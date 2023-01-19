"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const filterSchema = new mongoose_1.default.Schema({
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    address: { type: String, default: null },
    radius: { type: Number, default: 0 },
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'user' }
}, {
    timestamps: true
});
exports.filterModel = mongoose_1.default.model('filter', filterSchema);
//# sourceMappingURL=filter.js.map