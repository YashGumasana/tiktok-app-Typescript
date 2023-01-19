import { followerModel, notificationModel, userModel } from '../../database'
import { apiResponse, notification_template, type } from '../../common'
import { Request, Response } from 'express'
import { reqInfo, notification_to_user, responseMessage } from '../../helper'
import { ObjectId, Types } from 'mongoose'
import { pipeline } from 'stream'

const ObjectId = Types.ObjectId

export const follower_request = async (req: Request, res: Response) => {
    reqInfo(req)
    let { id } = req.params,
        parallel_array: any = [],
        user: any = req.header('user')

    try {
        let existFollow = await followerModel.findOne({
            createdBy: new ObjectId(user._id),
            followerId: new ObjectId(id),
            isActive: true,
            isBlock: false
        })

        if (existFollow != null) {
            return res.status(409).json(new apiResponse(409, responseMessage?.customMessage('Your request already has been sent!'), {}, {}))
        }
        else {


            let add_follow = await new followerModel({
                createdBy: new ObjectId(user._id),
                followerId: new ObjectId(id)
            }).save()

            let userData = await userModel.findOne({ _id: new ObjectId(id), isActive: true, isBlock: false })

            // console.log(user);
            // console.log(user?.notification);
            // console.log(user?.notification?.follow);
            // console.log(user?.notification?.all);
            // console.log(userData?._id.toString());
            // console.log(user?._id.toString());

            if ((user?.notification?.follow || user?.notification?.all) && (userData?._id.toString() !== user?._id.toString())) {

                let notification = await notification_template.follow_request({
                    followerId: id,
                    ...user._doc
                })

                parallel_array.push(new notificationModel({
                    title: notification.template.body,
                    followerId: new ObjectId(user?._id),
                    isActive: true,
                    isBlock: false,
                    createdBy: new ObjectId(id),
                    type: type.notification.follow_request
                }).save())

                parallel_array.push(notification_to_user(userData || { deviceToken: [] }, notification?.data, notification?.template))
            }

            await Promise.all(parallel_array)
            // console.log(parallel_array);
            return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('follow request'), {}, {}))
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}


