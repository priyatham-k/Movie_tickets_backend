const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin"); // Adjust path as needed
const router = express.Router();
const Booking = require("../models/Booking");
const JWT_SECRET = "10"; // Replace with a secure key, preferably from an environment variable

// Admin Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Compare provided password with stored hashed password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      JWT_SECRET,
      { expiresIn: "1h" } // Token valid for 1 hour
    );

    // Send success response with token and user details
    res.status(200).json({
      message: "Login successful",
      user: {
        id: admin._id,
        email: admin.email,
        role: "admin",
      },
      token,
    });
  } catch (error) {
    // Handle server errors
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});
// Fetch all seat bookings with pending cancellations
router.get("/seatbookings", async (req, res) => {
  try {
    // Fetch all bookings with populated movie and customer details
    const bookings = await Booking.find()
      .populate("movieId", "title") // Populate movie title
      .populate("customerId", "firstName email") // Populate customer name and email
      .exec();

    // Format the bookings data
    const formattedBookings = bookings.map((booking) => ({
      _id: booking._id,
      movie: booking.movieId ? { title: booking.movieId.title } : null, // Movie title
      customer: booking.customerId
        ? { name: booking.customerId.firstName, email: booking.customerId.email } // Customer details
        : null,
      seatsBooked: booking.seatsBooked.map((seat) => ({
        seatNumber: seat.seatNumber, // Seat number
        seatId: seat.seatId, // Seat unique ID
        status: seat.status, // Current status of the seat
        remarks: seat.remarks || null, // Optional remarks
      })),
      timeSlot: booking.timeSlot, // Movie time slot
      date: booking.date.toISOString().split("T")[0], // Format date to YYYY-MM-DD
      status: booking.status, // Overall booking status
    }));

    res.status(200).json(formattedBookings);
  } catch (error) {
    console.error("Error fetching seat bookings:", error);
    res.status(500).json({ message: "Failed to fetch seat bookings" });
  }
});


// Approve a seat cancellation request
router.put("/seatbookings/:bookingId/approve-cancel", async (req, res) => {
  const { bookingId } = req.params;
  const { seatId } = req.body;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const seat = booking.seatsBooked.find((seat) => seat.seatId === seatId);
    if (!seat || seat.status !== "Pending Cancel") {
      return res.status(400).json({ message: "Seat not found or not pending cancellation" });
    }

    seat.status = "Cancelled"; // Approve the cancellation request by setting status to "Cancelled"
    await booking.save();

    res.status(200).json({ message: "Cancellation approved successfully", booking });
  } catch (error) {
    console.error("Error approving cancellation:", error);
    res.status(500).json({ message: "Failed to approve cancellation" });
  }
});

// Reject a seat cancellation request
router.put("/seatbookings/:bookingId/reject-cancel", async (req, res) => {
  const { bookingId } = req.params;
  const { seatId } = req.body;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const seat = booking.seatsBooked.find((seat) => seat.seatId === seatId);
    if (!seat || seat.status !== "Pending Cancel") {
      return res.status(400).json({ message: "Seat not found or not pending cancellation" });
    }

    seat.status = "Booked"; // Reject the cancellation request by reverting to "Booked"
    await booking.save();

    res.status(200).json({ message: "Cancellation rejected successfully", booking });
  } catch (error) {
    console.error("Error rejecting cancellation:", error);
    res.status(500).json({ message: "Failed to reject cancellation" });
  }
});


module.exports = router;
