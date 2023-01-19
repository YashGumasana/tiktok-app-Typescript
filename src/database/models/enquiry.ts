import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema({
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
    question: { type: String, default: null },
    answer: { type: String, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'job' }
},
    {
        timestamps: true
    })

enquirySchema.index({ videoId: 1 })
export const enquiryModel = mongoose.model('enquiry', enquirySchema)