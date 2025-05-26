// apiRequest.js
const axios = require("axios");
const qs = require("qs");

const getBalance4 = async () => {
  try {
    // const url = "https://api.huanxun58.com/sms/Api/ReturnJson/Send.do";
    const url = "https://api.huanxun58.com/sms/Api/searchNumber.do";
    const body = qs.stringify({
      SpCode: "100692",
      LoginName: "KING",
      Password: "2B!K@IzIh9",
    });

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    };

    const response = await axios.post(url, body, { headers });
    console.log("Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
  }
};

const makeApiRequest = async (sender, phoneList, content) => {
  try {
    // const url = "https://api.huanxun58.com/sms/Api/ReturnJson/Send.do";
    const url = "https://api.huanxun58.com/sms/Api/Send.do";
    const body = qs.stringify({
      SpCode: "100692",
      LoginName: "KING",
      Password: "2B!K@IzIh9",
      MessageContent: encodeURIComponent(content),
      UserNumber: phoneList.join(","),
      // subPort: sender,
    });

    console.log("PHONE LIST JOIN", phoneList.join(","));

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    };

    const response = await axios.post(url, body, { headers });
    console.log("Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
  }
};

getBalance4();

module.exports = { makeApiRequest };
