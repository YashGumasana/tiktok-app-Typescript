import Joi from 'joi'
import { apiResponse } from '../common'
import { Request, Response } from 'express'

export const add_update_enquiry = async (req: Request, res: Response, next: any) => {
    const schema = Joi.object({
        id: Joi.string().error(new Error('id is string!')),

        question: Joi.string().allow(null, "").error(new Error('question is string!')),

        answer: Joi.string().allow(null, "").error(new Error('answer is string!')),

        jobId: Joi.string().allow(null, "").error(new Error('jobId is string'))

    })

    schema.validateAsync(req.body).then(async result => {
        return next()
    }).catch(async error => {
        res.status(400).json(new apiResponse(400, error.message, {}, {}))
    })
}