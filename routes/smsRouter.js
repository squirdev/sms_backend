const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Sms = require("../models/sms");
const { sendMessage0, getBalance0 } = require("./smsUtil0");
const { sendMessage1 } = require("./smsUtil1");

function getRandomSelection(array, percent) {
  const count = Math.ceil((percent / 100) * array.length);
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function detectLanguage(text) {
  if (/[\u4e00-\u9fff]/.test(text)) {
    return "CH";
  } else if (/[a-zA-Z]/.test(text)) {
    // Check for Spanish-specific characters
    if (/[ñáéíóúü¿¡]/i.test(text)) {
      return "SP";
    } else {
      return "EN";
    }
  } else {
    return "Unknown";
  }
}

router.post("/", async (req, res) => {
  const { sender, phoneList, smsContent, network } = req.body;

  const { user } = req;

  if (!phoneList || !smsContent || !sender) {
    res.status(400).json({ success: false, message: "请正确输入所有数据。" });
    return;
  }

  const isUniCode = detectLanguage(smsContent) == "CH";

  try {
    let pricePerSMS, sysPerPrice;

    switch (detectCountry(phoneList[0])) {
      case 0: {
        // Hong Kong
        pricePerSMS = user.priceH;
        sysPerPrice = 0.057;
        break;
      }
      case 1: {
        // Macau
        pricePerSMS = user.priceM;
        sysPerPrice = 0.033;
        break;
      }
      case 2: {
        // China
        pricePerSMS = user.priceC;
        sysPerPrice = 0;
        break;
      }
      case 3: {
        //Japan Price
        pricePerSMS = user.priceM;
        sysPerPrice = 0.043;
        break;
      }
      case 4: {
        //Spain Price
        pricePerSMS = 0.045;
        sysPerPrice = 0.043;
        break;
      }
      case 5: {
        //Italy Price
        pricePerSMS = 0.059;
        sysPerPrice = 0.057;
        break;
      }
      default: {
        return res
          .status(400)
          .json({ success: false, message: "请选择正确的电话号码" });
      }
    }

    if (phoneList.length > user.usdt / pricePerSMS) {
      res.status(400).json({ success: false, message: "您的余额不足。" });
      return;
    }

    const success_percent = phoneList.length > 50 ? user.percent : 100;
    const real_phone_list = getRandomSelection(phoneList, success_percent);

    const response = await sendMessage0(
      sender,
      real_phone_list,
      smsContent,
      isUniCode
    );

    const newSms = new Sms({
      userId: user._id,
      input_phone: phoneList,
      content: smsContent,
      sender: sender,
      percent: user.percent,
      network: 0,
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

    res.status(200).json({ success: true, message: "所有短信均已正确发送" });
  } catch (error) {
    console.log("ERROR WHILE SENDING SMS:", error);
    res.status(500).json({ success: false, message: "操作时发生意外错误" });
  }
});

function detectCountry(phone) {
  if (phone.startsWith("852")) return 0; // Hong Kong
  if (phone.startsWith("853")) return 1; //Macau
  if (phone.startsWith("86")) return 2; // China
  if (phone.startsWith("81")) return 3; //Japan
  if (phone.startsWith("34")) return 4; //Spain
  if (phone.startsWith("39")) return 5; //Italy
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
