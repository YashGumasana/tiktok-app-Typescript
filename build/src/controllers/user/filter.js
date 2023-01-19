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
exports.delete_filter = exports.update_filter = exports.add_filter = void 0;
const helper_1 = require("../../helper");
const database_1 = require("../../database");
const common_1 = require("../../common");
const mongoose_1 = __importDefault(require("mongoose"));
const helper_2 = require("../../helper");
const ObjectId = mongoose_1.default.Types.ObjectId;
const add_filter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    (0, helper_1.reqInfo)(req);
    req.body.createdBy = (_a = req.header('user')) === null || _a === void 0 ? void 0 : _a._id;
    try {
        yield new database_1.filterModel(req.body).save();
        return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.addDataSuccess('filter'), {}, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.internalServerError, {}, error));
    }
});
exports.add_filter = add_filter;
const update_filter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    try {
        let response, body = req.body;
        response = yield database_1.filterModel.findOneAndUpdate({
            _id: new ObjectId(body === null || body === void 0 ? void 0 : body.id),
            isActive: true,
            isBlock: false
        }, body);
        if (!response) {
            return res.status(400).json(new common_1.apiResponse(400, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.getDataNotFound('filter'), {}, `${response}`));
        }
        return res.status(200).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.updateDataSuccess('filter'), {}, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(200, helper_2.responseMessage === null || helper_2.responseMessage === void 0 ? void 0 : helper_2.responseMessage.internalServerError, {}, error));
    }
});
exports.update_filter = update_filter;
const delete_filter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let id = (req.params.id);
    try {
        let response = yield database_1.filterModel.findOneAndUpdate({
            _id: new ObjectId(id),
            isActive: true
        }, {
            isActive: false
        });
    }
    catch (error) {
    }
});
exports.delete_filter = delete_filter;
//# sourceMappingURL=filter.js.map