const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const destinationRoutes = require("./routes/destinationRoutes");

dotenv.config();

const app = express();

// ==========================================
// CORS CONFIGURATION
// ==========================================

const allowedOrigins = [
  // Local frontend
  "http://localhost:3000",

  // Deployed Vercel frontend
  "https://traveller-app-steel.vercel.app",

  // Optional frontend URL from Render environment variables
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header
      // Example: Postman or server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked by CORS:", origin);

      return callback(
        new Error("Not allowed by CORS")
      );
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());

// ==========================================
// HEALTH ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Traveller Companion API is running",
  });
});

// ==========================================
// AUTH ROUTES
// ==========================================

app.use(
  "/api/auth",
  require("./routes/authRoutes")
);

// ==========================================
// TRIP ROUTES
// ==========================================

app.use(
  "/api/trips",
  require("./routes/tripRoutes")
);

// ==========================================
// CITY ROUTES
// ==========================================

app.use(
  "/api/cities",
  require("./routes/cityRoutes")
);

// ==========================================
// SUGGESTION ROUTES
// ==========================================

app.use(
  "/api/suggestions",
  require("./routes/suggestionRoutes")
);

// ==========================================
// USER ROUTES
// ==========================================

app.use(
  "/api/users",
  require("./routes/userRoutes")
);

// ==========================================
// AI ITINERARY ROUTES
// ==========================================

app.use(
  "/api/ai",
  require("./routes/aiRoutes")
);

// ==========================================
// DESTINATION ROUTES
// ==========================================

app.use(
  "/api/destinations",
  destinationRoutes
);

// ==========================================
// COMMUNITY TRAVEL TIPS ROUTES
// ==========================================

app.use(
  "/api/travel-tips",
  require("./routes/travelTipRoutes")
);

// ==========================================
// PORT
// ==========================================

const PORT = process.env.PORT || 5000;

// ==========================================
// DATABASE + SERVER
// ==========================================

if (!process.env.MONGO_URI) {
  console.error(
    "Error: MONGO_URI environment variable is not configured."
  );

  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("Allowed frontend origins:", allowedOrigins);
    });
  })
  .catch((error) => {
    console.error(
      "MongoDB connection error:",
      error
    );

    process.exit(1);
  });