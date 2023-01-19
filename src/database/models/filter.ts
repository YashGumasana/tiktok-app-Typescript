import mongoose from "mongoose";

const filterSchema = new mongoose.Schema({
    isActive: { type: Boolean, default: true },
    isBlock: { type: Boolean, default: false },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    address: { type: String, default: null },
    radius: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
},
    {
        timestamps: true
    })

export const filterModel = mongoose.model('filter', filterSchema)