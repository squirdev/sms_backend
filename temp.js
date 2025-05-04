// apiRequest.js
const axios = require("axios");
const qs = require("qs");

const makeApiRequest = async (
  url,
  spCode,
  loginName,
  password,
  smsContent,
  cleanedPhoneList
) => {
  const body = qs.stringify({
    SpCode: spCode,
    LoginName: loginName,
    Password: password,
    MessageContent: encodeURIComponent(smsContent),
    // UserNumber: "15542660709",
    UserNumber: cleanedPhoneList,
  });

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  };

  try {
    const response = await axios.post(url, body, { headers });
    console.log("Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  }
};

// makeApiRequest();

module.exports = { makeApiRequest };
