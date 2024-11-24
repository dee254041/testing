const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/auth/login');
};

// Login page
router.get('/login', (req, res) => {
    res.render('login');
});

// Signup page
router.get('/signup', (req, res) => {
    res.render('signup');
});

// Register handle
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, password2 } = req.body;
        const errors = [];

        // Check required fields
        if (!name || !email || !password || !password2) {
            errors.push({ msg: 'Please fill in all fields' });
        }

        // Check passwords match
        if (password !== password2) {
            errors.push({ msg: 'Passwords do not match' });
        }

        // Check password length
        if (password.length < 6) {
            errors.push({ msg: 'Password should be at least 6 characters' });
        }

        if (errors.length > 0) {
            res.render('signup', {
                errors,
                name,
                email
            });
        } else {
            // Validation passed
            const existingUser = await User.findOne({ email });

            if (existingUser) {
                errors.push({ msg: 'Email is already registered' });
                res.render('signup', {
                    errors,
                    name,
                    email
                });
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);
                const newUser = new User({
                    name,
                    email,
                    password: hashedPassword
                });

                await newUser.save();
                req.flash('success_msg', 'You are now registered and can log in');
                res.redirect('/auth/login');
            }
        }
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Registration failed');
        res.redirect('/auth/signup');
    }
});

// Login handle
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            req.flash('error_msg', 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            req.flash('error_msg', 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        // Store user in session
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin
        };

        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Login failed');
        res.redirect('/auth/login');
    }
});

// Logout handle
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/auth/login');
    });
});

module.exports = {
    router,
    isAuthenticated
}; 