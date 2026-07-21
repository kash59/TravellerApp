const express = require("express");
const router = express.Router();

const User = require("../models/User");
const TravelTip = require("../models/TravelTip");
const authMiddleware = require("../middleware/authMiddleware");


// ======================================================
// GET CURRENT USER PROFILE + CONTRIBUTION STATS
// GET /api/users/profile
// ======================================================

router.get(
    "/profile",
    authMiddleware,
    async (req, res) => {

        try {

            // Get logged-in user
            const user = await User.findById(
                req.user.id
            ).select("-password");

            if (!user) {

                return res.status(404).json({
                    message: "User not found"
                });

            }


            // Get all tips created by this user
            const tips = await TravelTip.find({
                author: req.user.id
            }).sort({
                createdAt: -1
            });


            // Calculate total upvotes received
            const totalUpvotes = tips.reduce(
                (total, tip) =>
                    total + (tip.upvotes || 0),
                0
            );


            // Calculate total downvotes received
            const totalDownvotes = tips.reduce(
                (total, tip) =>
                    total + (tip.downvotes || 0),
                0
            );


            // Calculate leaderboard rank

            const usersAbove = await User.countDocuments({
                points: {
                    $gt: user.points
                }
            });

            const rank = usersAbove + 1;


            // Send complete profile

            res.status(200).json({

                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    points: user.points,
                    badge: user.badge,
                    rank
                },

                stats: {
                    totalTips: tips.length,
                    totalUpvotes,
                    totalDownvotes
                },

                tips

            });

        } catch (error) {

            console.error(
                "Profile Error:",
                error
            );

            res.status(500).json({
                message:
                    "Unable to fetch user profile."
            });

        }

    }
);


// ======================================================
// LEADERBOARD
// GET /api/users/leaderboard
// ======================================================

router.get(
    "/leaderboard",
    async (req, res) => {

        try {

            const users = await User.find()
                .select(
                    "_id name points badge"
                )
                .sort({
                    points: -1
                })
                .limit(10);

            res.status(200).json(users);

        } catch (error) {

            console.error(
                "Leaderboard Error:",
                error
            );

            res.status(500).json({
                message: error.message
            });

        }

    }
);


module.exports = router;