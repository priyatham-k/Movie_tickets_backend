const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const customerRoutes = require("./routes/customerRoutes"); // Adjust the path as needed
const adminRoutes = require("./routes/adminRoutes");
const movieRoutes = require("./routes/movieRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const screenRoutes = require("./routes/screenRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from this origin
  })
);

// Set payload size limits to prevent PayloadTooLargeError
app.use(bodyParser.json({ limit: "50mb" })); // For JSON payloads
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true })); // For form-urlencoded payloads

// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/Movie_Tickets", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // Exit process if the database connection fails
  });

app.use("/api/customer", customerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/movieRoutes", movieRoutes);
app.use("/api/screenRoutes", screenRoutes);
app.use("/api", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/schedule", scheduleRoutes);
// Global Error Handling Middleware
app.use((err, req, res, next) => {
  if (err.type === "entity.too.large") {
    res
      .status(413)
      .send({ message: "Payload too large. Please reduce the size." });
  } else {
    console.error("Unhandled Error:", err.message);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Start the Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
