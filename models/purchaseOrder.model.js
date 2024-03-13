const mongoose = require("mongoose");

const PurchaseOrderItemSchema = new mongoose.Schema({
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
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 1
    }
});

const PurchaseOrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [PurchaseOrderItemSchema],
    orderStatus: {
        type: String,
        enum: ['pending', 'paid', 'shipped', 'delivered'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.no
    }
});

const PurchaseOrder = mongoose.model("PurchaseOrder", PurchaseOrderSchema);

module.exports = PurchaseOrder;
