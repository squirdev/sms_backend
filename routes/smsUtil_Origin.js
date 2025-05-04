const axios = require("axios");
const crypto = require("crypto");

async function getBalance() {
  const baseUrl = "https://sendustext.com/sendsms/checkbalance.php";

  const query = new URLSearchParams({
    username: "HinHK",
    password: "Hin9",
  }).toString();

  const url = `${baseUrl}?${query}`;

  try {
    const response = await fetch(url, {
      method: "GET",
    });

    const data = await response.text();
    console.log("Balance Get:", data);
    return Number(data) ?? 0;
  } catch (error) {
    console.error("Error getting Balance:", error);
    return 0;
  }
}

async function sendMessage(sender, phoneList, content) {
  const baseUrl = "https://sendustext.com/sendsms/bulksms.php";

  const query = new URLSearchParams({
    username: "HinHK",
    password: "Hin9",
    type: "UNICODE",
    sender: sender,
    mobile: phoneList.join(","),
    message: content,
  }).toString();

  console.log("Query", query);

  const url = `${baseUrl}?${query}`;

  try {
    const response = await fetch(url, {
      method: "GET",
    });

    const data = await response.text();

    return {
      msgId: data.split("|")[1],
      smsCount: phoneList.length,
    };
  } catch (error) {
    console.error("Error sending SMS:", error);
    return null;
  }
}

module.exports = {
  getBalance,
  sendMessage,
};
