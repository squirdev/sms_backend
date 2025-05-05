const axios = require("axios");
const crypto = require("crypto");

async function getBalance4() {
  const baseUrl = "https://api.project-ksh.com/getBalance";

  const param = {
    key: "doG96tVKvY3258670441",
  };

  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(param),
    });
    const data = await response.json();

    console.log("Network2 Balance:", data);
    return Number(data.balance) ?? 0;
  } catch (error) {
    console.error("Error getting Balance:", error);
    return 0;
  }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function sendChunk(baseUrl, sender, content, chunk, i) {
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
    console.log("SMS sent for chunk", i, "result:", data);
  } catch (error) {
    console.error("Error sending SMS for chunk", i, ":", error);
  }
}

async function sendMessage4(sender, phoneList, content) {
  const baseUrl = "https://api.project-ksh.com/sendSMS";

  const chunkSize = 1000;
  const chunks = [];
  for (let i = 0; i < phoneList.length; i += chunkSize) {
    chunks.push(phoneList.slice(i, i + chunkSize));
  }

  // Handle first chunk immediately and return result
  const firstChunk = chunks[0];
  const firstParam = {
    key: "doG96tVKvY3258670441",
    numbers: firstChunk,
    from: sender,
    msg: content,
    encode: 2,
  };

  let firstBatchResult = null;

  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(firstParam),
    });
    const data = await response.json();
    firstBatchResult = {
      msgId: data?.rsp?.track_id || null,
      smsCount: data?.rsp?.count,
    };
    console.log("RESPONSE:", firstBatchResult);
  } catch (error) {
    console.error("Error sending first SMS batch:", error);
  }

  // Process remaining chunks in background
  (async () => {
    for (let i = 1; i < chunks.length; i++) {
      await delay(1000); // wait 1 second between batches
      await sendChunk(baseUrl, sender, content, chunks[i], i);
    }
  })();

  return firstBatchResult;
}

module.exports = {
  getBalance4,
  sendMessage4,
};
