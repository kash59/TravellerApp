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

module.exports = router;