import mongoose, { mongo } from "mongoose";

const feedSchema = new mongoose.Schema({
    isActive: { type: Boolean, default: true },

    isBlock: { type: Boolean, default: false },

    description: { type: String, default: null },

    image: { type: String, default: null },

    video: { type: String, default: null },

    thumbnail: { type: String, default: null },

    suburb: { type: String, default: null },

    state: { type: String, default: null },

    city: { type: String, default: null },

    latitude: { type: Number, default: 0 },

    longitude: { type: Number, default: 0 },

    country: { type: String, default: null },

    likedBy: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "userModel" }] },

    totalLike: { type: Number, default: 0 },

    totalComment: { type: Number, default: 0 },

    totalShare: { type: Number, default: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId }
},
    { timestamps: true })

feedSchema.index({ followerId: 1, createdAt: -1 })

export const feedModel = mongoose.model('feed', feedSchema)