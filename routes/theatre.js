// backend/routes/theatre.js

const express = require("express");
const router = express.Router();
const Theatre = require("../models/Theatre");
const Movie = require("../models/Movie");
router.post("/addTheatre", async (req, res) => {
  const { name, location } = req.body;

  try {
    // Create a new theatre instance
    const newTheatre = new Theatre({
      name,
      location,
      screens: [], // Initialize with no screens
    });

    // Save the theatre to the database
    await newTheatre.save();

    res
      .status(201)
      .json({ message: "Theatre added successfully.", newTheatre });
  } catch (error) {
    res.status(500).json({ message: "Error adding theatre", error });
  }
});

// Update theatre
router.put("/updateTheatre", async (req, res) => {
  const { name, location } = req.body;

  try {
    const updatedTheatre = await Theatre.findByIdAndUpdate(
      THEATRE_ID, // Update the theatre with the predefined ID
      { name, location },
      { new: true } // Return the updated theatre
    );

    if (!updatedTheatre) {
      return res.status(404).json({ message: "Theatre not found." });
    }

    res
      .status(200)
      .json({ message: "Theatre updated successfully.", updatedTheatre });
  } catch (error) {
    res.status(500).json({ message: "Error updating theatre", error });
  }
});

module.exports = router;
