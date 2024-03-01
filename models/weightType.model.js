const mongoose = require("mongoose");

const WeightTypeSchema = new mongoose.Schema({
    name: String,
});

const WeightType = mongoose.model("WeightType", WeightTypeSchema);

module.exports = WeightType;