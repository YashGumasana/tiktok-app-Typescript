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
exports.get_all_user = exports.google_SL = exports.change_password = exports.delete_profile = exports.update_profile = exports.get_profile = exports.reset_password = exports.forgot_password = exports.otp_verification = exports.logout = exports.login = exports.signUp = void 0;
// import
// import userModel from "../../database/models/user";
const database_1 = require("../../database");
const common_1 = require("../../common");
const helper_1 = require("../../helper");
//packages
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const ObjectId = require('mongoose').Types.ObjectId;
// const jwt_token_secret = config.get('jwt_token_secret')
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    try {
        console.log('sign up');
        let body = req.body, userType = req.headers.userType, otpFlag = 1, // Otp has already assign or not for cross-verification
        authToken = 0;
        // console.log(req.headers);
        // console.log(body, typeof userType, req.headers.userType);
        // userModel
        // const x = await userModel.findOne({ email: body?.email, isActive: true, userType, isEmailVerified: true })
        // console.log(x, '**');
        let [isAlready, usernameAlreadyExist] = yield Promise.all([
            database_1.userModel.findOne({ email: body === null || body === void 0 ? void 0 : body.email, isActive: true, userType, isEmailVerified: true }),
            database_1.userModel.findOne({
                username: { '$regex': body === null || body === void 0 ? void 0 : body.username, '$options': 'i' }, isActive: true, userType, isEmailVerified: true
            }),
        ]);
        // console.log(isAlready, usernameAlreadyExist, '---');
        if (usernameAlreadyExist) {
            return res.status(409).json(new common_1.apiResponse(409, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.alreadyUsername, {}, {}));
        }
        if ((isAlready === null || isAlready === void 0 ? void 0 : isAlready.isBlock) == true) {
            return res.status(403).json(new common_1.apiResponse(403, helper_1.responseMessage.accountBlock, {}, {}));
        }
        if (isAlready) {
            return res.status(409).json(new common_1.apiResponse(409, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.alreadyEmail, {}, {}));
        }
        const salt = bcryptjs_1.default.genSaltSync(8);
        const hashPassword = yield bcryptjs_1.default.hash(body.password, salt);
        delete body.password;
        body.password = hashPassword;
        while (otpFlag == 1) {
            for (let flag = 0; flag < 1;) {
                authToken = Math.round(Math.random() * 1000000);
                if (authToken.toString().length == 6) {
                    flag++;
                }
            }
            // console.log(authToken, '++');
            let isAlreadyAssign = yield database_1.userModel.findOne({ otp: authToken });
            // console.log(isAlreadyAssign);
            // console.log(isAlreadyAssign.otp);
            // console.log(isAlreadyAssign?.otp);
            if ((isAlreadyAssign === null || isAlreadyAssign === void 0 ? void 0 : isAlreadyAssign.otp) != authToken) {
                otpFlag = 0;
            }
        }
        // console.log('**');
        body.authToken = authToken;
        body.otp = authToken;
        body.otpExpireTime = new Date(new Date().setMinutes(new Date().getMinutes() + 10));
        const y = yield database_1.userModel.deleteOne({
            email: body.email,
            isActive: true,
            isEmailVerified: false
        });
        console.log(body, y, '+++');
        let user = yield new database_1.userModel(body).save();
        // console.log(user, '***');
        let response = yield (0, helper_1.email_verification_mail)({
            email: user === null || user === void 0 ? void 0 : user.email, username: user === null || user === void 0 ? void 0 : user.username, otp: user === null || user === void 0 ? void 0 : user.otp
        });
        return res.status(200).json(new common_1.apiResponse(200, response, {}, {}));
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
            userType: common_1.userStatus.user
        }, {
            $addToSet: Object.assign({}, ((body === null || body === void 0 ? void 0 : body.deviceToken) != null) && { deviceToken: body === null || body === void 0 ? void 0 : body.deviceToken })
        }, { new: true });
        if (!response) {
            return res.status(400).json(new common_1.apiResponse(400, 'email is not found', {}, {}));
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
            status: "Login",
            generatedOn: (new Date().getTime())
        }, process.env.JWT_TOKEN_SECRET);
        // console.log(response, '--');
        response = {
            _id: response === null || response === void 0 ? void 0 : response._id,
            username: response.username,
            firstName: response.firstName,
            lastName: response.lastName,
            gender: response.gender,
            email: response.email,
            image: response.image,
            userType: response.userType,
            isEmailVerified: response.isEmailVerified,
            token
        };
        return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage.loginSuccess, response, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_1.responseMessage.internalServerError, {}, error));
    }
});
exports.login = login;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let user = req.header('user');
    // console.log(req.body.logout);
    try {
        yield database_1.userModel.updateOne({ _id: ObjectId(user._id), isActive: true }, { $pull: { deviceToken: req.body.logout } });
        return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.logout, {}, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, 'Internal Server Error', {}, {}));
    }
});
exports.logout = logout;
const otp_verification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let body = req.body;
    try {
        body.isActive = true;
        let data = yield database_1.userModel.findOneAndUpdate(body, {
            $addToSet: { deviceToken: body === null || body === void 0 ? void 0 : body.deviceToken },
            authToken: body.otp,
            isEmailVerified: true
        });
        if (!data) {
            return res.status(400).json(new common_1.apiResponse(400, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.invalidOTP, {}, {}));
        }
        if (data.isBlock == true) {
            return res.status(403).json(new common_1.apiResponse(403, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.accountBlock, {}, {}));
        }
        if (new Date(data.otpExpireTime).getTime() < new Date().getTime()) {
            return res.status(410).json(new common_1.apiResponse(410, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.expireOTP, {}, {}));
        }
        if (data === null || data === void 0 ? void 0 : data.isEmailVerified) {
            return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.OTPverified, {
                _id: data._id,
                otp: data === null || data === void 0 ? void 0 : data.otp
            }, {}));
        }
        else {
            const token = jsonwebtoken_1.default.sign({
                _id: data._id,
                authToken: body === null || body === void 0 ? void 0 : body.otp,
                type: data.userType,
                status: "OTP verification",
                generatedOn: (new Date().getTime())
            }, process.env.JWT_TOKEN_SECRET);
            return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.OTPverified, {
                _id: data._id,
                firstName: data.firstName,
                username: data.username,
                lastName: data.lastName,
                gender: data.gender,
                email: data.email,
                image: data.image,
                userType: data.userType,
                token,
            }, {}));
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.internalServerError, {}, error));
    }
});
exports.otp_verification = otp_verification;
const forgot_password = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let body = req.body, otp = 0, otpFlag = 1; //otp has already assign or not for cross-verification 
    try {
        body.isActive = true;
        let data = yield database_1.userModel.findOne(body);
        if (!data) {
            return res.status(400).json(new common_1.apiResponse(400, helper_1.responseMessage.invalidEmail, {}, {}));
        }
        if (data.isBlock == true) {
            return res.status(403).json(new common_1.apiResponse(403, helper_1.responseMessage.accountBlock, {}, {}));
        }
        while (otpFlag == 1) {
            for (let flag = 0; flag < 1;) {
                otp = yield Math.round(Math.random() * 1000000);
                if (otp.toString().length == 6) {
                    flag++;
                }
            }
            let isAlreadyAssign = yield database_1.userModel.findOne({ otp: otp });
            if ((isAlreadyAssign === null || isAlreadyAssign === void 0 ? void 0 : isAlreadyAssign.otp) != otp) {
                otpFlag = 0;
            }
        }
        // console.log('---');
        data.otp = otp;
        // console.log(data);
        let response = yield (0, helper_1.forgot_password_mail)(data);
        // console.log('==');
        if (response) {
            yield database_1.userModel.findOneAndUpdate(body, { otp, otpExpireTime: new Date(new Date().setMinutes(new Date().getMinutes() + 10)) });
            return res.status(200).json(new common_1.apiResponse(200, `${response}`, {}, {}));
        }
        else {
            return res.status(501).json(new common_1.apiResponse(501, helper_1.responseMessage.errorMail, {}, `${response}`));
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_1.responseMessage.internalServerError, {}, error));
    }
});
exports.forgot_password = forgot_password;
const reset_password = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let body = req.body, authToken = 0, id = body.id, otp = body === null || body === void 0 ? void 0 : body.otp;
    delete body.otp;
    try {
        const salt = bcryptjs_1.default.genSaltSync(10);
        const hashPassword = yield bcryptjs_1.default.hash(body.password, salt);
        delete body.password;
        delete body.id;
        body.password = hashPassword;
        for (let flag = 0; flag < 1;) {
            authToken = Math.round(Math.random() * 1000000);
            if (authToken.toString().length == 6) {
                flag++;
            }
        }
        body.authToken = authToken;
        body.otp = 0;
        body.otpExpireTime = null;
        let response = yield database_1.userModel.findOneAndUpdate({
            _id: ObjectId(id), isActive: true, otp: otp
        }, body, { new: true });
        if (response) {
            return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.resetPasswordSuccess, { action: "please go to login page" }, {}));
        }
        else {
            return res.status(501).json(new common_1.apiResponse(501, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.resetPasswordError, response, {}));
        }
    }
    catch (error) {
        return res.status(200).json(new common_1.apiResponse(500, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.internalServerError, {}, error));
    }
});
exports.reset_password = reset_password;
const get_profile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let user = req.header('user'), planData;
    try {
        let response = yield database_1.userModel.findOne({ _id: ObjectId(user._id), isActive: true }).select('-password -createdAt -updatedAt -__v');
        return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.getDataSuccess('your profile'), response, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.internalServerError, {}, {}));
    }
});
exports.get_profile = get_profile;
const update_profile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let user = req.header('user'), body = req.body;
    // console.log(user);
    try {
        if (body === null || body === void 0 ? void 0 : body.email) {
            if (yield database_1.userModel.findOne({
                email: body === null || body === void 0 ? void 0 : body.email, isActive: true, _id: { $ne: ObjectId(user === null || user === void 0 ? void 0 : user._id) },
            }, { isActive: true })) {
                return res.status(409).json(new common_1.apiResponse(409, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.alreadyEmail, {}, {}));
            }
        }
        let response = yield database_1.userModel.findOneAndUpdate({
            _id: ObjectId(user._id),
            isActive: true
        }, body, { new: true });
        if (response) {
            return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.updateDataSuccess('profile'), response, {}));
        }
        else {
            return res.status(501).json(new common_1.apiResponse(501, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.getDataNotFound('profile'), {}, {}));
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.internalServerError, {}, {}));
    }
});
exports.update_profile = update_profile;
const delete_profile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let user = req.header('user'), planData;
    try {
        let response = yield database_1.userModel.findOneAndUpdate({
            _id: ObjectId(user._id), isActive: true
        }, {
            isActive: false
        });
        if (response) {
            return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.deleteDataSuccess('your profile'), {}, {}));
        }
        else {
            return res.status(501).json(new common_1.apiResponse(501, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.updateDataError('profile'), {}, {}));
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.internalServerError, {}, {}));
    }
});
exports.delete_profile = delete_profile;
const change_password = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    let user = req.header('user'), { oldPassword, newPassword } = req.body, otp = 0;
    try {
        for (let flag = 0; flag < 1;) {
            otp = Math.round(Math.random() * 1000000);
            if (otp.toString().length == 6) {
                flag++;
            }
        }
        // console.log(otp, '---+++');
        let data = yield database_1.userModel.findOne({ _id: ObjectId(user === null || user === void 0 ? void 0 : user._id), isActive: true, isBlock: false });
        // console.log(data, '***');
        const passwordIsCorrect = yield bcryptjs_1.default.compare(oldPassword, data.password);
        if (!passwordIsCorrect) {
            return res.status(400).json(new common_1.apiResponse(400, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.invalidOldPassword, {}, {}));
        }
        const hashPassword = yield bcryptjs_1.default.hash(newPassword, bcryptjs_1.default.genSaltSync(8));
        const newData = yield database_1.userModel.updateOne({ _id: ObjectId(user === null || user === void 0 ? void 0 : user._id), isActive: true, isBlock: false }, {
            password: hashPassword, authToken: otp
        });
        // console.log(newData, '///');
        return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.passwordChangeSuccess, {}, {}));
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.internalServerError, {}, {}));
    }
});
exports.change_password = change_password;
const google_SL = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { accessToken, idToken, deviceToken } = req.body;
    (0, helper_1.reqInfo)(req);
    try {
        if (accessToken && idToken) {
            let verificationAPI = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`, idAPI = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
            let access_token = yield axios_1.default.get(verificationAPI)
                .then((result) => {
                return result.data;
            }).catch((error) => {
                return false;
            });
            let id_token = yield axios_1.default.get(idAPI)
                .then((result) => {
                return result.data;
            }).catch((error) => {
                return false;
            });
            if (access_token.email == id_token.email && access_token.verified_email == true) {
                const isUser = yield database_1.userModel.findOneAndUpdate({ email: id_token === null || id_token === void 0 ? void 0 : id_token.email, isActive: true }, { $addToSet: { deviceToken: deviceToken } });
                if (!isUser) {
                    for (let flag = 0; flag < 1;) {
                        var authToken = Math.round(Math.random() * 1000000);
                        if (authToken.toString().length == 6) {
                            flag++;
                        }
                    }
                    let username = id_token.email.split('@')[0];
                    return new database_1.userModel({
                        email: id_token.email,
                        firstName: id_token.given_name,
                        lastName: id_token.famil_name,
                        image: id_token.picture,
                        loginType: common_1.loginType.google,
                        isEmailVerified: true,
                        deviceToken: [deviceToken],
                        username: username,
                        authToken,
                    }).save()
                        .then((response) => __awaiter(void 0, void 0, void 0, function* () {
                        const token = jsonwebtoken_1.default.sign({
                            _id: response._id,
                            authToken: response.authToken,
                            type: response.userType,
                            status: "Login",
                            generatedOn: (new Date().getTime())
                        }, process.env.JWT_TOKEN_SECRET);
                        let return_response = {
                            userType: response === null || response === void 0 ? void 0 : response.userType,
                            isEmailVerified: response === null || response === void 0 ? void 0 : response.isEmailVerified,
                            loginType: response === null || response === void 0 ? void 0 : response.loginType,
                            _id: response === null || response === void 0 ? void 0 : response._id,
                            firstName: response === null || response === void 0 ? void 0 : response.firstName,
                            lastName: response === null || response === void 0 ? void 0 : response.lastName,
                            email: response === null || response === void 0 ? void 0 : response.email,
                            image: id_token === null || id_token === void 0 ? void 0 : id_token.picture,
                            username: response === null || response === void 0 ? void 0 : response.username,
                            token,
                        };
                        return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.loginSuccess, return_response, {}));
                    }));
                }
                else {
                    if ((isUser === null || isUser === void 0 ? void 0 : isUser.isBlock) == true) {
                        return res.status(401).json(new common_1.apiResponse(401, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.accountBlock, {}, {}));
                    }
                    const token = jsonwebtoken_1.default.sign({
                        _id: isUser._id,
                        authToken: isUser.authToken,
                        type: isUser.userType,
                        status: "Login",
                        generatedOn: (new Date().getTime())
                    }, process.env.JWT_TOKEN_SECRET);
                    //isStore owner
                    let response = {
                        userType: isUser === null || isUser === void 0 ? void 0 : isUser.userType,
                        isEmailVerified: isUser === null || isUser === void 0 ? void 0 : isUser.isEmailVerified,
                        loginType: isUser === null || isUser === void 0 ? void 0 : isUser.loginType,
                        _id: isUser === null || isUser === void 0 ? void 0 : isUser._id,
                        firstName: isUser === null || isUser === void 0 ? void 0 : isUser.firstName,
                        lastName: isUser === null || isUser === void 0 ? void 0 : isUser.lastName,
                        email: isUser === null || isUser === void 0 ? void 0 : isUser.email,
                        isStoreOwner: isUser === null || isUser === void 0 ? void 0 : isUser.isStoreOwner,
                        image: isUser === null || isUser === void 0 ? void 0 : isUser.image,
                        username: isUser === null || isUser === void 0 ? void 0 : isUser.username,
                        token,
                    };
                    return res.status(200).json(new common_1.apiResponse(200, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.loginSuccess, response, {}));
                }
            }
            return res.status(401).json(new common_1.apiResponse(401, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.invalidIdTokenAndAccessToken, {}, {}));
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(new common_1.apiResponse(500, helper_1.responseMessage === null || helper_1.responseMessage === void 0 ? void 0 : helper_1.responseMessage.internalServerError, error, {}));
    }
});
exports.google_SL = google_SL;
// facebook and appele apiResponse
// get all user
const get_all_user = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const all_users = yield database_1.userModel.find().sort('createdat');
        const count = yield database_1.userModel.count(all_users);
        if (all_users) {
            return res.status(200).json(new common_1.apiResponse(200, 'get all user', { count: count, all_users }, {}));
        }
    }
    catch (error) {
    }
});
exports.get_all_user = get_all_user;
//# sourceMappingURL=authentication.js.map