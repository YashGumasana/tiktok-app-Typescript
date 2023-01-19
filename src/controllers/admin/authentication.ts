import { userModel } from "../../database";
import { apiResponse, userStatus } from "../../common";
import { responseMessage, reqInfo, } from "../../helper";

import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from 'config'
import { Request, Response } from "express";
import mongoose from "mongoose";

const ObjectId = mongoose.Types.ObjectId
const jwt_token_secret = process.env.JWT_TOKEN_SECRET

export const signUp = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let body = req.body, userType = req.headers.userType, otpFlag = 1, authToken = 0

        let isAlready: any = await userModel.findOne({
            email: body.email, isActive: true, userType
        })

        if (isAlready?.isBlock == true) {
            return res.status(403).json(new apiResponse(403, responseMessage.accountBlock, {}, {}))
        }

        if (isAlready) {
            return res.status(409).json(new apiResponse(409, responseMessage?.alreadyEmail, {}, {}))
        }

        const salt = bcryptjs.genSaltSync(8)
        const hashPassword = await bcryptjs.hash(body.password, salt)

        delete body.password
        body.userType = userType
        body.password = hashPassword
        body.username = body.name

        while (otpFlag == 1) {
            for (let flag = 0; flag < 1;) {
                authToken = Math.round(Math.random() * 1000000)
                if (authToken.toString().length == 6) {
                    flag++
                }
            }

            let isAlreadyAssign = await userModel.findOne({ otp: authToken })

            if (isAlreadyAssign?.otp != authToken) {
                otpFlag = 0
            }
        }

        body.authToken = authToken
        body.otp = authToken
        body.otpExpireTime = new Date(new Date().setMinutes(new Date().getMinutes() + 10))

        let response = await new userModel(body).save()
        const token = jwt.sign({
            _id: response._id,
            authToken: response.authToken,
            type: response.userType,
            status: "Login",
            generatedOn: (new Date().getTime())
        }, jwt_token_secret)

        return res.status(200).json(new apiResponse(200, responseMessage.signupSuccess, {
            firstName: response.firstName,
            lastName: response.lastName,
            gender: response.gender,
            email: response.email,
            image: response.image,
            userType: response.userType,
            token,
        }, {}))
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error))
    }
}

export const login = async (req: Request, res: Response) => {
    let body = req.body, otpFlag = 1, authToken: any
    reqInfo(req)

    try {
        for (let flag = 0; flag < 1;) {
            authToken = Math.round(Math.random() * 1000000)

            if (authToken.toString().length == 6) {
                flag++
            }
        }

        let response: any = await userModel.findOneAndUpdate({
            email: body.email,
            isActive: true,
            userType: userStatus.admin
        },
            {
                $addToSet: { ...(body?.deviceToken != null) && { deviceToken: body?.deviceToken } }
            }, { new: true })

        if (!response) {
            return res.status(400).json(new apiResponse(400, responseMessage.invalidUserPasswordEmail, {}, {}))
        }

        if (response?.isBlock == true) {
            return res.status(403).json(new apiResponse(403, responseMessage.accountBlock, {}, {}))
        }

        const passwordMatch = await bcryptjs.compare(body.password, response.password)

        if (!passwordMatch) {
            return res.status(400).json(new apiResponse(400, responseMessage.invalidUserPasswordEmail, {}, {}))
        }

        const token = jwt.sign({
            _id: response._id,
            authToken: response.authToken,
            type: response.userType,
            status: 'Login',
            generatedOn: (new Date().getTime())
        }, jwt_token_secret)

        response = {
            firstName: response.firstName,
            lastName: response.lastName,
            gender: response.gender,
            email: response.email,
            image: response.image,
            userType: response.userType,
            token,
        }

        return res.status(200).json(new apiResponse(200, responseMessage.loginSuccess, response, {}))
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error))
    }
}