export const accept_follower_request = async (req: Request, res: Response) => {
    reqInfo(req)
    let { id } = req.params,
        user: any = req.header('user')

    try {
        let followData = await followerModel.findOneAndUpdate({
            createdBy: new ObjectId(id),
            followerId: new ObjectId(user?._id),
            isActive: true,
            isBlock: false,
            requestStatus: type.follower.pending
        },
            {
                requestStatus: type.follower.accept
            },
        )

        // console.log(followData);
        if (!followData) {
            return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('follower'), {}, {}))
        }

        if (user?.notification?.follow || user?.notification?.all) {
            let notification = await notification_template.accept_request({ createdBy: id, ...user._doc })

            let userData: any = await Promise.all([
                userModel.findOne(
                    {
                        _id: new ObjectId(id),
                        isActive: true,
                        isBlock: false
                    }),

                userModel.updateOne({
                    _id: new ObjectId(id),
                    isActive: true,
                    isBlock: false
                },
                    {
                        $inc: { following: 1 }
                    }),

                userModel.updateOne({
                    _id: new ObjectId(user?._id),
                    isActive: true,
                    isBlock: false
                }, {
                    $inc: { followers: 1 }
                }),
            ])[0]

            if (userData?._id.toString() !== user?._id.toString()) {
                new notificationModel({
                    title: notification.template.body,
                    followerId: new ObjectId(user?._id),
                    isActive: true,
                    isBlock: false,
                    createdBy: new ObjectId(id),
                    type: type.notification.accept_request
                }).save()

                notificationModel.updateOne({
                    followerId: new ObjectId(id),
                    createdBy: new ObjectId(user?._id),
                    isActive: true,
                    isBlock: false
                }, {
                    title: notification?.action?.body,
                    isActive: false
                })

                await notification_to_user(userData || { deviceToken: [] }, notification?.data, notification?.template)
            }
        }
        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('accept follow request'), {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const reject_follower_request = async (req: Request, res: Response) => {
    reqInfo(req)
    let { id } = req.params,
        parallel_array: any = [],
        user: any = req.header('user')

    try {
        let followData = await followerModel.findOneAndUpdate({
            createdBy: new ObjectId(id),
            followerId: new ObjectId(user?._id),
            isActive: true,
            isBlock: false,
            requestStatus: type.follower.pending
        }, {
            requestStatus: type.follower.reject
        })

        if (!followData) {
            return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('follower'), {}, {}))
        }

        if (user?.notification?.follow || user?.notification?.all) {
            let notification = await notification_template.reject_request({
                createdBy: id,
                ...user._doc
            })

            let userData: any = await Promise.all([
                userModel.findOne({
                    _id: new ObjectId(id),
                    isActive: true,
                    isBlock: false
                })
            ])[0]

            if (userData?._id.toString() !== user?._id.toString()) {
                new notificationModel({
                    title: notification.template.body,
                    followerId: new ObjectId(user?._id),
                    isActive: true,
                    isBlock: false,
                    createdBy: new ObjectId(id),
                    type: type.notification.reject_request
                }).save(),

                    notificationModel.updateOne({
                        followerId: new ObjectId(id),
                        createdBy: new ObjectId(user?._id),
                        isActive: true,
                        isBlock: false,
                    }, {
                        title: notification?.action?.body,
                        isActive: false
                    })

                await notification_to_user(userData || { deviceToken: [] }, notification?.data, notification?.template)
            }
        }

        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('reject follow request'), {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const unfollower_user = async (req: Request, res: Response) => {
    reqInfo(req)
    let { id } = req.params,
        parallel_array: any = [],
        user: any = req.header('user')

    try {
        let followData = await followerModel.findOneAndUpdate({
            createdBy: new ObjectId(user?._id),
            followerId: new ObjectId(id),
            isActive: true,
            isBlock: false,
            requestStatus: type.follower.accept
        },
            {
                requestStatus: type.follower.pending,
                isActive: false
            })

        if (!followData) {
            return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('follower'), {}, {}))
        }

        if (user?.notification?.follow || user?.notification?.all) {
            let notification = await notification_template.reject_request({
                createdBy: id,
                ...user._doc
            })

            let userData = await Promise.all([
                userModel.findOne({
                    _id: new ObjectId(id),
                    isActive: true,
                    isBlock: false
                }),

                userModel.updateOne({
                    _id: new ObjectId(id),
                    isActive: true,
                    isBlock: false,
                    followers: { $gt: 0 }
                },
                    {
                        $inc: { followers: -1 }
                    }),

                userModel.updateOne({
                    _id: new ObjectId(user?._id),
                    isActive: true,
                    isBlock: false,
                    following: { $gt: 0 }
                }, {
                    $inc: { following: -1 }
                })
            ])[0]
        }

        await followerModel.deleteOne({
            createdBy: new ObjectId(user?._id),
            followerId: new ObjectId(id),
            isActive: false,
            isBlock: false,
            requestStatus: type.follower.pending
        })

        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('Unfollow user'), {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}


export const cancelrequest_user = async (req: Request, res: Response) => {
    reqInfo(req)

    let { id } = req.params,
        parallel_array: any = [],
        user: any = req.header('user')

    try {
        let followData = await followerModel.deleteOne({
            createdBy: new ObjectId(user?._id),
            followerId: new ObjectId(id),
            isActive: true,
            isBlock: false,
            requestStatus: type.follower.pending
        })

        if (followData.deletedCount > 0) {
            notificationModel.updateOne({
                followerId: new ObjectId(id),
                createdBy: new ObjectId(user?._id),
                isActive: true,
                isBlock: false,
            }, {
                isActive: false
            })

            return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('Cancel Request'), {}, {}))
        }
        else {
            return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('follower'), {}, {}))
        }


    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}


