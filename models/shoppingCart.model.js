const mongoose = require("mongoose");

const ShoppingCartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    productSubtype: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product.product_subtype", // Reference to the Product Subtype
        required: true
    },
    grindType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GrindType", // Reference to the Grind Type
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
});

const ShoppingCartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [ShoppingCartItemSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const ShoppingCart = mongoose.model("ShoppingCart", ShoppingCartSchema);

module.exports = ShoppingCart;
