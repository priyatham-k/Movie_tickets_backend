const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');

// Add a new movie
router.post('/add', async (req, res) => {
  try {
    const { title, genre, duration, screenNumber, timeSlots, imageUrl } = req.body;
    const movie = new Movie({
      title,
      genre,
      duration,
      screenNumber,
      timeSlots,
      imageUrl,
      seatsAvailable: 100,
      ticketPrice: 100
    });
    await movie.save();
    res.status(201).json({ message: 'Movie added successfully', movie });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edit a movie
router.put('/edit/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const movie = await Movie.findByIdAndUpdate(id, updates, { new: true });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json({ message: 'Movie updated successfully', movie });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a movie
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findByIdAndDelete(id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/', async (req, res) => {
    try {
      const movies = await Movie.find();
      res.status(200).json(movies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
module.exports = router;
