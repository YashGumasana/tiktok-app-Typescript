//import from floder
import { reqInfo } from "../../helper";
import { followerModel, userModel } from "../../database";
import { apiResponse } from "../../common";
import { responseMessage } from "../../helper";

//package
// import async from 'async'
import mongoose from "mongoose";
import { Request, Response } from "express";
const ObjectId = mongoose.Types.ObjectId

export const get_user_pagination = async (req: Request, res: Response) => {
    reqInfo(req)
    let { limit, page, search } = req.body,
        user = req.header('user') as any,
        blocklist = req.header('blocklist') as any,
        skip: number,
        match: any = { isActive: true, isBlock: false, isEmailVerified: true },
        response: any,
        count: number

    limit = parseInt(limit)
    skip = ((parseInt(page) - 1) * parseInt(limit))
    console.log(blocklist);

    try {
        if (search && search != "") {
            let firstNameArray: Array<any> = []
            let lastNameArray: Array<any> = []
            search = search.split(" ")

            await search.forEach((data: any) => {
                firstNameArray.push({ firstName: { $regex: data, $options: 'si' } })
                lastNameArray.push({ lastName: { $regex: data, $options: 'si' } })

                console.log(firstNameArray, lastNameArray);
            })
            match.$or = [{ $and: firstNameArray }, { $and: lastNameArray }]
        }

        console.log(match);
        match._id = { $nin: blocklist }
        console.log(match._id);
        console.log(match);

        response = await userModel.aggregate([
            { $match: match },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            { $project: { firstName: 1, lastName: 1, username: 1, image: 1 } },
        ])

        count = await userModel.countDocuments(match)

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('video'), {
            user_data: response,
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

export const get_by_id_user = async (req: Request, res: Response) => {
    // console.log('++');
    reqInfo(req)
    let id = (req.params.id) as any,
        user: any = req.header('user')

    try {
        let response = await userModel.aggregate([
            { $match: { _id: new ObjectId(id), isActive: true, isBlock: false } },
            {
                $lookup: {
                    from: "followers",
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$followerId',
                                                new ObjectId(id)
                                            ]
                                        },

                                        {
                                            $eq:
                                                ['$createdBy',
                                                    new ObjectId(user?._id)]
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
                        { $project: { requestStatus: 1 } }
                    ],
                    as: "follower"
                }
            },
            {
                $project: { firstName: 1, lastName: 1, follower: 1, email: 1, image: 1, username: 1, description: 1, location: 1, followers: 1, following: 1, promotes: 1, likedObs: 1, rating: 1, jobProvided: 1, jobCompleted: 1, bio: 1, accountType: 1 }
            }
        ])

        // console.log(response);
        if (response) {
            return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('user profile'),
                response[0], {}))
        }

        return res.status(400).json(new apiResponse(404, responseMessage?.getDataNotFound('user'), {}, {}))
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}


export const get_by_username_user = async (req: Request, res: Response) => {
    reqInfo(req)
    let id = (req.params.id) as any,
        user: any = req.header('user')

    try {
        let username = await userModel.findOne({ username: id, isActive: true, isBlock: false })
        console.log(username);
        if (username) {
            let response = await userModel.aggregate([
                { $match: { _id: username?._id, isActive: true, isBlock: false } },

                {
                    $lookup: {
                        from: "followers",
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: [
                                                    '$followerId', new ObjectId(username?._id)
                                                ]
                                            },

                                            {
                                                $eq: [
                                                    '$createdBy', new ObjectId(user?._id)
                                                ]
                                            },

                                            {
                                                $eq: [
                                                    '$isActive', true
                                                ]
                                            },

                                            {
                                                $eq: [
                                                    'isBlock', false
                                                ]
                                            },
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
                }, {
                    $project: {
                        firstName: 1, lastName: 1, follower: 1, email: 1, image: 1, username: 1, description: 1, location: 1, followers: 1, following: 1, promotes: 1, lokeObs: 1, rating: 1, jobProvided: 1, jobCompleted: 1, bio: 1, accounttype: 1
                    }
                }
            ])
            if (response) {
                return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('user profile'), response[0], {}))
            }
        }
        return res.status(404).json(new apiResponse(404, responseMessage?.getDataNotFound('user'), {}, {}))
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }
}