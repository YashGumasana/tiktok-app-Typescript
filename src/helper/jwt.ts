//packages
import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

import config from 'config'

//import
import { blockModel, userModel } from '../database'
import { apiResponse } from '../common'
import { responseMessage } from './response'
import mongoose from 'mongoose'

const ObjectId = mongoose.Types.ObjectId
const jwt_token_secret = process.env.JWT_TOKEN_SECRET

export const userJWT = async (req: Request, res: Response, next: NextFunction) => {
    let { authorization, userType } = req.headers,
        result: any

    // for postman
    authorization = authorization.split(' ')[1]
    console.log(authorization);
    if (authorization) {
        try {

            let isverifyToken: any = jwt.verify(authorization, jwt_token_secret)
            if (isverifyToken?.type != userType && userType != "5") {
                return res.status(403).json(new apiResponse(403, responseMessage?.accessDenied, {}, {}))
            }
            result = await userModel.findOne({ _id: new ObjectId(isverifyToken._id), isActive: true })

            if (result?.isBlock == true) {
                return res.status(403).json(new apiResponse(403, responseMessage?.accountBlock, {}, {}))
            }
            // console.log(isverifyToken, '--++-');
            // console.log(isverifyToken?.authToken, '------');
            // console.log(result, '+++++');
            if (result?.isActive == true && isverifyToken.authToken == result.authToken) {
                req.headers.user = result
                return next()
            }
            else {
                return res.status(401).json(new apiResponse(401, responseMessage?.invalidToken, {}, {}))
            }
        } catch (err) {
            if (err.message == "invalid signature") {
                return res.status(403).json(new apiResponse(403, responseMessage?.differentToken, {}, {}))
            }
            console.log('catch jwt err');
            console.log(err);
        }
    }
    else {
        return res.status(401).json(new apiResponse(401, responseMessage?.tokenNotFound, {}, {}))
    }
}

export const userBlock = async (req: Request, res: Response, next: NextFunction) => {
    let user = req.header('user') as any

    // console.log(user, '---');
    let blocklist1 = await blockModel.find({ blockId: new ObjectId(user?._id), isActive: true, isBlock: false, requestStatus: 1 })

    let blocklist2 = await blockModel.find({
        cratedBy: new ObjectId(user?._id), isActive: true, isBlock: false, requestStatus: 1
    })

    req.headers.blocklist = [...blocklist1.map((a: any) => a.createdBy), ...blocklist2.map((a: any) => a.blockId)]

    return next()
}

export const userBlock1 = async (req: Request, res: Response, next: NextFunction) => {
    let user = req.header('user') as any
    let id = (req.params.id) as any

    // console.log(user);
    let blocklist1 = await blockModel.find({ blockId: new ObjectId(user?._id), isActive: true, isBlock: false, requestStatus: 1 })

    let blocklist2 = await blockModel.find({ cratedBy: new ObjectId(user?._id), blockId: new ObjectId(id), isActive: true, isBlock: false, requestStatus: 1 })

    if (blocklist1.length == 0 && blocklist2.length == 0) {
        return next()
    }

    else {
        return res.status(401).json(new apiResponse(401, responseMessage?.blockbyuser, {}, {}))
    }
}

export const userBlock2 = async (req: Request, res: Response, next: NextFunction) => {
    let user = req.header('user') as any
    let id = (req.params.id) as any
    let username = await userModel.findOne({ username: id, isActive: true, isBlock: false })
    // console.log(user)
    let blocklist1 = await blockModel.find({ blockId: new ObjectId(user?._id), createdBy: username?._id, isActive: true, isBlock: false, requestStatus: 1 })
    let blocklist2 = await blockModel.find({ createdBy: new ObjectId(user?._id), blockId: username?._id, isActive: true, isBlock: false, requestStatus: 1 })

    // console.log(blocklist)
    // req.headers.blocklist = [...blocklist1.map(a => a.createdBy),...blocklist2.map(a => a.blockId)];
    // req.headers.blocklist = blocklist2.map(a => a.blockId);
    if (blocklist1.length == 0 && blocklist2.length == 0) {
        return next()
    } else {
        return res.status(401).json(new apiResponse(401, responseMessage?.blockbyuser, {}, {}))
    }
}

export const commanblockcheck = async (user: any, id: any) => {
    let blocklist1 = await blockModel.find({
        blockId: new ObjectId(user?._id),
        cratedBy: new ObjectId(id),
        isActive: true,
        isBlock: false,
        requestStatus: 1
    })

    let blocklist2 = await blockModel.find({
        createdBy: new ObjectId(user?._id),
        blockId: new ObjectId(id),
        isActive: true,
        isBlock: false,
        requestStatus: 1
    })

    if (blocklist1.length == 0 && blocklist2.length == 0) {
        return true
    } else {
        return false
    }
}

export const partialJWT = async (req: Request, res: Response, next) => {
    let { authorization, userType } = req.headers,
        result: any

    authorization = authorization.split(' ')[1]

    if (authorization) {
        try {
            let isverifyToken: any = jwt.verify(authorization, jwt_token_secret)

            if (isverifyToken?.type != userType && userType != "5") {
                return res.status(403).json(new apiResponse(403, responseMessage?.accessDenied, {}, {}))
            }

            result = await userModel.findOne({ _id: new ObjectId(isverifyToken._id), isActive: true })

            if (result?.isBlock == true) {
                return res.status(403).json(new apiResponse(403, responseMessage?.accountBlock, {}, {}))
            }
            // console.log(result);
            // console.log(isverifyToken);

            if (result?.isActive == true && isverifyToken.authToken == result.authToken) {
                req.headers.user = result
                return next()
            }
            else {
                return res.status(401).json(new apiResponse(401, responseMessage?.invalidToken, {}, {}))
            }


        } catch (err) {
            if (err.message == "invalid signature") {
                return res.status(403).json(new apiResponse(403, responseMessage?.differentToken, {}, {}))
            }
            console.log(err)
            return res.status(401).json(new apiResponse(401, responseMessage.invalidToken, {}, {}))

        }
    }

    else {
        next()
    }
}