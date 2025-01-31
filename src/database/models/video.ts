import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    description: { type: String, required: false },
    url: { type: String, required: true },
    suburb: { type: String, default: null },
    state: { type: String, default: null },
    city: { type: String, default: null },
    thumbnail: { type: String, default: null },
    country: { type: String, default: null },
    totalView: { type: Number, default: 0 },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    listViewUser: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }], default: [] },
    setting: {
        type: {
            comment: { type: Boolean },
            duet: { type: Boolean },
            stich: { type: Boolean }
        },
        default: {
            comment: true,
            duet: true,
            stich: true
        },
    },
    totalLike: { type: Number, default: 0 },
    totalComment: { type: Number, default: 0 },
    totalShare: { type: Number, default: 0 },
    totalDislike: { type: Number, default: 0 },
    popularityIndex: { Number, default: 0 },
    tag: { type: [{ type: String }], default: [] },
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'category' },
}, { timestamps: true })

videoSchema.index({ tag: 1 })
videoSchema.index({ createdBy: 1 })
videoSchema.index({ popularityIndex: -1 })
videoSchema.index({ createdAt: -1 })

export const videoModel = mongoose.model('video', videoSchema)