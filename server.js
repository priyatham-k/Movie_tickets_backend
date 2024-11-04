// backend/server.js

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const theatreRoutes = require("./routes/theatre");
const cors = require("cors");
const app = express();
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from this origin
  })
);
app.use(bodyParser.json());
app.use("/api/user", authRoutes);
app.use("/api/theatre", theatreRoutes);
// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/Movie_Tickets", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
