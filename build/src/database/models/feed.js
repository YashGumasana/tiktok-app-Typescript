"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.feedModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const feedSchema = new mongoose_1.default.Schema({
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
    description: { type: String, default: null },
    image: { type: String, default: null },
    video: { type: String, default: null },
    thumbnail: { type: String, default: null },
    suburb: { type: String, default: null },
    state: { type: String, default: null },
    city: { type: String, default: null },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    country: { type: String, default: null },
    likedBy: { type: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "userModel" }] },
    totalLike: { type: Number, default: 0 },
    totalComment: { type: Number, default: 0 },
    totalShare: { type: Number, default: 0 },
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId }
}, { timestamps: true });
feedSchema.index({ followerId: 1, createdAt: -1 });
exports.feedModel = mongoose_1.default.model('feed', feedSchema);
//# sourceMappingURL=feed.js.map