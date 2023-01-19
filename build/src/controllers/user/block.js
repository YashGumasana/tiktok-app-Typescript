"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_block_pagination = exports.block_request = void 0;
const helper_1 = require("../../helper");
const database_1 = require("../../database");
const common_1 = require("../../common");
const helper_2 = require("../../helper");
const mongoose_1 = require("mongoose");
const ObjectId = mongoose_1.Types.ObjectId;
const block_request = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let { id } = req.params, paraller_array = [], user = req.header('user');
    try {
        let existBlock = yield database_1.blockModel.findOne({
            createdBy: new ObjectId(user._id),
            blockId: new ObjectId(id),
            isActive: true,
            isBlock: false
        });
        console.log(existBlock);
        if (existBlock != null) {
            if (existBlock.requestStatus == 0) {
                console.log('+++');
                yield database_1.blockModel.findOneAndUpdate({
                    createdBy: new ObjectId(user._id),
                    blockId: new ObjectId(id)
                }, {
                    requestStatus: 1
                });
                let del = yield database_1.followerModel.deleteOne({
                    createdBy: new ObjectId(id),
                    followerId: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
                    isActive: true,
                    isBlock: false
                });
                let del1 = yield database_1.followerModel.deleteOne({
                    createdBy: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
                    followerId: new ObjectId(id),
                    isActive: true,
                    isBlock: false
                });
                console.log(del, '***');
                console.log(del1, '//');
                if (del.deletedCount > 0) {
                    // console.log('+++++++++++++/-');
                    database_1.userModel.updateOne({
                        _id: new ObjectId(id),
                        isActive: true,
                        isBlock: false,
                        following: { $gt: 0 }
                    }, {
                        $inc: { following: -1 }
                    });
                    database_1.userModel.updateOne({
                        _id: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
                        isActive: true,
                        isBlock: false,
                        followers: { $gt: 0 }
                    }, {
                        $inc: {
                            followers: -1
                        }
                    });
                }
                else if (del1.deletedCount > 0) {
                    database_1.userModel.updateOne({
                        _id: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
                        isActive: true,
                        isBlock: false,
                        following: { $gt: 0 }
                    }, {
                        $inc: {
                            following: -1
                        }
                    });
                    database_1.userModel.updateOne({
                        _id: new ObjectId(id),
                        isActive: true,
                        isBlock: false,
                        followers: { $gt: 0 }
                    }, {
                        $inc: {
                            followers: -1
                        }
                    });
                }
            }
            else {
                console.log('---');
                yield database_1.blockModel.findOneAndUpdate({
                    createdBy: new ObjectId(user._id),
                    blockId: new ObjectId(id)
                }, {
                    requestStatus: 0
                });
            }
            return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.updateDataSuccess('block request'), {}, {}));
        }
        else {
            console.log('....');
            console.log(user);
            console.log(user._id);
            console.log(user._Id);
            let add_block = yield new database_1.blockModel({
                createdBy: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
                blockId: new ObjectId(id)
            }).save();
            console.log(add_block);
            let del = yield database_1.followerModel.deleteOne({
                createdBy: new ObjectId(id),
                followerId: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
                isActive: true,
                isBlock: false
            });
            let del1 = yield database_1.followerModel.deleteOne({
                createdBy: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
                followerId: new ObjectId(id),
                isActive: true,
                isBlock: false
            });
            console.log(del, '===');
            console.log(del1, '././.');
            if (del.deletedCount > 0) {
                database_1.userModel.updateOne({
                    _id: new ObjectId(id),
                    isActive: true,
                    isBlock: false,
                    following: { $gt: 0 }
                }, {
                    $inc: { following: -1 }
                });
                database_1.userModel.updateOne({
                    _id: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
                    isActive: true,
                    isBlock: false,
                    followers: { $gt: 0 }
                }, {
                    $inc: {
                        followers: -1
                    }
                });
            }
            else if (del1.deletedCount > 0) {
                database_1.userModel.updateOne({
                    _id: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
                    isActive: true,
                    isBlock: false,
                    following: { $gt: 0 }
                }, {
                    $inc: {
                        following: -1
                    }
                });
                database_1.userModel.updateOne({
                    _id: new ObjectId(id),
                    isActive: true,
                    isBlock: false,
                    followers: { $gt: 0 }
                }, {
                    $inc: { followers: -1 }
                });
            }
            return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.addDataSuccess('block request'), {}, {}));
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.internalServerError, {}, error));
    }
});
exports.block_request = block_request;
// f 6380c3020b7a45a811919dc3
// g 6380c3290b7a45a811919dcc
const get_block_pagination = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let { limit, page, search } = req.body, user = req.header('user'), skip, match = {}, search_match = {}, response, count;
    limit = parseInt(limit);
    skip = ((parseInt(page) - 1) * parseInt(limit));
    try {
        match = {
            isActive: true,
            isBlock: false,
            createdBy: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
            requestStatus: 1,
        };
        if (search && search != "") {
            let usernameArray = [];
            search = search.split(" ");
            yield search.forEach((data) => {
                usernameArray.push({
                    "user.username": {
                        $regex: data,
                        $options: 'si'
                    }
                });
            });
            search_match.$or = [{ $and: usernameArray }];
        }
        [response, count] = yield Promise.all([
            database_1.blockModel.aggregate([
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
            database_1.blockModel.countDocuments(match)
        ]);
        return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.getDataSuccess('block'), {
            follower_data: response,
            state: {
                page,
                limit,
                page_limit: Math.ceil(count / limit),
                data_count: count
            }
        }, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.internalServerError, {}, error));
    }
});
exports.get_block_pagination = get_block_pagination;
//# sourceMappingURL=block.js.map