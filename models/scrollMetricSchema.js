import mongoose from "mongoose";

const scrollMetricSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    speed: { type: Number, required: true }, // pixels/sec
    timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.ScrollMetric ||
    mongoose.model("ScrollMetric", scrollMetricSchema);
