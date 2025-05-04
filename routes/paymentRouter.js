const express = require("express");
const router = express.Router();
const Payment = require("../models/payment");
const User = require("../models/user");
router.get("/", async (req, res) => {
  const { user } = req;
  try {
    const depositList = await Payment.find({ userId: user._id });
    res.json(depositList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/user", async (req, res) => {
  const { user } = req;
  res.json({ username: user.username, usdt: user.usdt, price: user.price });
});
router.put("/user", async (req, res) => {
  const { user } = req;
  const { username, password } = req.body;
  try {
    const newUser = {
      username: username,
      password: password,
    };
    await User.findByIdAndUpdate(user._id, newUser, {
      new: true,
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
