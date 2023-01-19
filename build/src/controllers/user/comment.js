"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ObjectId = mongoose_1.default.Types.ObjectId;
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
//# sourceMappingURL=comment.js.map