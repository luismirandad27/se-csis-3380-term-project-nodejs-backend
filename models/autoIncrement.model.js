const mongoose = require("mongoose");

const AutoIncrementSchema = new mongoose.Schema({
    _id: String,
    sequence_value: {
      type: Number,
      default: 0,
    },
  });
  
const AutoIncrement = mongoose.model('AutoIncrement', AutoIncrementSchema);
  
module.exports = AutoIncrement;