"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const categorySchema = new mongoose_1.default.Schema({
    name: { type: String, default: null },
    totalUsed: { type: Number, default: 0, min: 0 },
    type: { type: Number, default: 0, enum: [0, 1] },
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'user', default: null },
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
}, { timestamps: true });
categorySchema.index({ type: 1, isActive: 1 });
exports.categoryModel = mongoose_1.default.model('category', categorySchema);
//# sourceMappingURL=category.js.map