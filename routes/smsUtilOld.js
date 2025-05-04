const axios = require("axios");
const crypto = require("crypto");

async function getBalanceOld() {
  const baseUrl = 'http://35.79.246.93:9511/api/balance';
  
  const query = new URLSearchParams({
    sp_id: '620533',
    password: 'b8233fb1ff5da2999cdc6c4f751ed56b'
  }).toString();

  const url = `${baseUrl}?${query}`;

  try {
    const response = await fetch(url, {
      method: 'GET'
    });

    const data = await response.json();
    console.log('Balance Get:', data);
    return data.data.balance
  } catch (error) {
    console.error('Error getting Balance:', error);
    return 0
  }
}

async function sendMessageOld(sender, phoneList, content) {
 
  const url = 'http://35.79.246.93:9511/api/send-sms-batch';

  const formData = {
    sp_id: '620533',
    mobiles: phoneList.join(','),
    content: content,
    password: 'b8233fb1ff5da2999cdc6c4f751ed56b',
    ext: sender
  };

  const params = new URLSearchParams(formData);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await response.json();

    console.log('SMS Sent:', data);

    return {
      msgId: data.msg_id,
      smsCount: phoneList.length
    };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return null;
  }
}

module.exports = {
  getBalanceOld,
  sendMessageOld
};