const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Movie = require("../models/Movie");
const Schedule = require("../models/Schedule");
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
      "seatsBooked.status": { $in: ["Booked", "Pending Cancel"] }, // Include both Booked and Pending Cancel seats
    }).select("seatsBooked -_id");

    // Flatten and return only relevant seat details
    const seats = bookedSeats.flatMap((booking) =>
      booking.seatsBooked.map((seat) => ({
        seatNumber: seat.seatNumber,
        seatId: seat.seatId,
        status: seat.status,
        remarks: seat.remarks || null,
      }))
    );

    res.status(200).json(seats);
  } catch (error) {
    console.error("Error fetching booked seats:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch booked seats", error: error.message });
  }
});


router.post("/bookings", async (req, res) => {
  const { movieId, customerId, seatsBooked, timeSlot, date } = req.body;
  const ticketPrice = 100;
  const bookingDate = new Date(date);

  try {
    // Validate the input array
    if (!Array.isArray(seatsBooked) || seatsBooked.length === 0) {
      return res
        .status(400)
        .json({ message: "SeatsBooked must be a non-empty array." });
    }

    // Generate seat IDs and validate seat data
    const seatsWithIds = seatsBooked.map((seat) => {
      if (!seat.seatNumber) {
        throw new Error("Each seat must have a valid seatNumber.");
      }
      return {
        seatNumber: seat.seatNumber,
        seatId: `SEAT-${Math.floor(100000 + Math.random() * 900000)}`, // Random unique ID
        status: "Booked", // Set default status to "Booked"
        remarks: seat.remarks || null, // Optional remarks
      };
    });

    // Check for existing bookings
    const existingBooking = await Booking.findOne({
      movieId,
      timeSlot,
      date: bookingDate,
      "seatsBooked.seatNumber": { $in: seatsWithIds.map((seat) => seat.seatNumber) },
      "seatsBooked.status": "Booked", // Only consider fully booked seats
    });

    if (existingBooking) {
      return res
        .status(400)
        .json({ message: "One or more selected seats are already booked." });
    }

    // Calculate the total amount
    const totalAmount = seatsWithIds.length * ticketPrice;

    // Create the booking
    const booking = new Booking({
      movieId,
      customerId,
      seatsBooked: seatsWithIds,
      timeSlot,
      date: bookingDate,
      amountPaid: totalAmount,
      status: "Active",
    });

    await booking.save();

    res.status(201).json({ message: "Booking successful", booking });
  } catch (error) {
    console.error("Error creating booking:", error);
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

    // Format the response to include the additional fields
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
      seatsBooked: booking.seatsBooked.map((seat) => ({
        seatNumber: seat.seatNumber,
        seatId: seat.seatId,
        status: seat.status, // Include the status for each seat
        remarks: seat.remarks || null, // Include remarks if available
      })),
      status: booking.status, // Overall booking status
      date: booking.date.toISOString().split("T")[0], // Format date to YYYY-MM-DD
      amountPaid: booking.amountPaid, // Include the amount paid
    }));

    res.status(200).json(formattedBookings);
  } catch (error) {
    console.error("Error fetching customer bookings:", error);
    res.status(500).json({
      message: "Failed to fetch customer bookings",
      error: error.message,
    });
  }
});

// Endpoint to mark a booking as canceled
router.put("/bookings/:id/cancel", async (req, res) => {
  const { id } = req.params; // Booking ID
  const { seatId, remarks } = req.body; // Specific seat ID and remarks

  try {
    // Find the booking by ID
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if the seat exists in the booking
    const seatIndex = booking.seatsBooked.findIndex(
      (seat) => seat.seatId === seatId
    );
    if (seatIndex === -1) {
      return res
        .status(400)
        .json({ message: "Seat not found in the booking" });
    }

    // Update the status of the specific seat to "Pending Cancel" and add remarks
    booking.seatsBooked[seatIndex].status = "Pending Cancel";
    if (remarks) {
      booking.seatsBooked[seatIndex].remarks = remarks;
    }

    // Save the updated booking
    await booking.save();

    res.status(200).json({
      message: "Seat status updated to 'Pending Cancel'",
      booking,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update seat status", error: error.message });
  }
});


// routes/bookingRoutes.js

// Endpoint to get booked seats for a specific movie, date, and time slot
router.get("/bookings/:movieId/:date/:timeSlot", async (req, res) => {
  const { movieId, date, timeSlot } = req.params;
  const selectedDate = new Date(date); // Ensure date format is consistent

  try {
    // Fetch bookings for the specified movie, date, and time slot
    const bookedSeats = await Booking.find(
      { movieId, date: selectedDate, timeSlot }
    ).select("seatsBooked -_id");

    // Flatten the array to include seat details with status
    const seats = bookedSeats.flatMap((booking) =>
      booking.seatsBooked.map((seat) => ({
        seatNumber: seat.seatNumber,
        seatId: seat.seatId,
        status: seat.status, // Include seat status
        remarks: seat.remarks || null, // Include remarks, if any
      }))
    );

    res.status(200).json(seats);
  } catch (error) {
    console.error("Error fetching booked seats:", error);
    res.status(500).json({ message: "Failed to fetch booked seats", error: error.message });
  }
});

// routes/bookingRoutes.js

const ALL_SEATS = Array.from({ length: 100 }, (_, i) => `Seat${i + 1}`); // Define all possible seats

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
