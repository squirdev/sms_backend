const express = require("express");
const router = express.Router();
const Payment = require("../../models/payment");

router.get("/deposit", async (req, res) => {
  try {
    const { date } = req.query;
    const filter = {};

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      filter.t_time = {
        $gte: start,
        $lte: end,
      };
    }

    const depositList = await Payment.find(filter)
      .populate("userId")
      .sort({ t_time: -1 });

    res.json(depositList);
  } catch (error) {
    console.log("ERROR while getting all payment logs", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
