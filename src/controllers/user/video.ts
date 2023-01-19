import { reqInfo } from "../../helper";
import { dislikeModel, likeModel, notificationModel, tagModel, userModel, videoModel } from "../../database";
import { apiResponse, URL_decode, notification_template, type, getArea, not_first_one, RadiusInKm } from "../../common";
import { Request, Response } from "express";
import { commanblockcheck, deleteImage, notification_to_user, responseMessage } from "../../helper";
import { ObjectId, Types } from "mongoose";

const ObjectId = Types.ObjectId

export const add_video = async (req: Request, res: Response) => {
    reqInfo(req)

    try {
        let response: any,
            body: any = req.body,
            user: any = req.header('user')

        body.createdBy = new ObjectId(user?._id)

        let existTags = (await tagModel.aggregate([
            { $match: { name: { $in: body.tag } } },
            {
                $group: {
                    _id: null,
                    tag: { $addToSet: "$name" }
                }
            }
        ]))[0]?.tag || []

        // console.log(existTags);
        let newTags = not_first_one(body.tag, existTags)
        // console.log(newTags);

        newTags.forEach((data, index) => {
            newTags[index] = { name: data }
        })

        // console.log(body, '****');
        response = await new videoModel(body).save()
        // console.log(newTags, '---');
        if (response) {
            await Promise.all([
                await tagModel.insertMany(newTags),
                await tagModel.updateMany({ name: { $in: body.tag } },
                    {
                        $inc: { totalUsed: 1 },
                        $addToSet: { videoIds: [new ObjectId(response?._id)] }
                    }),

            ])
            return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('video'), {}, {}))
        }
        else return res.status(400).json(new apiResponse(400, responseMessage?.addDataError, {}, `${response}`))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const update_video = async (req: Request, res: Response) => {
    reqInfo(req)

    try {
        let response: any,
            body: any = req.body

        response = await videoModel.findOneAndUpdate({
            _id: new ObjectId(body?.id),
            isActive: true,
            isBlock: false
        }, body)

        if (!response) {
            return res.status(400).json(new apiResponse(400, responseMessage?.getDataNotFound('video'), {}, `${response}`))
        }

        // console.log(response, '--//');
        let newTags = not_first_one(body.tag, response.tag)
        console.log(newTags);
        // console.log('---');
        let removeTags = not_first_one(response.tag, body.tag)
        // console.log(removeTags);
        // console.log(newTags, '-+-+');
        body.newTags = newTags
        // console.log(body.newTags, '-+-+-');

        let tag: any = []

        newTags.forEach((data, index) => {
            tag[index] = { name: data }
        })

        // console.log(body.newTags, '-+-+-');
        // console.log(newTags, ':::');

        await Promise.all([
            await tagModel.insertMany(tag),
            await tagModel.updateMany({ name: { $in: body.newTags } },
                {
                    $inc: { totalUsed: 1 },
                    $addToSet: { videoIds: [new ObjectId(response?._id)] }
                }),
            await tagModel.updateMany({ name: { $in: removeTags } },
                {
                    $inc: { totalUsed: -1 },
                    $pull: { videoIds: [new ObjectId(response?._id)] }
                }),
        ])

        // video url delete
        console.log(body?.url);
        console.log(response?.url);
        if (body?.url != response?.url) {
            let [folder_name, image_name] = URL_decode(response?.url)
            console.log(folder_name, image_name, '+++');
            await deleteImage(image_name, folder_name)
        }
        return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess('video'), {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const get_video_by_trending_pagination = async (req: Request, res: Response) => {
    reqInfo(req)
    let { limit, page, tagName } = req.body,
        user = req.header('user') as any,
        blocklist = req.header('blocklist') as any,
        skip: number,
        match: any = {
            createdBy: { $nin: blocklist },
            isActive: true,
            isBlock: false
        },
        response: any,
        count: number

    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))

    console.log(user);
    try {
        response = await videoModel.aggregate([
            { $sort: { totalView: -1 } },
            { $match: match },
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
                                            $eq:
                                                ['$isBlock', false]
                                        }
                                    ],
                                },
                            }
                        },
                        {
                            $lookup: {
                                from: "followers",
                                let: { followerId: '$_id' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    {
                                                        $eq: ['$followerId', '$$followerId']
                                                    },

                                                    {
                                                        $eq: ['$isActive', true]
                                                    },

                                                    {
                                                        $eq: ['$isBlock', false]
                                                    },

                                                    {
                                                        $eq: ['$requestStatus', 1]
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                ],
                                as: "followingBy"
                            }
                        },
                        {
                            $addFields: {
                                isfollowing: {
                                    $cond: {
                                        if: {
                                            $in: [new ObjectId(user?._id),
                                                "$followingBy.createdBy"]
                                        },
                                        then: true,
                                        else: false
                                    }
                                },
                            }
                        },
                        {
                            $project: {
                                username: 1,
                                image: 1,
                                isfollowing: 1,
                                accountType: 1
                            }
                        }
                    ],
                    as: "user"
                }
            }, {
                $match: {
                    $or: [
                        {
                            $and: [
                                { "user.accountType": { $in: [0] } },
                                { "user.isfollowing": { $in: [false, true] } }
                            ]
                        },
                        {
                            $and: [
                                {
                                    "user.accountType": { $in: [1] }
                                },
                                {
                                    "user.isfollowing": { $in: [true] }
                                }
                            ]
                        }
                    ]
                }
            },
            {
                $project: {
                    createdBy: 0, createdAt: 0, listViewUser: 0, updatedAt: 0, __v: 0, isActive: 0, isBlock: 0, likedBy: 0, suburb: 0, state: 0, city: 0, country: 0, latitude: 0, longitude: 0, listViewr: 0, dislikedBy: 0, tag: 0,
                    user: 0
                }
            }
        ])

        count = await videoModel.countDocuments(match)
        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('video by tag name'), {
            video_data: response,
            state: {
                page,
                limit,
                page_limit: Math.ceil(count / limit), data_count: count
            }
        }, {}))

    } catch (error) {
        console.log(error)
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}


