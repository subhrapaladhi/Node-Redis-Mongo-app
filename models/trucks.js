const mongoose = require("mongoose");

const truckSchema = new mongoose.Schema({
    serialno: Number,
    model: String,
    loadCapacity: Number
});

const trucks = mongoose.model('trucksList',truckSchema);

module.exports = trucks;