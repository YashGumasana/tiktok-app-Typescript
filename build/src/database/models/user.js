"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    firstName: { type: String, default: null },
    lastName: { type: String, default: null },
    username: { type: String, default: null },
    bio: { type: String, default: null },
    email: { type: String, default: null },
    password: { type: String, default: null },
    description: { type: String, default: null },
    location: { type: String, default: null },
    DOB: { type: String, default: null },
    facebookId: { type: String, default: null },
    image: { type: String, default: null },
    gender: { type: Number, default: 0, enum: [0, 1, 2] },
    followers: { type: Number, default: 0, min: 0 },
    following: { type: Number, default: 0, min: 0 },
    promotes: { type: Number, default: 0, min: 0 },
    likedObs: { type: Number, default: 0, min: 0 },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    authToken: { type: Number, default: 0 },
    otp: { type: Number, default: 0 },
    totalRating: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    jobProvided: { type: Number, default: 0 },
    jobCompleted: { type: Number, default: 0 },
    otpExpireTime: { type: Date, default: null },
    deviceToken: { type: [{ type: String }], default: [] },
    loginType: { type: Number, default: 0, enum: [0, 1, 2, 3] },
    userType: { type: Number, default: 0, enum: [0, 1,] },
    accountType: { type: Number, default: 0, enum: [0, 1,] },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
    notification: {
        type: {
            all: { type: Boolean },
            video: { type: Boolean },
            follow: { type: Boolean },
            message: { type: Boolean },
        },
        default: {
            all: true,
            video: true,
            follow: true,
            message: true,
        }
    },
    //extra
    isStoreOwner: { type: Boolean, default: false },
}, { timestamps: true });
userSchema.index({ username: 1, userType: 1 });
exports.userModel = mongoose_1.default.model("user", userSchema);
// const userSchema = new mongoose.Schema({
//     firstName: { type: String, default: null },
//     lastName: { type: String, default: null },
//     username: { type: String, default: null },
//     bio: { type: String, default: null },
//     email: { type: String, default: null },
//     password: { type: String, default: null },
//     description: { type: String, default: null },
//     location: { type: String, default: null },
//     DOB: { type: String, default: null },
//     facebookId: { type: String, default: null },
//     image: { type: String, default: null },
//     gender: { type: Number, default: 0, enum: [0, 1, 2] }, // 0 - Female || 1 - Male || 2 - Other
//     followers: { type: Number, default: 0, min: 0 },
//     following: { type: Number, default: 0, min: 0 },
//     promotes: { type: Number, default: 0, min: 0 },
//     likedObs: { type: Number, default: 0, min: 0 },
//     latitude: { type: Number, default: 0 },
//     longitude: { type: Number, default: 0 },
//     authToken: { type: Number, default: 0 },
//     otp: { type: Number, default: 0 },
//     totalRating: { type: Number, default: 0 },
//     rating: { type: Number, default: 0 },
//     jobProvided: { type: Number, default: 0 },
//     jobCompleted: { type: Number, default: 0 },
//     otpExpireTime: { type: Date, default: null },
//     // deviceToken: { type: [{ type: String }], default: [] },
//     loginType: { type: Number, default: 0, enum: [0, 1, 2, 3] }, // 0 - custom || 1 - google || 2 - facebook
//     userType: { type: Number, default: 0, enum: [0, 1,] }, // 0 - user || 1 - owner
//     accountType: { type: Number, default: 0, enum: [0, 1,] }, // 0 - public || 1 - private
//     isEmailVerified: { type: Boolean, default: false },
//     isActive: { type: Boolean, default: true },
//     isBlock: { type: Boolean, default: false },
//     notification: {
//         type: {
//             all: { type: Boolean },
//             video: { type: Boolean },
//             follow: { type: Boolean },
//             message: { type: Boolean },
//         },
//         default: {
//             all: true,
//             video: true,
//             follow: true,
//             message: true,
//         }
//     }
// }, { timestamps: true })
// userSchema.index({ username: 1, userType: 1, })
// export const userModel =  mongoose.model<UserDocumnet>("user", userSchema)
// const mongoose = require('mongoose')
// export type notification = {
//     all: boolean;
//     video: boolean;
//     follow: boolean;
//     message: boolean;
// }
// export type UserDocumnet = Document & {
//     firstName: string;
//     lastName: string;
//     username: string;
//     bio: string;
//     email: string;
//     password: string;
//     description: string;
//     location: string;
//     DOB: string;
//     facebookId: string;
//     image: string;
//     gender: number;
//     followers: number;
//     following: number;
//     promotes: number;
//     likedObs: number;
//     latitude: number;
//     longitude: number;
//     authToken: number;
//     otp: number;
//     totalRating: number;
//     rating: number;
//     jobProvided: number;
//     jobCompleted: number;
//     otpExpireTime: Date;
//     // deviceToken: string;
//     loginType: number;
//     userType: number;
//     accountType: number;
//     isEmailVerified: boolean;
//     isActive: boolean;
//     isBlock: boolean;
//     notification: notification;
// };
//# sourceMappingURL=user.js.map