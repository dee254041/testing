const Reminder = require('../models/Reminder');
const { sendSMS } = require('./sms');
const moment = require('moment');

const checkAndSendReminders = async () => {
    try {
        // Find all reminders that are due within the next minute
        const now = moment();
        const oneMinuteFromNow = moment().add(1, 'minutes');

        const dueReminders = await Reminder.find({
            reminderDate: {
                $gte: now.toDate(),
                $lt: oneMinuteFromNow.toDate()
            },
            isCompleted: false
        }).populate('user');

        console.log(`Found ${dueReminders.length} reminders due between ${now} and ${oneMinuteFromNow}`);

        for (const reminder of dueReminders) {
            const message = `Reminder: ${reminder.title}\n${reminder.description}`;
            
            try {
                const smsResponse = await sendSMS(reminder.phoneNumber, message);
                console.log('SMS API Response:', smsResponse);
                
                if (smsResponse.status === 'success') {
                    reminder.isCompleted = true;
                    await reminder.save();
                    console.log(`Reminder successfully sent to ${reminder.phoneNumber}`);
                } else {
                    console.error(`SMS sending failed: ${smsResponse.reason}`);
                }
            } catch (error) {
                console.error(`Failed to send reminder to ${reminder.phoneNumber}:`, error.message);
            }
        }
    } catch (error) {
        console.error('Error in reminder scheduler:', error);
    }
};

// Log when scheduler starts
console.log('Reminder scheduler started...');
setInterval(checkAndSendReminders, 60000);

// Run immediately on startup
checkAndSendReminders();

module.exports = { checkAndSendReminders }; 