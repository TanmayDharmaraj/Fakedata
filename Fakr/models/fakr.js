var mongoose = require('mongoose');

//0Schema
var fakrSchema = new mongoose.Schema( {
    unique_id: String,
    timestamp: { type: Date, default: Date.now },
    data: []
});

module.exports = mongoose.model('Fakrs', fakrSchema);