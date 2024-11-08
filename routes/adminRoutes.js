const express = require("express");
const Admin = require("../models/Admin"); // Adjust path as needed
const router = express.Router();

// Admin Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin || admin.password !== password) {
      return res.status(400).json({ message: "Invalid email or password." });
    }
    res.status(200).json({ message: "Login successful", user: admin });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

module.exports = router;
