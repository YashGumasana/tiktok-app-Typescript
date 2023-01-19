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
exports.forgot_password_mail = exports.email_verification_mail = void 0;
const config_1 = __importDefault(require("config"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const mail = config_1.default.get('nodeMail');
const option = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    tls: {
        rejectUnauthorized: false
    },
    auth: {
        user: mail.mail,
        pass: mail.password,
    },
};
const transPorter = nodemailer_1.default.createTransport(option);
const email_verification_mail = (mail_data) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // console.log(mail, '::');
            // console.log(mail_data, '...');
            const mailOptions = {
                from: `Zois <${mail.mail}>`,
                to: mail_data === null || mail_data === void 0 ? void 0 : mail_data.email,
                subject: "Zois Sign up OTP",
                html: `<html lang="en-US">
                <head>
                    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
                    <title>Zois Sign up OTP</title>
                    <meta name="description" content="Zois Sign up OTP.">
                    <style type="text/css">
                        a:hover {
                            text-decoration: underline !important;
                        }
                    </style>
                </head>
                
                <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
                    <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
                        style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                        <tr>
                            <td>
                                <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                                    align="center" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="height:80px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td style="text-align:center;">
                
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                                style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                                <tr>
                                                    <td style="height:40px;">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding:0 35px;">
                                                        <a href="https://legacyfolderapp.com/" title="logo" target="_blank">
                                                            <img src="https://zois-api.s3.us-west-2.amazonaws.com/zois_logo.png"
                                                                height="130px" widht="400px" title="logo" alt="logo">
                                                        </a>
                                                        <h1
                                                            style="color:#1e1e2d; font-weight:500; margin:0; padding-top: 20px;font-size:32px;font-family:'Rubik',sans-serif;">
                                                            Zois OTP verification</h1>
                                                        <span
                                                            style="display:inline-block; vertical-align:middle; margin:6px 0 26px; border-bottom:1px solid #cecece; width:300px;"></span>
                                                        <p
                                                            style="color:#455056; font-size:15px;line-height:24px;text-align:left; margin:0;">
                                                            Hi ${mail_data.username || ""},
                                                            <br><br>
                                                            Your Verification code For Zois App Sign up is ${mail_data.otp}. Please do
                                                            not share it anyone.
                                                            <br><br>
                                                            Thanks & Regards<br>
                                                            Team Zois
                                                        </p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="height:40px;">&nbsp;</td>
                                                </tr>
                                            </table>
                                        </td>
                                    <tr>
                                        <td style="height:20px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td style="height:80px;">&nbsp;</td>
                                    </tr>
                        </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                </body>
                
                </html>`,
            };
            // console.log('././.');
            transPorter.sendMail(mailOptions, function (err, data) {
                if (err) {
                    console.log('mail error');
                    console.log(err);
                    reject(err);
                }
                else {
                    resolve(`Email has been sent to ${mail_data === null || mail_data === void 0 ? void 0 : mail_data.email}, kindly follow the instruction`);
                }
            });
        }
        catch (error) {
            console.log(error);
            reject(error);
        }
    }));
});
exports.email_verification_mail = email_verification_mail;
const forgot_password_mail = (mail_data) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const mailOptions = {
                from: `Zois <${mail.mail}>`,
                to: mail_data === null || mail_data === void 0 ? void 0 : mail_data.email,
                subject: "Zois Forget Password OTP",
                html: `<html lang="en-US"

                <head>
                    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
                    <title>Zois Forget Password OTP</title>
                    <meta name="description" content="Zois Forget Password OTP.">
                    <style type="text/css">
                        a:hover {
                            text-decoration: underline !important;
                        }
                    </style>
                </head>
                
                <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
                    <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
                        style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                        <tr>
                            <td>
                                <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                                    align="center" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="height:80px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td style="height:20px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                                style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                                <tr>
                                                    <td style="height:40px;">&nbsp;</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding:0 35px;">
                                                        <a href="https://legacyfolderapp.com/" title="logo" target="_blank">
                                                            <img src="https://zois-api.s3.us-west-2.amazonaws.com/zois_logo.png"
                                                                height="130px" widht="400px" title="logo" alt="logo">
                                                        </a>
                                                        <h1
                                                            style="color:#1e1e2d; font-weight:500; margin:0; padding-top: 20px;font-size:32px;font-family:'Rubik',sans-serif;">
                                                            Zois Forget Password OTP</h1>
                                                        <span
                                                            style="display:inline-block; vertical-align:middle; margin:6px 0 26px; border-bottom:1px solid #cecece; width:380px;"></span>
                                                        <p
                                                            style="color:#455056; font-size:15px;line-height:24px; margin:0; text-align:left;">
                                                            Hi ${mail_data.username || ""}
                                                            <br><br>
                                                            Your Verification code to recover your Zois Account Password is
                                                            ${mail_data.otp}. Please do not share it anyone.
                                                            <br><br>
                                                            Thanks & Regards <br>
                                                            Team Zois
                                                        </p>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="height:40px;">&nbsp;</td>
                                                </tr>
                                            </table>
                                        </td>
                                    <tr>
                                        <td style="height:20px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td style="height:80px;">&nbsp;</td>
                                    </tr>
                        </tr>
                    </table>
                    </td>
                    </tr>
                    </table>
                </body>
                
                </html>`,
            };
            transPorter.sendMail(mailOptions, function (err, data) {
                if (err) {
                    console.log('++');
                    console.log(err);
                    reject(err);
                }
                else {
                    resolve(`Email has been sent to ${mail_data === null || mail_data === void 0 ? void 0 : mail_data.email},kindly follow the instruction`);
                }
            });
        }
        catch (error) {
            console.log('--');
            console.log(error);
            reject(error);
        }
    }));
});
exports.forgot_password_mail = forgot_password_mail;
//# sourceMappingURL=nodemailer.js.map