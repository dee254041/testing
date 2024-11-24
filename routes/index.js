const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('./auth');
const Reminder = require('../models/Reminder');

// Home page - redirect to login if not authenticated
router.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/auth/login');
    }
});

// Dashboard - protected route
router.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        const reminders = await Reminder.find({ user: req.session.user.id }).sort({ reminderDate: 1 });
        res.render('dashboard', {
            user: req.session.user,
            reminders
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error loading dashboard');
        res.redirect('/');
    }
});

module.exports = router; 