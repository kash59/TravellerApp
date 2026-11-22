
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// Load environment variables before importing routes
dotenv.config();

// ==========================================
// ROUTE IMPORTS
// ==========================================

const destinationRoutes = require("./routes/destinationRoutes");
const authRoutes = require("./routes/authRoutes");
const tripRoutes = require("./routes/tripRoutes");
const cityRoutes = require("./routes/cityRoutes");
const suggestionRoutes = require("./routes/suggestionRoutes");
const userRoutes = require("./routes/userRoutes");
const aiRoutes = require("./routes/aiRoutes");
const travelTipRoutes = require("./routes/travelTipRoutes");

// ==========================================
// EXPRESS APP
// ==========================================

const app = express();

// ==========================================
// CORS CONFIGURATION
// ==========================================

const allowedOrigins = [
  "http://localhost:3000",
  "https://traveller-app-steel.vercel.app",

  ...(process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL
        .split(",")
        .map((origin) => origin.trim())
    : []),
].filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Allow requests without an Origin header
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked by CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
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
};

app.use(cors(corsOptions));

// ==========================================
// BODY PARSING MIDDLEWARE
// ==========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// DATABASE READINESS MIDDLEWARE
// ==========================================

const requireDatabase = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    console.log(
      "Database unavailable. Ready state:",
      mongoose.connection.readyState
    );

    return res.status(503).json({
      message:
        "Database unavailable. Check MongoDB connection settings.",
    });
  }

  next();
};

// ==========================================
// HEALTH CHECK ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Traveller Companion API is running",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

// ==========================================
// DATABASE MIDDLEWARE FOR API ROUTES
// ==========================================

app.use("/api", requireDatabase);

// ==========================================
// AUTH ROUTES
// ==========================================

app.use("/api/auth", authRoutes);

// ==========================================
// TRIP ROUTES
// ==========================================

app.use("/api/trips", tripRoutes);

// ==========================================
// CITY ROUTES
// ==========================================

app.use("/api/cities", cityRoutes);

// ==========================================
// SUGGESTION ROUTES
// ==========================================

app.use("/api/suggestions", suggestionRoutes);

// ==========================================
// USER ROUTES
// ==========================================

app.use("/api/users", userRoutes);

// ==========================================
// AI ITINERARY ROUTES
// ==========================================

app.use("/api/ai", aiRoutes);

// ==========================================
// DESTINATION ROUTES
// ==========================================

app.use("/api/destinations", destinationRoutes);

// ==========================================
// COMMUNITY TRAVEL TIPS ROUTES
// ==========================================

app.use("/api/travel-tips", travelTipRoutes);

// ==========================================
// 404 HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    message: "API route not found",
  });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((error, req, res, next) => {
  console.error("Server Error:", error.message);

  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({
      message: "Invalid JSON request body",
    });
  }

  if (error.message === "Not allowed by CORS") {
    return res.status(403).json({
      message: "CORS origin not allowed",
    });
  }

  return res.status(500).json({
    message: "Internal server error",
  });
});

// ==========================================
// DATABASE + SERVER STARTUP
// ==========================================

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Check MongoDB URI
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI environment variable is missing"
      );
    }

    console.log("Connecting to MongoDB...");

    // Connect to MongoDB before starting Express
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });

    console.log("MongoDB Connected Successfully");

    // Monitor future database disconnections
    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB Disconnected");
    });

    mongoose.connection.on("error", (error) => {
      console.error("MongoDB Error:", error.message);
    });

    // Start Express server only after DB connection
    app.listen(PORT, () => {
      console.log("--------------------------------");
      console.log("Traveller Companion Backend");
      console.log("--------------------------------");
      console.log(`Server running on port ${PORT}`);
      console.log("MongoDB Status: Connected");
      console.log("Allowed frontend origins:", allowedOrigins);
      console.log("--------------------------------");
    });

  } catch (error) {
    console.error("--------------------------------");
    console.error("APPLICATION STARTUP FAILED");
    console.error("--------------------------------");
    console.error(error.message);
    process.exit(1);
  }
}

// Start application
startServer();
