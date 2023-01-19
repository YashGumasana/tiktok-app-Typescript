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
exports.count_notification = exports.read_notification = exports.delete_notification = exports.get_notification = void 0;
const helper_1 = require("../../helper");
const mongoose_1 = __importDefault(require("mongoose"));
const common_1 = require("../../common");
const database_1 = require("../../database");
const helper_2 = require("../../helper");
const ObjectId = mongoose_1.default.Types.ObjectId;
const get_notification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    (0, helper_1.reqInfo)(req);
    try {
        let { page, limit } = req.body, skip = ((parseInt(page) - 1) * parseInt(limit)), match = {
            isActive: true,
            isBlock: false,
            createdBy: new ObjectId((_a = req.header('user')) === null || _a === void 0 ? void 0 : _a._id),
        };
        limit = parseInt(limit);
        // limit = parseInt(page)
        let [notification_data, notification_count] = yield Promise.all([
            yield database_1.notificationModel.aggregate([
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
            yield database_1.notificationModel.countDocuments(match)
        ]);
        return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.getDataSuccess('notification'), {
            notification_data: notification_data,
            state: {
                page,
                limit,
                page_limit: Math.ceil(notification_count / limit),
            }
        }, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.internalServerError, {}, error));
    }
});
exports.get_notification = get_notification;
const delete_notification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e;
    (0, helper_1.reqInfo)(req);
    try {
        if ((_b = req.body) === null || _b === void 0 ? void 0 : _b.delete_all) {
            yield database_1.notificationModel.updateMany({
                createdBy: new ObjectId((_c = req.header('user')) === null || _c === void 0 ? void 0 : _c._id),
                isActive: true,
            }, {
                $set: {
                    isActive: false
                }
            });
            return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.allNotificationDelete, {}, {}));
        }
        else {
            yield database_1.notificationModel.updateMany({
                createdBy: new ObjectId((_d = req.header('user')) === null || _d === void 0 ? void 0 : _d._id),
                isActive: true,
                _id: { $in: (_e = req.body) === null || _e === void 0 ? void 0 : _e.notificationId }
            }, {
                $set: { isActive: false }
            });
            return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.selectedNotificationDelete, {}, {}));
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.internalServerError, {}, error));
    }
});
exports.delete_notification = delete_notification;
const read_notification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let user = req.header('user'), { read } = req.query;
    try {
        console.log(JSON.parse(read));
        console.log(read);
        if (JSON.parse(read) && read) {
            const y = yield database_1.notificationModel.find({
                mark: common_1.type.notification.unread,
                createdBy: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
            });
            const x = yield database_1.notificationModel.updateMany({
                mark: common_1.type.notification.unread,
                createdBy: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
            }, {
                mark: common_1.type.notification.read
            });
            console.log(y, '----');
            console.log(x);
            console.log(x === null || x === void 0 ? void 0 : x.mark);
            return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.updateDataSuccess('read notification'), {}, {}));
        }
        return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.invalidId("query request"), {}, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.internalServerError, {}, error));
    }
});
exports.read_notification = read_notification;
const count_notification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    (0, helper_1.reqInfo)(req);
    let user = req.header('user');
    try {
        return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.getDataSuccess("read notification"), {
            notificationCount: yield database_1.notificationModel.countDocuments({
                status: (_f = common_1.type === null || common_1.type === void 0 ? void 0 : common_1.type.notification) === null || _f === void 0 ? void 0 : _f.unread,
                createdBy: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
                isActive: true
            })
        }, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.internalServerError, {}, error));
    }
});
exports.count_notification = count_notification;
//# sourceMappingURL=notification.js.map