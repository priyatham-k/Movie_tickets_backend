const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin"); // Adjust path as needed
const router = express.Router();

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

module.exports = router;
