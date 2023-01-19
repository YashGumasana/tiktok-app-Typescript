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
exports.by_id = exports.logout = exports.change_password = exports.update_profile = exports.reset_password = exports.forgot_password = exports.otp_verification = exports.login = exports.signUp = void 0;
//package
const joi_1 = __importDefault(require("joi"));
const mongoose_1 = require("mongoose");
//route
const common_1 = require("../common");
const signUp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const schema = joi_1.default.object({
        DOB: joi_1.default.string().lowercase().error(new Error('DOB is string!')),
        location: joi_1.default.string().lowercase().error(new Error('location is string!')),
        email: joi_1.default.string().error(new Error('email is string!')),
        username: joi_1.default.string().error(new Error('username is string!')),
        gender: joi_1.default.number().error(new Error('gender is number!')),
        password: joi_1.default.string().error(new Error('password is string!')),
        deviceToken: joi_1.default.string().error(new Error('deviceToken is string!')),
    });
    schema.validateAsync(req.body).then(result => {
        return next();
    }).catch(error => {
        res.status(400).json(new common_1.apiResponse(400, error.message, {}, {}));
    });
});
exports.signUp = signUp;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const schema = joi_1.default.object({
        email: joi_1.default.string().lowercase().max(50).required().error(new Error('email is required! & max length is 50')),
        password: joi_1.default.string().max(20).required().error(new Error('password is required! & max length is 20')),
        deviceToken: joi_1.default.string().error(new Error('deviceToken is string!')),
    });
    schema.validateAsync(req.body).then((result) => __awaiter(void 0, void 0, void 0, function* () {
        req.body = result;
        return next();
    })).catch((error) => __awaiter(void 0, void 0, void 0, function* () {
        res.status(400).json(new common_1.apiResponse(400, error.message, {}, {}));
    }));
});
exports.login = login;
const otp_verification = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const schema = joi_1.default.object({
        otp: joi_1.default.number().error(new Error('otp is number!')),
        email: joi_1.default.string().error(new Error('email is string!')),
    });
    schema.validateAsync(req.body).then(result => {
        return next();
    }).catch(error => {
        res.status(400).json(new common_1.apiResponse(400, error.message, {}, {}));
    });
});
exports.otp_verification = otp_verification;
const forgot_password = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const schema = joi_1.default.object({
        email: joi_1.default.string().lowercase().required().error(new Error('email is required!')),
    });
    schema.validateAsync(req.body).then((result) => __awaiter(void 0, void 0, void 0, function* () {
        req.body = result;
        return next();
    })).catch((error) => __awaiter(void 0, void 0, void 0, function* () {
        res.status(400).json(new common_1.apiResponse(400, error.message, {}, {}));
    }));
});
exports.forgot_password = forgot_password;
const reset_password = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const schema = joi_1.default.object({
        id: joi_1.default.string().required().error(new Error('id is required! ')),
        otp: joi_1.default.number().required().error(new Error('otp is required! ')),
        password: joi_1.default.string().max(20).required().error(new Error('password is required! & max length is 20')),
    });
    schema.validateAsync(req.body).then((result) => __awaiter(void 0, void 0, void 0, function* () {
        if (!(0, mongoose_1.isValidObjectId)(result.id)) {
            return res.status(400).json(new common_1.apiResponse(400, 'invalid id', {}, {}));
        }
        return next();
    })).catch((error) => __awaiter(void 0, void 0, void 0, function* () {
        res.status(400).json(new common_1.apiResponse(400, error.message, {}, {}));
    }));
});
exports.reset_password = reset_password;
const update_profile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const schema = joi_1.default.object({
        firstName: joi_1.default.string().lowercase().error(new Error('firstName is string!')),
        lastName: joi_1.default.string().lowercase().error(new Error('lastName is string!')),
        bio: joi_1.default.string().lowercase().error(new Error('bio is string!')),
        image: joi_1.default.string().error(new Error('image is string!')),
        phoneNumber: joi_1.default.string().error(new Error('phoneNumber is string!')),
        countryCode: joi_1.default.string().error(new Error('countryCode is string!')),
        username: joi_1.default.string().error(new Error('username is string!')),
        DOB: joi_1.default.string().lowercase().error(new Error('DOB is string!')),
        location: joi_1.default.string().lowercase().error(new Error('location is string!')),
        email: joi_1.default.string().error(new Error('email is string!')),
        gender: joi_1.default.number().error(new Error('gender is number!')),
    });
    schema.validateAsync(req.body).then(result => {
        return next();
    }).catch(error => {
        res.status(400).json(new common_1.apiResponse(400, error.message, {}, {}));
    });
});
exports.update_profile = update_profile;
const change_password = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const schema = joi_1.default.object({
        oldPassword: joi_1.default.string().required().error(new Error('oldPassword is string!')),
        newPassword: joi_1.default.string().required().error(new Error('newPassword is string!'))
    });
    schema.validateAsync(req.body).then(result => {
        return next();
    }).catch(error => {
        res.status(400).json(new common_1.apiResponse(400, error.message, {}, {}));
    });
});
exports.change_password = change_password;
const logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const schema = joi_1.default.object({
        deviceToken: joi_1.default.string().error(new Error('deviceToken is string!')),
    });
    schema.validateAsync(req.body).then(result => {
        return next();
    }).catch(error => {
        res.status(400).json(new common_1.apiResponse(400, error.message, {}, {}));
    });
});
exports.logout = logout;
const by_id = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(0, mongoose_1.isValidObjectId)(req.params.id)) {
        return res.status(400).json(new common_1.apiResponse(400, 'invalid id', {}, {}));
    }
    return next();
});
exports.by_id = by_id;
//# sourceMappingURL=user.js.map