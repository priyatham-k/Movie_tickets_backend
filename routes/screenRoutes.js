const express = require('express');
const router = express.Router();
const Screen = require('../models/Screen');
const Movie = require('../models/Movie');

// Add a new screen
router.post('/add', async (req, res) => {
  try {
    const { screenNumber, capacity, description } = req.body;

    // Check if screenNumber already exists
    const existingScreen = await Screen.findOne({ screenNumber });
    if (existingScreen) {
      return res.status(400).json({ message: 'Screen number already exists' });
    }

    // Create new screen
    const screen = new Screen({
      screenNumber,
      capacity,
      description,
    });

    await screen.save();
    res.status(201).json({ message: 'Screen added successfully', screen });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all screens
router.get('/', async (req, res) => {
  try {
    // Fetch all screens
    const screens = await Screen.find();

    // For each screen, find associated movies
    const screensWithMovies = await Promise.all(
      screens.map(async (screen) => {
        const movies = await Movie.find({ screen: screen._id }).populate('genre', 'name');
        return {
          ...screen.toObject(),
          movies, // Attach movies to the screen object
        };
      })
    );

    res.status(200).json(screensWithMovies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get screen details with movies
router.get('/:id/movies', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the screen ID
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid screen ID format' });
    }

    // Find the screen by ID
    const screen = await Screen.findById(id);
    if (!screen) {
      return res.status(404).json({ message: 'Screen not found' });
    }

    // Find movies associated with this screen
    const movies = await Movie.find({ screen: id })
      .populate('genre', 'name') // Populate the genre field
      .select('title genre duration imageUrl bookings'); // Select specific fields to return

    // Construct response
    const response = {
      screen: {
        id: screen._id,
        screenNumber: screen.screenNumber,
        capacity: screen.capacity,
        description: screen.description,
      },
      movies: movies.map((movie) => ({
        id: movie._id,
        title: movie.title,
        genre: movie.genre ? movie.genre.name : 'N/A',
        duration: movie.duration,
        imageUrl: movie.imageUrl,
        bookings: movie.bookings,
      })),
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});


// Edit screen details
router.put('/edit/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { capacity, description } = req.body;

    // Update screen details
    const updatedScreen = await Screen.findByIdAndUpdate(
      id,
      { capacity, description },
      { new: true }
    );

    if (!updatedScreen) return res.status(404).json({ message: 'Screen not found' });

    res.status(200).json({ message: 'Screen updated successfully', screen: updatedScreen });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a screen
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the screen
    const screen = await Screen.findByIdAndDelete(id);
    if (!screen) return res.status(404).json({ message: 'Screen not found' });

    // Optional: Delete movies associated with this screen
    await Movie.deleteMany({ screen: id });

    res.status(200).json({ message: 'Screen and associated movies deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
