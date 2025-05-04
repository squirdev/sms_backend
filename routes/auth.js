const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/user");

// Login route
router.post("/", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "参数不正确。" });
  }
  try {
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user || !user.status) {
      return res
        .status(400)
        .json({ success: false, message: "用户名或密码不正确。" });
    }

    if (user.password != password) {
      return res
        .status(400)
        .json({ success: false, message: "用户名或密码不正确。" });
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({
      success: true,
      token: token,
      user: { username: user.username, usdt: user.usdt, price: user.price },
      message: "用户登录成功。",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "服务器错误。" });
  }
});

module.exports = router;
