// package
import { Request } from "express";
import winston from "winston";
import config from 'config'
import moment from 'moment-timezone'
const timeFormat = moment().format('DD-MM-YYYY hh:mm:ss A')
const colorizer = winston.format.colorize()
const Winston: any = config.get('Winston')
const timeZone: any = config.get('timeZone')

let logColor: any = {
    colors: {
        error: "red",
        warn: "magenta",
        info: "yellow",
        http: "green",
        debug: "cyan"
    }
}
let name: String = 'UI-Village'
winston.addColors(logColor)

let alignColorsAndTime: any = winston.format.combine(
    winston.format.colorize({
        all: true
    }),
    winston.format.timestamp({
        format: timeFormat
    }),
    winston.format.json(),
    winston.format.printf(
        info => `\x1b[96m[${name}]` + " " + `\x1b[95m${moment.tz(timeZone)}` + " " + colorizer.colorize(winston.level, `- ${info.level}:${info.message}`)
    )
)

export const logger: any = winston.createLogger({
    level: Winston.level,
    transports: [
        new winston.transports.Http({
            level: 'warn',
            format: winston.format.json()
        }),
        new (winston.transports.Console)({
            format: alignColorsAndTime,
        })
    ]

})

// reqinfo
export const reqInfo: any = async function (req: Request) {

    // console.log(req.header('user-agent'), '+-+-+-');
    let spliteResult = req.header('User-Agent').split("(").toString().split(")")
    // spliteResult = req.header('user-agent').split("(")
    //  .split("(").toString().split(")")

    // console.log(spliteResult, '+++');
    // console.log(spliteResult.length, '+++');

    let browserName = spliteResult[spliteResult.length - 1]

    spliteResult = spliteResult[0].split(",")

    let osName = spliteResult[1]
    // console.log(osName, '***');
    // console.log(req.method, '11');
    // console.log(req.headers.host, '22');
    // console.log(req.originalUrl, '33');
    // console.log(req.ip, '44');

    logger.http(`${req.method} ${req.headers.host}${req.originalUrl} \x1b[33m device os => [${osName}] \x1b[1m\x1b[37mip address => ${req.ip} \n\x1b[36m browser => ${browserName}`)


}