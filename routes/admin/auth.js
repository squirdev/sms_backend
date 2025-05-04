const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const bcrypt = require("bcrypt");
const Admin = require("../../models/admin");

// Login route
router.post("/", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "参数不正确。" });
  }
  try {
    // Check if user exists
    const user = await Admin.findOne({ username });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "用户名或密码不正确。" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
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
      user: user,
      message: "用户登录成功。",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "服务器错误。" });
  }
});

module.exports = router;
