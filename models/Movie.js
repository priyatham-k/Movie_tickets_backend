const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: mongoose.Schema.Types.ObjectId, ref: 'Genre', required: true }, // Referencing Genre model
  duration: { type: Number, required: true }, // Duration in minutes
  screen: { type: mongoose.Schema.Types.ObjectId, ref: 'Screen', required: true }, // Reference to Screen model
  seatsAvailable: { type: Number, default: 100 },
  timeSlots: [{ type: String }], // Array of time slots, e.g., ["10:00 AM", "1:00 PM", "4:00 PM", "7:00 PM"]
  imageUrl: { type: String },
  bookings: { type: Number, default: 0 }, // Track number of bookings
  ticketPrice: { type: Number, default: 100 },
  actors: [{ type: String }], // Array of actors' names
  director: { type: String } // Director's name
});

module.exports = mongoose.model('Movie', movieSchema);
