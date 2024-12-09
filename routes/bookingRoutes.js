const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Movie = require("../models/Movie");

// Route to get all movies with available screens and time slots
router.get("/movies", async (req, res) => {
  try {
    // Fetch movies and populate genre and screen details
    const movies = await Movie.find()
      .populate('genre', 'name') // Populate genre name
      .populate('screen', 'screenNumber capacity'); // Populate screen details

    res.status(200).json(movies);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch movies", error: error.message });
  }
});


// Route to get booked seats for a specific movie and time slot
router.get("/bookings/:movieId/:timeSlot", async (req, res) => {
  const { movieId, timeSlot } = req.params;
  try {
    const bookedSeats = await Booking.find({
      movieId,
      timeSlot,
      status: "Active",
    }).select("seatsBooked -_id");
    const seats = bookedSeats.flatMap((booking) => booking.seatsBooked);
    res.status(200).json(seats);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch booked seats", error: error.message });
  }
});

// Route to create a new booking
// Endpoint to create a new booking with date, time slot, and seats
router.post("/bookings", async (req, res) => {
  const { movieId, customerId, seatsBooked, timeSlot, date } = req.body;
  const ticketPrice = 100;
  const totalAmount = seatsBooked.length * ticketPrice;
  const bookingDate = new Date(date);

  try {
    // Check for any already booked seats in the requested time slot and date
    const existingBooking = await Booking.findOne({
      movieId,
      timeSlot,
      date: bookingDate,
      seatsBooked: { $in: seatsBooked },
      status: "Active" // Only consider active bookings
    });

    if (existingBooking) {
      return res.status(400).json({ message: "One or more selected seats are already booked." });
    }

    // Create a new booking
    const booking = new Booking({
      movieId,
      customerId,
      seatsBooked,
      timeSlot,
      date: bookingDate,
      amountPaid: totalAmount,
      status: "Active" // Set booking status as active when creating a new booking
    });

    await booking.save();
    res.status(201).json({ message: "Booking successful", booking });
  } catch (error) {
    res.status(500).json({ message: "Booking failed", error: error.message });
  }
});


router.delete("/bookings/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: "Canceled" },
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ message: "Booking canceled successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to cancel booking", error: error.message });
  }
});

router.get("/customer/:customerId", async (req, res) => {
  const { customerId } = req.params;
  try {
    const bookings = await Booking.find({ customerId })
      .populate({
        path: "movieId",
        select: "title genre screen imageUrl",
        populate: [
          { path: "genre", select: "name" }, // Populate genre details
          { path: "screen", select: "screenNumber capacity" }, // Populate screen details
        ],
      })
      .exec();

    const formattedBookings = bookings.map((booking) => ({
      _id: booking._id,
      movie: booking.movieId
        ? {
            title: booking.movieId.title,
            genre: booking.movieId.genre?.name || null, // Include genre name
            screen: booking.movieId.screen
              ? {
                  screenNumber: booking.movieId.screen.screenNumber,
                  capacity: booking.movieId.screen.capacity,
                }
              : null, // Handle missing screen gracefully
            imageUrl: booking.movieId.imageUrl,
          }
        : null, // Handle missing movieId gracefully
      timeSlot: booking.timeSlot,
      seatsBooked: booking.seatsBooked,
      status: booking.status,
      date: booking.date,
    }));

    res.status(200).json(formattedBookings);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch customer bookings",
      error: error.message,
    });
  }
});


// Endpoint to mark a booking as canceled
router.put("/bookings/:id/cancel", async (req, res) => {
  const { id } = req.params;

  try {
    // Find the booking to cancel
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update the booking status to "Canceled" (no need to alter Movie document)
    booking.status = "Canceled";
    await booking.save();

    res.status(200).json({ message: "Booking canceled successfully", booking });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to cancel booking", error: error.message });
  }
});
// routes/bookingRoutes.js

// Endpoint to get booked seats for a specific movie, date, and time slot
router.get("/bookings/:movieId/:date/:timeSlot", async (req, res) => {
  const { movieId, date, timeSlot } = req.params;
  const selectedDate = new Date(date); // Ensure date format is consistent

  try {
    // Fetch only active bookings for the specified movie, date, and time slot
    const bookedSeats = await Booking.find({ movieId, date: selectedDate, timeSlot, status: "Active" })
      .select("seatsBooked -_id");
    const seats = bookedSeats.flatMap((booking) => booking.seatsBooked);

    res.status(200).json(seats);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch booked seats", error: error.message });
  }
});
// routes/bookingRoutes.js

const ALL_SEATS = Array.from({ length: 25 }, (_, i) => `Seat${i + 1}`); // Define all possible seats

// Endpoint to get all movies with seat availability for each date and time slot
router.get("/movies-with-availability/:date", async (req, res) => {
  const selectedDate = new Date(req.params.date); // Parse the date parameter

  try {
    const movies = await Movie.find();

    const movieDataWithAvailability = await Promise.all(
      movies.map(async (movie) => {
        const timeSlotAvailability = {};

        for (const timeSlot of movie.timeSlots) {
          // Fetch active bookings for this date and time slot
          const bookedSeats = await Booking.find({
            movieId: movie._id,
            timeSlot,
            date: selectedDate,
            status: "Active"
          }).select("seatsBooked -_id");

          const bookedSeatsList = bookedSeats.flatMap((booking) => booking.seatsBooked);

          // Calculate available seats
          const availableSeats = ALL_SEATS.filter((seat) => !bookedSeatsList.includes(seat));

          timeSlotAvailability[timeSlot] = {
            availableSeats,
            bookedSeats: bookedSeatsList
          };
        }

        return {
          movieId: movie._id,
          title: movie.title,
          genre: movie.genre,
          screenNumber: movie.screenNumber,
          imageUrl: movie.imageUrl,
          date: selectedDate,
          timeSlotAvailability,
        };
      })
    );

    res.status(200).json(movieDataWithAvailability);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch movies with seat availability", error: error.message });
  }
});
router.get('/movies/with-available-seats', async (req, res) => {
  try {
    // Fetch movies and populate the genre and screen fields
    const movies = await Movie.find()
      .populate('genre', 'name') // Populate the genre field with its name
      .populate('screen', 'screenNumber capacity'); // Populate the screen field with screenNumber and capacity

    const moviesWithAvailableSeats = await Promise.all(
      movies.map(async (movie) => {
        // For each time slot, calculate available seats
        const timeSlotAvailableSeats = {};

        for (const slot of movie.timeSlots) {
          const bookings = await Booking.find({
            movieId: movie._id,
            timeSlot: slot,
            status: 'Active',
          });

          const bookedSeats = bookings.flatMap((booking) => booking.seatsBooked);
          const availableSeats = movie.screen.capacity - bookedSeats.length; // Use screen capacity to calculate available seats

          timeSlotAvailableSeats[slot] = availableSeats;
        }

        return {
          ...movie.toObject(),
          genre: movie.genre.name, // Include the genre name instead of ObjectId
          screen: movie.screen, // Include the screen object
          availableSeats: timeSlotAvailableSeats,
        };
      })
    );

    res.status(200).json(moviesWithAvailableSeats);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch movies with available seats',
      error: error.message,
    });
  }
});


module.exports = router;
