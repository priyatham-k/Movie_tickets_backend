const express = require("express");
const bcrypt = require("bcrypt");
const Customer = require("../models/Customer"); // Adjust path as needed
const jwt = require("jsonwebtoken"); // For token generation
const router = express.Router();

const JWT_SECRET = "movie_123"; // Replace with a secure key, ideally from environment variables

// Customer Registration
router.post("/register", async (req, res) => {
  const { firstName, lastName, phoneNumber, email, password } = req.body;

  try {
    // Check if email or phone number is already registered
    const existingCustomer = await Customer.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingCustomer) {
      return res
        .status(400)
        .json({ message: "Email or phone number is already registered." });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new customer
    const customer = new Customer({
      firstName,
      lastName,
      phoneNumber,
      email,
      password: hashedPassword,
    });

    await customer.save();
    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
});

// Customer Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the customer by email
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: customer._id, email: customer.email }, JWT_SECRET, {
      expiresIn: "1h", // Token expiration time
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});
router.post("/change-password", async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  try {
    // Find the user by ID
    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Compare the provided old password with the hashed password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect." });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Save the updated user
    await user.save();

    res.status(200).json({
      message: "Password updated successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: "Password change failed", error: error.message });
  }
});

module.exports = router;
