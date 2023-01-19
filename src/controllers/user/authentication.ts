// import
// import userModel from "../../database/models/user";
import { userModel } from "../../database";
import { apiResponse, loginType, userStatus } from "../../common";
import { reqInfo, responseMessage, email_verification_mail, forgot_password_mail } from "../../helper";

//packages
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from "config"
import { Request, response, Response } from "express";
import axios from 'axios'

const ObjectId = require('mongoose').Types.ObjectId
// const jwt_token_secret = config.get('jwt_token_secret')

export const signUp = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        console.log('sign up');
        let body = req.body, userType = req.headers.userType,
            otpFlag = 1,// Otp has already assign or not for cross-verification
            authToken = 0
        // console.log(req.headers);
        // console.log(body, typeof userType, req.headers.userType);
        // userModel
        // const x = await userModel.findOne({ email: body?.email, isActive: true, userType, isEmailVerified: true })

        // console.log(x, '**');

        let [isAlready, usernameAlreadyExist]: any = await Promise.all([
            userModel.findOne({ email: body?.email, isActive: true, userType, isEmailVerified: true }),

            userModel.findOne({
                username: { '$regex': body?.username, '$options': 'i' }, isActive: true, userType, isEmailVerified: true
            }),
        ])
        // console.log(isAlready, usernameAlreadyExist, '---');
        if (usernameAlreadyExist) {
            return res.status(409).json(new apiResponse(409, responseMessage?.alreadyUsername, {}, {}))
        }

        if (isAlready?.isBlock == true) {
            return res.status(403).json(new apiResponse(403, responseMessage.accountBlock, {}, {}))
        }

        if (isAlready) {
            return res.status(409).json(new apiResponse(409, responseMessage?.alreadyEmail, {}, {}))
        }

        const salt = bcryptjs.genSaltSync(8)
        const hashPassword = await bcryptjs.hash(body.password, salt)
        delete body.password
        body.password = hashPassword

        while (otpFlag == 1) {
            for (let flag = 0; flag < 1;) {
                authToken = Math.round(Math.random() * 1000000)
                if (authToken.toString().length == 6) {
                    flag++
                }
            }
            // console.log(authToken, '++');
            let isAlreadyAssign = await userModel.findOne({ otp: authToken })
            // console.log(isAlreadyAssign);
            // console.log(isAlreadyAssign.otp);
            // console.log(isAlreadyAssign?.otp);
            if (isAlreadyAssign?.otp != authToken) {
                otpFlag = 0
            }
        }
        // console.log('**');

        body.authToken = authToken
        body.otp = authToken
        body.otpExpireTime = new Date(new Date().setMinutes(new Date().getMinutes() + 10))

        const y = await userModel.deleteOne({
            email: body.email,
            isActive: true,
            isEmailVerified: false
        })

        console.log(body, y, '+++')
        let user: any = await new userModel(body).save()
        // console.log(user, '***');
        let response = await email_verification_mail({
            email: user?.email, username: user?.username, otp: user?.otp
        })
        return res.status(200).json(new apiResponse(200, response as string, {}, {}))
    }
    catch (error) {
        console.log(error)
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
            userType: userStatus.user
        },
            {
                $addToSet: { ...(body?.deviceToken != null) && { deviceToken: body?.deviceToken } }
            },
            { new: true })

        if (!response) {
            return res.status(400).json(new apiResponse(400, 'email is not found', {}, {}))
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
            status: "Login",
            generatedOn: (new Date().getTime())
        }, process.env.JWT_TOKEN_SECRET)

        // console.log(response, '--');
        response = {
            _id: response?._id,
            username: response.username,
            firstName: response.firstName,
            lastName: response.lastName,
            gender: response.gender,
            email: response.email,
            image: response.image,
            userType: response.userType,
            isEmailVerified: response.isEmailVerified,
            token
        }

        return res.status(200).json(new apiResponse(200, responseMessage.loginSuccess, response, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error))
    }
}


export const logout = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user')
    // console.log(req.body.logout);

    try {
        await userModel.updateOne({ _id: ObjectId(user._id), isActive: true }, { $pull: { deviceToken: req.body.logout } })

        return res.status(200).json(new apiResponse(200, responseMessage?.logout, {}, {}))
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, 'Internal Server Error', {}, {}))
    }

}


