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
exports.get_enquiry_pagination = exports.delete_enquiry = exports.update_enquiry = exports.add_enquiry = void 0;
const helper_1 = require("../../helper");
const database_1 = require("../../database");
const common_1 = require("../../common");
const mongoose_1 = __importDefault(require("mongoose"));
const ObjectId = mongoose_1.default.Types.ObjectId;
const add_enquiry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    (0, helper_1.reqInfo)(req);
    req.body.createdBy = (_a = req.header('user')) === null || _a === void 0 ? void 0 : _a._id;
    try {
        yield new database_1.enquiryModel(req.body).save();
        return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.addDataSuccess('enquiry'), {}, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.internalServerError, {}, error));
    }
});
exports.add_enquiry = add_enquiry;
const update_enquiry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    try {
        let response, body = req.body;
        response = yield database_1.enquiryModel.findOneAndUpdate({
            _id: new ObjectId(body === null || body === void 0 ? void 0 : body.id),
            isActive: true,
            isBlock: false
        }, body);
        if (!response) {
            return res.status(400).json(new common_1.apiResponse(400, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.getDataNotFound('enquiry'), {}, `${response}`));
        }
        return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.updateDataSuccess('enquiry'), {}, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.internalServerError, {}, error));
    }
});
exports.update_enquiry = update_enquiry;
const delete_enquiry = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let id = (req.params.id);
    try {
        let response = yield database_1.enquiryModel.findOneAndUpdate({
            _id: new ObjectId(id),
            isActive: true
        }, {
            isActive: false
        });
        if (response) {
            return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.deleteDataSuccess('enquiry'), {}, {}));
        }
        return res.status(404).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.getDataNotFound('enquiry'), {}, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.internalServerError, {}, error));
    }
});
exports.delete_enquiry = delete_enquiry;
const get_enquiry_pagination = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let { limit, page, search, jobId } = req.body, user = req.header('user'), skip, match = {}, response, count;
    limit = parseInt(limit);
    skip = ((parseInt(page) - 1) * parseInt(limit));
    try {
        match = {
            isActive: true,
            isBlock: false,
        };
        if (jobId) {
            match.jobId = new ObjectId(jobId);
        }
        response = yield database_1.enquiryModel.aggregate([
            { $match: match },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            { $project: { createdBy: 0, createdAt: 0, updatedAt: 0, __v: 0, isActive: 0, isBlock: 0 } }
        ]);
        count = yield database_1.enquiryModel.countDocuments(match);
        return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.getDataSuccess('enquiry'), {
            enquiry_data: response,
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
exports.get_enquiry_pagination = get_enquiry_pagination;
//# sourceMappingURL=enquiry.js.map