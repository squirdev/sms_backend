const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const Payment = require("../../models/payment");
const Admin = require("../../models/admin");
const Sms = require("../../models/sms");
// Create a new user
router.post("/", async (req, res) => {
  const { username, password, content, price, percent } = req.body;
  if (!username || !password || !price || !percent) {
    return res
      .status(400)
      .json({ success: false, message: "Parameter not correct" });
  }
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }
    const newUser = new User({
      username: username,
      password: password,
      usdt: 0,
      content: content,
      price: price,
      percent: percent,
      status: 1,
      t_time: new Date(),
    });
    const response = await newUser.save();
    res.status(200).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get("/", async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query; // Default values

    page = parseInt(page);
    limit = parseInt(limit);

    const query = search
      ? {
          $or: [
            { username: { $regex: search, $options: "i" } },
            { content: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const total = await User.countDocuments(query); // Get total count with search filter
    const users = await User.find(query)
      .sort({ status: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/all", async (req, res) => {
  try {
    // Retrieve all users without pagination
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get a single user by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a user by ID
router.put("/:id", async (req, res) => {
  const { username, password, content, price, percent, status } = req.body;
  try {
    const newUser = {
      username: username,
      password: password,
      content: content,
      price: price,
      percent: percent,
      status: status,
    };
    const updatedUser = await User.findByIdAndUpdate(req.params.id, newUser, {
      new: true,
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.put("/", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Parameter not correct" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({
      username: username,
      password: hashedPassword,
    });
    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      newAdmin,
      { new: true }
    );
    res.json(updatedAdmin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.put("/deposit/:id", async (req, res) => {
  const { usdt } = req.body;
  try {
    const newPayment = new Payment({
      userId: req.params.id,
      amount: parseFloat(usdt),
      t_time: new Date(),
    });
    await newPayment.save();
    await User.updateOne(
      { _id: req.params.id },
      { $inc: { usdt: Math.round(usdt * 100) / 100 } }
    );
    res.json(newPayment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/deposit/:id", async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.params.id }).sort({
      t_time: -1,
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/sms/:id", async (req, res) => {
  try {
    const smsList = await Sms.find({ userId: req.params.id }).sort({
      t_time: -1,
    });
    res.json(smsList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
