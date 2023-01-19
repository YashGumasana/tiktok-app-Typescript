"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const commentSchema = new mongoose_1.default.Schema({
    isActive: { type: Boolean, default: true },
    videoId: { type: mongoose_1.default.Schema.Types.ObjectId, default: null },
    feedId: { type: mongoose_1.default.Schema.Types.ObjectId, default: null },
    likedBy: { type: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "userModel" }] },
    type: { type: Number, default: 0, enum: [0, 1] },
    totalLikes: { type: Number, default: 0, min: 0 },
    message: { type: String, default: null },
    replayBy: { type: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "commentModel" }] },
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "userModel" },
}, { timestamps: true });
commentSchema.index({ type: 1, createdAt: -1 });
exports.commentModel = mongoose_1.default.model('comment', commentSchema);
//# sourceMappingURL=comment.js.map