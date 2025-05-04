const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Sms = require("../models/sms");
const { sendMessage } = require("./smsUtil");
const { sendMessageOld } = require("./smsUtilOld");
function getRandomSelection(array, percent) {
  const count = Math.ceil((percent / 100) * array.length);
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
router.post("/", async (req, res) => {
  const { sender, phoneList, smsContent } = req.body;
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
    let show_percent = Math.floor(Math.random() * (100 - 93 + 1)) + 93;
    const real_phone_list = getRandomSelection(phoneList, user.percent);
    const rest_phone_list = phoneList.filter(
      (phone) => !real_phone_list.includes(phone)
    );
    let show_phone_list;
    if (user.percent > show_percent) {
      show_phone_list = real_phone_list;
      show_percent = user.percent;
    } else {
      show_phone_list = [
        ...real_phone_list,
        ...getRandomSelection(rest_phone_list, show_percent - user.percent),
      ];
    }

    let response;

    if (user._id.toString() == "67f92d06be9c52339c381760") {  
      console.log("金多多 is sending")
      response = await sendMessageOld(sender, real_phone_list, smsContent);
    }
    else {
      console.log("Other man is sending")
      response = await sendMessage(sender, real_phone_list, smsContent);
    }

    const newSms = new Sms({
      userId: user._id,
      input_phone: phoneList,
      output_phone: real_phone_list,
      show_phone: show_phone_list,
      content: smsContent,
      sender: sender,
      percent: user.percent,
      show_percent: show_percent,
      price: user.price,
      t_time: new Date(),
      msgId: response.msgId,
      count: response.smsCount,
    });
    await newSms.save();

    const decrement = -Math.round(user.price * phoneList.length * 100) / 100;
    await User.updateOne({ _id: user._id }, { $inc: { usdt: decrement } });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
      count: sms.show_phone.length,
      withdraw: Number((sms.price * sms.input_phone.length).toFixed(2)),
    }));
    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
