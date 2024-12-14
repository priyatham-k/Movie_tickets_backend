const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
  },
  seatsBooked: [
    {
      seatNumber: { type: String, required: true },
      seatId: { type: String, required: true },
    },
  ],
  timeSlot: {
    type: String,
    required: true,
  },
  date: {
    type: String, // Stored in YYYY-MM-DD format
    required: true,
  },
  paymentDetails: {
    cardHolder: { type: String, required: true },
    creditCard: { type: String, required: true },
    expiry: { type: String, required: true },
    cvv: { type: String, required: true },
  },
  amountPaid: {
    type: Number,
    required: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Payment', paymentSchema);
