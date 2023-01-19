import { reqInfo } from "../../helper";
import { blockModel, followerModel, userModel } from "../../database";
import { apiResponse } from "../../common";
import { Request, Response } from "express";
import { responseMessage } from "../../helper";
import { ObjectId, Types } from "mongoose";

const ObjectId = Types.ObjectId

export const block_request = async (req: Request, res: Response) => {
    reqInfo(req)
    let { id } = req.params,
        paraller_array: any = [],
        user: any = req.header('user')

    try {
        let existBlock = await blockModel.findOne({
            createdBy: new ObjectId(user._id),
            blockId: new ObjectId(id),
            isActive: true,
            isBlock: false
        })

        console.log(existBlock);

        if (existBlock != null) {
            if (existBlock.requestStatus == 0) {
                console.log('+++');
                await blockModel.findOneAndUpdate({
                    createdBy: new ObjectId(user._id),
                    blockId: new ObjectId(id)
                },
                    {
                        requestStatus: 1
                    })

                let del = await followerModel.deleteOne({
                    createdBy: new ObjectId(id),
                    followerId: new ObjectId(user?._id),
                    isActive: true,
                    isBlock: false
                })

                let del1 = await followerModel.deleteOne({
                    createdBy: new ObjectId(user?._id),
                    followerId: new ObjectId(id),
                    isActive: true,
                    isBlock: false
                })

                console.log(del, '***');
                console.log(del1, '//');

                if (del.deletedCount > 0) {
                    // console.log('+++++++++++++/-');
                    userModel.updateOne({
                        _id: new ObjectId(id),
                        isActive: true,
                        isBlock: false,
                        following: { $gt: 0 }
                    },
                        {
                            $inc: { following: -1 }
                        })

                    userModel.updateOne({
                        _id: new ObjectId(user?._id),
                        isActive: true,
                        isBlock: false,
                        followers: { $gt: 0 }
                    },
                        {
                            $inc: {
                                followers: -1
                            }
                        })
                }
                else if (del1.deletedCount > 0) {
                    userModel.updateOne({
                        _id: new ObjectId(user?._id),
                        isActive: true,
                        isBlock: false,
                        following: { $gt: 0 }
                    },
                        {
                            $inc: {
                                following: -1
                            }
                        })

                    userModel.updateOne({
                        _id: new ObjectId(id),
                        isActive: true,
                        isBlock: false,
                        followers: { $gt: 0 }
                    },
                        {
                            $inc: {
                                followers: -1
                            }
                        })
                }
            }
            else {
                console.log('---');

                await blockModel.findOneAndUpdate({
                    createdBy: new ObjectId(user._id),
                    blockId: new ObjectId(id)
                },
                    {
                        requestStatus: 0
                    })
            }
            return res.status(200).json(new apiResponse(200, responseMessage?.updateDataSuccess('block request'), {}, {}))
        }
        else {
            console.log('....');
            console.log(user);
            console.log(user._id);
            console.log(user._Id);
            let add_block = await new blockModel({
                createdBy: new ObjectId(user?._id),
                blockId: new ObjectId(id)
            }).save()

            console.log(add_block);

            let del = await followerModel.deleteOne({
                createdBy: new ObjectId(id),
                followerId: new ObjectId(user?._id),
                isActive: true,
                isBlock: false
            })

            let del1 = await followerModel.deleteOne({
                createdBy: new ObjectId(user?._id),
                followerId: new ObjectId(id),
                isActive: true,
                isBlock: false
            })

            console.log(del, '===');
            console.log(del1, '././.');
            if (del.deletedCount > 0) {
                userModel.updateOne({
                    _id: new ObjectId(id),
                    isActive: true,
                    isBlock: false,
                    following: { $gt: 0 }
                }, {
                    $inc: { following: -1 }
                })

                userModel.updateOne({
                    _id: new ObjectId(user?._id),
                    isActive: true,
                    isBlock: false,
                    followers: { $gt: 0 }
                },
                    {
                        $inc: {
                            followers: -1
                        }
                    })
            }
            else if (del1.deletedCount > 0) {
                userModel.updateOne({
                    _id: new ObjectId(user?._id),
                    isActive: true,
                    isBlock: false,
                    following: { $gt: 0 }
                },
                    {
                        $inc: {
                            following: -1
                        }
                    })

                userModel.updateOne({
                    _id: new ObjectId(id),
                    isActive: true,
                    isBlock: false,
                    followers: { $gt: 0 }
                },
                    {
                        $inc: { followers: -1 }
                    })
            }

            return res.status(200).json(new apiResponse(200, responseMessage?.addDataSuccess('block request'), {}, {}))
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json(new apiResponse(500, responseMessage?.internalServerError, {}, error))
    }

}

// f 6380c3020b7a45a811919dc3
// g 6380c3290b7a45a811919dcc

export const get_block_pagination = async (req: Request, res: Response) => {
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
            createdBy: new ObjectId(user?._id),
            requestStatus: 1,
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
            search_match.$or = [{ $and: usernameArray }]
        }

        [response, count] = await Promise.all([
            blockModel.aggregate([
                { $match: match },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: "users",
                        let: { blockId: '$blockId' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: ['$_id', '$$blockId']
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
                { $match: search_match },
                { $project: { user: 1, requestStatus: 1 } }
            ]),
            blockModel.countDocuments(match)
        ])

        return res.status(200).json(new apiResponse(200, responseMessage?.getDataSuccess('block'), {
            follower_data: response,
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