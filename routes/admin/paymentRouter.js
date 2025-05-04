const express = require("express");
const router = express.Router();
const Payment = require("../../models/payment");

router.get("/deposit", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};

    if (startDate && endDate) {
      filter.t_time = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const depositList = await Payment.find(filter).populate("userId");

    res.json(depositList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
