"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const notificationSchema = new mongoose_1.default.Schema({
    title: { type: String, default: null },
    date: { type: Date, default: null },
    type: { type: Number, default: 0, enum: [0, 1, 2, 3, 4, 5, 6] },
    //0-like , 1-dislike,2-accepet_request,3-reject_request,4-follow_request,5-comment video,6-comment feed 
    mark: { type: Number, default: 0, enum: [0, 1] },
    // 0 - unread || 1 - read 
    videoId: { type: mongoose_1.default.Schema.Types.ObjectId, default: null, ref: 'video' },
    feedId: { type: mongoose_1.default.Schema.Types.ObjectId, default: null, ref: 'feed' },
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, default: null, ref: 'user' },
    followerId: { type: mongoose_1.default.Schema.Types.ObjectId, default: null, ref: 'user' },
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, default: null, ref: 'user' },
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
}, { timestamps: true });
exports.notificationModel = mongoose_1.default.model('notification', notificationSchema);
//# sourceMappingURL=notification.js.map