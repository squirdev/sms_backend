const mongoose = require("mongoose");

const SmsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  input_phone: [String],
  content: { type: String, default: "" },
  sender: { type: String, default: "" },
  percent: { type: Number, min: 0, max: 100 }, // success percent
  network: { type: Number, default: 0 }, // user select network
  userPerPrice: { type: Number, min: 0 }, // user consume cost
  sysPerPrice: { type: Number, min: 0 }, // service consume cost
  t_time: { type: Date, required: true, default: new Date() },
  msgId: { type: String },
  totalCount: { type: Number }, // user submit count
  sendCount: { type: Number }, // real sent count
});

module.exports = mongoose.model("Sms", SmsSchema);
