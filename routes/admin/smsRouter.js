const express = require("express");
const router = express.Router();
const SMS = require("../../models/sms");
const { getBalance0 } = require("../smsUtil0");

router.get("/getBalance", async (_, res) => {
  try {
    const balance0 = await getBalance0();
    res.json(balance0);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching the balance" });
  }
});

router.get("/", async (req, res) => {
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

    const smsList = await SMS.find(filter)
      .populate("userId")
      .sort({ t_time: -1 });
    res.json(smsList);
  } catch (error) {
    console.log("ERROR while getting all sms logs", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
