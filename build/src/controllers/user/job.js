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
exports.complete_job = exports.start_job = exports.get_job_pagination = exports.delete_job = exports.update_job = exports.add_job = void 0;
const helper_1 = require("../../helper");
const database_1 = require("../../database");
const common_1 = require("../../common");
const helper_2 = require("../../helper");
const mongoose_1 = require("mongoose");
const ObjectId = mongoose_1.Types.ObjectId;
const add_job = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    try {
        let response, body = req.body, user = req.header('user');
        body.createdBy = new ObjectId(user === null || user === void 0 ? void 0 : user._id);
        response = yield new database_1.jobModel(body).save();
        if (response) {
            return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.addDataSuccess('job'), {}, {}));
        }
        else
            return res.status(400).json(new common_1.apiResponse(400, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.addDataError, {}, `${response}`));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.internalServerError, {}, error));
    }
});
exports.add_job = add_job;
const update_job = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    try {
        let response, body = req.body;
        response = yield database_1.jobModel.findOneAndUpdate({
            _id: new ObjectId(body === null || body === void 0 ? void 0 : body.id),
            isActive: true,
            isBlock: false
        }, body);
        if (!response) {
            return res.status(400).json(new common_1.apiResponse(400, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.getDataNotFound('job'), {}, `${response}`));
        }
        return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.updateDataSuccess('job'), {}, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.internalServerError, {}, error));
    }
});
exports.update_job = update_job;
const delete_job = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let id = (req.params.id);
    try {
        let response = yield database_1.jobModel.findOneAndUpdate({
            _id: new ObjectId(id),
            isActive: true
        }, {
            isActive: false
        });
        return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.deleteDataSuccess('job'), {}, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.internalServerError, {}, error));
    }
});
exports.delete_job = delete_job;
const get_job_pagination = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let { limit, page, search } = req.body, user = req.header('user'), skip, match = {}, response, count;
    limit = parseInt(limit);
    skip = ((parseInt(page) - 1) * parseInt(limit));
    try {
        match = {
            isActive: true,
            isBlock: false
        };
        response = yield database_1.jobModel.aggregate([
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
                        }, {
                            $project: { username: 1, image: 1 }
                        }
                    ],
                    as: "user"
                }
            },
            {
                $project: { user: 1, description: 1, title: 1, location: 1, status: 1, }
            }
        ]);
        count = yield database_1.jobModel.countDocuments(match);
        return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.getDataSuccess('job'), {
            job_data: response,
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
exports.get_job_pagination = get_job_pagination;
const start_job = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let id = (req.params.id);
    try {
        let response = yield database_1.jobModel.findOneAndUpdate({
            _id: new ObjectId(id),
            isActive: true,
            isBlock: false
        }, { status: common_1.type.job.running });
        if (response) {
            return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.updateDataSuccess('start job'), {}, {}));
        }
        return res.status(404).json(new common_1.apiResponse(404, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.getDataNotFound('job'), {}, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.internalServerError, {}, error));
    }
});
exports.start_job = start_job;
const complete_job = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let id = (req.params.id);
    try {
        let response = yield database_1.jobModel.findOneAndUpdate({
            _id: new ObjectId(id),
            isActive: true,
            isBlock: false
        }, {
            status: common_1.type.job.complete
        });
        if (response) {
            return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.updateDataSuccess('complete job'), {}, {}));
        }
        return res.status(404).json(new common_1.apiResponse(404, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.getDataNotFound('job'), {}, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.internalServerError, {}, error));
    }
});
exports.complete_job = complete_job;
//# sourceMappingURL=job.js.map