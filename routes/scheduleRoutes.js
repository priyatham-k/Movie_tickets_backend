const express = require("express");
const router = express.Router();
const Schedule = require("../models/Schedule");
router.post("/schedules/add", async (req, res) => {
  try {
    const schedule = new Schedule(req.body);
    await schedule.save();
    res.status(201).json({ message: "Schedule added successfully", schedule });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add schedule", error: error.message });
  }
});

// Edit Schedule
router.put("/schedules/edit/:id", async (req, res) => {
  try {
    const updatedSchedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Schedule updated successfully", updatedSchedule });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update schedule", error: error.message });
  }
});
module.exports = router;
