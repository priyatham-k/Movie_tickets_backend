// backend/routes/auth.js
const express = require('express');
const Customer = require('../models/Customer');
const Manager = require('../models/Manager');
const Admin = require('../models/Admin');

const router = express.Router();

// Register for Customers, Managers, and Admins
router.post('/register/:role', async (req, res) => {
  const { role } = req.params;
  const { name, email, password, theatre } = req.body;

  try {
    if (role === 'customer') {
      const customer = new Customer({ name, email, password });
      await customer.save();
      return res.status(201).json(customer);
    } else if (role === 'manager') {
      const manager = new Manager({ name, email, password, theatre });
      await manager.save();
      return res.status(201).json(manager);
    } else if (role === 'admin') {
      const admin = new Admin({ name, email, password });
      await admin.save();
      return res.status(201).json(admin);
    } else {
      return res.status(400).json({ error: 'Invalid role' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login for Customers, Managers, and Admins
router.post('/login/:role', async (req, res) => {
  const { role } = req.params;
  const { email, password } = req.body;

  let user;
  try {
    if (role === 'customer') {
      user = await Customer.findOne({ email, password });
    } else if (role === 'manager') {
      user = await Manager.findOne({ email, password });
    } else if (role === 'admin') {
      user = await Admin.findOne({ email, password });
    } else {
      return res.status(400).json({ error: 'Invalid role' });
    }

    if (user) {
      return res.status(200).json({ message: 'Login successful', role, user });
    } else {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
