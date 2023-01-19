"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const tagSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, index: true },
    videoIds: { type: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'video' }], default: [] },
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
    totalUsed: { type: Number, default: 0, min: 0 }
}, { timestamps: true });
tagSchema.index({ name: 1 });
tagSchema.index({ createdAt: -1 });
exports.tagModel = mongoose_1.default.model('tag', tagSchema);
//# sourceMappingURL=tag.js.map