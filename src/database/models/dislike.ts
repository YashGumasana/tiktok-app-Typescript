import mongoose from "mongoose";

const dislikeSchema = new mongoose.Schema({
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'video' }
}, { timestamps: true })

dislikeSchema.index({ videoId: 1 })
export const dislikeModel = mongoose.model('dislike', dislikeSchema)