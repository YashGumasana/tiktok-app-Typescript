import mongoose from "mongoose";

const notificationSchema: any = new mongoose.Schema({
    title: { type: String, default: null },
    date: { type: Date, default: null },
    type: { type: Number, default: 0, enum: [0, 1, 2, 3, 4, 5, 6] },
    //0-like , 1-dislike,2-accepet_request,3-reject_request,4-follow_request,5-comment video,6-comment feed 
    mark: { type: Number, default: 0, enum: [0, 1] },
    // 0 - unread || 1 - read 
    videoId: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'video' },
    feedId: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'feed' },
    userId: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    followerId: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'user' },

    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
}, { timestamps: true })

export const notificationModel = mongoose.model('notification', notificationSchema)