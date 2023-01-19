import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { type: String, default: null },
    totalUsed: { type: Number, default: 0, min: 0 },
    type: { type: Number, default: 0, enum: [0, 1] },//0=video
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
}, { timestamps: true })

categorySchema.index({ type: 1, isActive: 1 })

export const categoryModel = mongoose.model('category', categorySchema)