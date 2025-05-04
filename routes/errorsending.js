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

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function sendMessage(sender, phoneList, content) {
  const baseUrl = "https://sendustext.com/sendsms/bulksms.php";

  // Split phone list into chunks of 100
  const chunkSize = 100;
  const chunks = [];
  for (let i = 0; i < phoneList.length; i += chunkSize) {
    chunks.push(phoneList.slice(i, i + chunkSize));
  }

  let firstBatchResult = null;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const query = new URLSearchParams({
      username: "HinHK",
      password: "Hin9",
      type: "UNICODE",
      sender: sender,
      mobile: chunk.join(","),
      message: content,
    }).toString();

    const url = `${baseUrl}?${query}`;

    try {
      const response = await fetch(url, { method: "GET" });
      const data = await response.text();

      const result = {
        msgId: data.split("|")[1] || null,
        smsCount: phoneList.length,
      };
      console.log("SMS sending", i);
      // Return immediately after sending the first batch
      if (i === 0) {
        firstBatchResult = result;
      }

    } catch (error) {
      console.error("Error sending SMS:", error);
    }

    if (i < chunks.length - 1) {
      await delay(1000); // wait 1 second before next batch
    }
  }

  return firstBatchResult;
}

module.exports = {
  getBalance,
  sendMessage,
};
