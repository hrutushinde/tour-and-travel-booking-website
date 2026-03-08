// packageModel.js
const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // Added for easy mapping to frontend mock IDs
  name: { type: String, required: true },
  destination: { type: String, required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, default: 4.5 },
  imgUrl: { type: String, default: 'placeholder.jpg' }
});

module.exports = mongoose.model('Package', packageSchema);