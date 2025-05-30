const axios = require("axios");
const crypto = require("crypto");

async function getBalance0() {
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

async function sendChunk(baseUrl, sender, content, chunk, i, isUniCode) {
  const query = new URLSearchParams({
    username: "HinHK",
    password: "Hin9",
    type: isUniCode ? "UNICODE" : "TEXT",
    sender: sender,
    mobile: chunk.join(","),
    message: content,
  }).toString();

  const url = `${baseUrl}?${query}`;

  try {
    const response = await fetch(url, { method: "GET" });
    const data = await response.text();
    console.log("SMS sent for chunk", i, "result:", data);
  } catch (error) {
    console.error("Error sending SMS for chunk", i, ":", error);
  }
}

async function sendMessage0(sender, phoneList, content, isUniCode) {
  const baseUrl = "https://sendustext.com/sendsms/bulksms.php";

  const chunkSize = 100;
  const chunks = [];
  for (let i = 0; i < phoneList.length; i += chunkSize) {
    chunks.push(phoneList.slice(i, i + chunkSize));
  }

  // Handle first chunk immediately and return result
  const firstChunk = chunks[0];
  const firstQuery = new URLSearchParams({
    username: "HinHK",
    password: "Hin9",
    type: isUniCode ? "UNICODE" : "TEXT",
    sender: sender,
    mobile: firstChunk.join(","),
    message: content,
  }).toString();

  const firstUrl = `${baseUrl}?${firstQuery}`;

  let firstBatchResult = null;

  try {
    const response = await fetch(firstUrl, { method: "GET" });
    const data = await response.text();
    firstBatchResult = {
      msgId: data.split("|")[1] || null,
      smsCount: phoneList.length,
    };
  } catch (error) {
    console.error("Error sending first SMS batch:", error);
  }

  // Process remaining chunks in background
  (async () => {
    for (let i = 1; i < chunks.length; i++) {
      await delay(1000);
      await sendChunk(baseUrl, sender, content, chunks[i], i, isUniCode);
    }
  })();

  return firstBatchResult;
}

module.exports = {
  getBalance0,
  sendMessage0,
};
