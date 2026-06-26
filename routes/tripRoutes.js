const express = require("express");
const router = express.Router();

const Trip = require("../models/Trip");

const City = require("../models/City");

const PlaceSuggestion = require("../models/PlaceSuggestion");
const authMiddleware = require("../middleware/authMiddleware");

const { body, validationResult } = require("express-validator");

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ============================
// CREATE TRIP
// ============================

router.post(

  "/",

  authMiddleware,

  [

    body("title")
      .notEmpty()
      .withMessage("Title is required"),

    body("startDate")
      .isISO8601()
      .withMessage("startDate must be a valid ISO 8601 date"),

    body("endDate")
      .isISO8601()
      .withMessage("endDate must be a valid ISO 8601 date")
      .custom((value, { req }) => {
        if (req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
          throw new Error("endDate must be the same or after startDate");
        }
        return true;
      }),

    body("budget")
      .isNumeric()
      .withMessage("Budget must be a number"),

  ],

  async (req, res) => {

    try {

      // VALIDATION CHECK
      const errors = validationResult(req);

      if (!errors.isEmpty()) {

        return res.status(400).json({
          errors: errors.array()
        });

      }

      const tripPayload = {

        ...req.body,

      };

      if (!tripPayload.destination && tripPayload.city) {

        tripPayload.destination = tripPayload.city;

      }

      delete tripPayload.city;

      const trip = new Trip({

        ...tripPayload,

        userId: req.user.id

      });

      await trip.save();

      res.status(201).json({
        message: "Trip created successfully",
        trip
      });

    } catch (error) {

      res.status(500).json({
        message: error.message
      });

    }

  }

);


// ============================
// GET MY TRIPS
// ============================

router.get("/mytrips", authMiddleware, async (req, res) => {

  try {

    const trips = await Trip.find({
      userId: req.user.id
    });

    res.status(200).json(trips);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});
//serach trips by  destination 
router.get("/search", authMiddleware, async (req, res) => {

  try {

    const searchTerm = (req.query.city || req.query.destination || "").toString().trim();

    if (!searchTerm) {

      return res.status(400).json({
        message: "city or destination query parameter is required"
      });

    }

    const trips = await Trip.find({
      userId: req.user.id,
      destination: {
        $regex: new RegExp(escapeRegex(searchTerm), "i")
      }
    }).sort({ createdAt: -1 });

    res.status(200).json(trips);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});



/////
//filter trips by budget//
///////
router.get("/filter", authMiddleware, async (req, res) => {

  try {

    const min = Number(req.query.minBudget);
    const max = Number(req.query.maxBudget);

    const trips = await Trip.find({

      userId: req.user.id,

      budget: {
        $gte: min,
        $lte: max
      }

    });

    res.json(trips);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});
/////trips statistic dashboard///


router.get("/stats", authMiddleware, async (req, res) => {

  try {

    const trips = await Trip.find({
      userId: req.user.id
    });

    const totalTrips = trips.length;

    const totalBudget = trips.reduce(
      (sum, trip) => sum + trip.budget,
      0
    );

    res.json({
      totalTrips,
      totalBudget
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});
//Status Analtyics route
router.get("/analytics/status", authMiddleware, async (req, res) => {

    try {

        const trips = await Trip.find({
            userId: req.user.id
        });

        const planned = trips.filter(
            trip => trip.status === "planned"
        ).length;

        const ongoing = trips.filter(
            trip => trip.status === "ongoing"
        ).length;

        const completed = trips.filter(
            trip => trip.status === "completed"
        ).length;

        res.json({
            planned,
            ongoing,
            completed
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

// ⭐ ADD THIS HERE ⭐

// TRIP RECOMMENDATIONS
router.get("/:tripId/recommendations", authMiddleware, async (req, res) => {

    try {

        const trip = await Trip.findOne({
            _id: req.params.tripId,
            userId: req.user.id
        });

        if (!trip) {
            return res.status(404).json({
                message: "Trip not found"
            });
        }

        const city = await City.findOne({
            name: {
                $regex: trip.destination,
                $options: "i"
            }
        });

        if (!city) {
            return res.status(404).json({
                message: "No recommendations available"
            });
        }

        res.status(200).json({
            trip: trip.title,
            destination: trip.destination,
            recommendations: {
                hotels: city.hotels,
                places: city.places,
                foods: city.foods
            }
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});




// ============================
router.post(
  "/:tripId/save-suggestion/:suggestionId",
  authMiddleware,
  async (req, res) => {

    try {

      const trip = await Trip.findById(req.params.tripId);

      if (!trip) {
        return res.status(404).json({
          message: "Trip not found"
        });
      }

      const suggestion = await PlaceSuggestion.findById(
        req.params.suggestionId
      );

      if (!suggestion) {
        return res.status(404).json({
          message: "Suggestion not found"
        });
      }

      trip.savedSuggestions.push(
        req.params.suggestionId
      );

      await trip.save();

      res.status(200).json({
        message: "Suggestion saved to trip"
      });

    } catch (error) {

      res.status(500).json({
        message: error.message
      });

    }

});

// ============================
// GET SINGLE TRIP
// ============================

router.get("/:id", authMiddleware, async (req, res) => {

  try {

    const trip = await Trip.findById(req.params.id)
      .populate("savedSuggestions");

    if (!trip || trip.userId.toString() !== req.user.id) {

      return res.status(404).json({
        message: "Trip not found"
      });

    }

    res.status(200).json(trip);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


// ============================
// UPDATE TRIP
// ============================

router.put(

  "/:id",

  authMiddleware,

  [

    body("budget")
      .optional()
      .isNumeric()
      .withMessage("Budget must be a number")

  ,

    body("startDate")
      .optional()
      .isISO8601()
      .withMessage("startDate must be a valid ISO 8601 date"),

    body("endDate")
      .optional()
      .isISO8601()
      .withMessage("endDate must be a valid ISO 8601 date")
      .custom((value, { req }) => {
        if (req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
          throw new Error("endDate must be the same or after startDate");
        }
        return true;
      })

  ],

  async (req, res) => {

    try {

      // VALIDATION CHECK
      const errors = validationResult(req);

      if (!errors.isEmpty()) {

        return res.status(400).json({
          errors: errors.array()
        });

      }

      const updatedTrip = await Trip.findOneAndUpdate(

        {
          _id: req.params.id,
          userId: req.user.id
        },

        req.body,

        { new: true }

      );

      if (!updatedTrip) {

        return res.status(404).json({
          message: "Trip not found"
        });

      }

      res.status(200).json({
        message: "Trip updated successfully",
        trip: updatedTrip
      });

    } catch (error) {

      res.status(500).json({
        message: error.message
      });

    }

  }

);


// ============================
// DELETE TRIP
// ============================

router.delete("/:id", authMiddleware, async (req, res) => {

  try {

    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!trip) {

      return res.status(404).json({
        message: "Trip not found"
      });

    }

    await Trip.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Trip deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

});


module.exports = router;