const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const Genre = require('../models/Genre');
const Screen = require('../models/Screen');

// Add a new movie
router.post('/add', async (req, res) => {
  try {
    const {
      title,
      genre, // Genre name as a string
      duration,
      screenNumber, // Screen number
      timeSlots,
      imageUrl,
      ticketPrice,
      actors,
      director,
    } = req.body;

    // Find or create the screen
    let screenDocument = await Screen.findOne({ screenNumber });
    if (!screenDocument) {
      screenDocument = new Screen({ screenNumber, capacity: 100 }); // Default capacity
      await screenDocument.save();
    }

    // Check if the screen is already occupied in the movies collection
    const existingMovie = await Movie.findOne({ screen: screenDocument._id });
    if (existingMovie) {
      return res.status(400).json({
        message: `Screen ${screenNumber} is already occupied by another movie.`,
      });
    }

    // Find or create the genre
    let genreDocument = await Genre.findOne({ name: genre });
    if (!genreDocument) {
      genreDocument = new Genre({ name: genre });
      await genreDocument.save();
    }

    // Create the movie
    const movie = new Movie({
      title,
      genre: genreDocument._id, // Reference the Genre document
      duration,
      screen: screenDocument._id, // Reference the Screen document by ObjectId
      timeSlots,
      imageUrl,
      ticketPrice: ticketPrice || 100, // Default to 100 if not provided
      actors, // Actors array
      director, // Director string
    });

    await movie.save();

    // Populate the screen and genre fields in the response
    const populatedMovie = await Movie.findById(movie._id)
      .populate('screen') // Populate screen details
      .populate('genre', 'name'); // Populate genre details (only name)

    res.status(201).json({ message: 'Movie added successfully', movie: populatedMovie });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/edit/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      genre,
      duration,
      screenNumber, // Screen number in the payload
      timeSlots,
      imageUrl,
      ticketPrice,
      actors,
      director,
    } = req.body;

    // Validate the payload
    if (!screenNumber) {
      return res.status(400).json({ message: 'Screen number is required.' });
    }

    // Find or create the screen based on the provided screenNumber
    let screenDocument = await Screen.findOne({ screenNumber });
    if (!screenDocument) {
      screenDocument = new Screen({ screenNumber, capacity: 100 }); // Default capacity
      await screenDocument.save();
    }

    // Check if another movie is already assigned to the same screen
    const existingMovie = await Movie.findOne({
      screen: screenDocument._id,
      _id: { $ne: id }, // Exclude the current movie being updated
    });
    if (existingMovie) {
      return res.status(400).json({
        message: `Screen ${screenNumber} is already occupied by another movie.`,
      });
    }

    // Find or create the genre
    let genreDocument = await Genre.findOne({ name: genre });
    if (!genreDocument) {
      genreDocument = new Genre({ name: genre });
      await genreDocument.save();
    }

    // Update the movie
    const updates = {
      title,
      genre: genreDocument._id,
      duration,
      screen: screenDocument._id, // Reference the updated Screen document
      timeSlots,
      imageUrl,
      ticketPrice,
      actors,
      director,
    };

    const updatedMovie = await Movie.findByIdAndUpdate(id, updates, { new: true })
      .populate('genre', 'name')
      .populate('screen', 'screenNumber capacity'); // Populate screen details for response

    if (!updatedMovie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json({ message: 'Movie updated successfully', movie: updatedMovie });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});






// Delete a movie
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the movie
    const movie = await Movie.findByIdAndDelete(id);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all movies
router.get('/', async (req, res) => {
  try {
    // Populate the genre field with its name
    const movies = await Movie.find().populate('genre', 'name');
    console.log(movies)
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single movie by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the movie by ID and populate the genre field
    const movie = await Movie.findById(id).populate('genre', 'name');
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
