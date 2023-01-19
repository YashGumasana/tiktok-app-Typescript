import { reqInfo } from "../../helper";
import { categoryModel } from "../../database";
import { apiResponse, URL_decode } from "common";
import { Request, Response } from "express";
// import { deleteImage, responseMessage } from '../../helper'
import { Types } from 'mongoose'
// import async from 'async'

const ObjectId = Types.ObjectId

export const add_category = async (req: Request, res: Response) => {
    reqInfo(req)

    try {
        let response: any,
            alreadyExist: any,
            body: any = req.body,
            search = new RegExp(`^${body}`)
    } catch (error) {

    }
}