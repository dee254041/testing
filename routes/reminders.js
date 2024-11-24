const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const { isAuthenticated } = require('./auth');
const { sendSMS } = require('../utils/sms');

// Create reminder
router.post('/create', isAuthenticated, async (req, res) => {
    try {
        const { title, description, reminderDate, phoneNumber } = req.body;
        
        const reminder = new Reminder({
            user: req.session.user.id,
            title,
            description,
            reminderDate,
            phoneNumber
        });

        await reminder.save();

        // Send confirmation SMS
        try {
            await sendSMS(
                phoneNumber, 
                `Reminder set for ${new Date(reminderDate).toLocaleString()}: ${title}`
            );
        } catch (smsError) {
            console.error('SMS sending failed:', smsError);
            // Continue even if SMS fails
        }

        req.flash('success_msg', 'Reminder created successfully');
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error creating reminder:', error);
        req.flash('error_msg', 'Error creating reminder');
        res.redirect('/dashboard');
    }
});

// Get all reminders for a user
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const reminders = await Reminder.find({ user: req.session.user.id })
            .sort({ reminderDate: 1 });
        res.json(reminders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reminders' });
    }
});

// Get reminder for editing
router.get('/edit/:id', isAuthenticated, async (req, res) => {
    try {
        const reminder = await Reminder.findOne({
            _id: req.params.id,
            user: req.session.user.id
        });
        if (!reminder) {
            req.flash('error_msg', 'Reminder not found');
            return res.redirect('/dashboard');
        }
        res.json(reminder);
    } catch (error) {
        console.error('Error fetching reminder:', error);
        req.flash('error_msg', 'Error fetching reminder');
        res.redirect('/dashboard');
    }
});

// Update reminder
router.post('/update/:id', isAuthenticated, async (req, res) => {
    try {
        const { title, description, reminderDate, phoneNumber } = req.body;
        const reminder = await Reminder.findOne({
            _id: req.params.id,
            user: req.session.user.id
        });

        if (!reminder) {
            req.flash('error_msg', 'Reminder not found');
            return res.redirect('/dashboard');
        }

        reminder.title = title;
        reminder.description = description;
        reminder.reminderDate = reminderDate;
        reminder.phoneNumber = phoneNumber;
        reminder.isCompleted = false; // Reset completion status for new reminder time

        await reminder.save();
        req.flash('success_msg', 'Reminder updated successfully');
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error updating reminder:', error);
        req.flash('error_msg', 'Error updating reminder');
        res.redirect('/dashboard');
    }
});

// Delete reminder
router.delete('/delete/:id', isAuthenticated, async (req, res) => {
    try {
        const reminder = await Reminder.findOneAndDelete({
            _id: req.params.id,
            user: req.session.user.id
        });

        if (!reminder) {
            return res.status(404).json({ success: false, message: 'Reminder not found' });
        }

        res.json({ success: true, message: 'Reminder deleted successfully' });
    } catch (error) {
        console.error('Error deleting reminder:', error);
        res.status(500).json({ success: false, message: 'Error deleting reminder' });
    }
});

module.exports = router; 