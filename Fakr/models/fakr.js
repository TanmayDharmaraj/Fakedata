﻿var mongoose = require('mongoose');

//Schema
var fakrSchema = new mongoose.Schema({
    unique_id: { type: String, unique: true },
    timestamp: { type: Date, default: Date.now },
    data: [],
    type_details: []
});

module.exports = mongoose.model('Fakrs', fakrSchema);