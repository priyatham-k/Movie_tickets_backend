// backend/models/Theatre.js

const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
  screenName: { type: String, required: true },
  capacity: { type: Number, required: true }
});

const theatreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  screens: [screenSchema],  // Array of screens within the theatre
});

module.exports = mongoose.model('Theatre', theatreSchema);