export const delete_video = async (req: Request, res: Response) => {
    reqInfo(req)
    let id = (req.params.id) as any,
        user: any = req.header('user')

    try {

        let response = await videoModel.findOneAndUpdate({
            _id: new ObjectId(id),
            isActive: true,
            createdBy: new ObjectId(user?._id)
        }, {
            isActive: false
        })

        if (!response) {
            return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('video'), {}, {}))
        }

        let [folder_name, image_name] = URL_decode(response?.url)

        await Promise.all([
            await tagModel.updateMany({ name: { $in: response?.tag } },
                { $inc: { totalUsed: -1 } })
        ])

        return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess('video'), {}, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}


export const like_video = async (req: Request, res: Response) => {
    reqInfo(req)
    let { id } = req.params,
        paraller_array: any = [],
        user: any = req.header('user')

    try {
        let existLike = await likeModel.findOne({
            createdBy: new ObjectId(user._id),
            videoId: new ObjectId(id),
            isActive: true,
            isBlock: false,
            type: type.like.video
        })

        if (existLike != null) {
            paraller_array = [
                likeModel.deleteOne({
                    createdBy: new ObjectId(user._id),
                    videoId: new ObjectId(id)
                }),

                userModel.updateOne({
                    _id: new ObjectId(user?._id),
                    isActive: true,
                    isBlock: false,
                    likedObs: { $gt: 0 }
                },
                    {
                        $inc: {
                            likedObs: -1
                        }
                    }),

                videoModel.updateOne({
                    _id: new ObjectId(id),
                    isActive: true,
                    isBlock: false,
                    totalLike: { $gt: 0 }
                },
                    {
                        $inc: { totalLike: -1 }
                    })
            ]
            await Promise.all(paraller_array)

            return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess('like'), {}, {}))
        }
        else {
            let add_like: any = await new likeModel({
                createdBy: new ObjectId(user._id),
                videoId: new ObjectId(id),
                type: type.like.video
            }).save()

            let add_like1 = await dislikeModel.deleteOne({
                createdBy: new ObjectId(user._id),
                videoId: new ObjectId(id)
            })

            paraller_array = [
                userModel.updateOne({
                    _id: new ObjectId(add_like?.createdBy),
                    isActive: true,
                    isBlock: false
                },
                    {
                        $inc: {
                            likedObs: 1
                        }
                    }),

                add_like1.deletedCount > 0 ? videoModel.updateOne({
                    _id: new ObjectId(id),
                    isActive: true,
                    isBlock: false
                }, {
                    $inc: {
                        totalLike: 1,
                        totalDislike: -1
                    }
                }) :
                    videoModel.updateOne({
                        _id: new ObjectId(id),
                        isActive: true,
                        isBlock: false
                    }, {
                        $inc: { totalLike: 1 }
                    }),
            ]

            if (user?.notification?.video || user?.notification?.all) {
                console.log('+++');
                let notification = await notification_template.like({
                    videoId: id, ...user._doc
                })

                let videoOwnerData = await videoModel.aggregate([
                    {
                        $match: {
                            _id: new ObjectId(id),
                            isActive: true,
                            isBlock: false
                        }
                    },
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
                                {
                                    $project: {
                                        deviceToken: 1
                                    }
                                }
                            ],
                            as: "user"
                        }
                    },
                    { $project: { user: 1 } },
                ])

                console.log(videoOwnerData);
                console.log(videoOwnerData[0]?.user[0]);
                console.log(user._id);
                if (videoOwnerData[0]?.user[0]?._id.toString() !== user._id.toString()) {
                    paraller_array.push(
                        new notificationModel({
                            title: notification.template.body,
                            createdBy: new ObjectId(videoOwnerData[0]?.user[0]?._id),
                            userId: new ObjectId(user?._id),
                            isActive: true,
                            isBlock: false,
                            videoId: new ObjectId(id),
                            type: type.notification.like
                        }).save()
                    )

                    paraller_array.push(notification_to_user(
                        videoOwnerData[0]?.user[0] || { deviceToken: [] },
                        notification?.data,
                        notification?.template
                    ))
                }
            }
            await Promise.all(paraller_array)

            return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('like'), {}, {}))
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}


