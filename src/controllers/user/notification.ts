import { reqInfo } from "../../helper";
import mongoose from "mongoose";
import { Request, Response } from 'express'
import { apiResponse, type } from "../../common";
import { notificationModel } from "../../database";
import { responseMessage } from "../../helper";

const ObjectId = mongoose.Types.ObjectId

export const get_notification = async (req: Request, res: Response) => {
    reqInfo(req)
    try {
        let { page, limit } = req.body,
            skip = ((parseInt(page) - 1) * parseInt(limit)),
            match = {
                isActive: true,
                isBlock: false,
                createdBy: new ObjectId((req.header('user') as any)?._id),
            }

        limit = parseInt(limit)
        // limit = parseInt(page)

        let [notification_data, notification_count] = await Promise.all([
            await notificationModel.aggregate([
                { $match: match },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: "users",
                        let: { userId: '$userId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: ['$_id', '$$userId']
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
                            },
                            {
                                $project: { username: 1, image: 1 }
                            }
                        ],
                        as: "user"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        let: { followerId: '$followerId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [

                                            {
                                                $eq: ['$_id', '$$followerId']
                                            },

                                            {
                                                $eq: ['$isActive', true]
                                            },

                                            {
                                                $eq: ['$isBlock', false]
                                            },

                                        ]
                                    }
                                }
                            },
                            {
                                $project: { username: 1, image: 1 }
                            }
                        ],
                        as: "follower"
                    }
                },
                {
                    $lookup: {
                        from: "videos",
                        let: { videoId: '$videoId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: ['$_id', '$$videoId']
                                            },
                                            {
                                                $eq: ['$isActive', true]
                                            },
                                            {
                                                $eq: ['$isBlock', false]
                                            },
                                        ],
                                    },
                                }
                            },
                            {
                                $project: { thumbnail: 1 }
                            }
                        ],
                        as: "video"
                    }
                },
                {
                    $lookup: {
                        from: "feeds",
                        let: { feedId: '$feedId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$_id', '$$feedId'] },
                                            { $eq: ['$isActive', true] },
                                            { $eq: ['$isBlock', false] },
                                        ],
                                    },
                                }
                            },
                            {
                                $project: { thumbnail: 1, image: 1 }
                            }
                        ],
                        as: "feed"
                    }
                },
                {
                    $project: { title: 1, video: 1, feed: 1, user: 1, status: 1, mark: 1, createdAt: 1, follower: 1, type: 1 }
                }
            ]),
            await notificationModel.countDocuments(match)
        ])

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('notification'), {
            notification_data: notification_data,
            state: {
                page,
                limit,
                page_limit: Math.ceil(notification_count / limit),
            }
        }, {}))
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}


export const delete_notification = async (req: Request, res: Response) => {
    reqInfo(req)

    try {
        if (req.body?.delete_all) {
            await notificationModel.updateMany({
                createdBy: new ObjectId((req.header('user') as any)?._id),
                isActive: true,
            }, {
                $set: {
                    isActive: false
                }
            })

            return res.status(200).json(new apiResponse(200, responseMessage?.allNotificationDelete, {}, {}))
        }
        else {
            await notificationModel.updateMany({
                createdBy: new ObjectId((req.header('user') as any)?._id),
                isActive: true,
                _id: { $in: req.body?.notificationId }
            }, {
                $set: { isActive: false }
            })

            return res.status(200).json(new apiResponse(200, responseMessage?.selectedNotificationDelete, {}, {}))
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const read_notification = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user'),
        { read } = req.query

    try {
        console.log(JSON.parse(read as any));
        console.log(read);
        if (JSON.parse(read as any) && read) {

            const y: any = await notificationModel.find({
                mark: type.notification.unread,
                createdBy: new ObjectId(user?._id),
            })
            const x: any = await notificationModel.updateMany({
                mark: type.notification.unread,
                createdBy: new ObjectId(user?._id),
            }, {
                mark: type.notification.read
            })
            console.log(y, '----');
            console.log(x);
            console.log(x?.mark);
            return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess('read notification'), {}, {}))
        }



        return res.status(200).json(new apiResponse(200, responseMessage?.invalidId("query request"), {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const count_notification = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user')

    try {
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess("read notification"), {
            notificationCount: await notificationModel.countDocuments({
                status: type?.notification?.unread,
                createdBy: new ObjectId(user?._id),
                isActive: true
            })
        }, {}))
    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}