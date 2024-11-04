// backend/models/Customer.js

const mongoose = require('mongoose');
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bookings: [
    {
      theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre' },
      movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
      date: { type: Date, required: true },
      seats: { type: Number, required: true },
    },
  ],
});

module.exports = mongoose.model('Customer', customerSchema);