export const otp_verification = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body

    try {
        body.isActive = true

        let data = await userModel.findOneAndUpdate(
            body,
            {
                $addToSet: { deviceToken: body?.deviceToken },
                authToken: body.otp,
                isEmailVerified: true
            }
        )

        if (!data) {
            return res.status(400).json(new apiResponse(400, responseMessage?.invalidOTP, {}, {}
            ))
        }

        if (data.isBlock == true) {
            return res.status(403).json(new apiResponse(403, responseMessage?.accountBlock, {}, {}))
        }

        if (new Date(data.otpExpireTime).getTime() < new Date().getTime()) {
            return res.status(410).json(new apiResponse(410, responseMessage?.expireOTP, {}, {}))
        }

        if (data?.isEmailVerified) {
            return res.status(200).json(new apiResponse(200, responseMessage?.OTPverified, {
                _id: data._id,
                otp: data?.otp
            }, {}))
        }

        else {
            const token = jwt.sign({
                _id: data._id,
                authToken: body?.otp,
                type: data.userType,
                status: "OTP verification",
                generatedOn: (new Date().getTime())
            }, process.env.JWT_TOKEN_SECRET)

            return res.status(200).json(new apiResponse(200, responseMessage?.OTPverified, {
                _id: data._id,
                firstName: data.firstName,
                username: data.username,
                lastName: data.lastName,
                gender: data.gender,
                email: data.email,
                image: data.image,
                userType: data.userType,
                token,
            }, {}))
        }
    }
    catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const forgot_password = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body, otp = 0, otpFlag = 1//otp has already assign or not for cross-verification 

    try {
        body.isActive = true
        let data = await userModel.findOne(body)
        if (!data) {
            return res.status(400).json(new apiResponse(400, responseMessage.invalidEmail, {}, {}))
        }

        if (data.isBlock == true) {
            return res.status(403).json(new apiResponse(403, responseMessage.accountBlock, {}, {}))
        }

        while (otpFlag == 1) {
            for (let flag = 0; flag < 1;) {
                otp = await Math.round(Math.random() * 1000000)
                if (otp.toString().length == 6) {
                    flag++
                }
            }

            let isAlreadyAssign = await userModel.findOne({ otp: otp })

            if (isAlreadyAssign?.otp != otp) {
                otpFlag = 0
            }
        }
        // console.log('---');
        data.otp = otp
        // console.log(data);
        let response = await forgot_password_mail(data)
        // console.log('==');
        if (response) {
            await userModel.findOneAndUpdate(body, { otp, otpExpireTime: new Date(new Date().setMinutes(new Date().getMinutes() + 10)) })

            return res.status(200).json(new apiResponse(200, `${response}`, {}, {}))
        }
        else {
            return res.status(501).json(new apiResponse(501, responseMessage.errorMail, {}, `${response}`))
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage.internalServerError, {}, error))
    }
}

export const reset_password = async (req: Request, res: Response) => {
    reqInfo(req)
    let body = req.body,
        authToken = 0,
        id = body.id,
        otp = body?.otp
    delete body.otp

    try {
        const salt = bcryptjs.genSaltSync(10)
        const hashPassword = await bcryptjs.hash(body.password, salt)
        delete body.password
        delete body.id
        body.password = hashPassword

        for (let flag = 0; flag < 1;) {
            authToken = Math.round(Math.random() * 1000000)

            if (authToken.toString().length == 6) {
                flag++
            }
        }

        body.authToken = authToken
        body.otp = 0
        body.otpExpireTime = null
        let response = await userModel.findOneAndUpdate(
            {
                _id: ObjectId(id), isActive: true, otp: otp
            },
            body,
            { new: true }
        )

        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage?.resetPasswordSuccess, { action: "please go to login page" }, {}))
        }
        else {
            return res.status(501).json(new apiResponse(501, responseMessage?.resetPasswordError, response, {}))
        }
    }
    catch (error) {
        return res.status(200).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}



export const get_profile = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'), planData: any

    try {
        let response = await userModel.findOne({ _id: ObjectId(user._id), isActive: true }).select('-password -createdAt -updatedAt -__v')

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('your profile'), response, {}))
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, {}))
    }
}


export const update_profile = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'),
        body: any = req.body

    // console.log(user);
    try {
        if (body?.email) {
            if (await userModel.findOne(
                {
                    email: body?.email, isActive: true, _id: { $ne: ObjectId(user?._id) },
                },
                { isActive: true }
            )) {
                return res.status(409).json(new apiResponse(409, responseMessage?.alreadyEmail, {}, {}))
            }
        }

        let response = await userModel.findOneAndUpdate(
            {
                _id: ObjectId(user._id),
                isActive: true
            },
            body,
            { new: true }
        )

        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess('profile'), response, {}))
        }
        else {
            return res.status(501).json(new apiResponse(501, responseMessage?.getDataNotFound('profile'), {}, {}))
        }

    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, {}))
    }
}

export const delete_profile = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'), planData: any

    try {
        let response = await userModel.findOneAndUpdate({
            _id: ObjectId(user._id), isActive: true
        }, {
            isActive: false
        })

        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess('your profile'), {}, {}))
        }

        else {
            return res.status(501).json(new apiResponse(501, responseMessage?.updateDataError('profile'), {}, {}))
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, {}))
    }
}