export const get_follower_pagination = async (req: Request, res: Response) => {
    reqInfo(req)
    let { limit, page, search } = req.body,
        user = req.header('user') as any,
        skip: number,
        match: any = {},
        search_match: any = {},
        response: any,
        count: number

    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))


    try {
        match = {
            isActive: true,
            isBlock: false,
            followerId: req.params.id ? new ObjectId(req.params.id) : new ObjectId(user?._id),
            requestStatus: type.follower.accept,
        }

        if (search && search != "") {
            let usernameArryay: Array<any> = []
            search = search.split(" ")

            await search.forEach((data: any) => {
                console.log(data);
                usernameArryay.push({
                    "user.username": {
                        $regex: data,
                        $options: 'si'
                    }
                })
            })
            console.log(usernameArryay);
            search_match.$or = [{ $and: usernameArryay },];
            console.log(search_match);
        }

        [response, count] = await Promise.all([
            followerModel.aggregate([
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
                                                $eq:
                                                    ['$isActive', true]
                                            },

                                            {
                                                $eq:
                                                    ['$isBlock', false]
                                            }

                                        ]
                                    }
                                }
                            },

                            { $project: { username: 1, image: 1 } },
                        ],
                        as: "user"
                    }
                },
                { $match: search_match },
                { $project: { user: 1, requestStatus: 1 } }
            ]), followerModel.countDocuments(match)
        ])

        // console.log('---');
        // console.log(response);
        // console.log(user._id);
        // console.log(response[0].user[0]._id);
        // console.log(response.length);
        for (let i = 0; i < response.length; i++) {
            let tem = await followerModel.findOne({
                createdBy: new ObjectId(user._id),
                followerId: new ObjectId(response[i]?.user[0]?._id),
                isActive: true,
                isBlock: false
            })
            if (tem == null) {
                response[i].requestStatus = 2
            }
            else {
                if (tem.requestStatus = 0) {
                    response[i].requestStatus = 0
                }
                else if (tem.requestStatus = 1) {
                    response[i].requestStatus = 1
                }
            }
        }
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('follower'), {
            follower_data: response,
            state: {
                page,
                limit,
                page_limit: Math.ceil(count / limit),
                data_count: count
            }
        }, {}))

    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}


