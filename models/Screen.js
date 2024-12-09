const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
  screenNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  capacity: {
    type: Number,
    required: true,
    default: 25,
  },
  description: {
    type: String,
    trim: true,
  },
});

const Screen = mongoose.model('Screen', screenSchema);

module.exports = Screen;
