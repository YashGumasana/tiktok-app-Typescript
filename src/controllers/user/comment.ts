import { reqInfo } from "../../helper";
import { commentModel, feedModel, notificationModel, videoModel } from '../../database'
import { apiResponse, notification_template, type } from "../../common";
import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { responseMessage } from "../../helper";
import { notification_to_user } from "../../helper";

const ObjectId = mongoose.Types.ObjectId

// export const add_comment = async (req: Request, res: Response) => {
//     reqInfo(req)
//     let user: any = req.header('user'),
//         parallel_array: any = [],
//         videoOwnerData: any,
//         feedOwnerData: any,
//         body = req.body
//     body.createdBy = user._id

//     try {
//         if(body?.type == type.comment.video){
//             videoOwnerData = await videoModel.aggregate([
//                 {$match:{_id : new ObjectId(body?.videoId),
//                 isActive:true,
//                 isBlock:false
//                 }},
//                 {
//                     $lookup:{
//                         from:"users",
//                         let:{createdBy:'$createdBy'},
//                         pipeline:[
//                             {
//                                 $match:{
//                                     $expr:{
//                                         $and:[
//                                             {
//                                                 $eq:['$_id','$$cratedBy']
//                                             }
//                                         ]
//                                     }
//                                 }
//                             }
//                         ]
//                     }
//                 }

//             ])
//         }
//     } catch (error) {
        
//     }
// }