export const get_following_pagination = async (req: Request, res: Response) => {
    reqInfo(req)
    let { limit, page, search } = req.body,
        user = req.header('user') as any,
        skip: number,
        match: any = {},
        search_match: any = {},
        response: any,
        count: any

    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))

    try {
        match = {
            isActive: true,
            isBlock: false,
            requestStatus: type.follower.accept,
            createdBy: req.params.id ? new ObjectId(req.params.id) : new ObjectId(user?._id)
        }

        if (search && search != "") {
            let usernameArryay: Array<any> = []
            search = search.split(" ")

            await search.forEach((data: any) => {
                usernameArryay.push({
                    "user.username": {
                        $regex: data,
                        $option: 'si'
                    }
                })
            })
            search_match.$or = [{ $and: usernameArryay },];
        }

        [response, count] = await Promise.all([
            followerModel.aggregate([
                { $match: match },
                { $sort: { createdAt: 1 } },
                { $skip: skip },
                { $limit: limit },
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
                        as: "user"
                    }
                },
                { $match: search_match },
                { $project: { user: 1, requestStatus: 1 } }
            ]),
            // followerModel.countDocuments(match)
            followerModel.aggregate([
                { $match: match },
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
                                                $eq: ['isActive', true]
                                            },

                                            {
                                                $eq: ['$isBlock', false]
                                            },
                                        ]
                                    }
                                }
                            },
                            { $project: { _id: 1 } }
                        ],
                        as: "user"
                    }
                },
                { $match: search_match },
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 }
                    }
                }
            ])
        ])

        // console.log(count);
        for (let i = 0; i < response.length; i++) {
            let tem = await followerModel.findOne({
                createdBy: new ObjectId(user._id),
                followerId: new ObjectId(response[i]?.user[0]?._id),
                isActive: true,
                isBlock: false
            })

            if (tem == null) {
                response[i].requestStatus = 2
            }
            else {
                if (tem.requestStatus = 0) {
                    response[i].requestStatus = 0
                }
                else if (tem.requestStatus = 1) {
                    response[i].requestStatus = 1
                }
            }
        }

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('following'), {
            following_data: response,
            state: {
                page,
                limit,
                page_limit: Math.ceil(count[0]?.count || 1 / limit),
                data_count: count[0]?.count || 0
            }
        }, {}))



    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_follower_request_pagination = async (req: Request, res: Response) => {
    reqInfo(req)

    let { limit, page, search } = req.body,
        user = req.header('user') as any,
        skip: number,
        match: any = {},
        search_match: any = {},
        response: any,
        count: any

    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))

    try {
        match = {
            isActive: true,
            isBlock: false,
            requestStatus: type.follower.pending,
            followerId: new ObjectId(user?._id)
        }

        if (search && search != "") {
            let usernameArray: Array<any> = []
            search = search.split(" ")
            await search.forEach((data: any) => {
                usernameArray.push({
                    "user.username": {
                        $regex: data,
                        $options: 'si'
                    }
                })
            })

            search_match.$or = [{ $and: usernameArray },];
        }

        [response, count] = await Promise.all([
            followerModel.aggregate([
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
                                                $eq: ['$isBlock', false
                                                ]
                                            },
                                        ]
                                    }
                                }
                            },
                            { $project: { username: 1, image: 1 } }
                        ],
                        as: "user"
                    }
                }, { $match: search_match },
                { $project: { user: 1, requestStaus: 1 } }
            ]),

            followerModel.aggregate([
                { $match: match },
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
                                                $eq:
                                                    ['$isActive', true]
                                            },

                                            {
                                                $eq: ['$isBlock', false]
                                            }
                                        ]
                                    }
                                }
                            },
                            { $project: { _id: 1 } }
                        ],
                        as: "user"
                    }
                },
                { $match: search_match },
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 }
                    }
                }
            ])
        ])

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('follow request'), {
            follower_data: response,
            state: {
                page,
                limit,
                page_limit: Math.ceil(count[0]?.count || 1 / limit),
                data_count: count[0]?.count || 0
            }
        }, {}))


    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_follower_request_sent_pagination = async (req: Request, res: Response) => {
    reqInfo(req)
    let { limit, page, search } = req.body,
        user = req.header('user') as any,
        skip: number,
        match: any = {},
        search_match: any = {},
        response: any,
        count: any

    console.log(user, '+++');
    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))

    try {
        match = {
            isActive: true,
            isBlock: false,
            requestStatus: type.follower.pending,
            createdBy: new ObjectId(user?._id)
        }

        if (search && search != "") {
            let usernameArray: Array<any> = []
            search = search.split(" ")
            await search.forEach((data: any) => {
                usernameArray.push({
                    "user.username": {
                        $regex: data,
                        $options: 'si'
                    }
                })
            })
            search_match.$or = [{ $and: usernameArray },];
        }

        [response, count] = await Promise.all([
            followerModel.aggregate([
                { $match: match },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
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
                                            }
                                        ],
                                    },
                                }
                            },
                            { $project: { username: 1, image: 1 } }
                        ],
                        as: 'user'
                    }
                },
                { $match: search_match },
                { $project: { user: 1, requestStatus: 1 } }
            ]),

            followerModel.aggregate([
                { $match: match },
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
                                                $eq: ['isActive', true]
                                            },

                                            {
                                                $eq: ['$isBlock', false]
                                            }
                                        ]
                                    }
                                }
                            },
                            { $project: { _id: 1 } }
                        ],
                        as: "user"
                    }
                },
                { $match: search_match },
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 }
                    }
                }
            ])
        ])

        console.log(response);




        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('following'), {
            following_data: response,
            state: {
                page,
                limit,
                page_limit: Math.ceil(count[0]?.count || 1 / limit),
                data_count: count[0]?.count || 0
            }
        }, {}))

    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const delete_follower = async (req: Request, res: Response) => {
    reqInfo(req)

    let id = (req.params.id) as any,
        user = req.header('user') as any

    try {
        let response = await followerModel.findOneAndUpdate({
            createdBy: new ObjectId(id),
            followerId: new ObjectId(user?._id),
            isActive: true,
            isBlock: false,
            requestStatus: type.follower.accept,
        }, {
            requestStatus: type.follower.pending,
            isActive: false
        })

        if (!response) {
            return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('follower'), {}, {}))
        }

        await Promise.all([
            userModel.updateOne({
                _id: new ObjectId(id),
                isActive: true,
                isBlock: false,
                following: { $gt: 0 }
            },
                {
                    $inc: { following: -1 }
                }),

            userModel.updateOne({
                _id: new ObjectId(user?._id), isActive: true, isBlock: false, followers: { $gt: 0 }
            },
                {
                    $inc: { followers: -1 }
                })
        ])

        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess('follower'), {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}


export const get_pending_follower_request_count = async (req: Request, res: Response) => {
    reqInfo(req)
    let user: any = req.header('user')

    try {
        let count = await followerModel.countDocuments({
            followerId: new ObjectId(user?._id),
            isActive: true,
            isBlock: false,
            requestStatus: type.follower.pending
        })

        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('get pending follower'), { count }, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}
// a = 6369f41c554bed176f2d2872
// b = 6369f454554bed176f2d287b
// c = 6369f471554bed176f2d2884
// d = 6369f49d554bed176f2d288d
