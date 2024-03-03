const mongoose = require("mongoose");

const TrackingLogSchema = new mongoose.Schema({
  status: String,
  log_date: Date,
  description: String
})

const PaymentSchema = new mongoose.Schema({
  quantity: Number,
  price: Number
})

const OrderDetailSchema = new mongoose.Schema({
  payment_date: Date,
  payment_intent_id: Number,
  amount: Number
})


const PurchaseOrderSchema = new mongoose.Schema({
  order_date: Date,
  total_amount: Number,
  order_details:[OrderDetailSchema],
  payment: PaymentSchema,
  trackingLog: [TrackingLogSchema]
})

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  address: String,
  phone: String,
  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role"
    }
  ],
  company: String,
  purchaseOrders: [PurchaseOrderSchema]
});

const User = mongoose.model("User", UserSchema);

module.exports = User;