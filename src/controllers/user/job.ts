import { reqInfo } from '../../helper'
import { userModel, jobModel } from '../../database'
import { apiResponse, type } from '../../common'
import { Request, Response } from 'express'
import { responseMessage } from '../../helper'
import { ObjectId, Types } from 'mongoose'

const ObjectId = Types.ObjectId

export const add_job = async (req: Request, res: Response) => {
    reqInfo(req)

    try {
        let response: any,
            body: any = req.body,
            user: any = req.header('user')

        body.createdBy = new ObjectId(user?._id)
        response = await new jobModel(body).save()

        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('job'), {}, {}))
        }

        else return res.status(400).json(new apiResponse(400, responseMessage?.addDataError, {}, `${response}`))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const update_job = async (req: Request, res: Response) => {
    reqInfo(req)

    try {
        let response: any,
            body: any = req.body

        response = await jobModel.findOneAndUpdate({
            _id: new ObjectId(body?.id),
            isActive: true,
            isBlock: false
        },
            body)

        if (!response) {
            return res.status(400).json(new apiResponse(400, responseMessage?.getDataNotFound('job'), {}, `${response}`))
        }

        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess('job'), {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }

}


export const delete_job = async (req: Request, res: Response) => {
    reqInfo(req)
    let id = (req.params.id) as any

    try {
        let response = await jobModel.findOneAndUpdate({
            _id: new ObjectId(id),
            isActive: true
        }, {
            isActive: false
        })

        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess('job'), {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_job_pagination = async (req: Request, res: Response) => {
    reqInfo(req)

    let { limit, page, search } = req.body,
        user = req.header('user') as any,
        skip: number,
        match: any = {},
        response: any,
        count: number

    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))

    try {
        match = {
            isActive: true,
            isBlock: false
        }

        response = await jobModel.aggregate([
            { $match: match },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },

            {
                $lookup: {
                    from: "users",
                    let: { createdBy: '$createdBy' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$_id', '$$createdBy']
                                        },

                                        {
                                            $eq: ['$isActive', true]
                                        },

                                        {
                                            $eq: ['$isBlock', false]
                                        }
                                    ]
                                }
                            }
                        }, {
                            $project: { username: 1, image: 1 }
                        }
                    ],
                    as: "user"
                }
            },
            {
                $project: { user: 1, description: 1, title: 1, location: 1, status: 1, }
            }
        ])

        count = await jobModel.countDocuments(match)

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('job'), {
            job_data: response,
            state: {
                page,
                limit,
                page_limit: Math.ceil(count / limit),
                data_count: count
            }
        }, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}


export const start_job = async (req: Request, res: Response) => {
    reqInfo(req)
    let id = (req.params.id) as any

    try {
        let response = await jobModel.findOneAndUpdate({
            _id: new ObjectId(id),
            isActive: true,
            isBlock: false
        },
            { status: type.job.running })

        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess('start job'), {}, {}))
        }

        return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('job'), {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const complete_job = async (req: Request, res: Response) => {
    reqInfo(req)
    let id = (req.params.id) as any

    try {
        let response = await jobModel.findOneAndUpdate({
            _id: new ObjectId(id),
            isActive: true,
            isBlock: false
        },
            {
                status: type.job.complete
            })

        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess('complete job'), {}, {}))
        }

        return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('job'), {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}