const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const destinationRoutes =require("./routes/destinationRoutes");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Health route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/trips", require("./routes/tripRoutes"));
app.use("/api/cities", require("./routes/cityRoutes"));
app.use("/api/suggestions", require("./routes/suggestionRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use( "/api/destinations",destinationRoutes);

// Community Travel Tips
app.use(
  "/api/travel-tips",
  require("./routes/travelTipRoutes")
);

const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error(
    "Error: MONGO_URI not set in environment. Create a .env file or set MONGO_URI."
  );

  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });