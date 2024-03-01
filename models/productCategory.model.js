const mongoose = require("mongoose");

const ProductCategorySchema = new mongoose.Schema({
    name: String,
    description: String
});

const ProductCategory = mongoose.model("ProductCategory", ProductCategorySchema);

module.exports = ProductCategory;