"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dislikeModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dislikeSchema = new mongoose_1.default.Schema({
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId },
    videoId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'video' }
}, { timestamps: true });
dislikeSchema.index({ videoId: 1 });
exports.dislikeModel = mongoose_1.default.model('dislike', dislikeSchema);
//# sourceMappingURL=dislike.js.map