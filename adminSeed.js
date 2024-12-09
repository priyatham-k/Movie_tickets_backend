const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("./models/Admin"); // Replace with the actual path to your Admin model

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/Movie_Tickets", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected for seeding admin");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
    process.exit(1); // Exit with error code
  });

// Seed admin data
const seedAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 10); // Change password as needed

    const admin = new Admin({
      name: "admin",
      email: "admin@gmail.com",
      password: hashedPassword, // Store hashed password
      role: "admin", // Explicitly specify the role
    });

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: admin.email });
    if (existingAdmin) {
      console.log("Admin user already exists. Skipping seeding.");
    } else {
      await admin.save();
      console.log("Admin user seeded successfully");
    }
  } catch (error) {
    console.error("Error seeding admin user:", error.message);
  } finally {
    mongoose.connection.close();
  }
};

// Execute the seeding function
seedAdmin();
