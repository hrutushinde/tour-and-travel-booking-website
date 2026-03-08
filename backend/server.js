const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const Package = require('./packageModel');
const Feedback = require('./feedbackModel');
const Registration = require('./registrationModel'); // <--- RESTORED: Import the Registration Model

// Initialize the app and DB connection
const app = express();
connectDB();

// --- Middleware ---
app.use(cors({ origin: '*' })); 
app.use(express.json()); // Body parser for application/json

// --- API Routes ---

// GET /api/packages: Fetch all travel packages
app.get('/api/packages', async (req, res) => {
    try {
        const packages = await Package.find();
        res.json(packages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching packages.' });
    }
});

// GET /api/feedback: Fetch recent feedback
app.get('/api/feedback', async (req, res) => {
    try {
        // Fetch last 10 feedback items, newest first
        const feedback = await Feedback.find().sort({ date: -1 }).limit(10);
        res.json(feedback);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching feedback.' });
    }
});

// POST /api/feedback: Submit new feedback (Data stored in MongoDB)
app.post('/api/feedback', async (req, res) => {
    const newFeedback = new Feedback({
        name: req.body.name,
        rating: req.body.rating,
        comment: req.body.comment
    });

    try {
        const savedFeedback = await newFeedback.save();
        res.status(201).json(savedFeedback);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Invalid feedback data.' });
    }
});

// POST /api/register: Store new user registration (Data stored in MongoDB)
app.post('/api/register', async (req, res) => {
    const newRegistration = new Registration({
        name: req.body.regName, // Mapped from frontend script.js
        email: req.body.regEmail, // Mapped from frontend script.js
        preferredTravelStyle: req.body.regPref // Mapped from frontend script.js
    });

    try {
        const savedRegistration = await newRegistration.save();
        console.log("🔔 New User Registered:", savedRegistration.email);
        res.status(201).json(savedRegistration);
    } catch (err) {
        // Handle MongoDB duplicate key error (11000) for unique email constraint
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Registration failed. This email is already registered.' });
        }
        res.status(400).json({ message: 'Invalid registration data.', error: err.message });
    }
});

// POST /api/bookings: Handle booking submission (data logging example)
app.post('/api/bookings', (req, res) => {
    // In a real application, you would save this to a separate 'Bookings' collection
    console.log('---------------------------------');
    console.log('🔔 Received New Booking Request:');
    console.log(`Package ID: ${req.body.packageId}`);
    console.log(`Customer: ${req.body.fullName}`);
    console.log(`Email: ${req.body.email}`);
    console.log(`Travelers: ${req.body.travelers}`);
    console.log('---------------------------------');

    res.status(200).json({ message: 'Booking received for processing.' });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌍 Server running on http://localhost:${PORT}`));
