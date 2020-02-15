const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
    serialno: Number,
    model: String,
    passengerCapacity: Number
});

const cars = mongoose.model('carsList',carSchema);

module.exports = cars;