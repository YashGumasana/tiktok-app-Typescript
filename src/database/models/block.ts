import mongoose from "mongoose";

const blockSchema = new mongoose.Schema({
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
    requestStatus: { type: Number, default: 1, enum: [0, 1] }, // 0 = Unblock || 1 = Block 
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    blockId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
}, { timestamps: true })

blockSchema.index({ blockId: 1, createdAt: -1 })

export const blockModel = mongoose.model('block', blockSchema)