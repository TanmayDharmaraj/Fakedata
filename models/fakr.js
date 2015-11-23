var mongoose = require('mongoose');

//Schema
var fakrSchema = new mongoose.Schema({
    name: { type: String },
    timestamp: { type: Date, default: Date.now },
    data: [],
    type_details: []
});

module.exports = mongoose.model('Fakrs', fakrSchema);