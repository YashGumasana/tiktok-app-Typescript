import dotenv from 'dotenv'
dotenv.config()
import * as bodyParser from 'body-parser'
import express, { Request, Response } from 'express'
import http from 'http'
import cors from 'cors'
import { mongooseConnection } from './database/connection'
// import * as packageInfo from '../package.json'

import { router } from './Routes'
const app = express();
app.use(cors())
app.use(mongooseConnection)
app.use(express.json())

app.get('/', (request, response) => {
    response.send('Hello world!');
});

// app.use(express.urlencoded({ extended: true }))

// console.log(process.env.NODE_ENV);

const health = (req: Request, res: Response) => {
    return res.status(200).json({
        message: "Zois backend server is running",
    })
}

const bad_gateway = (req: Request, res: Response) => {
    return res.status(502).json({ status: 502, message: "Zois Backend API Bad Gateway" })
}

app.get('/', health);
app.get('/health', health);
app.get('/isServerUp', (req: Request, res: Response) => {
    res.send('Server is running');
})

app.use(router)
app.use('*', bad_gateway)

let server = new http.Server(app);
export default server