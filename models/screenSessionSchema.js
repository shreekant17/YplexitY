// models/ScreenSession.js
const mongoose = require('mongoose');

const screenSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: String, required: true, index: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date }, // may be set later
    seconds: { type: Number, default: 0 }, // total active seconds for this session
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.ScreenSession || mongoose.model('ScreenSession', screenSessionSchema);
