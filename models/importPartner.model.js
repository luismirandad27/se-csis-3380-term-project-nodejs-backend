const mongoose = require("mongoose");

const ImportPartnerSchema = new mongoose.Schema({
    name: String,
});

const ImportPartner = mongoose.model("ImportPartner", ImportPartnerSchema);

module.exports = ImportPartner;