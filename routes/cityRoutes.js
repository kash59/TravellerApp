const express = require("express");
const router = express.Router();

const City = require("../models/City");
const authMiddleware = require("../middleware/authMiddleware");


// ADD CITY

router.post("/", authMiddleware, async (req, res) => {

    try {

        const city = await City.create(req.body);

        res.status(201).json({
            message: "City added successfully",
            city
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// GET ALL CITIES

router.get("/", authMiddleware, async (req, res) => {

    try {

        const cities = await City.find();

        res.status(200).json(cities);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// GET CITY RECOMMENDATIONS

router.get("/recommendations", authMiddleware, async (req, res) => {

    try {

        const destination = req.query.destination;

        const city = await City.findOne({

            name: {
                $regex: destination,
                $options: "i"
            }

        });

        if (!city) {

            return res.status(404).json({
                message: "No recommendations found"
            });

        }

        res.status(200).json(city);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});
// ==========================================
// UPDATE CITY LOCATION
// PUT /api/cities/:cityName/location
// ==========================================

router.put(
    "/:cityName/location",
    authMiddleware,
    async (req, res) => {

        try {

            const { latitude, longitude } = req.body;

            if (
                latitude === undefined ||
                longitude === undefined
            ) {
                return res.status(400).json({
                    message:
                        "Latitude and longitude are required"
                });
            }

            const city = await City.findOneAndUpdate(
                {
                    name: {
                        $regex:
                            `^${req.params.cityName}$`,
                        $options: "i"
                    }
                },

                {
                    $set: {
                        location: {
                            latitude: Number(latitude),
                            longitude: Number(longitude)
                        }
                    }
                },

                {
                    new: true
                }
            );

            if (!city) {
                return res.status(404).json({
                    message: "City not found"
                });
            }

            res.status(200).json({
                message:
                    "City location updated successfully",
                city
            });

        } catch (error) {

            console.error(
                "Update City Location Error:",
                error
            );

            res.status(500).json({
                message:
                    "Unable to update city location"
            });

        }

    }
);
// ==========================================
// UPDATE PLACE LOCATIONS FOR A CITY
// PUT /api/cities/:cityName/place-locations
// ==========================================

router.put(
    "/:cityName/place-locations",
    authMiddleware,
    async (req, res) => {
        try {
            const { placeLocations } = req.body;

            // Validate array
            if (!Array.isArray(placeLocations)) {
                return res.status(400).json({
                    message: "placeLocations must be an array"
                });
            }

            // Validate every place
            for (const place of placeLocations) {
                if (
                    !place.name ||
                    place.latitude === undefined ||
                    place.longitude === undefined
                ) {
                    return res.status(400).json({
                        message:
                            "Each place must have name, latitude and longitude"
                    });
                }
            }

            const city = await City.findOneAndUpdate(
                {
                    name: {
                        $regex: `^${req.params.cityName}$`,
                        $options: "i"
                    }
                },
                {
                    $set: {
                        placeLocations: placeLocations.map((place) => ({
                            name: place.name,
                            latitude: Number(place.latitude),
                            longitude: Number(place.longitude)
                        }))
                    }
                },
                {
                    new: true,
                    runValidators: true
                }
            );

            if (!city) {
                return res.status(404).json({
                    message: "City not found"
                });
            }

            res.status(200).json({
                message: "Place locations updated successfully",
                city
            });

        } catch (error) {
            console.error(
                "Update Place Locations Error:",
                error
            );

            res.status(500).json({
                message: "Unable to update place locations"
            });
        }
    }
);
module.exports = router;