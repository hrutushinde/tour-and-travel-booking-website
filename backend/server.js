const express = require('express');
const cors = require('cors');
require('dotenv').config(); // ✅ Load environment variables

const connectDB = require('./db');
const Package = require('./packageModel');
const Feedback = require('./feedbackModel');
const Registration = require('./registrationModel');

const app = express();

// ✅ Connect DB
connectDB();

// --- Middleware ---
app.use(cors({
    origin: '*', // You can restrict this later for security
}));
app.use(express.json());

// ✅ Root route (IMPORTANT for deployment)
app.get('/', (req, res) => {
    res.send('🌍 Tour & Travel API is running...');
});

// --- API Routes ---

// GET all packages
app.get('/api/packages', async (req, res) => {
    try {
        const packages = await Package.find();
        res.json(packages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching packages.' });
    }
});

// GET feedback
app.get('/api/feedback', async (req, res) => {
    try {
        const feedback = await Feedback.find().sort({ date: -1 }).limit(10);
        res.json(feedback);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching feedback.' });
    }
});

// POST feedback
app.post('/api/feedback', async (req, res) => {
    try {
        const newFeedback = new Feedback({
            name: req.body.name,
            rating: req.body.rating,
            comment: req.body.comment
        });

        const savedFeedback = await newFeedback.save();
        res.status(201).json(savedFeedback);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Invalid feedback data.' });
    }
});

// POST registration
app.post('/api/register', async (req, res) => {
    try {
        const newRegistration = new Registration({
            name: req.body.regName,
            email: req.body.regEmail,
            preferredTravelStyle: req.body.regPref
        });

        const savedRegistration = await newRegistration.save();

        console.log("🔔 New User Registered:", savedRegistration.email);

        res.status(201).json(savedRegistration);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                message: 'Email already registered'
            });
        }

        res.status(400).json({
            message: 'Invalid registration data',
            error: err.message
        });
    }
});

// POST bookings
app.post('/api/bookings', (req, res) => {
    console.log('---------------------------------');
    console.log('🔔 New Booking Request:');
    console.log(req.body);
    console.log('---------------------------------');

    res.status(200).json({
        message: 'Booking received successfully'
    });
});

// ✅ PORT for Render
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
