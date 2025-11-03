// models/UserScreenTime.js
const mongoose = require('mongoose');

const dailySchema = new mongoose.Schema({
    date: { type: String, required: true }, // "YYYY-MM-DD"
    seconds: { type: Number, default: 0 }
}, { _id: false });

const userScreenTimeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    totalSeconds: { type: Number, default: 0 },
    daily: [dailySchema], // per-day totals
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.UserScreenTime || mongoose.model('UserScreenTime', userScreenTimeSchema);
