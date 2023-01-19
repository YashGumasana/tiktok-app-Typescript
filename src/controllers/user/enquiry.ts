import { reqInfo, responseMessage } from "../../helper";
import { enquiryModel } from "../../database";
import { apiResponse } from "../../common";
import { Request, Response } from "express";
import mongoose from "mongoose";

const ObjectId = mongoose.Types.ObjectId

export const add_enquiry = async (req: Request, res: Response) => {
    reqInfo(req)
    req.body.createdBy = (req.header('user') as any)?._id

    try {
        await new enquiryModel(req.body).save()
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('enquiry'), {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const update_enquiry = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response: any,
            body: any = req.body

        response = await enquiryModel.findOneAndUpdate({
            _id: new ObjectId(body?.id),
            isActive: true,
            isBlock: false
        }, body)

        if (!response) {
            return res.status(400).json(new apiResponse(400, responseMessage?.getDataNotFound('enquiry'), {}, `${response}`))
        }

        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess('enquiry'), {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}


export const delete_enquiry = async (req: Request, res: Response) => {

    reqInfo(req)
    let id = (req.params.id) as any
    try {
        let response = await enquiryModel.findOneAndUpdate({
            _id: new ObjectId(id),
            isActive: true
        },
            {
                isActive: false
            })

        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess('enquiry'), {}, {}))
        }

        return res.status(404).json(new apiResponse(200, responseMessage?.getDataNotFound('enquiry'), {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }

}


export const get_enquiry_pagination = async (req: Request, res: Response) => {
    reqInfo(req)
    let { limit, page, search, jobId } = req.body,
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
            isBlock: false,
        }

        if (jobId) {
            match.jobId = new ObjectId(jobId)
        }

        response = await enquiryModel.aggregate([
            { $match: match },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            { $project: { createdBy: 0, createdAt: 0, updatedAt: 0, __v: 0, isActive: 0, isBlock: 0 } }
        ])
        count = await enquiryModel.countDocuments(match)

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('enquiry'), {
            enquiry_data: response,
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