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
exports.login = exports.signUp = void 0;
const database_1 = require("../../database");
const common_1 = require("../../common");
const helper_1 = require("../../helper");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const ObjectId = mongoose_1.default.Types.ObjectId;
const jwt_token_secret = process.env.JWT_TOKEN_SECRET;
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    try {
        let body = req.body, userType = req.headers.userType, otpFlag = 1, authToken = 0;
        let isAlready = yield database_1.userModel.findOne({
            email: body.email, isActive: true, userType
        });
        if ((isAlready === null || isAlready === void 0 ? void 0 : isAlready.isBlock) == true) {
            return res.status(403).json(new common_1.apiResponse(403, helper_1.responseMessage.accountBlock, {}, {}));
        }
        if (isAlready) {
            return res.status(409).json(new common_1.apiResponse(409, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.alreadyEmail, {}, {}));
        }
        const salt = bcryptjs_1.default.genSaltSync(8);
        const hashPassword = yield bcryptjs_1.default.hash(body.password, salt);
        delete body.password;
        body.userType = userType;
        body.password = hashPassword;
        body.username = body.name;
        while (otpFlag == 1) {
            for (let flag = 0; flag < 1;) {
                authToken = Math.round(Math.random() * 1000000);
                if (authToken.toString().length == 6) {
                    flag++;
                }
            }
            let isAlreadyAssign = yield database_1.userModel.findOne({ otp: authToken });
            if ((isAlreadyAssign === null || isAlreadyAssign === void 0 ? void 0 : isAlreadyAssign.otp) != authToken) {
                otpFlag = 0;
            }
        }
        body.authToken = authToken;
        body.otp = authToken;
        body.otpExpireTime = new Date(new Date().setMinutes(new Date().getMinutes() + 10));
        let response = yield new database_1.userModel(body).save();
        const token = jsonwebtoken_1.default.sign({
            _id: response._id,
            authToken: response.authToken,
            type: response.userType,
            status: "Login",
            generatedOn: (new Date().getTime())
        }, jwt_token_secret);
        return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage.signupSuccess, {
            firstName: response.firstName,
            lastName: response.lastName,
            gender: response.gender,
            email: response.email,
            image: response.image,
            userType: response.userType,
            token,
        }, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_1.responseMessage.internalServerError, {}, error));
    }
});
exports.signUp = signUp;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let body = req.body, otpFlag = 1, authToken;
    (0, helper_1.reqInfo)(req);
    try {
        for (let flag = 0; flag < 1;) {
            authToken = Math.round(Math.random() * 1000000);
            if (authToken.toString().length == 6) {
                flag++;
            }
        }
        let response = yield database_1.userModel.findOneAndUpdate({
            email: body.email,
            isActive: true,
            userType: common_1.userStatus.admin
        }, {
            $addToSet: Object.assign({}, ((body === null || body === void 0 ? void 0 : body.deviceToken) != null) && { deviceToken: body === null || body === void 0 ? void 0 : body.deviceToken })
        }, { new: true });
        if (!response) {
            return res.status(400).json(new common_1.apiResponse(400, helper_1.responseMessage.invalidUserPasswordEmail, {}, {}));
        }
        if ((response === null || response === void 0 ? void 0 : response.isBlock) == true) {
            return res.status(403).json(new common_1.apiResponse(403, helper_1.responseMessage.accountBlock, {}, {}));
        }
        const passwordMatch = yield bcryptjs_1.default.compare(body.password, response.password);
        if (!passwordMatch) {
            return res.status(400).json(new common_1.apiResponse(400, helper_1.responseMessage.invalidUserPasswordEmail, {}, {}));
        }
        const token = jsonwebtoken_1.default.sign({
            _id: response._id,
            authToken: response.authToken,
            type: response.userType,
            status: 'Login',
            generatedOn: (new Date().getTime())
        }, jwt_token_secret);
        response = {
            firstName: response.firstName,
            lastName: response.lastName,
            gender: response.gender,
            email: response.email,
            image: response.image,
            userType: response.userType,
            token,
        };
        return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage.loginSuccess, response, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_1.responseMessage.internalServerError, {}, error));
    }
});
exports.login = login;
//# sourceMappingURL=authentication.js.map