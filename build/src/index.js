"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const connection_1 = require("./database/connection");
// import * as packageInfo from '../package.json'
const Routes_1 = require("./Routes");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(connection_1.mongooseConnection);
app.use(express_1.default.json());
app.get('/', (request, response) => {
    response.send('Hello world!');
});
// app.use(express.urlencoded({ extended: true }))
// console.log(process.env.NODE_ENV);
const health = (req, res) => {
    return res.status(200).json({
        message: "Zois backend server is running",
    });
};
const bad_gateway = (req, res) => {
    return res.status(502).json({ status: 502, message: "Zois Backend API Bad Gateway" });
};
app.get('/', health);
app.get('/health', health);
app.get('/isServerUp', (req, res) => {
    res.send('Server is running');
});
app.use(Routes_1.router);
app.use('*', bad_gateway);
let server = new http_1.default.Server(app);
exports.default = server;
//# sourceMappingURL=index.js.map