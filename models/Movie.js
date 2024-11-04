const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },  // in minutes
  releaseDate: { type: Date, required: true },
  image: { type: String, required: true },  // URL of the movie image
  imdbScore: { type: Number, required: true },
  screen: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre.screens', unique: true }  // Reference to a screen, and ensure only one movie per screen
});

module.exports = mongoose.model('Movie', movieSchema);
