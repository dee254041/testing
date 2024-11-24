const axios = require('axios');

const sendSMS = async (phoneNumber, message) => {
    try {
        const formData = new URLSearchParams({
            userid: process.env.ZETTATEL_USERNAME,
            password: process.env.ZETTATEL_PASSWORD,
            sendMethod: 'quick',
            mobile: phoneNumber,
            msg: message,
            senderid: process.env.SENDER_ID,
            msgType: 'text',
            duplicatecheck: 'true',
            output: 'json'
        });

        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'cache-control': 'no-cache'
            }
        };

        const response = await axios.post(process.env.ZETTATEL_API_URL, formData, config);
        
        console.log('SMS sent successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw error;
    }
};

module.exports = { sendSMS }; 