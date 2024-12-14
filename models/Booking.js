const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  seatsBooked: [
    {
      seatNumber: { type: String, required: true }, // E.g., A1, B2
      seatId: { type: String, required: true },     // Unique random ID for the seat
      remarks: { type: String, default: "" }, // Optional remarks field, empty by default
      status: {
        type: String,
        enum: ["Booked", "Pending Cancel", "Cancelled"], // Status per seat
        default: "Booked", // Default status for each seat
      },
    },
  ],
  timeSlot: { type: String, required: true },
  date: { type: Date, required: true },
  amountPaid: Number,
  overallStatus: {
    type: String,
    enum: ["Active", "Cancelled"], // Status for the overall booking
    default: "Active", // Default overall booking status
  },
});

module.exports = mongoose.model("Booking", bookingSchema);
