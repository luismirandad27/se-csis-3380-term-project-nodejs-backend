const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
    title: String,
    comment: String,
    rating: Number ,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
});

const ProductSubtypeSchema = new mongoose.Schema({
    price: Number, 
    stock: Number, 
    image_url: String,
    weight: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WeightType"
    }
});

const ProductSchema =  new mongoose.Schema({
    name: String,
    prod_id: String,
    description: String,
    product_category: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductCategory"
    },
    countries_origin : [String],
    tags : [String],
    varietal: [String],
    sca_score: Number,
    reviews: [ReviewSchema],
    farm: String,
    producer: String,
    region: String,
    process: String,
    import_partner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ImportPartner"
    },
    product_subtypes: [ProductSubtypeSchema],
    grind_types: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "GrindType"
    }]
  });


const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;