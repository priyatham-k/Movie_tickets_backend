const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true }, // Reference to the Movie model
  screenNumber: { type: Number, required: true }, // Screen where the movie is scheduled
  capacity: { type: Number, required: true }, // Total seat capacity for the screen
  date: { type: Date, required: true }, // Date of the schedule
  timeSlots: [{ type: String, required: true }], // Time slots for the schedule
});

module.exports = mongoose.model('Schedule', scheduleSchema);
