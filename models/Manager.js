// backend/models/Manager.js

const mongoose = require('mongoose');
const managerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre', required: true },
});

module.exports = mongoose.model('Manager', managerSchema);
