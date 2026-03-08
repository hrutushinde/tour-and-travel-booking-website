// registrationModel.js
const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  preferredTravelStyle: { 
    type: String, 
    enum: ['luxury', 'adventure', 'cultural', 'budget'],
    required: true 
  },
  registrationDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Registration', registrationSchema);