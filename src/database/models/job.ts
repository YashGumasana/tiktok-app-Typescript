import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
    description: { type: String, default: null },
    title: { type: String, default: null },
    location: { type: String, default: null },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    type: { type: Number, default: 0, enum: [0, 1, 2,] }, // 0 = Bid || 1=Applicant
    projectType: { type: Number, default: 0, enum: [0, 1, 2,] },// 0 = Full Time || 1 = Running Project
    status: { type: Number, default: 0, enum: [0, 1, 2,] }, // 0 = Pending || 1 = Running || 2 = Complete ||
    price: { type: Number, default: 0 },
    numberOfProposal: { type: Number, default: 0 },
    numberOfAcceptProposal: { type: Number, default: 0 },
    duartion: { type: String, default: null },
    completionTime: { type: String, default: null },
    skills: { type: [{ type: String }], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
}, { timestamps: true })

jobSchema.index({ createdBy: 1 })
export const jobModel = mongoose.model('job', jobSchema)