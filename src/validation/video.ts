import Joi from 'joi';
import { apiResponse } from '../common';
import { Request, Response } from 'express';

export const add_update_video = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        id: Joi.string().error(new Error('id is string!')),
        description: Joi.string().error(new Error('description is string!')),
        url: Joi.string().error(new Error('url is string!')),
        thumbnail: Joi.string().error(new Error('thumbnail is string! ')),
        setting: Joi.object().error(new Error('settign is object! ')),
        suburb: Joi.string().error(new Error('suburb is string! ')),
        state: Joi.string().error(new Error('state is string! ')),
        city: Joi.string().error(new Error('city is string! ')),
        country: Joi.string().error(new Error('country is string! ')),
        latitude: Joi.number().error(new Error('latitude is number! ')),
        longitude: Joi.number().error(new Error('longitude is number! ')),
        tag: Joi.array().error(new Error('tag is array! ')),
    })

    schema.validateAsync(req.body).then(async result => {
        return next()
    }).catch(async error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}))
    })
}