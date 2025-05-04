const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: {
    type: Number,
    required: true,
  },
  t_time: {
    type: Date,
    required: true,
    default: new Date(),
  },
});

module.exports = mongoose.model("Payment", PaymentSchema);