export const dislike_video = async (req: Request, res: Response) => {
    reqInfo(req)
    let { id } = req.params,
        paraller_array: any = [],
        user: any = req.header('user')

    try {
        let existDislike = await dislikeModel.findOne({
            createdBy: new ObjectId(user._id),
            videoId: new ObjectId(id),
            isActive: true,
            isBlock: false
        })

        if (existDislike != null) {
            paraller_array = [
                dislikeModel.deleteOne({
                    createdBy: new ObjectId(user._id),
                    videoId: new ObjectId(id)
                }),

                userModel.updateOne({
                    _id: new ObjectId(user?._id),
                    isActive: true,
                    isBlock: false,
                    likedObs: { $gt: 0 }
                }, {
                    $inc: { likedObs: -1 }
                }),

                videoModel.updateOne(
                    {
                        _id: new ObjectId(user?._id),
                        isActive: true,
                        isBlock: false,
                        likedObs: { $gt: 0 }
                    },
                    { $inc: { likedObs: -1 } }
                ),

                videoModel.updateOne({
                    _id: new ObjectId(id),
                    isActive: true,
                    isBlock: false,
                    totalDislike: { $gt: 0 }
                },
                    {
                        $inc: {
                            totalDislike: -1
                        }
                    })
            ]

            await Promise.all(paraller_array)
            return res.status(200).json(new apiResponse(200, responseMessage?.deleteDataSuccess('dislike'), {}, {}))
        }

        else {
            let add_dislike: any = await new dislikeModel({
                createdBy: new ObjectId(user._id),
                videoId: new ObjectId(id)
            }).save()

            let add_like1 = await likeModel.deleteOne({
                createdBy: new ObjectId(user._id),
                videoId: new ObjectId(id),
                type: type.like.video
            })

            if (user?.notification?.video || user?.notification?.all) {
                let notification = await notification_template.dislike({
                    videoId: id,
                    ...user._doc
                })

                let videoOwnerData = await videoModel.aggregate([
                    {
                        $match: {
                            _id: new ObjectId(id),
                            isActive: true,
                            isBlock: false
                        }
                    },

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
                                                },
                                            ]
                                        }
                                    }
                                },
                                {
                                    $project: {
                                        deviceToken: 1
                                    }
                                }
                            ],
                            as: "user"
                        }
                    },
                    { $project: { user: 1 } }
                ])

                if (videoOwnerData[0]?.user[0]?._id.toString() !== user._id.toString()) {

                    paraller_array.push(new notificationModel({
                        title: notification.template.body,
                        createdBy: new ObjectId(videoOwnerData[0]?.user[0]?._id),
                        userId: new ObjectId(user?._id),
                        isActive: true,
                        isBlock: false,
                        videoId: new ObjectId(id),
                        type: type.notification.dislike
                    }).save())

                    paraller_array.push(notification_to_user(videoOwnerData[0]?.user[0] || { deviceToken: [] }, notification?.data, notification?.template))
                }
            }

            paraller_array.push(userModel.updateOne({
                _id: new ObjectId(add_dislike?.createdBy),
                isActive: true,
                isBlock: false
            }, {
                $inc: {
                    likedObs: 1
                }
            }),)

            paraller_array.push(add_like1.deletedCount > 0 ? videoModel.updateOne({
                _id: new ObjectId(id),
                isActive: true,
                isBlock: false
            }, {
                $inc: {
                    totalDislike: 1,
                    totalLike: -1
                }
            }) : videoModel.updateOne({
                _id: new ObjectId(id),
                isActive: true,
                isBlock: false
            },
                {
                    $inc: { totalDislike: 1 }
                }))

            await Promise.all(paraller_array)

            return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('dislike'), {}, {}))
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}


