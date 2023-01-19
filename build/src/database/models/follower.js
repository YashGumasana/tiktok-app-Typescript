"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.followerModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const followerSchema = new mongoose_1.default.Schema({
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
    requestStatus: { type: Number, default: 0, enum: [0, 1, 2] },
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'user' },
    followerId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'user' },
}, { timestamps: true });
followerSchema.index({ followerId: 1, createdAt: -1 });
exports.followerModel = mongoose_1.default.model('follower', followerSchema);
//# sourceMappingURL=follower.js.map