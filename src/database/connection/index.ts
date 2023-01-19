import config from 'config'
import mongoose from 'mongoose'
import express from 'express'


let dbUrl: any

if (process.env.NODE_ENV) {

    dbUrl = process.env.LOCAL_DB_URL
}
if (!process.env.NODE_ENV) {

    dbUrl = process.env.DB_URL
}

const mongooseConnection = express()

mongoose.connect(
    dbUrl
).then(() =>
    console.log('Database successfully connected')
).catch(err => console.log(err))

export { mongooseConnection }