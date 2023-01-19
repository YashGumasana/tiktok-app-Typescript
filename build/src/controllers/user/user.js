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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_by_username_user = exports.get_by_id_user = exports.get_user_pagination = void 0;
//import from floder
const helper_1 = require("../../helper");
const database_1 = require("../../database");
const common_1 = require("../../common");
const helper_2 = require("../../helper");
//package
// import async from 'async'
const mongoose_1 = __importDefault(require("mongoose"));
const ObjectId = mongoose_1.default.Types.ObjectId;
const get_user_pagination = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let { limit, page, search } = req.body, user = req.header('user'), blocklist = req.header('blocklist'), skip, match = { isActive: true, isBlock: false, isEmailVerified: true }, response, count;
    limit = parseInt(limit);
    skip = ((parseInt(page) - 1) * parseInt(limit));
    console.log(blocklist);
    try {
        if (search && search != "") {
            let firstNameArray = [];
            let lastNameArray = [];
            search = search.split(" ");
            yield search.forEach((data) => {
                firstNameArray.push({ firstName: { $regex: data, $options: 'si' } });
                lastNameArray.push({ lastName: { $regex: data, $options: 'si' } });
                console.log(firstNameArray, lastNameArray);
            });
            match.$or = [{ $and: firstNameArray }, { $and: lastNameArray }];
        }
        console.log(match);
        match._id = { $nin: blocklist };
        console.log(match._id);
        console.log(match);
        response = yield database_1.userModel.aggregate([
            { $match: match },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            { $project: { firstName: 1, lastName: 1, username: 1, image: 1 } },
        ]);
        count = yield database_1.userModel.countDocuments(match);
        return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.getDataSuccess('video'), {
            user_data: response,
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
exports.get_user_pagination = get_user_pagination;
const get_by_id_user = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log('++');
    (0, helper_1.reqInfo)(req);
    let id = (req.params.id), user = req.header('user');
    try {
        let response = yield database_1.userModel.aggregate([
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
                                            $eq: ['$createdBy',
                                                new ObjectId(user === null || user === void 0 ? void 0 : user._id)]
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
        ]);
        // console.log(response);
        if (response) {
            return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.getDataSuccess('user profile'), response[0], {}));
        }
        return res.status(400).json(new common_1.apiResponse(404, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.getDataNotFound('user'), {}, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.internalServerError, {}, error));
    }
});
exports.get_by_id_user = get_by_id_user;
const get_by_username_user = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let id = (req.params.id), user = req.header('user');
    try {
        let username = yield database_1.userModel.findOne({ username: id, isActive: true, isBlock: false });
        console.log(username);
        if (username) {
            let response = yield database_1.userModel.aggregate([
                { $match: { _id: username === null || username === void 0 ? void 0 : username._id, isActive: true, isBlock: false } },
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
                                                    '$followerId', new ObjectId(username === null || username === void 0 ? void 0 : username._id)
                                                ]
                                            },
                                            {
                                                $eq: [
                                                    '$createdBy', new ObjectId(user === null || user === void 0 ? void 0 : user._id)
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
            ]);
            if (response) {
                return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.getDataSuccess('user profile'), response[0], {}));
            }
        }
        return res.status(404).json(new common_1.apiResponse(404, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.getDataNotFound('user'), {}, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.internalServerError, {}, error));
    }
});
exports.get_by_username_user = get_by_username_user;
//# sourceMappingURL=user.js.map