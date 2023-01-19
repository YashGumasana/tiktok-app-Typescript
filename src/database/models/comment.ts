import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
    isActive: { type: Boolean, default: true },
    videoId: { type: mongoose.Schema.Types.ObjectId, default: null },
    feedId: { type: mongoose.Schema.Types.ObjectId, default: null },
    likedBy: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "userModel" }] },
    type: { type: Number, default: 0, enum: [0, 1] },
    totalLikes: { type: Number, default: 0, min: 0 },
    message: { type: String, default: null },
    replayBy: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "commentModel" }] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "userModel" },
}, { timestamps: true })

commentSchema.index({ type: 1, createdAt: -1 })

export const commentModel = mongoose.model('comment', commentSchema)