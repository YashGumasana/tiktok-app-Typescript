"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.likeModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const likeSchema = new mongoose_1.default.Schema({
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
    type: { type: Number, default: 0, enum: [0, 1] },
    // 0 = video , 1 = feed
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId },
    videoId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'video' }
}, { timestamps: true });
likeSchema.index({ videoId: 1 });
exports.likeModel = mongoose_1.default.model('like', likeSchema);
//# sourceMappingURL=like.js.map