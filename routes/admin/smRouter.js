const express = require("express");
const router = express.Router();
const SMS = require("../../models/sms");
const { getBalance0 } = require("../smsUtil0");

router.get("/", async (req, res) => {
  try {
    let filter = {};
    filter.sender = "Telegram";

    const smsList = await SMS.find(filter);

    const phoneSet = new Set();

    // Loop through the records
    smsList.forEach((record) => {
      record.input_phone.forEach((phone) => phoneSet.add(phone));
    });

    // Convert to array if needed
    const uniquePhones = [...phoneSet];

    res.json(uniquePhones);
  } catch (error) {
    console.log("ERROR while getting all sms logs", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
