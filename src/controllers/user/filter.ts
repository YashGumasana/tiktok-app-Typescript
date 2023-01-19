import { reqInfo } from "../../helper";
import { filterModel } from "../../database";
import { apiResponse } from "../../common";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { responseMessage } from "../../helper";

const ObjectId = mongoose.Types.ObjectId

export const add_filter = async (req: Request, res: Response) => {
    reqInfo(req)
    req.body.createdBy = (req.header('user') as any)?._id

    try {
        await new filterModel(req.body).save()
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('filter'), {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const update_filter = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let response: any,
            body: any = req.body

        response = await filterModel.findOneAndUpdate({
            _id: new ObjectId(body?.id),
            isActive: true,
            isBlock: false
        },
            body)

        if (!response) {
            return res.status(400).json(new apiResponse(400, responseMessage?.getDataNotFound('filter'), {}, `${response}`))
        }

        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess('filter'), {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(200, responseMessage?.internalServerError, {}, error))
    }
}

export const delete_filter = async (req: Request, res: Response) => {
    reqInfo(req)
    let id = (req.params.id) as any

    try {
        let response = await filterModel.findOneAndUpdate({
            _id: new ObjectId(id),
            isActive: true
        }, {
            isActive: false
        })



    } catch (error) {

    }
}