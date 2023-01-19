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
exports.partialJWT = exports.commanblockcheck = exports.userBlock2 = exports.userBlock1 = exports.userBlock = exports.userJWT = void 0;
//packages
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
//import
const database_1 = require("../database");
const common_1 = require("../common");
const response_1 = require("./response");
const mongoose_1 = __importDefault(require("mongoose"));
const ObjectId = mongoose_1.default.Types.ObjectId;
const jwt_token_secret = process.env.JWT_TOKEN_SECRET;
const userJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { authorization, userType } = req.headers, result;
    // for postman
    authorization = authorization.split(' ')[1];
    console.log(authorization);
    if (authorization) {
        try {
            let isverifyToken = jsonwebtoken_1.default.verify(authorization, jwt_token_secret);
            if ((isverifyToken === null || isverifyToken === void 0 ? void 0 : isverifyToken.type) != userType && userType != "5") {
                return res.status(403).json(new common_1.apiResponse(403, response_1.responseMessage === null || response_1.responseMessage === void 0 ? void 0 : response_1.responseMessage.accessDenied, {}, {}));
            }
            result = yield database_1.userModel.findOne({ _id: new ObjectId(isverifyToken._id), isActive: true });
            if ((result === null || result === void 0 ? void 0 : result.isBlock) == true) {
                return res.status(403).json(new common_1.apiResponse(403, response_1.responseMessage === null || response_1.responseMessage === void 0 ? void 0 : response_1.responseMessage.accountBlock, {}, {}));
            }
            // console.log(isverifyToken, '--++-');
            // console.log(isverifyToken?.authToken, '------');
            // console.log(result, '+++++');
            if ((result === null || result === void 0 ? void 0 : result.isActive) == true && isverifyToken.authToken == result.authToken) {
                req.headers.user = result;
                return next();
            }
            else {
                return res.status(401).json(new common_1.apiResponse(401, response_1.responseMessage === null || response_1.responseMessage === void 0 ? void 0 : response_1.responseMessage.invalidToken, {}, {}));
            }
        }
        catch (err) {
            if (err.message == "invalid signature") {
                return res.status(403).json(new common_1.apiResponse(403, response_1.responseMessage === null || response_1.responseMessage === void 0 ? void 0 : response_1.responseMessage.differentToken, {}, {}));
            }
            console.log('catch jwt err');
            console.log(err);
        }
    }
    else {
        return res.status(401).json(new common_1.apiResponse(401, response_1.responseMessage === null || response_1.responseMessage === void 0 ? void 0 : response_1.responseMessage.tokenNotFound, {}, {}));
    }
});
exports.userJWT = userJWT;
const userBlock = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let user = req.header('user');
    // console.log(user, '---');
    let blocklist1 = yield database_1.blockModel.find({ blockId: new ObjectId(user === null || user === void 0 ? void 0 : user._id), isActive: true, isBlock: false, requestStatus: 1 });
    let blocklist2 = yield database_1.blockModel.find({
        cratedBy: new ObjectId(user === null || user === void 0 ? void 0 : user._id), isActive: true, isBlock: false, requestStatus: 1
    });
    req.headers.blocklist = [...blocklist1.map((a) => a.createdBy), ...blocklist2.map((a) => a.blockId)];
    return next();
});
exports.userBlock = userBlock;
const userBlock1 = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let user = req.header('user');
    let id = (req.params.id);
    // console.log(user);
    let blocklist1 = yield database_1.blockModel.find({ blockId: new ObjectId(user === null || user === void 0 ? void 0 : user._id), isActive: true, isBlock: false, requestStatus: 1 });
    let blocklist2 = yield database_1.blockModel.find({ cratedBy: new ObjectId(user === null || user === void 0 ? void 0 : user._id), blockId: new ObjectId(id), isActive: true, isBlock: false, requestStatus: 1 });
    if (blocklist1.length == 0 && blocklist2.length == 0) {
        return next();
    }
    else {
        return res.status(401).json(new common_1.apiResponse(401, response_1.responseMessage === null || response_1.responseMessage === void 0 ? void 0 : response_1.responseMessage.blockbyuser, {}, {}));
    }
});
exports.userBlock1 = userBlock1;
const userBlock2 = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let user = req.header('user');
    let id = (req.params.id);
    let username = yield database_1.userModel.findOne({ username: id, isActive: true, isBlock: false });
    // console.log(user)
    let blocklist1 = yield database_1.blockModel.find({ blockId: new ObjectId(user === null || user === void 0 ? void 0 : user._id), createdBy: username === null || username === void 0 ? void 0 : username._id, isActive: true, isBlock: false, requestStatus: 1 });
    let blocklist2 = yield database_1.blockModel.find({ createdBy: new ObjectId(user === null || user === void 0 ? void 0 : user._id), blockId: username === null || username === void 0 ? void 0 : username._id, isActive: true, isBlock: false, requestStatus: 1 });
    // console.log(blocklist)
    // req.headers.blocklist = [...blocklist1.map(a => a.createdBy),...blocklist2.map(a => a.blockId)];
    // req.headers.blocklist = blocklist2.map(a => a.blockId);
    if (blocklist1.length == 0 && blocklist2.length == 0) {
        return next();
    }
    else {
        return res.status(401).json(new common_1.apiResponse(401, response_1.responseMessage === null || response_1.responseMessage === void 0 ? void 0 : response_1.responseMessage.blockbyuser, {}, {}));
    }
});
exports.userBlock2 = userBlock2;
const commanblockcheck = (user, id) => __awaiter(void 0, void 0, void 0, function* () {
    let blocklist1 = yield database_1.blockModel.find({
        blockId: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
        cratedBy: new ObjectId(id),
        isActive: true,
        isBlock: false,
        requestStatus: 1
    });
    let blocklist2 = yield database_1.blockModel.find({
        createdBy: new ObjectId(user === null || user === void 0 ? void 0 : user._id),
        blockId: new ObjectId(id),
        isActive: true,
        isBlock: false,
        requestStatus: 1
    });
    if (blocklist1.length == 0 && blocklist2.length == 0) {
        return true;
    }
    else {
        return false;
    }
});
exports.commanblockcheck = commanblockcheck;
const partialJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { authorization, userType } = req.headers, result;
    authorization = authorization.split(' ')[1];
    if (authorization) {
        try {
            let isverifyToken = jsonwebtoken_1.default.verify(authorization, jwt_token_secret);
            if ((isverifyToken === null || isverifyToken === void 0 ? void 0 : isverifyToken.type) != userType && userType != "5") {
                return res.status(403).json(new common_1.apiResponse(403, response_1.responseMessage === null || response_1.responseMessage === void 0 ? void 0 : response_1.responseMessage.accessDenied, {}, {}));
            }
            result = yield database_1.userModel.findOne({ _id: new ObjectId(isverifyToken._id), isActive: true });
            if ((result === null || result === void 0 ? void 0 : result.isBlock) == true) {
                return res.status(403).json(new common_1.apiResponse(403, response_1.responseMessage === null || response_1.responseMessage === void 0 ? void 0 : response_1.responseMessage.accountBlock, {}, {}));
            }
            // console.log(result);
            // console.log(isverifyToken);
            if ((result === null || result === void 0 ? void 0 : result.isActive) == true && isverifyToken.authToken == result.authToken) {
                req.headers.user = result;
                return next();
            }
            else {
                return res.status(401).json(new common_1.apiResponse(401, response_1.responseMessage === null || response_1.responseMessage === void 0 ? void 0 : response_1.responseMessage.invalidToken, {}, {}));
            }
        }
        catch (err) {
            if (err.message == "invalid signature") {
                return res.status(403).json(new common_1.apiResponse(403, response_1.responseMessage === null || response_1.responseMessage === void 0 ? void 0 : response_1.responseMessage.differentToken, {}, {}));
            }
            console.log(err);
            return res.status(401).json(new common_1.apiResponse(401, response_1.responseMessage.invalidToken, {}, {}));
        }
    }
    else {
        next();
    }
});
exports.partialJWT = partialJWT;
//# sourceMappingURL=jwt.js.map