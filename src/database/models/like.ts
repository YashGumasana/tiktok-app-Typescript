import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
    type: { type: Number, default: 0, enum: [0, 1] },
    // 0 = video , 1 = feed
    createdBy: { type: mongoose.Schema.Types.ObjectId },
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'video' }
},
    { timestamps: true })

likeSchema.index({ videoId: 1 })
export const likeModel = mongoose.model('like', likeSchema)