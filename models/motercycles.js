const mongoose = require("mongoose");

const motercycleSchema = new mongoose.Schema({
    serialno: Number,
    model: String,
    mileage: Number
});

const motercycle = mongoose.model('motercycleList',motercycleSchema);

module.exports = motercycle;