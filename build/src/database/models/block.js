"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const blockSchema = new mongoose_1.default.Schema({
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
    requestStatus: { type: Number, default: 1, enum: [0, 1] },
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'user' },
    blockId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'user' },
}, { timestamps: true });
blockSchema.index({ blockId: 1, createdAt: -1 });
exports.blockModel = mongoose_1.default.model('block', blockSchema);
//# sourceMappingURL=block.js.map