export const change_password = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'), { oldPassword, newPassword } = req.body, otp: number = 0

    try {
        for (let flag = 0; flag < 1;) {
            otp = Math.round(Math.random() * 1000000)

            if (otp.toString().length == 6) {
                flag++
            }
        }

        // console.log(otp, '---+++');
        let data = await userModel.findOne({ _id: ObjectId(user?._id), isActive: true, isBlock: false })

        // console.log(data, '***');
        const passwordIsCorrect = await bcryptjs.compare(oldPassword, data.password)

        if (!passwordIsCorrect) {
            return res.status(400).json(new apiResponse(400, responseMessage?.invalidOldPassword, {}, {}))
        }

        const hashPassword = await bcryptjs.hash(newPassword, bcryptjs.genSaltSync(8))

        const newData = await userModel.updateOne({ _id: ObjectId(user?._id), isActive: true, isBlock: false }, {
            password: hashPassword, authToken: otp
        })

        // console.log(newData, '///');

        return res.status(200).json(new apiResponse(200, responseMessage?.passwordChangeSuccess, {}, {}))
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(200, responseMessage?.internalServerError, {}, {}))
    }
}


export const google_SL = async (req: Request, res: Response) => {
    let { accessToken, idToken, deviceToken } = req.body
    reqInfo(req)

    try {
        if (accessToken && idToken) {
            let verificationAPI = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`,
                idAPI = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`

            let access_token: any = await axios.get(verificationAPI)
                .then((result) => {
                    return result.data
                }).catch((error) => {
                    return false
                })

            let id_token: any = await axios.get(idAPI)
                .then((result) => {
                    return result.data
                }).catch((error) => {
                    return false
                })

            if (access_token.email == id_token.email && access_token.verified_email == true) {
                const isUser = await userModel.findOneAndUpdate({ email: id_token?.email, isActive: true }, { $addToSet: { deviceToken: deviceToken } })

                if (!isUser) {
                    for (let flag = 0; flag < 1;) {
                        var authToken: any = Math.round(Math.random() * 1000000)

                        if (authToken.toString().length == 6) {
                            flag++
                        }
                    }

                    let username: any = id_token.email.split('@')[0]

                    return new userModel({
                        email: id_token.email,
                        firstName: id_token.given_name,
                        lastName: id_token.famil_name,
                        image: id_token.picture,
                        loginType: loginType.google,
                        isEmailVerified: true,
                        deviceToken: [deviceToken],
                        username: username,
                        authToken,
                    }).save()
                        .then(async response => {
                            const token = jwt.sign({
                                _id: response._id,
                                authToken: response.authToken,
                                type: response.userType,
                                status: "Login",
                                generatedOn: (new Date().getTime())
                            }, process.env.JWT_TOKEN_SECRET)
                            let return_response = {
                                userType: response?.userType,
                                isEmailVerified: response?.isEmailVerified,
                                loginType: response?.loginType,
                                _id: response?._id,
                                firstName: response?.firstName,
                                lastName: response?.lastName,
                                email: response?.email,
                                image: id_token?.picture,
                                username: response?.username,
                                token,
                            }
                            return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, return_response, {}))
                        })
                }
                else {
                    if (isUser?.isBlock == true) {
                        return res.status(401).json(new apiResponse(401, responseMessage?.accountBlock, {}, {}))
                    }

                    const token = jwt.sign({
                        _id: isUser._id,
                        authToken: isUser.authToken,
                        type: isUser.userType,
                        status: "Login",
                        generatedOn: (new Date().getTime())
                    }, process.env.JWT_TOKEN_SECRET)

                    //isStore owner
                    let response = {
                        userType: isUser?.userType,
                        isEmailVerified: isUser?.isEmailVerified,
                        loginType: isUser?.loginType,
                        _id: isUser?._id,
                        firstName: isUser?.firstName,
                        lastName: isUser?.lastName,
                        email: isUser?.email,
                        isStoreOwner: isUser?.isStoreOwner,
                        image: isUser?.image,
                        username: isUser?.username,
                        token,
                    }
                    return res.status(200).json(new apiResponse(200, responseMessage?.loginSuccess, response, {}))
                }
            }
            return res.status(401).json(new apiResponse(401, responseMessage?.invalidIdTokenAndAccessToken, {}, {}))
        }
    } catch (error) {
        console.log(error);

        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, error, {}))
    }
}


// facebook and appele apiResponse

// get all user
export const get_all_user = async (req: Request, res: Response) => {
    try {
        const all_users = await userModel.find().sort('createdat')
        const count = await userModel.count(all_users)
        if (all_users) {
            return res.status(200).json(new apiResponse(200, 'get all user', { count: count, all_users }, {}))
        }

    } catch (error) {

    }

}