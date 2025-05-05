const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  usdt: {
    type: Number,
    default: 0,
    min: 0,
  },
  content: { type: String },
  priceH: { type: Number, default: 0.06, min: 0 },
  priceC: { type: Number, default: 0.06, min: 0 },
  priceM: { type: Number, default: 0.06, min: 0 },
  percent: { type: Number, min: 0, max: 100, default: 100 },
  status: { type: Number, default: 1 },
  t_time: { type: Date, required: true, default: new Date() },
});

module.exports = mongoose.model("User", UserSchema);
