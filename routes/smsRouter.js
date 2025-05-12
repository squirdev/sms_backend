const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Sms = require("../models/sms");
const { sendMessage0 } = require("./smsUtil0");
const { sendMessage1 } = require("./smsUtil1");
const { sendMessage2 } = require("./smsUtil2");
const { sendMessage3 } = require("./smsUtil3");
const { sendMessage4 } = require("./smsUtil4");
const { sendMessage0w } = require("./smsUtil0w");

function getRandomSelection(array, percent) {
  const count = Math.ceil((percent / 100) * array.length);
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

router.post("/", async (req, res) => {
  const { sender, phoneList, smsContent, network } = req.body;
  const { user } = req;
  if (!phoneList || !smsContent || !sender) {
    res.status(400).json({ success: false, message: "请正确输入所有数据。" });
    return;
  }

  if (phoneList.length > user.usdt / user.price) {
    res.status(400).json({ success: false, message: "您的余额不足。" });
    return;
  }

  try {
    let pricePerSMS;
    if (detectCountry(phoneList[0]) == 0)
      pricePerSMS = user.priceH; // Hong Kong
    else if (detectCountry(phoneList[0]) == 1)
      pricePerSMS = user.priceM; // Macau
    else if (detectCountry(phoneList[0]) == 2)
      pricePerSMS = user.priceC; // China
    else if (detectCountry(phoneList[0]) == 3) pricePerSMS = 0.048; // Japan
    else
      return res
        .status(400)
        .json({ success: false, message: "请选择正确的电话号码" });

    const success_percent = phoneList.length > 50 ? user.percent : 100;
    const real_phone_list = getRandomSelection(phoneList, success_percent);

    let response, sysPerPrice;

    if (network == 0) {
      response = await sendMessage0(sender, real_phone_list, smsContent);
      sysPerPrice = 0.057;
    } else if (network == 1) {
      response = await sendMessage1(sender, real_phone_list, smsContent);
      if (detectCountry(phoneList[0]) == 1) sysPerPrice = 0.039;
      else sysPerPrice == 0.05;
    } else if (network == 2) {
      response = await sendMessage2(sender, real_phone_list, smsContent);
      sysPerPrice = 0.05;
    } else
      return res.status(400).json({ success: false, message: "参数不正确" });

    const newSms = new Sms({
      userId: user._id,
      input_phone: phoneList,
      content: smsContent,
      sender: sender,
      percent: user.percent,
      network: network,
      userPerPrice: pricePerSMS,
      sysPerPrice: sysPerPrice,
      t_time: new Date(),
      msgId: response.msgId,
      totalCount: phoneList.length,
      sendCount: response.smsCount,
    });
    await newSms.save();

    const decrement = -Math.round(pricePerSMS * phoneList.length * 100) / 100;
    await User.updateOne({ _id: user._id }, { $inc: { usdt: decrement } });

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("ERROR WHILE SENDING SMS:", error);
    res.status(500).json({ error: error.message });
  }
});

function detectCountry(phone) {
  if (phone.startsWith("852")) return 0; // Hong Kong
  if (phone.startsWith("853")) return 1; //Macau
  if (phone.startsWith("86")) return 2; // China
  if (phone.startsWith("81")) return 3; //Japan
  return -1;
}

router.get("/", async (req, res) => {
  const { user } = req;
  try {
    const smsList = await Sms.find({ userId: user._id });
    const response = smsList.map((sms) => ({
      phonelist: sms.input_phone,
      success_phonelist: sms.show_phone,
      content: sms.content,
      sender: sms.sender,
      date: sms.t_time,
      withdraw: Number((sms.price * sms.input_phone.length).toFixed(2)),
    }));
    return res.json({ success: true, data: response });
  } catch (error) {
    console.log("ERROR", error);
    return res.status(500).json({ error: error.message });
  }
});
module.exports = router;
