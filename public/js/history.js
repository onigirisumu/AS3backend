const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, 
    query: { type: String, required: true }, 
    results: { type: Array, required: true }, 
    createdAt: { type: Date, default: Date.now } 
});

const History = mongoose.model('History', historySchema);

module.exports = History;
