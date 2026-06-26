const express = require("express");
const router = express.Router();

const PlaceSuggestion = require("../models/PlaceSuggestion");
const User = require("../models/User");
const getBadge = require("../utils/badgeHelper");
const authMiddleware = require("../middleware/authMiddleware");


// ADD SUGGESTION

router.post("/", authMiddleware, async (req, res) => {

    try {

        const suggestion = await PlaceSuggestion.create({

            ...req.body,

            submittedBy: req.user.id

        });

        const user = await User.findById(req.user.id);
        if (user) {
            user.points += 5;
            user.badge = getBadge(user.points);
            await user.save();
        }

        res.status(201).json(suggestion);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});
// TOP RATED PLACES IN CITY
router.get("/top-rated/:city", async (req, res) => {

    try {

        const suggestions = await PlaceSuggestion.find({

            city: {
                $regex: req.params.city,
                $options: "i"
            }

        })
        .select("placeName ratingAverage")
        .sort({
            ratingAverage: -1,
            ratingCount: -1
        });

        res.status(200).json(suggestions);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

// TRENDING PLACES IN CITY
router.get("/trending/:city", async (req, res) => {

    try {

        const suggestions = await PlaceSuggestion.find({

            city: {
                $regex: req.params.city,
                $options: "i"
            }

        })
        .select(
            "placeName description ratingAverage upvotes downvotes trendingScore"
        )
        .sort({
            trendingScore: -1
        });

        res.status(200).json(suggestions);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

// GET SUGGESTIONS BY CITY

router.get("/:city", async (req, res) => {

    try {

        const suggestions = await PlaceSuggestion.find({

            city: {
                $regex: req.params.city,
                $options: "i"
            }

        })
        .select("placeName ratingAverage")
        .sort({
            ratingAverage: -1,
            ratingCount: -1
        });

        res.status(200).json(suggestions);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});
// UPVOTE SUGGESTION
router.post("/:id/upvote", authMiddleware, async (req, res) => {

    try {

        const suggestion = await PlaceSuggestion.findById(req.params.id);

        if (!suggestion) {
            return res.status(404).json({
                message: "Suggestion not found"
            });
        }

        const existingVote = suggestion.votes.find((vote) =>
            vote.userId.toString() === req.user.id
        );

        if (existingVote?.voteType === "upvote") {
            suggestion.upvotes -= 1;
            suggestion.score -= 1;
            suggestion.votes = suggestion.votes.filter(
                (vote) => vote.userId.toString() !== req.user.id
            );

            await suggestion.save();

            return res.status(200).json({
                message: "Upvote removed",
                upvotes: suggestion.upvotes,
                downvotes: suggestion.downvotes,
                score: suggestion.score,
                userVote: null
            });
        }

        if (existingVote?.voteType === "downvote") {
            suggestion.downvotes -= 1;
            suggestion.upvotes += 1;
            suggestion.score += 2;
            existingVote.voteType = "upvote";
        } else {
            suggestion.upvotes += 1;
            suggestion.score += 1;
            suggestion.votes.push({
                userId: req.user.id,
                voteType: "upvote"
            });
        }

        const owner = await User.findById(suggestion.submittedBy);
        if (owner) {
            owner.points += 1;
            owner.badge = getBadge(owner.points);
            await owner.save();
        }

        // Recalculate trending score after vote changes
        suggestion.trendingScore = (suggestion.ratingAverage * 10) + suggestion.upvotes - suggestion.downvotes;

        await suggestion.save();

        res.status(200).json({
            message: "Upvoted successfully",
            upvotes: suggestion.upvotes,
            downvotes: suggestion.downvotes,
            score: suggestion.score,
            userVote: "upvote"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// DOWNVOTE SUGGESTION

router.post("/:id/downvote", authMiddleware, async (req, res) => {

    try {

        const suggestion = await PlaceSuggestion.findById(req.params.id);

        if (!suggestion) {
            return res.status(404).json({
                message: "Suggestion not found"
            });
        }

        const existingVote = suggestion.votes.find((vote) =>
            vote.userId.toString() === req.user.id
        );

        if (existingVote?.voteType === "downvote") {
            suggestion.downvotes -= 1;
            suggestion.score += 1;
            suggestion.votes = suggestion.votes.filter(
                (vote) => vote.userId.toString() !== req.user.id
            );

            await suggestion.save();

            return res.status(200).json({
                message: "Downvote removed",
                upvotes: suggestion.upvotes,
                downvotes: suggestion.downvotes,
                score: suggestion.score,
                userVote: null
            });
        }

        if (existingVote?.voteType === "upvote") {
            suggestion.upvotes -= 1;
            suggestion.downvotes += 1;
            suggestion.score -= 2;
            existingVote.voteType = "downvote";
        } else {
            suggestion.downvotes += 1;
            suggestion.score -= 1;
            suggestion.votes.push({
                userId: req.user.id,
                voteType: "downvote"
            });
        }

        // Recalculate trending score after vote changes
        suggestion.trendingScore = (suggestion.ratingAverage * 10) + suggestion.upvotes - suggestion.downvotes;

        await suggestion.save();

        res.status(200).json({
            message: "Downvoted successfully",
            upvotes: suggestion.upvotes,
            downvotes: suggestion.downvotes,
            score: suggestion.score,
            userVote: "downvote"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

// REVIEW SUGGESTION
router.post("/:id/review", authMiddleware, async (req, res) => {

    try {

        const { rating, comment } = req.body;

        if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be a number between 1 and 5"
            });
        }

        const suggestion = await PlaceSuggestion.findById(req.params.id);

        if (!suggestion) {
            return res.status(404).json({
                message: "Suggestion not found"
            });
        }

        const existingReview = suggestion.reviews.find((review) =>
            review.userId.toString() === req.user.id
        );

        if (existingReview) {
            existingReview.rating = rating;
            existingReview.comment = comment || existingReview.comment;
            existingReview.createdAt = Date.now();
        } else {
            suggestion.reviews.push({
                userId: req.user.id,
                rating,
                comment
            });
        }

        suggestion.ratingCount = suggestion.reviews.length;
        suggestion.ratingAverage = suggestion.reviews.reduce(
            (sum, review) => sum + review.rating,
            0
        ) / suggestion.ratingCount;

        if (req.body.rating === 5) {
            const owner = await User.findById(suggestion.submittedBy);
            if (owner) {
                owner.points += 2;
                owner.badge = getBadge(owner.points);
                await owner.save();
            }
        }

        // Update trending score after recalculating ratingAverage
        suggestion.trendingScore = (suggestion.ratingAverage * 10) + suggestion.upvotes - suggestion.downvotes;

        await suggestion.save();

        res.status(200).json({
            message: existingReview ? "Review updated successfully" : "Review added successfully",
            ratingAverage: suggestion.ratingAverage,
            ratingCount: suggestion.ratingCount,
            review: existingReview || suggestion.reviews[suggestion.reviews.length - 1]
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

// GET REVIEWS
router.get("/:id/reviews", async (req, res) => {

    try {

        const suggestion = await PlaceSuggestion.findById(req.params.id).select(
            "reviews ratingAverage ratingCount"
        );

        if (!suggestion) {
            return res.status(404).json({
                message: "Suggestion not found"
            });
        }

        const reviews = suggestion.reviews
            .slice()
            .sort((a, b) => b.createdAt - a.createdAt);

        res.status(200).json({
            ratingAverage: suggestion.ratingAverage,
            ratingCount: suggestion.ratingCount,
            reviews
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

// TOP HIDDEN GEMS

router.get("/top/:city", async (req, res) => {

    try {

        const suggestions = await PlaceSuggestion.find({

            city: {
                $regex: req.params.city,
                $options: "i"
            }

        })
        .select("placeName description category upvotes downvotes score")
        .sort({
            score: -1
        });

        res.status(200).json(suggestions);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

// TOP RATED PLACES IN CITY
router.get("/top-rated/:city", async (req, res) => {

    try {

        const suggestions = await PlaceSuggestion.find({
            city: {
                $regex: req.params.city,
                $options: "i"
            },
            ratingCount: { $gt: 0 }
        })
        .select("placeName description category upvotes downvotes score ratingAverage ratingCount")
        .sort({
            ratingAverage: -1,
            ratingCount: -1
        });

        res.status(200).json(suggestions);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

module.exports = router;