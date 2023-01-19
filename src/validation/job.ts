import Joi from 'joi'
import { apiResponse } from '../common'
import { Request, Response } from 'express'

export const add_update_job = async (req: Request, res: Response, next: any) => {

    const schema = Joi.object({
        id: Joi.string().error(new Error('id is string!')),
        description: Joi.string().allow(null, "").error(new Error('description is string!')),
        title: Joi.string().allow(null, "").error(new Error('title is string!')),
        location: Joi.string().allow(null, "").error(new Error('location is string!')),
        latitude: Joi.number().error(new Error('latitude is number!')),
        longitude: Joi.number().error(new Error('longitude is number')),
        projectType: Joi.number().error(new Error('projectType is number')),
        status: Joi.number().error(new Error('status is number!')),
        type: Joi.number().error(new Error('type is number!')),
        price: Joi.number().error(new Error('price is number!')),
        duration: Joi.string().allow(null, "").error(new Error('duration is string!')),
        completionTime: Joi.string().allow(null, "").error(new Error('completionTime is string!')),
        skills: Joi.array().error(new Error('skills is array!'))
    })

    schema.validateAsync(req.body).then(async result => {
        return next()
    }).catch(async error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}))
    })
}