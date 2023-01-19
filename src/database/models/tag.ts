import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    videoIds: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'video' }], default: [] },
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
    totalUsed: { type: Number, default: 0, min: 0 }
}, { timestamps: true })

tagSchema.index({ name: 1 })
tagSchema.index({ createdAt: -1 })
export const tagModel = mongoose.model('tag', tagSchema)