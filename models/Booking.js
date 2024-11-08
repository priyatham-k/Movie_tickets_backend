// models/Booking.js

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  seatsBooked: [String],
  timeSlot: { type: String, required: true },
  date: { type: Date, required: true }, // New field for the booking date
  amountPaid: Number,
  status: { type: String, enum: ["Active", "Canceled"], default: "Active" }
});

module.exports = mongoose.model("Booking", bookingSchema);
