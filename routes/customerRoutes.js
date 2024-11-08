const express = require("express");
const Customer = require("../models/Customer"); // Adjust path as needed
const router = express.Router();

// Customer Registration
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ message: "Email is already registered." });
    }
    const customer = new Customer({ email, password });
    await customer.save();
    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

// Customer Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const customer = await Customer.findOne({ email });
    if (!customer || customer.password !== password) {
      return res.status(400).json({ message: "Invalid email or password." });
    }
    res.status(200).json({ message: "Login successful", user: customer });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

module.exports = router;
