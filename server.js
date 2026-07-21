const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const destinationRoutes = require("./routes/destinationRoutes");

dotenv.config();

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:3000",
        process.env.FRONTEND_URL,
      ].filter(Boolean);

      // Allow requests without an Origin header
      // such as Postman and server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

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
// HEALTH ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Traveller Companion API is running",
  });
});

// ==========================================
// ROUTES
// ==========================================

app.use(
  "/api/auth",
  require("./routes/authRoutes")
);

app.use(
  "/api/trips",
  require("./routes/tripRoutes")
);

app.use(
  "/api/cities",
  require("./routes/cityRoutes")
);

app.use(
  "/api/suggestions",
  require("./routes/suggestionRoutes")
);

app.use(
  "/api/users",
  require("./routes/userRoutes")
);

app.use(
  "/api/ai",
  require("./routes/aiRoutes")
);

app.use(
  "/api/destinations",
  destinationRoutes
);

// Community Travel Tips

app.use(
  "/api/travel-tips",
  require("./routes/travelTipRoutes")
);

// ==========================================
// PORT
// ==========================================

const PORT =
  process.env.PORT || 5000;

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
    console.log(
      "MongoDB Connected"
    );

    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT}`
      );
    });
  })

  .catch((error) => {
    console.error(
      "MongoDB connection error:",
      error
    );

    process.exit(1);
  });