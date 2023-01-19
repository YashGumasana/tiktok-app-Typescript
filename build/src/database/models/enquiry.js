"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enquiryModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const enquirySchema = new mongoose_1.default.Schema({
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
    question: { type: String, default: null },
    answer: { type: String, default: null },
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId },
    jobId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'job' }
}, {
    timestamps: true
});
enquirySchema.index({ videoId: 1 });
exports.enquiryModel = mongoose_1.default.model('enquiry', enquirySchema);
//# sourceMappingURL=enquiry.js.map