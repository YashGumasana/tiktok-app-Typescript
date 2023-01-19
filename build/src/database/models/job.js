"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const jobSchema = new mongoose_1.default.Schema({
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
    description: { type: String, default: null },
    title: { type: String, default: null },
    location: { type: String, default: null },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    type: { type: Number, default: 0, enum: [0, 1, 2,] },
    projectType: { type: Number, default: 0, enum: [0, 1, 2,] },
    status: { type: Number, default: 0, enum: [0, 1, 2,] },
    price: { type: Number, default: 0 },
    numberOfProposal: { type: Number, default: 0 },
    numberOfAcceptProposal: { type: Number, default: 0 },
    duartion: { type: String, default: null },
    completionTime: { type: String, default: null },
    skills: { type: [{ type: String }], default: [] },
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'user' }
}, { timestamps: true });
jobSchema.index({ createdBy: 1 });
exports.jobModel = mongoose_1.default.model('job', jobSchema);
//# sourceMappingURL=job.js.map