export const get_video_pagination = async (req: Request, res: Response) => {
    reqInfo(req)

    let { limit, page, latitude, longitude, state, suburb, city, country } = req.body,
        user = req.header('user') as any,
        blocklist = req.header('blocklist') as any,
        skip: number,
        match: any = {},
        response: any,
        count: number

    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))

    try {
        match = { isActive: true, isBlock: false }
        match.createdBy = { $nin: blocklist }

        if (latitude != null && longitude != null) {
            let location_data = getArea({
                lat: latitude, long: longitude
            }, RadiusInKm)

            match.latitude = { $gte: location_data.min.lat, $lte: location_data.max.lat }

            match.longitude = { $gte: location_data.min.long, $lte: location_data.max.long }
        }

        if (state) {
            match.state = state
        }
        if (suburb) {
            match.suburb = suburb
        }
        if (city) {
            match.city = city
        }
        if (country) {
            match.country = country
        }

        [response, count] = await Promise.all([
            videoModel.aggregate([
                { $match: match },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: "likes",
                        let: { videoId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: ['$videoId', '$$videoId']
                                            },

                                            {
                                                $eq: ['$isActive', true]
                                            },

                                            {
                                                $eq:
                                                    ['$isBlock', false]
                                            },
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "likedBy"
                    }
                },
                // console.log('1'),
                {
                    $lookup: {
                        from: "dislikes",
                        let: { videoId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: ['$videoId', '$$videoId']
                                            },

                                            {
                                                $eq:
                                                    ['$isActive', true]
                                            },

                                            {
                                                $eq:
                                                    ['$isBlock', false]
                                            },
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "dislikedBy"
                    }
                },
                // console.log(2),
                {
                    $lookup: {
                        from: "followers",
                        let: { createdBy: '$createdBy' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq:
                                                    ['$createdBy', new ObjectId(user?._id)]
                                            },

                                            {
                                                $eq:
                                                    ['$followerId', '$$createdBy']
                                            },

                                            {
                                                $eq:
                                                    ['$isActive', true]
                                            },

                                            {
                                                $eq:
                                                    ['$isBlock', false]
                                            },
                                        ],
                                    },
                                }
                            },
                            {
                                $project:
                                {
                                    requestStatus: 1
                                }
                            }
                        ],
                        as: "follower"
                    }
                },
                // console.log(3),

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
                                            },
                                        ]
                                    }
                                }
                            },
                            {
                                $lookup: {
                                    from: "followers",
                                    let: { followerId: '$_id' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        {
                                                            $eq: ['$followerId', '$$followerId']
                                                        },

                                                        {
                                                            $eq: ['$isActive', true]
                                                        },

                                                        {
                                                            $eq: ['$isBlock', false]
                                                        },

                                                        {
                                                            $eq: ['$requestStatus', 1]
                                                        }
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    as: "followingBy"
                                }
                            },
                            {
                                $addFields: {
                                    isfollowing: {
                                        $cond: {
                                            if:
                                            {
                                                $in: [new ObjectId(user?._id), "$followingBy.createdBy"]
                                            },

                                            then: true,
                                            else: false
                                        }
                                    }
                                }
                            },
                            {
                                $project: {
                                    username: 1, image: 1, isfollowing: 1, accountType: 1
                                }
                            }
                        ],
                        as: "user"
                    }
                },
                {
                    $lookup: {
                        from: "categories",
                        let: { categoryId: '$categoryId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq:
                                                    ['$_id', '$$categoryId']
                                            },

                                            {
                                                $eq: ['$isActive', true]
                                            },

                                            {
                                                $eq:
                                                    ['$isBlock', false]
                                            }
                                        ],
                                    },
                                }
                            },
                            {
                                $project: { name: 1 }
                            }
                        ],
                        as: "category"
                    }
                },
                {
                    $addFields: {
                        isLike: {
                            $cond: {
                                if: {
                                    $in: [new ObjectId(user?._id), "$likedBy.createdBy"]
                                },
                                then: true,
                                else: false
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        isDislike: {
                            $cond: {
                                if: {
                                    $in: [new ObjectId(user?._id), "$dislikedBy.createdBy"]
                                },
                                then: true,
                                else: false
                            },
                        }
                    }
                },

                {
                    $match: {
                        $or: [
                            {
                                $and: [
                                    {
                                        "user.accountType": { $in: [0] }
                                    },
                                    {
                                        "user.isfollowing":
                                        {
                                            $in: [false, true]
                                        }
                                    }]
                            },

                            {
                                $and: [
                                    {
                                        "user.accountType": { $in: [1] }
                                    },
                                    {
                                        "user.isfollowing":
                                        {
                                            $in: [true]
                                        }
                                    }]
                            }
                        ]
                    }
                },

                {
                    $project: {
                        createdBy: 0, createdAt: 0, updatedAt: 0, __v: 0, isActive: 0, isBlock: 0, likedBy: 0, suburb: 0, state: 0, city: 0, country: 0, latitude: 0, longitude: 0, listViewUser: 0, dislikedBy: 0, tag: 0
                    }
                }
            ]),
            videoModel.countDocuments(match)
        ])

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('video'), {
            video_data: response,
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




export const get_video_by_tag_pagination = async (req: Request, res: Response) => {
    reqInfo(req)

    let { limit, page } = req.body,
        user = req.header('user') as any,
        blocklist = req.header('blocklist') as any,
        skip: number,
        match: any = { isActive: true, isBlock: false },
        match1: any = {
            createdBy: { $nin: blocklist },
            isActive: true,
            isBlock: false
        },
        response: any,
        count: number,
        trending: any

    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))

    try {
        [response, count, trending] = await Promise.all([
            tagModel.aggregate([
                { $match: match },
                { $sort: { totalUsed: -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $addFields: {
                        videoList: { $slice: ["$videoIds", 0, 6] }
                    }
                },
                {
                    $lookup: {
                        from: "videos",
                        let: { videoList: '$videoList' },
                        pipeline: [
                            {
                                $match: {
                                    createdBy: { $nin: blocklist },
                                    $expr: {
                                        $and: [
                                            {
                                                $in: ['$_id', '$$videoList']
                                            },

                                            {
                                                $eq:
                                                    ['$isActive', true]
                                            },

                                            {
                                                $eq:
                                                    ['$isBlock', false]
                                            },
                                        ]
                                    }
                                }
                            },

                            {
                                $lookup: {
                                    from: "likes",
                                    let: { videoId: '$_id' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        {
                                                            $eq: ['$videoId', '$$videoId']
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
                                        }
                                    ],
                                    as: "likedBy"
                                }
                            },
                            {
                                $lookup: {
                                    from: "dislikes",
                                    let: { videoId: '$_id' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        {
                                                            $eq: ['$videoId', '$$videoId']
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
                                        }
                                    ],
                                    as: "dislikedBy"
                                }
                            },
                            {
                                $lookup: {
                                    from: "followers",
                                    let: { createdBy: '$createdBy' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        {
                                                            $eq: ['$createdBy', new ObjectId(user?._id)]
                                                        },

                                                        {
                                                            $eq: ['$followerId', '$$createdBy']
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
                                            $project: {
                                                requestStatus: 1
                                            }
                                        }
                                    ],
                                    as: "follower"
                                }
                            },
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
                                        },
                                        {
                                            $lookup: {
                                                from: "followers",
                                                let: { followerId: '$_id' },

                                                pipeline: [
                                                    {
                                                        $match: {
                                                            $expr: {
                                                                $and: [
                                                                    { $eq: ['$followerId', '$$followerId'] },
                                                                    { $eq: ['$isActive', true] },
                                                                    { $eq: ['$isBlock', false] },
                                                                    { $eq: ['$requestStatus', 1] }
                                                                ]
                                                            }
                                                        }
                                                    }
                                                ],
                                                as: "followingBy"
                                            }
                                        },
                                        {
                                            $addFields: {
                                                isfollowing: {
                                                    $cond: {
                                                        if: {
                                                            $in: [new ObjectId(user?._id), "$followingBy.createdBy"]
                                                        },
                                                        then: true,
                                                        else: false
                                                    }
                                                }
                                            }
                                        },
                                        { $project: { username: 1, image: 1, isfollowing: 1, accountType: 1 } }
                                    ],
                                    as: "user"
                                }
                            },
                            {
                                $lookup: {
                                    from: "categories",
                                    let: { categoryId: '$categoryId' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        {
                                                            $eq: ['$_id', '$$categoryId']
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
                                        { $project: { name: 1 } }
                                    ],
                                    as: "category"
                                }
                            },
                            {
                                $addFields: {
                                    isLike: {
                                        $cond: {
                                            if: {
                                                $in: [new ObjectId(user?._id), "$likedBy.createdBy"]
                                            },
                                            then: true,
                                            else: false
                                        }
                                    }
                                }
                            },
                            {
                                $addFields: {
                                    isDislike: {
                                        $cond: {
                                            if: {
                                                $in: [new ObjectId(user?._id), "$dislikedBy.createdBy"]
                                            },
                                            then: true,
                                            else: false
                                        }
                                    }
                                }
                            }, {
                                $match: {
                                    $or: [
                                        {
                                            $and: [
                                                {
                                                    "user.accountType": { $in: [0] }
                                                },
                                                {
                                                    "user.isfollowing": { $in: [false, true] }
                                                }
                                            ]
                                        },

                                        {
                                            $and: [
                                                {
                                                    "user.accountType": { $in: [1] }
                                                },
                                                {
                                                    "user.isfollowing": { $in: [true] }
                                                }
                                            ]
                                        },
                                    ]
                                }
                            },
                            { $project: { createdBy: 0, createdAt: 0, updatedAt: 0, __v: 0, isActive: 0, isBlock: 0, likedBy: 0, suburb: 0, state: 0, city: 0, country: 0, latitude: 0, longitude: 0, listViewUser: 0, dislikedBy: 0, tag: 0 } },
                        ],
                        as: "video"
                    }
                },
                { $project: { name: 1, video: 1 } }
            ]),
            tagModel.countDocuments(match),
            videoModel.aggregate([
                { $match: match1 },
                { $sort: { totalView: -1 } },
                { $skip: 0 },
                { $limit: 6 },
                {
                    $lookup: {
                        from: "likes",
                        let: { videoId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: ['$videoId', '$$videoId']
                                            },

                                            {
                                                $eq: ['$isAtcive', true]
                                            },

                                            {
                                                $eq: ['$isBlock', false]
                                            }
                                        ],
                                    }
                                }
                            }
                        ],
                        as: "likedBy"
                    }
                },
                {
                    $lookup: {
                        from: "dislikes",
                        let: { videoId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: ['$videoId', '$$videoId']
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
                            }
                        ],
                        as: "dislikedBy"
                    }
                },
                {
                    $lookup: {
                        from: "followers",
                        let: { createdBy: '$createdBy' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: ['$createdBy', new ObjectId(user?._id)]
                                            },

                                            {
                                                $eq: ['$followerId', '$$createdBy']
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
                                $project: { requestStatus: 1 }
                            }
                        ],
                        as: "follower"
                    }
                },
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
                            },
                            {
                                $lookup: {
                                    from: "followers",
                                    let: { followerId: '$_id' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $and: [
                                                        {
                                                            $eq: ['$followerId', '$$followerId']
                                                        },

                                                        {
                                                            $eq: ['$isActive', true]
                                                        },

                                                        {
                                                            $eq: ['$isBlock', false]
                                                        },

                                                        {
                                                            $eq: ['$requestStatus', 1]
                                                        }
                                                    ]
                                                }
                                            }
                                        }
                                    ],
                                    as: "followingBy"
                                }
                            },
                            {
                                $addFields: {
                                    isfollowing: {
                                        $cond: {
                                            if: {
                                                $in: [new ObjectId(user?._id), "$followingBy.createdBy"]
                                            },
                                            then: true,
                                            else: false
                                        }
                                    }
                                }
                            },
                            {
                                $project: {
                                    username: 1, image: 1, isfollowing: 1, accountType: 1,
                                }
                            }
                        ],
                        as: "user"
                    }
                },
                {
                    $lookup: {
                        from: "categories",
                        let: { categoryId: '$categoryId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: ['$_id', '$$categoryId']
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
                            { $project: { name: 1 } }
                        ],
                        as: "category"
                    }
                },
                {
                    $addFields: {
                        isLike: {
                            $cond: {
                                if: {
                                    $in: [new ObjectId(user?._id), "$likedBy.createdBy"]
                                },
                                then: true,
                                else: false
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        isDislike: {
                            $cond: {
                                if: {
                                    $in: [new ObjectId(user?._id), "$dislikedBy.createdBy"]
                                },
                                then: true,
                                else: false
                            }
                        }
                    }
                },
                {
                    $match: {
                        $or: [
                            {
                                $and: [
                                    {
                                        "user.accountType":
                                            { $in: [0] }
                                    },
                                    {
                                        "user.isfollowing":
                                            { $in: [false, true] }
                                    }]
                            }, {
                                $and: [
                                    {
                                        "user.accountType":
                                        {
                                            $in: [1]
                                        }
                                    },
                                    {
                                        "user.isfollowing": {
                                            $in: [true]
                                        }
                                    }]
                            }
                        ]
                    }
                },
                {
                    $project: {
                        createdBy: 0, createdAt: 0, updatedAt: 0, __v: 0, isActive: 0, isBlock: 0, likedBy: 0, suburb: 0, state: 0, city: 0, country: 0, latitude: 0, longitude: 0, listViewUser: 0, dislikedBy: 0, tag: 0
                    }
                },
            ])
        ])


        trending = {
            _id: null,
            name: "trending",
            video: trending
        }

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('video'),
            {
                video_data: [trending, ...response],
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


export const get_video_by_tag_name_pagination = async (req: Request, res: Response) => {
    reqInfo(req)

    let { limit, page, tagName } = req.body,
        user = req.header('user') as any,
        blocklist = req.header('blocklist') as any,
        skip: number,
        match: any = { isActive: true, isBlock: false },
        response: any,
        count: number

    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))

    try {
        match.tag = { $in: [tagName] }
        match.createdBy = { $nin: blocklist }

        response = await videoModel.aggregate([
            { $sort: { createdAt: -1 } },
            { $match: match },
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
                                            $eq: [
                                                '$_id', '$$createdBy'
                                            ]
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
                            $lookup: {
                                from: "followers",
                                let: { followerId: '$_id' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    {
                                                        $eq: [
                                                            '$followerId', '$$followerId'
                                                        ]
                                                    },

                                                    {
                                                        $eq: [
                                                            '$isActive', true
                                                        ]
                                                    },

                                                    {
                                                        $eq: ['$isBlock', false]
                                                    },

                                                    {
                                                        $eq: ['$requestStatus', 1]
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                ],
                                as: "followingBy"
                            }
                        },
                        {
                            $addFields: {
                                isfollowing: {
                                    $cond: {
                                        if: {
                                            $in: [new ObjectId(user?._id), "$followingBy.createdBy"]
                                        },
                                        then: true,
                                        else: false
                                    }
                                }
                            }
                        },
                        {
                            $project: { username: 1, image: 1, isfollowing: 1, accountType: 1 }
                        }
                    ],
                    as: "user"
                }
            },
            {
                $match: {
                    $or: [
                        {
                            $and: [
                                {
                                    "user.accountType": {
                                        $in: [0]
                                    }
                                },
                                {
                                    "user.isfollowing": {
                                        $in: [false, true]
                                    }
                                }
                            ]
                        },
                        {
                            $and: [
                                {
                                    "user.accountType": {
                                        $in: [1]
                                    }
                                },
                                {
                                    "user.isfollowing": {
                                        $in: [true]
                                    }
                                }
                            ]
                        },
                    ]
                }
            },
            {
                $project: { createdBy: 0, createdAt: 0, updatedAt: 0, __v: 0, isActive: 0, isBlock: 0, likedBy: 0, suburb: 0, state: 0, city: 0, country: 0, latitude: 0, longitude: 0, listViewUser: 0, dislikedBy: 0, tag: 0, user: 0 }
            }
        ])

        count = await videoModel.countDocuments(match)

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('video by tag name'), {
            video_data: response,
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


export const get_video_by_user_pagination = async (req: Request, res: Response) => {
    reqInfo(req)

    let { limit, page, userId } = req.body,
        user = req.header('user') as any,
        skip: number,
        match: any = { isActive: true, isBlock: false },
        response: any,
        count: number

    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))

    try {

        if (userId) {
            let commanblockcheck1 = await commanblockcheck(user, userId)

            if (commanblockcheck1) {
                match.createdBy = new ObjectId(userId)
            }
            else {
                return res.status(401).json(new apiResponse(401, responseMessage?.blockbyuser, {}, {}))
            }
        }

        [response, count] = await Promise.all([videoModel.aggregate([
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
                        },
                        {
                            $lookup: {
                                from: "followers",
                                let: { followerId: '$_id' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $and: [
                                                    {
                                                        $eq: [
                                                            '$followerId', '$$followerId'
                                                        ]
                                                    },

                                                    {
                                                        $eq: [
                                                            '$isActive', true
                                                        ]
                                                    },

                                                    {
                                                        $eq: [
                                                            '$isBlock', false
                                                        ]
                                                    },

                                                    {
                                                        $eq: [
                                                            '$requestStatus', 1
                                                        ]
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                ],
                                as: "followingBy"
                            }
                        },
                        {
                            $addFields: {
                                isfollowing: {
                                    $cond: {
                                        if: {
                                            $in: [new ObjectId(user?._id),
                                                "$followingBy.createdBy"]
                                        },
                                        then: true,
                                        else: false
                                    }
                                }
                            }
                        },
                        {
                            $project: {
                                username: 1, image: 1,
                                isfollowing: 1,
                                accountType: 1
                            }
                        }
                    ],
                    as: "user"
                }
            },

            {
                $lookup: {
                    from: "likes",
                    let: { videoId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$videoId', '$$videoId']
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
                        }
                    ],
                    as: "likedBy"
                }
            },
            {
                $lookup: {
                    from: "dislikes",
                    let: { videoId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$videoId', '$$videoId']
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
                        }
                    ],
                    as: "dislikedBy"
                }
            },
            {
                $lookup: {
                    from: "categories",
                    let: { categoryId: '$categoryId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$_id', '$$categoryId']
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
                        { $project: { name: 1 } }
                    ],
                    as: "category"
                }
            },
            {
                $addFields: {
                    isLike: {
                        $cond: {
                            if: {
                                $in: [
                                    new ObjectId(user?._id), "$likedBy.createdBy"]
                            },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $addFields: {
                    isDisike: {
                        $cond: {
                            if: {
                                $in: [
                                    new ObjectId(user?._id), "$dislikedBy.createdBy"]
                            },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $match: {
                    $or: [
                        {
                            $and: [
                                {
                                    "user.accountType": { $in: [0] }
                                },
                                {
                                    "user.isfollowing": { $in: [false, true] }
                                }
                            ]
                        },
                        {
                            $and: [
                                {
                                    "user.accountType": { $in: [1] }
                                },
                                {
                                    "user.isfollowing": { $in: [true] }
                                }
                            ]
                        },
                    ]
                }
            },
            {
                $project: {
                    createdBy: 0, createdAt: 0, listViewUser: 0, updatedAt: 0, __v: 0, isActive: 0, isBlock: 0, likedBy: 0, suburb: 0, state: 0, city: 0, country: 0, latitude: 0, longitude: 0, listViewer: 0, dislikedBy: 0, tag: 0, user: 0
                }
            }
        ]),
        videoModel.countDocuments(match)
        ])

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('video'), {
            video_data: response,
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


export const get_video_by_user_pagination1 = async (req: Request, res: Response) => {
    reqInfo(req)
    let { limit, page, userId } = req.body,
        user = req.header('user') as any,
        skip: number,
        match: any = { isActive: true, isBlock: false },
        response: any,
        count: number

    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))

    try {
        if (userId) {
            let commanblockcheck1 = await commanblockcheck(user, userId)

            if (commanblockcheck1) {
                match.createdBy = new ObjectId(userId)
            }
            else {
                return res.status(401).json(new apiResponse(401, responseMessage?.blockbyuser, {}, {}))
            }
        }

        [response, count] = await Promise.all([
            videoModel.aggregate([
                { $match: match },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: "likes",
                        let: { videoId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: ['$videoId', '$$videoId']
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
                            }
                        ],
                        as: "likedBy"
                    }
                },
                {
                    $lookup: {
                        from: "dislikes",
                        let: { videoId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: ['$videoId', '$$videoId']
                                            },

                                            {
                                                $eq: ['$isAtcive', true]
                                            },

                                            {
                                                $eq: ['$isBlock', false]
                                            }
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "dislikedBy"
                    }
                },
                {
                    $lookup: {
                        from: "categories",
                        let: { categoryId: '$categoryId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: ['$_id', '$$categoryId']
                                            },

                                            {
                                                $eq: ['$isActive', true]
                                            },

                                            {
                                                $eq: ['$isBlock', false]
                                            }
                                        ],
                                    }
                                }
                            },
                            {
                                $project: { name: 1 }
                            }
                        ],
                        as: "category"
                    }
                },
                {
                    $addFields: {
                        isLike: {
                            $cond: {
                                if: {
                                    $in: [new ObjectId(user?._id), "$likedBy.createdBy"]
                                },
                                then: true,
                                else: false
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        isDislike: {
                            $cond: {
                                if: {
                                    $in: [new ObjectId(user?._id), "$dislikedBy.createdBy"]
                                },
                                then: true,
                                else: false
                            }
                        }
                    }
                },
                {
                    $project: {
                        createdBy: 0, createdAt: 0, listViewUser: 0, updatedAt: 0, __v: 0, isActive: 0, isBlock: 0, likedBy: 0, suburb: 0, state: 0, city: 0, country: 0, latitude: 0, longitude: 0, listViewer: 0, dislikedBy: 0, tag: 0
                    }
                },
            ]),
            videoModel.countDocuments(match)
        ])

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('video'), {
            video_data: response,
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


export const get_video_by_categoryId_pagination = async (req: Request, res: Response) => {
    reqInfo(req)
    let { limit, page, categoryId } = req.body,
        user = req.header('user') as any,
        skip: number,
        match: any = { isActive: true, isBlock: false },
        response: any,
        count: number

    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))

    try {
        match.categoryId = new ObjectId(categoryId)

        response = await videoModel.aggregate([
            { $match: match },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            { $project: { url: 1, totalView: 1, thumbnail: 1 } }
        ])

        count = await videoModel.countDocuments(match)

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('video'), {
            video_data: response,
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

export const by_id_video = async (req: Request, res: Response) => {
    reqInfo(req)
    let { id } = req.params as any,
        user = req.header('user') as any,
        response: any

    try {
        response = await videoModel.aggregate([
            { $match: { _id: new ObjectId(id), isActive: true, isBlock: false } },
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
                        },
                        {
                            $project: {
                                username: 1,
                                image: 1
                            }
                        }
                    ],
                    as: "user"
                }
            },
            {
                $lookup: {
                    from: "categories",
                    let: { categoryId: '$categoryId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$_id', '$$categoryId']
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
                        { $project: { name: 1 } }
                    ],
                    as: "category"
                }
            },
            {
                $lookup: {
                    from: "likes",
                    let: { videoId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$videoId', '$$videoId']
                                        },

                                        {
                                            $eq: ['$createdBy', new ObjectId(user?._id)]
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
                        }
                    ],
                    as: "isLike"
                }
            },
            {
                $lookup: {
                    from: "dislikes",
                    let: { videoId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$videoId', '$$videoId']
                                        },

                                        {
                                            $eq: ['$createdBy', new ObjectId(user?._id)]
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
                        }
                    ],
                    as: "isDislike"
                }
            },
            {
                $project: {
                    createdAt: 0, updatedAt: 0, isActive: 0, isBlock: 0, __v: 0, listViewUser: 0,
                }
            }
        ])

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('video'), response, {}))
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const share_video_link = async (req: Request, res: Response) => {
    reqInfo(req)
    let { id } = req.params as any

    try {
        await videoModel.updateOne({
            _id: new ObjectId(id),
            isActive: true,
            isBlock: false
        },
            {
                $inc: {
                    totalShare: 1
                }
            })

        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('video share'), {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}

export const add_count_view_video = async (req: Request, res: Response) => {
    reqInfo(req)

    let { id } = req.params as any,
        user: any = req.header('user'),
        update_match: any = { $inc: { totalView: 1 } }

    try {
        if (user) {
            update_match['$addToSet'] = { listViewUser: [new ObjectId(user?._id)] }

            // console.log('++', update_match, '--');
        }

        await videoModel.updateOne({
            _id: new ObjectId(id),
            isActive: true,
            isBlock: false
        },
            update_match)

        return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('video view'), {}, {}))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}