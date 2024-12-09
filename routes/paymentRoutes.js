const express = require('express');
const router = express.Router();
const Payment = require('../models/Payments');

// Add Payment
router.post('/add', async (req, res) => {
  try {
    const {
      customerId,
      movieId,
      seatsBooked,
      timeSlot,
      date,
      paymentDetails,
      amountPaid,
    } = req.body;

    // Create and save the payment
    const payment = new Payment({
      customerId,
      movieId,
      seatsBooked,
      timeSlot,
      date,
      paymentDetails,
      amountPaid,
    });

    await payment.save();
    res.status(201).json({ message: 'Payment added successfully', payment });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add payment', error: error.message });
  }
});

// Get All Payments
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('customerId', 'firstName lastName email') // Populate customer details
      .populate('movieId', 'title'); // Populate movie details

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
  }
});

// Get Payments by Customer ID
router.get('/customer/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const payments = await Payment.find({ customerId: id })
      .populate('movieId', 'title') // Populate movie details
      .sort({ paymentDate: -1 });

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
  }
});

module.exports = router;
