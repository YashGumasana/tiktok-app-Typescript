//package
import Joi from 'joi'
import { isValidObjectId } from 'mongoose'
import { Request, Response, NextFunction } from 'express'

//route
import { apiResponse } from '../common'

export const signUp = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        DOB: Joi.string().lowercase().error(new Error('DOB is string!')),
        location: Joi.string().lowercase().error(new Error('location is string!')),
        email: Joi.string().error(new Error('email is string!')),
        username: Joi.string().error(new Error('username is string!')),
        gender: Joi.number().error(new Error('gender is number!')),
        password: Joi.string().error(new Error('password is string!')),
        deviceToken: Joi.string().error(new Error('deviceToken is string!')),
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}))
    })
}

export const login = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        email: Joi.string().lowercase().max(50).required().error(new Error('email is required! & max length is 50')),

        password: Joi.string().max(20).required().error(new Error('password is required! & max length is 20')),

        deviceToken: Joi.string().error(new Error('deviceToken is string!')),
    })
    schema.validateAsync(req.body).then(async result => {
        req.body = result
        return next()
    }).catch(async error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}))
    })
}

export const otp_verification = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        otp: Joi.number().error(new Error('otp is number!')),
        email: Joi.string().error(new Error('email is string!')),
    })

    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}))
    })
}

export const forgot_password = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        email: Joi.string().lowercase().required().error(new Error('email is required!')),
    })

    schema.validateAsync(req.body).then(async result => {
        req.body = result
        return next()
    }).catch(async error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}))
    })
}

export const reset_password = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        id: Joi.string().required().error(new Error('id is required! ')),
        otp: Joi.number().required().error(new Error('otp is required! ')),
        password: Joi.string().max(20).required().error(new Error('password is required! & max length is 20')),
    })

    schema.validateAsync(req.body).then(async result => {
        if (!isValidObjectId(result.id)) {
            return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
        }
        return next()
    }).catch(async error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}))
    })
}


export const update_profile = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        firstName: Joi.string().lowercase().error(new Error('firstName is string!')),
        lastName: Joi.string().lowercase().error(new Error('lastName is string!')),
        bio: Joi.string().lowercase().error(new Error('bio is string!')),
        image: Joi.string().error(new Error('image is string!')),
        phoneNumber: Joi.string().error(new Error('phoneNumber is string!')),
        countryCode: Joi.string().error(new Error('countryCode is string!')),
        username: Joi.string().error(new Error('username is string!')),
        DOB: Joi.string().lowercase().error(new Error('DOB is string!')),
        location: Joi.string().lowercase().error(new Error('location is string!')),
        email: Joi.string().error(new Error('email is string!')),
        gender: Joi.number().error(new Error('gender is number!')),
    })

    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}))
    })
}

export const change_password = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        oldPassword: Joi.string().required().error(new Error('oldPassword is string!')),
        newPassword: Joi.string().required().error(new Error('newPassword is string!'))
    })
    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}))
    })
}

export const logout = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        deviceToken: Joi.string().error(new Error('deviceToken is string!')),
    })

    schema.validateAsync(req.body).then(result => {
        return next()
    }).catch(error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}))
    })
}

export const by_id = async (req: Request, res: Response, next: any) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json(new apiResponse(400, 'invalid id', {}, {}))
    }
    return next()
}