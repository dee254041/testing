require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
require('./utils/scheduler');

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public', { 
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.js')) {
            res.set('Content-Type', 'application/javascript');
        }
    }
}));
app.set('view engine', 'ejs');

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Trust proxy in production
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Flash messages
app.use(flash());

// Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

// Routes
app.get('/manifest.json', (req, res) => {
    res.set('Content-Type', 'application/manifest+json');
    res.sendFile(path.join(__dirname, 'public/manifest.json'));
});

const { router: authRouter, isAuthenticated } = require('./routes/auth');
app.use('/auth', authRouter);
app.use('/reminders', isAuthenticated, require('./routes/reminders'));
app.use('/', require('./routes/index'));
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 