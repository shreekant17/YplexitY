// models/AppOpenEvent.js
import mongoose from "mongoose";

const AppOpenEventSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: { type: String, required: true }, // client-generated session uuid
    timestamp: { type: Date, default: Date.now },
    platform: { type: String },   // e.g. "web", "android", "iOS"
    userAgent: { type: String },
    ip: { type: String }, // optional; be careful with privacy
});

export default mongoose.models.AppOpenEvent ||
    mongoose.model("AppOpenEvent", AppOpenEventSchema);
