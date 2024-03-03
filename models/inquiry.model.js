const mongoose = require("mongoose");

const InquirySchema = new mongoose.Schema({
    title: String,
    body: String,
    inquiry_date: Date,
    email: String,
    phone: String
});

const Inquiry = mongoose.model("Inquiry", InquirySchema);

module.exports = Inquiry;