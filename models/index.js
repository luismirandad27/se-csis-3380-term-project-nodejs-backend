const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.role = require("./role.model");
db.grindType = require("./grindType.model")
db.importPartner = require("./importPartner.model");
db.inquiry = require("./inquiry.model");
db.productCategory = require("./productCategory.model");
db.product = require("./product.model");
db.weightType = require("./weightType.model");

db.ROLES = ["user", "admin", "moderator"];

module.exports = db;