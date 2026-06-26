const express = require("express");
const router = express.Router();

const User = require("../models/User");

router.get("/leaderboard", async (req, res) => {

    try {

        const users = await User.find()
            .select("_id name points badge")
            .sort({
                points: -1
            })
            .limit(10);

        res.json(users);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

module.exports = router;
