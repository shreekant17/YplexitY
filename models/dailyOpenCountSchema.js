// models/DailyOpenCount.js
import mongoose from "mongoose";

const DailyOpenCountSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // ISO date like "2025-11-02" (YYYY-MM-DD)
    opens: { type: Number, default: 0 },
}, { timestamps: true });

DailyOpenCountSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.DailyOpenCount ||
    mongoose.model("DailyOpenCount", DailyOpenCountSchema);
