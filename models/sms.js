const mongoose = require("mongoose");

const SmsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  input_phone: [String],
  output_phone: [String],
  show_phone: [String],
  content: { type: String, default: "" },
  sender: { type: String, default: "" },
  percent: { type: Number, min: 0, max: 100 },
  show_percent: { type: Number, min: 0, max: 100 },
  price: { type: Number, min: 0 },
  t_time: { type: Date, required: true, default: new Date() },
  msgId: String,
  count: Number,
});

module.exports = mongoose.model("Sms", SmsSchema);
