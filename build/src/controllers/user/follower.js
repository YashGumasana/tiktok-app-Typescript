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
exports.get_pending_follower_request_count = exports.delete_follower = exports.get_follower_request_sent_pagination = exports.get_follower_request_pagination = exports.get_following_pagination = exports.get_follower_pagination = exports.cancelrequest_user = exports.unfollower_user = exports.reject_follower_request = exports.accept_follower_request = exports.follower_request = void 0;
const database_1 = require("../../database");
const common_1 = require("../../common");
const helper_1 = require("../../helper");
const mongoose_1 = require("mongoose");
const ObjectId = mongoose_1.Types.ObjectId;
const follower_request = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    (0, helper_1.reqInfo)(req);
    let { id } = req.params, parallel_array = [], user = req.header('user');
    try {
        let existFollow = yield database_1.followerModel.findOne({
            createdBy: new ObjectId(user._id),
            followerId: new ObjectId(id),
            isActive: true,
            isBlock: false
        });
        if (existFollow != null) {
            return res.status(409).json(new common_1.apiResponse(409, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.customMessage('Your request already has been sent!'), {}, {}));
        }
        else {
            let add_follow = yield new database_1.followerModel({
                createdBy: new ObjectId(user._id),
                followerId: new ObjectId(id)
            }).save();
            let userData = yield database_1.userModel.findOne({ _id: new ObjectId(id), isActive: true, isBlock: false });
            // console.log(user);
            // console.log(user?.notification);
            // console.log(user?.notification?.follow);
            // console.log(user?.notification?.all);
            // console.log(userData?._id.toString());
            // console.log(user?._id.toString());
            if ((((_a = user === null || user === void 0 ? void 0 : user.notification) === null || _a === void 0 ? void 0 : _a.follow) || ((_b = user === null || user === void 0 ? void 0 : user.notification) === null || _b === void 0 ? void 0 : _b.all)) && ((userData === null || userData === void 0 ? void 0 : userData._id.toString()) !== (user === null || user === void 0 ? void 0 : user._id.toString()))) {
                let notification = yield common_1.notification_template.follow_request(Object.assign({ followerId: id }, user._doc));
                parallel_array.push(new database_1.notificationModel({
                    title: notification.template.body,
                    followerId: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
                    isActive: true,
                    isBlock: false,
                    createdBy: new ObjectId(id),
                    type: common_1.type.notification.follow_request
                }).save());
                parallel_array.push((0, helper_1.notification_to_user)(userData || { deviceToken: [] }, notification === null || notification === void 0 ? void 0 : notification.data, notification === null || notification === void 0 ? void 0 : notification.template));
            }
            yield Promise.all(parallel_array);
            // console.log(parallel_array);
            return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.addDataSuccess('follow request'), {}, {}));
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.internalServerError, {}, error));
    }
});
exports.follower_request = follower_request;
const accept_follower_request = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d, _e;
    (0, helper_1.reqInfo)(req);
    let { id } = req.params, user = req.header('user');
    try {
        let followData = yield database_1.followerModel.findOneAndUpdate({
            createdBy: new ObjectId(id),
            followerId: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
            isActive: true,
            isBlock: false,
            requestStatus: common_1.type.follower.pending
        }, {
            requestStatus: common_1.type.follower.accept
        });
        // console.log(followData);
        if (!followData) {
            return res.status(404).json(new common_1.apiResponse(404, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.getDataNotFound('follower'), {}, {}));
        }
        if (((_c = user === null || user === void 0 ? void 0 : user.notification) === null || _c === void 0 ? void 0 : _c.follow) || ((_d = user === null || user === void 0 ? void 0 : user.notification) === null || _d === void 0 ? void 0 : _d.all)) {
            let notification = yield common_1.notification_template.accept_request(Object.assign({ createdBy: id }, user._doc));
            let userData = yield Promise.all([
                database_1.userModel.findOne({
                    _id: new ObjectId(id),
                    isActive: true,
                    isBlock: false
                }),
                database_1.userModel.updateOne({
                    _id: new ObjectId(id),
                    isActive: true,
                    isBlock: false
                }, {
                    $inc: { following: 1 }
                }),
                database_1.userModel.updateOne({
                    _id: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
                    isActive: true,
                    isBlock: false
                }, {
                    $inc: { followers: 1 }
                }),
            ])[0];
            if ((userData === null || userData === void 0 ? void 0 : userData._id.toString()) !== (user === null || user === void 0 ? void 0 : user._id.toString())) {
                new database_1.notificationModel({
                    title: notification.template.body,
                    followerId: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
                    isActive: true,
                    isBlock: false,
                    createdBy: new ObjectId(id),
                    type: common_1.type.notification.accept_request
                }).save();
                database_1.notificationModel.updateOne({
                    followerId: new ObjectId(id),
                    createdBy: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
                    isActive: true,
                    isBlock: false
                }, {
                    title: (_e = notification === null || notification === void 0 ? void 0 : notification.action) === null || _e === void 0 ? void 0 : _e.body,
                    isActive: false
                });
                yield (0, helper_1.notification_to_user)(userData || { deviceToken: [] }, notification === null || notification === void 0 ? void 0 : notification.data, notification === null || notification === void 0 ? void 0 : notification.template);
            }
        }
        return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.addDataSuccess('accept follow request'), {}, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.internalServerError, {}, error));
    }
});
exports.accept_follower_request = accept_follower_request;
const reject_follower_request = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f, _g, _h;
    (0, helper_1.reqInfo)(req);
    let { id } = req.params, parallel_array = [], user = req.header('user');
    try {
        let followData = yield database_1.followerModel.findOneAndUpdate({
            createdBy: new ObjectId(id),
            followerId: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
            isActive: true,
            isBlock: false,
            requestStatus: common_1.type.follower.pending
        }, {
            requestStatus: common_1.type.follower.reject
        });
        if (!followData) {
            return res.status(404).json(new common_1.apiResponse(404, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.getDataNotFound('follower'), {}, {}));
        }
        if (((_f = user === null || user === void 0 ? void 0 : user.notification) === null || _f === void 0 ? void 0 : _f.follow) || ((_g = user === null || user === void 0 ? void 0 : user.notification) === null || _g === void 0 ? void 0 : _g.all)) {
            let notification = yield common_1.notification_template.reject_request(Object.assign({ createdBy: id }, user._doc));
            let userData = yield Promise.all([
                database_1.userModel.findOne({
                    _id: new ObjectId(id),
                    isActive: true,
                    isBlock: false
                })
            ])[0];
            if ((userData === null || userData === void 0 ? void 0 : userData._id.toString()) !== (user === null || user === void 0 ? void 0 : user._id.toString())) {
                new database_1.notificationModel({
                    title: notification.template.body,
                    followerId: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
                    isActive: true,
                    isBlock: false,
                    createdBy: new ObjectId(id),
                    type: common_1.type.notification.reject_request
                }).save(),
                    database_1.notificationModel.updateOne({
                        followerId: new ObjectId(id),
                        createdBy: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
                        isActive: true,
                        isBlock: false,
                    }, {
                        title: (_h = notification === null || notification === void 0 ? void 0 : notification.action) === null || _h === void 0 ? void 0 : _h.body,
                        isActive: false
                    });
                yield (0, helper_1.notification_to_user)(userData || { deviceToken: [] }, notification === null || notification === void 0 ? void 0 : notification.data, notification === null || notification === void 0 ? void 0 : notification.template);
            }
        }
        return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.addDataSuccess('reject follow request'), {}, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.internalServerError, {}, error));
    }
});
exports.reject_follower_request = reject_follower_request;
const unfollower_user = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, _k;
    (0, helper_1.reqInfo)(req);
    let { id } = req.params, parallel_array = [], user = req.header('user');
    try {
        let followData = yield database_1.followerModel.findOneAndUpdate({
            createdBy: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
            followerId: new ObjectId(id),
            isActive: true,
            isBlock: false,
            requestStatus: common_1.type.follower.accept
        }, {
            requestStatus: common_1.type.follower.pending,
            isActive: false
        });
        if (!followData) {
            return res.status(404).json(new common_1.apiResponse(404, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.getDataNotFound('follower'), {}, {}));
        }
        if (((_j = user === null || user === void 0 ? void 0 : user.notification) === null || _j === void 0 ? void 0 : _j.follow) || ((_k = user === null || user === void 0 ? void 0 : user.notification) === null || _k === void 0 ? void 0 : _k.all)) {
            let notification = yield common_1.notification_template.reject_request(Object.assign({ createdBy: id }, user._doc));
            let userData = yield Promise.all([
                database_1.userModel.findOne({
                    _id: new ObjectId(id),
                    isActive: true,
                    isBlock: false
                }),
                database_1.userModel.updateOne({
                    _id: new ObjectId(id),
                    isActive: true,
                    isBlock: false,
                    followers: { $gt: 0 }
                }, {
                    $inc: { followers: -1 }
                }),
                database_1.userModel.updateOne({
                    _id: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
                    isActive: true,
                    isBlock: false,
                    following: { $gt: 0 }
                }, {
                    $inc: { following: -1 }
                })
            ])[0];
        }
        yield database_1.followerModel.deleteOne({
            createdBy: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
            followerId: new ObjectId(id),
            isActive: false,
            isBlock: false,
            requestStatus: common_1.type.follower.pending
        });
        return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.addDataSuccess('Unfollow user'), {}, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.internalServerError, {}, error));
    }
});
exports.unfollower_user = unfollower_user;
const cancelrequest_user = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let { id } = req.params, parallel_array = [], user = req.header('user');
    try {
        let followData = yield database_1.followerModel.deleteOne({
            createdBy: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
            followerId: new ObjectId(id),
            isActive: true,
            isBlock: false,
            requestStatus: common_1.type.follower.pending
        });
        if (followData.deletedCount > 0) {
            database_1.notificationModel.updateOne({
                followerId: new ObjectId(id),
                createdBy: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
                isActive: true,
                isBlock: false,
            }, {
                isActive: false
            });
            return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.addDataSuccess('Cancel Request'), {}, {}));
        }
        else {
            return res.status(404).json(new common_1.apiResponse(404, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.getDataNotFound('follower'), {}, {}));
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.internalServerError, {}, error));
    }
});
exports.cancelrequest_user = cancelrequest_user;
const get_follower_pagination = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _l, _m;
    (0, helper_1.reqInfo)(req);
    let { limit, page, search } = req.body, user = req.header('user'), skip, match = {}, search_match = {}, response, count;
    limit = parseInt(limit);
    skip = ((parseInt(page) - 1) * parseInt(limit));
    try {
        match = {
            isActive: true,
            isBlock: false,
            followerId: req.params.id ? new ObjectId(req.params.id) : new ObjectId(user === null || user === void 0 ? void 0 : user._id),
            requestStatus: common_1.type.follower.accept,
        };
        if (search && search != "") {
            let usernameArryay = [];
            search = search.split(" ");
            yield search.forEach((data) => {
                console.log(data);
                usernameArryay.push({
                    "user.username": {
                        $regex: data,
                        $options: 'si'
                    }
                });
            });
            console.log(usernameArryay);
            search_match.$or = [{ $and: usernameArryay },];
            console.log(search_match);
        }
        [response, count] = yield Promise.all([
            database_1.followerModel.aggregate([
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
                            { $project: { username: 1, image: 1 } },
                        ],
                        as: "user"
                    }
                },
                { $match: search_match },
                { $project: { user: 1, requestStatus: 1 } }
            ]), database_1.followerModel.countDocuments(match)
        ]);
        // console.log('---');
        // console.log(response);
        // console.log(user._id);
        // console.log(response[0].user[0]._id);
        // console.log(response.length);
        for (let i = 0; i < response.length; i++) {
            let tem = yield database_1.followerModel.findOne({
                createdBy: new ObjectId(user._id),
                followerId: new ObjectId((_m = (_l = response[i]) === null || _l === void 0 ? void 0 : _l.user[0]) === null || _m === void 0 ? void 0 : _m._id),
                isActive: true,
                isBlock: false
            });
            if (tem == null) {
                response[i].requestStatus = 2;
            }
            else {
                if (tem.requestStatus = 0) {
                    response[i].requestStatus = 0;
                }
                else if (tem.requestStatus = 1) {
                    response[i].requestStatus = 1;
                }
            }
        }
        return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.getDataSuccess('follower'), {
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
        return res.status(500).json(new common_1.apiResponse(500, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.internalServerError, {}, error));
    }
});
exports.get_follower_pagination = get_follower_pagination;
const get_following_pagination = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _o, _p, _q, _r;
    (0, helper_1.reqInfo)(req);
    let { limit, page, search } = req.body, user = req.header('user'), skip, match = {}, search_match = {}, response, count;
    limit = parseInt(limit);
    skip = ((parseInt(page) - 1) * parseInt(limit));
    try {
        match = {
            isActive: true,
            isBlock: false,
            requestStatus: common_1.type.follower.accept,
            createdBy: req.params.id ? new ObjectId(req.params.id) : new ObjectId(user === null || user === void 0 ? void 0 : user._id)
        };
        if (search && search != "") {
            let usernameArryay = [];
            search = search.split(" ");
            yield search.forEach((data) => {
                usernameArryay.push({
                    "user.username": {
                        $regex: data,
                        $option: 'si'
                    }
                });
            });
            search_match.$or = [{ $and: usernameArryay },];
        }
        [response, count] = yield Promise.all([
            database_1.followerModel.aggregate([
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
            database_1.followerModel.aggregate([
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
        ]);
        // console.log(count);
        for (let i = 0; i < response.length; i++) {
            let tem = yield database_1.followerModel.findOne({
                createdBy: new ObjectId(user._id),
                followerId: new ObjectId((_p = (_o = response[i]) === null || _o === void 0 ? void 0 : _o.user[0]) === null || _p === void 0 ? void 0 : _p._id),
                isActive: true,
                isBlock: false
            });
            if (tem == null) {
                response[i].requestStatus = 2;
            }
            else {
                if (tem.requestStatus = 0) {
                    response[i].requestStatus = 0;
                }
                else if (tem.requestStatus = 1) {
                    response[i].requestStatus = 1;
                }
            }
        }
        return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.getDataSuccess('following'), {
            following_data: response,
            state: {
                page,
                limit,
                page_limit: Math.ceil(((_q = count[0]) === null || _q === void 0 ? void 0 : _q.count) || 1 / limit),
                data_count: ((_r = count[0]) === null || _r === void 0 ? void 0 : _r.count) || 0
            }
        }, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.internalServerError, {}, error));
    }
});
exports.get_following_pagination = get_following_pagination;
const get_follower_request_pagination = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _s, _t;
    (0, helper_1.reqInfo)(req);
    let { limit, page, search } = req.body, user = req.header('user'), skip, match = {}, search_match = {}, response, count;
    limit = parseInt(limit);
    skip = ((parseInt(page) - 1) * parseInt(limit));
    try {
        match = {
            isActive: true,
            isBlock: false,
            requestStatus: common_1.type.follower.pending,
            followerId: new ObjectId(user === null || user === void 0 ? void 0 : user._id)
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
            search_match.$or = [{ $and: usernameArray },];
        }
        [response, count] = yield Promise.all([
            database_1.followerModel.aggregate([
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
            database_1.followerModel.aggregate([
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
                                                $eq: ['$isActive', true]
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
        ]);
        return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.getDataSuccess('follow request'), {
            follower_data: response,
            state: {
                page,
                limit,
                page_limit: Math.ceil(((_s = count[0]) === null || _s === void 0 ? void 0 : _s.count) || 1 / limit),
                data_count: ((_t = count[0]) === null || _t === void 0 ? void 0 : _t.count) || 0
            }
        }, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.internalServerError, {}, error));
    }
});
exports.get_follower_request_pagination = get_follower_request_pagination;
const get_follower_request_sent_pagination = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _u, _v;
    (0, helper_1.reqInfo)(req);
    let { limit, page, search } = req.body, user = req.header('user'), skip, match = {}, search_match = {}, response, count;
    console.log(user, '+++');
    limit = parseInt(limit);
    skip = ((parseInt(page) - 1) * parseInt(limit));
    try {
        match = {
            isActive: true,
            isBlock: false,
            requestStatus: common_1.type.follower.pending,
            createdBy: new ObjectId(user === null || user === void 0 ? void 0 : user._id)
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
            search_match.$or = [{ $and: usernameArray },];
        }
        [response, count] = yield Promise.all([
            database_1.followerModel.aggregate([
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
            database_1.followerModel.aggregate([
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
        ]);
        console.log(response);
        return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.getDataSuccess('following'), {
            following_data: response,
            state: {
                page,
                limit,
                page_limit: Math.ceil(((_u = count[0]) === null || _u === void 0 ? void 0 : _u.count) || 1 / limit),
                data_count: ((_v = count[0]) === null || _v === void 0 ? void 0 : _v.count) || 0
            }
        }, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.internalServerError, {}, error));
    }
});
exports.get_follower_request_sent_pagination = get_follower_request_sent_pagination;
const delete_follower = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let id = (req.params.id), user = req.header('user');
    try {
        let response = yield database_1.followerModel.findOneAndUpdate({
            createdBy: new ObjectId(id),
            followerId: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
            isActive: true,
            isBlock: false,
            requestStatus: common_1.type.follower.accept,
        }, {
            requestStatus: common_1.type.follower.pending,
            isActive: false
        });
        if (!response) {
            return res.status(404).json(new common_1.apiResponse(404, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.getDataNotFound('follower'), {}, {}));
        }
        yield Promise.all([
            database_1.userModel.updateOne({
                _id: new ObjectId(id),
                isActive: true,
                isBlock: false,
                following: { $gt: 0 }
            }, {
                $inc: { following: -1 }
            }),
            database_1.userModel.updateOne({
                _id: new ObjectId(user === null || user === void 0 ? void 0 : user._id), isActive: true, isBlock: false, followers: { $gt: 0 }
            }, {
                $inc: { followers: -1 }
            })
        ]);
        return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.deleteDataSuccess('follower'), {}, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.internalServerError, {}, error));
    }
});
exports.delete_follower = delete_follower;
const get_pending_follower_request_count = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let user = req.header('user');
    try {
        let count = yield database_1.followerModel.countDocuments({
            followerId: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
            isActive: true,
            isBlock: false,
            requestStatus: common_1.type.follower.pending
        });
        return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.addDataSuccess('get pending follower'), { count }, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.internalServerError, {}, error));
    }
});
exports.get_pending_follower_request_count = get_pending_follower_request_count;
// a = 6369f41c554bed176f2d2872
// b = 6369f454554bed176f2d287b
// c = 6369f471554bed176f2d2884
// d = 6369f49d554bed176f2d288d
//# sourceMappingURL=follower.js.map