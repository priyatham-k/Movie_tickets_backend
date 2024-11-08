// backend/server.js

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const customerRoutes = require("./routes/customerRoutes"); // Adjust the path as needed
const adminRoutes = require("./routes/adminRoutes");
const movieRoutes = require("./routes/movieRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from this origin
  })
);
app.use(bodyParser.json());
// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/Movie_Tickets", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));
// Routes
app.use("/api/customer", customerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/movieRoutes", movieRoutes);
app.use("/api", bookingRoutes);
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
