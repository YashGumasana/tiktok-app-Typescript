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
exports.add_count_view_video = exports.share_video_link = exports.by_id_video = exports.get_video_by_categoryId_pagination = exports.get_video_by_user_pagination1 = exports.get_video_by_user_pagination = exports.get_video_by_tag_name_pagination = exports.get_video_by_tag_pagination = exports.get_video_pagination = exports.dislike_video = exports.like_video = exports.delete_video = exports.get_video_by_trending_pagination = exports.update_video = exports.add_video = void 0;
const helper_1 = require("../../helper");
const database_1 = require("../../database");
const common_1 = require("../../common");
const helper_2 = require("../../helper");
const mongoose_1 = require("mongoose");
const ObjectId = mongoose_1.Types.ObjectId;
const add_video = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    (0, helper_1.reqInfo)(req);
    try {
        let response, body = req.body, user = req.header('user');
        body.createdBy = new ObjectId(user === null || user === void 0 ? void 0 : user._id);
        let existTags = ((_a = (yield database_1.tagModel.aggregate([
            { $match: { name: { $in: body.tag } } },
            {
                $group: {
                    _id: null,
                    tag: { $addToSet: "$name" }
                }
            }
        ]))[0]) === null || _a === void 0 ? void 0 : _a.tag) || [];
        // console.log(existTags);
        let newTags = (0, common_1.not_first_one)(body.tag, existTags);
        // console.log(newTags);
        newTags.forEach((data, index) => {
            newTags[index] = { name: data };
        });
        // console.log(body, '****');
        response = yield new database_1.videoModel(body).save();
        // console.log(newTags, '---');
        if (response) {
            yield Promise.all([
                yield database_1.tagModel.insertMany(newTags),
                yield database_1.tagModel.updateMany({ name: { $in: body.tag } }, {
                    $inc: { totalUsed: 1 },
                    $addToSet: { videoIds: [new ObjectId(response === null || response === void 0 ? void 0 : response._id)] }
                }),
            ]);
            return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.addDataSuccess('video'), {}, {}));
        }
        else
            return res.status(400).json(new common_1.apiResponse(400, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.addDataError, {}, `${response}`));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.internalServerError, {}, error));
    }
});
exports.add_video = add_video;
const update_video = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    try {
        let response, body = req.body;
        response = yield database_1.videoModel.findOneAndUpdate({
            _id: new ObjectId(body === null || body === void 0 ? void 0 : body.id),
            isActive: true,
            isBlock: false
        }, body);
        if (!response) {
            return res.status(400).json(new common_1.apiResponse(400, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.getDataNotFound('video'), {}, `${response}`));
        }
        // console.log(response, '--//');
        let newTags = (0, common_1.not_first_one)(body.tag, response.tag);
        console.log(newTags);
        // console.log('---');
        let removeTags = (0, common_1.not_first_one)(response.tag, body.tag);
        // console.log(removeTags);
        // console.log(newTags, '-+-+');
        body.newTags = newTags;
        // console.log(body.newTags, '-+-+-');
        let tag = [];
        newTags.forEach((data, index) => {
            tag[index] = { name: data };
        });
        // console.log(body.newTags, '-+-+-');
        // console.log(newTags, ':::');
        yield Promise.all([
            yield database_1.tagModel.insertMany(tag),
            yield database_1.tagModel.updateMany({ name: { $in: body.newTags } }, {
                $inc: { totalUsed: 1 },
                $addToSet: { videoIds: [new ObjectId(response === null || response === void 0 ? void 0 : response._id)] }
            }),
            yield database_1.tagModel.updateMany({ name: { $in: removeTags } }, {
                $inc: { totalUsed: -1 },
                $pull: { videoIds: [new ObjectId(response === null || response === void 0 ? void 0 : response._id)] }
            }),
        ]);
        // video url delete
        console.log(body === null || body === void 0 ? void 0 : body.url);
        console.log(response === null || response === void 0 ? void 0 : response.url);
        if ((body === null || body === void 0 ? void 0 : body.url) != (response === null || response === void 0 ? void 0 : response.url)) {
            let [folder_name, image_name] = (0, common_1.URL_decode)(response === null || response === void 0 ? void 0 : response.url);
            console.log(folder_name, image_name, '+++');
            yield (0, helper_2.deleteImage)(image_name, folder_name);
        }
        return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.updateDataSuccess('video'), {}, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.internalServerError, {}, error));
    }
});
exports.update_video = update_video;
const get_video_by_trending_pagination = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let { limit, page, tagName } = req.body, user = req.header('user'), blocklist = req.header('blocklist'), skip, match = {
        createdBy: { $nin: blocklist },
        isActive: true,
        isBlock: false
    }, response, count;
    limit = parseInt(limit);
    skip = ((parseInt(page) - 1) * parseInt(limit));
    console.log(user);
    try {
        response = yield database_1.videoModel.aggregate([
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
                                            $eq: ['$isBlock', false]
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
                                            $in: [new ObjectId(user === null || user === void 0 ? void 0 : user._id),
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
        ]);
        count = yield database_1.videoModel.countDocuments(match);
        return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.getDataSuccess('video by tag name'), {
            video_data: response,
            state: {
                page,
                limit,
                page_limit: Math.ceil(count / limit), data_count: count
            }
        }, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.internalServerError, {}, error));
    }
});
exports.get_video_by_trending_pagination = get_video_by_trending_pagination;
const delete_video = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let id = (req.params.id), user = req.header('user');
    try {
        let response = yield database_1.videoModel.findOneAndUpdate({
            _id: new ObjectId(id),
            isActive: true,
            createdBy: new ObjectId(user === null || user === void 0 ? void 0 : user._id)
        }, {
            isActive: false
        });
        if (!response) {
            return res.status(404).json(new common_1.apiResponse(404, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.getDataNotFound('video'), {}, {}));
        }
        let [folder_name, image_name] = (0, common_1.URL_decode)(response === null || response === void 0 ? void 0 : response.url);
        yield Promise.all([
            yield database_1.tagModel.updateMany({ name: { $in: response === null || response === void 0 ? void 0 : response.tag } }, { $inc: { totalUsed: -1 } })
        ]);
        return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.deleteDataSuccess('video'), {}, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.internalServerError, {}, error));
    }
});
exports.delete_video = delete_video;
const like_video = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    (0, helper_1.reqInfo)(req);
    let { id } = req.params, paraller_array = [], user = req.header('user');
    try {
        let existLike = yield database_1.likeModel.findOne({
            createdBy: new ObjectId(user._id),
            videoId: new ObjectId(id),
            isActive: true,
            isBlock: false,
            type: common_1.type.like.video
        });
        if (existLike != null) {
            paraller_array = [
                database_1.likeModel.deleteOne({
                    createdBy: new ObjectId(user._id),
                    videoId: new ObjectId(id)
                }),
                database_1.userModel.updateOne({
                    _id: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
                    isActive: true,
                    isBlock: false,
                    likedObs: { $gt: 0 }
                }, {
                    $inc: {
                        likedObs: -1
                    }
                }),
                database_1.videoModel.updateOne({
                    _id: new ObjectId(id),
                    isActive: true,
                    isBlock: false,
                    totalLike: { $gt: 0 }
                }, {
                    $inc: { totalLike: -1 }
                })
            ];
            yield Promise.all(paraller_array);
            return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.deleteDataSuccess('like'), {}, {}));
        }
        else {
            let add_like = yield new database_1.likeModel({
                createdBy: new ObjectId(user._id),
                videoId: new ObjectId(id),
                type: common_1.type.like.video
            }).save();
            let add_like1 = yield database_1.dislikeModel.deleteOne({
                createdBy: new ObjectId(user._id),
                videoId: new ObjectId(id)
            });
            paraller_array = [
                database_1.userModel.updateOne({
                    _id: new ObjectId(add_like === null || add_like === void 0 ? void 0 : add_like.createdBy),
                    isActive: true,
                    isBlock: false
                }, {
                    $inc: {
                        likedObs: 1
                    }
                }),
                add_like1.deletedCount > 0 ? database_1.videoModel.updateOne({
                    _id: new ObjectId(id),
                    isActive: true,
                    isBlock: false
                }, {
                    $inc: {
                        totalLike: 1,
                        totalDislike: -1
                    }
                }) :
                    database_1.videoModel.updateOne({
                        _id: new ObjectId(id),
                        isActive: true,
                        isBlock: false
                    }, {
                        $inc: { totalLike: 1 }
                    }),
            ];
            if (((_b = user === null || user === void 0 ? void 0 : user.notification) === null || _b === void 0 ? void 0 : _b.video) || ((_c = user === null || user === void 0 ? void 0 : user.notification) === null || _c === void 0 ? void 0 : _c.all)) {
                console.log('+++');
                let notification = yield common_1.notification_template.like(Object.assign({ videoId: id }, user._doc));
                let videoOwnerData = yield database_1.videoModel.aggregate([
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
                                        deviceToken: 1
                                    }
                                }
                            ],
                            as: "user"
                        }
                    },
                    { $project: { user: 1 } },
                ]);
                console.log(videoOwnerData);
                console.log((_d = videoOwnerData[0]) === null || _d === void 0 ? void 0 : _d.user[0]);
                console.log(user._id);
                if (((_f = (_e = videoOwnerData[0]) === null || _e === void 0 ? void 0 : _e.user[0]) === null || _f === void 0 ? void 0 : _f._id.toString()) !== user._id.toString()) {
                    paraller_array.push(new database_1.notificationModel({
                        title: notification.template.body,
                        createdBy: new ObjectId((_h = (_g = videoOwnerData[0]) === null || _g === void 0 ? void 0 : _g.user[0]) === null || _h === void 0 ? void 0 : _h._id),
                        userId: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
                        isActive: true,
                        isBlock: false,
                        videoId: new ObjectId(id),
                        type: common_1.type.notification.like
                    }).save());
                    paraller_array.push((0, helper_2.notification_to_user)(((_j = videoOwnerData[0]) === null || _j === void 0 ? void 0 : _j.user[0]) || { deviceToken: [] }, notification === null || notification === void 0 ? void 0 : notification.data, notification === null || notification === void 0 ? void 0 : notification.template));
                }
            }
            yield Promise.all(paraller_array);
            return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.addDataSuccess('like'), {}, {}));
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.internalServerError, {}, error));
    }
});
exports.like_video = like_video;
const dislike_video = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _k, _l, _m, _o, _p, _q, _r;
    (0, helper_1.reqInfo)(req);
    let { id } = req.params, paraller_array = [], user = req.header('user');
    try {
        let existDislike = yield database_1.dislikeModel.findOne({
            createdBy: new ObjectId(user._id),
            videoId: new ObjectId(id),
            isActive: true,
            isBlock: false
        });
        if (existDislike != null) {
            paraller_array = [
                database_1.dislikeModel.deleteOne({
                    createdBy: new ObjectId(user._id),
                    videoId: new ObjectId(id)
                }),
                database_1.userModel.updateOne({
                    _id: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
                    isActive: true,
                    isBlock: false,
                    likedObs: { $gt: 0 }
                }, {
                    $inc: { likedObs: -1 }
                }),
                database_1.videoModel.updateOne({
                    _id: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
                    isActive: true,
                    isBlock: false,
                    likedObs: { $gt: 0 }
                }, { $inc: { likedObs: -1 } }),
                database_1.videoModel.updateOne({
                    _id: new ObjectId(id),
                    isActive: true,
                    isBlock: false,
                    totalDislike: { $gt: 0 }
                }, {
                    $inc: {
                        totalDislike: -1
                    }
                })
            ];
            yield Promise.all(paraller_array);
            return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.deleteDataSuccess('dislike'), {}, {}));
        }
        else {
            let add_dislike = yield new database_1.dislikeModel({
                createdBy: new ObjectId(user._id),
                videoId: new ObjectId(id)
            }).save();
            let add_like1 = yield database_1.likeModel.deleteOne({
                createdBy: new ObjectId(user._id),
                videoId: new ObjectId(id),
                type: common_1.type.like.video
            });
            if (((_k = user === null || user === void 0 ? void 0 : user.notification) === null || _k === void 0 ? void 0 : _k.video) || ((_l = user === null || user === void 0 ? void 0 : user.notification) === null || _l === void 0 ? void 0 : _l.all)) {
                let notification = yield common_1.notification_template.dislike(Object.assign({ videoId: id }, user._doc));
                let videoOwnerData = yield database_1.videoModel.aggregate([
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
                ]);
                if (((_o = (_m = videoOwnerData[0]) === null || _m === void 0 ? void 0 : _m.user[0]) === null || _o === void 0 ? void 0 : _o._id.toString()) !== user._id.toString()) {
                    paraller_array.push(new database_1.notificationModel({
                        title: notification.template.body,
                        createdBy: new ObjectId((_q = (_p = videoOwnerData[0]) === null || _p === void 0 ? void 0 : _p.user[0]) === null || _q === void 0 ? void 0 : _q._id),
                        userId: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
                        isActive: true,
                        isBlock: false,
                        videoId: new ObjectId(id),
                        type: common_1.type.notification.dislike
                    }).save());
                    paraller_array.push((0, helper_2.notification_to_user)(((_r = videoOwnerData[0]) === null || _r === void 0 ? void 0 : _r.user[0]) || { deviceToken: [] }, notification === null || notification === void 0 ? void 0 : notification.data, notification === null || notification === void 0 ? void 0 : notification.template));
                }
            }
            paraller_array.push(database_1.userModel.updateOne({
                _id: new ObjectId(add_dislike === null || add_dislike === void 0 ? void 0 : add_dislike.createdBy),
                isActive: true,
                isBlock: false
            }, {
                $inc: {
                    likedObs: 1
                }
            }));
            paraller_array.push(add_like1.deletedCount > 0 ? database_1.videoModel.updateOne({
                _id: new ObjectId(id),
                isActive: true,
                isBlock: false
            }, {
                $inc: {
                    totalDislike: 1,
                    totalLike: -1
                }
            }) : database_1.videoModel.updateOne({
                _id: new ObjectId(id),
                isActive: true,
                isBlock: false
            }, {
                $inc: { totalDislike: 1 }
            }));
            yield Promise.all(paraller_array);
            return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.addDataSuccess('dislike'), {}, {}));
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.internalServerError, {}, error));
    }
});
exports.dislike_video = dislike_video;
const get_video_pagination = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let { limit, page, latitude, longitude, state, suburb, city, country } = req.body, user = req.header('user'), blocklist = req.header('blocklist'), skip, match = {}, response, count;
    limit = parseInt(limit);
    skip = ((parseInt(page) - 1) * parseInt(limit));
    try {
        match = { isActive: true, isBlock: false };
        match.createdBy = { $nin: blocklist };
        if (latitude != null && longitude != null) {
            let location_data = (0, common_1.getArea)({
                lat: latitude, long: longitude
            }, common_1.RadiusInKm);
            match.latitude = { $gte: location_data.min.lat, $lte: location_data.max.lat };
            match.longitude = { $gte: location_data.min.long, $lte: location_data.max.long };
        }
        if (state) {
            match.state = state;
        }
        if (suburb) {
            match.suburb = suburb;
        }
        if (city) {
            match.city = city;
        }
        if (country) {
            match.country = country;
        }
        [response, count] = yield Promise.all([
            database_1.videoModel.aggregate([
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
                                                $eq: ['$createdBy', new ObjectId(user === null || user === void 0 ? void 0 : user._id)]
                                            },
                                            {
                                                $eq: ['$followerId', '$$createdBy']
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
                                $project: {
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
                                                $in: [new ObjectId(user === null || user === void 0 ? void 0 : user._id), "$followingBy.createdBy"]
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
                                                $eq: ['$_id', '$$categoryId']
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
                                    $in: [new ObjectId(user === null || user === void 0 ? void 0 : user._id), "$likedBy.createdBy"]
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
                                    $in: [new ObjectId(user === null || user === void 0 ? void 0 : user._id), "$dislikedBy.createdBy"]
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
                                        "user.isfollowing": {
                                            $in: [false, true]
                                        }
                                    }
                                ]
                            },
                            {
                                $and: [
                                    {
                                        "user.accountType": { $in: [1] }
                                    },
                                    {
                                        "user.isfollowing": {
                                            $in: [true]
                                        }
                                    }
                                ]
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
            database_1.videoModel.countDocuments(match)
        ]);
        return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.getDataSuccess('video'), {
            video_data: response,
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
exports.get_video_pagination = get_video_pagination;
const get_video_by_tag_pagination = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let { limit, page } = req.body, user = req.header('user'), blocklist = req.header('blocklist'), skip, match = { isActive: true, isBlock: false }, match1 = {
        createdBy: { $nin: blocklist },
        isActive: true,
        isBlock: false
    }, response, count, trending;
    limit = parseInt(limit);
    skip = ((parseInt(page) - 1) * parseInt(limit));
    try {
        [response, count, trending] = yield Promise.all([
            database_1.tagModel.aggregate([
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
                                                            $eq: ['$createdBy', new ObjectId(user === null || user === void 0 ? void 0 : user._id)]
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
                                                            $in: [new ObjectId(user === null || user === void 0 ? void 0 : user._id), "$followingBy.createdBy"]
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
                                                $in: [new ObjectId(user === null || user === void 0 ? void 0 : user._id), "$likedBy.createdBy"]
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
                                                $in: [new ObjectId(user === null || user === void 0 ? void 0 : user._id), "$dislikedBy.createdBy"]
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
            database_1.tagModel.countDocuments(match),
            database_1.videoModel.aggregate([
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
                                                $eq: ['$createdBy', new ObjectId(user === null || user === void 0 ? void 0 : user._id)]
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
                                                $in: [new ObjectId(user === null || user === void 0 ? void 0 : user._id), "$followingBy.createdBy"]
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
                                    $in: [new ObjectId(user === null || user === void 0 ? void 0 : user._id), "$likedBy.createdBy"]
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
                                    $in: [new ObjectId(user === null || user === void 0 ? void 0 : user._id), "$dislikedBy.createdBy"]
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
                            }, {
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
        ]);
        trending = {
            _id: null,
            name: "trending",
            video: trending
        };
        return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.getDataSuccess('video'), {
            video_data: [trending, ...response],
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
exports.get_video_by_tag_pagination = get_video_by_tag_pagination;
const get_video_by_tag_name_pagination = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let { limit, page, tagName } = req.body, user = req.header('user'), blocklist = req.header('blocklist'), skip, match = { isActive: true, isBlock: false }, response, count;
    limit = parseInt(limit);
    skip = ((parseInt(page) - 1) * parseInt(limit));
    try {
        match.tag = { $in: [tagName] };
        match.createdBy = { $nin: blocklist };
        response = yield database_1.videoModel.aggregate([
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
                                            $in: [new ObjectId(user === null || user === void 0 ? void 0 : user._id), "$followingBy.createdBy"]
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
        ]);
        count = yield database_1.videoModel.countDocuments(match);
        return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.getDataSuccess('video by tag name'), {
            video_data: response,
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
exports.get_video_by_tag_name_pagination = get_video_by_tag_name_pagination;
const get_video_by_user_pagination = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let { limit, page, userId } = req.body, user = req.header('user'), skip, match = { isActive: true, isBlock: false }, response, count;
    limit = parseInt(limit);
    skip = ((parseInt(page) - 1) * parseInt(limit));
    try {
        if (userId) {
            let commanblockcheck1 = yield (0, helper_2.commanblockcheck)(user, userId);
            if (commanblockcheck1) {
                match.createdBy = new ObjectId(userId);
            }
            else {
                return res.status(401).json(new common_1.apiResponse(401, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.blockbyuser, {}, {}));
            }
        }
        [response, count] = yield Promise.all([database_1.videoModel.aggregate([
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
                                                $in: [new ObjectId(user === null || user === void 0 ? void 0 : user._id),
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
                                        new ObjectId(user === null || user === void 0 ? void 0 : user._id), "$likedBy.createdBy"
                                    ]
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
                                        new ObjectId(user === null || user === void 0 ? void 0 : user._id), "$dislikedBy.createdBy"
                                    ]
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
            database_1.videoModel.countDocuments(match)]);
        return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.getDataSuccess('video'), {
            video_data: response,
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
exports.get_video_by_user_pagination = get_video_by_user_pagination;
const get_video_by_user_pagination1 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let { limit, page, userId } = req.body, user = req.header('user'), skip, match = { isActive: true, isBlock: false }, response, count;
    limit = parseInt(limit);
    skip = ((parseInt(page) - 1) * parseInt(limit));
    try {
        if (userId) {
            let commanblockcheck1 = yield (0, helper_2.commanblockcheck)(user, userId);
            if (commanblockcheck1) {
                match.createdBy = new ObjectId(userId);
            }
            else {
                return res.status(401).json(new common_1.apiResponse(401, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.blockbyuser, {}, {}));
            }
        }
        [response, count] = yield Promise.all([
            database_1.videoModel.aggregate([
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
                                    $in: [new ObjectId(user === null || user === void 0 ? void 0 : user._id), "$likedBy.createdBy"]
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
                                    $in: [new ObjectId(user === null || user === void 0 ? void 0 : user._id), "$dislikedBy.createdBy"]
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
            database_1.videoModel.countDocuments(match)
        ]);
        return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.getDataSuccess('video'), {
            video_data: response,
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
exports.get_video_by_user_pagination1 = get_video_by_user_pagination1;
const get_video_by_categoryId_pagination = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let { limit, page, categoryId } = req.body, user = req.header('user'), skip, match = { isActive: true, isBlock: false }, response, count;
    limit = parseInt(limit);
    skip = ((parseInt(page) - 1) * parseInt(limit));
    try {
        match.categoryId = new ObjectId(categoryId);
        response = yield database_1.videoModel.aggregate([
            { $match: match },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            { $project: { url: 1, totalView: 1, thumbnail: 1 } }
        ]);
        count = yield database_1.videoModel.countDocuments(match);
        return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.getDataSuccess('video'), {
            video_data: response,
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
exports.get_video_by_categoryId_pagination = get_video_by_categoryId_pagination;
const by_id_video = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let { id } = req.params, user = req.header('user'), response;
    try {
        response = yield database_1.videoModel.aggregate([
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
                                            $eq: ['$createdBy', new ObjectId(user === null || user === void 0 ? void 0 : user._id)]
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
                                            $eq: ['$createdBy', new ObjectId(user === null || user === void 0 ? void 0 : user._id)]
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
        ]);
        return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.getDataSuccess('video'), response, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.internalServerError, {}, error));
    }
});
exports.by_id_video = by_id_video;
const share_video_link = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let { id } = req.params;
    try {
        yield database_1.videoModel.updateOne({
            _id: new ObjectId(id),
            isActive: true,
            isBlock: false
        }, {
            $inc: {
                totalShare: 1
            }
        });
        return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.addDataSuccess('video share'), {}, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.internalServerError, {}, error));
    }
});
exports.share_video_link = share_video_link;
const add_count_view_video = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let { id } = req.params, user = req.header('user'), update_match = { $inc: { totalView: 1 } };
    try {
        if (user) {
            update_match['$addToSet'] = { listViewUser: [new ObjectId(user === null || user === void 0 ? void 0 : user._id)] };
            // console.log('++', update_match, '--');
        }
        yield database_1.videoModel.updateOne({
            _id: new ObjectId(id),
            isActive: true,
            isBlock: false
        }, update_match);
        return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.addDataSuccess('video view'), {}, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.internalServerError, {}, error));
    }
});
exports.add_count_view_video = add_count_view_video;
//# sourceMappingURL=video.js.map