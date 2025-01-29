const mongoose = require('mongoose');

const makeupHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    query: { type: String, required: true },
    results: { type: Array, required: true },
    createdAt: { type: Date, default: Date.now }
});

const MakeupHistory = mongoose.model('MakeupHistory', makeupHistorySchema);

module.exports = MakeupHistory;
