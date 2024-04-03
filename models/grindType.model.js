const mongoose = require("mongoose");

const GrindTypeSchema = new mongoose.Schema({
    name: String,
});

const GrindType = mongoose.model("GrindType", GrindTypeSchema);

module.exports = GrindType;