const mongoose = require("mongoose");

const ImportPartnerSchema = new mongoose.Schema({
    name: String,
    contactInfo: {
        email: String,
        phone: String
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String
    }
});

const ImportPartner = mongoose.model("ImportPartner", ImportPartnerSchema);

module.exports = ImportPartner;