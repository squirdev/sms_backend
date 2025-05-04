const express = require("express");
const { getBalance } = require("../smsUtil");
const router = express.Router();
const SMS = require("../../models/sms");
router.get("/getBalance", async (req, res) => {
  try {
    const balance = await getBalance();
    res.json(balance); // Send the balance as the response
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the balance" });
  }
});
router.get("/", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};

    if (startDate && endDate) {
      filter.t_time = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    const smsList = await SMS.find(filter).populate("userId").sort({ t_time: -1 });
    res.json(smsList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
