/**
 * index.js
 * Index file that compiles all javascripts files in the /models folder
 *
 *
 * @version 1.0
 * @author  Andrea Olivares - Valentina Alvarez - Luis Miguel Miranda
 * @updated 2024-02-02
 *
*/

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

db.ROLES = ["user", "admin"];

module.exports = db;