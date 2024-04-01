const mongoose = require("mongoose");
const AutoIncrement = require("./autoIncrement.model");

const TrackingLogSchema = new mongoose.Schema({
    status: String,
    log_date: Date,
    description: String
})

const OrderDetailSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    product_subtype: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product.product_subtype", // Reference to the Product Subtype
        required: true
    },
    grind_type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GrindType", // Reference to the Grind Type
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    unit_price: {
        type: Number,
        required: true,
        min: 1
    },
    product_rated: {
        type: Boolean,
        required: true,
        default: false
    },
    review_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product.product_subtype.reviews"
    }
})

const PurchaseOrderSchema = new mongoose.Schema({
    items: [OrderDetailSchema],
    order_number: Number,
    order_status: {
        type: String,
        enum: ['pending', 'paid', 'shipped', 'delivered'],
        default: 'pending'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    stripe_session_id: {
        type: String
    },
    total_taxes: Number,
    total_purchase: Number
})

PurchaseOrderSchema.pre('save', async function (next) {
    try {
      const doc = this;
      
      const counter = await AutoIncrement.findByIdAndUpdate(
        { _id: 'order_number' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true, useFindAndModify: false }
      );
  
      if (!counter) {
        throw new Error('Unable to fetch and update order number.');
      }
  
      doc.order_number = counter.sequence_value;
      next();
    } catch (error) {
      next(error);
    }
  });
  

const ShoppingCartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Reference to the Product
        required: true
    },
    product_subtype: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product.product_subtype", // Reference to the Product Subtype
        required: true
    },
    grind_type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GrindType", // Reference to the Grind Type
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    unit_price: {
        type: Number,
        required: true,
        min: 1
    }
});

const ShoppingCartSchema = new mongoose.Schema({
    items: [ShoppingCartItemSchema],
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    stripe_session_id: {
        type: String
    }
});

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    required_change_password: Boolean,
    address: String,
    phone: String,
    roles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
    }],
    company: String,
    shopping_cart: ShoppingCartSchema,
    purchase_orders: [PurchaseOrderSchema],
    logo_image_url: String,
    created_at: Date,
    deletedAt: {
        type: Date,
        default: null
    }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;