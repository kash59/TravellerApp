const express = require("express");
const router = express.Router();

const TravelTip = require("../models/TravelTip");
const Vote = require("../models/Vote");
const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");
const getBadge = require("../utils/badgeHelper");

// ==========================================
// CREATE COMMUNITY TRAVEL TIP
// ==========================================

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      destination,
      title,
      description,
      category,
    } = req.body;

    // Basic validation
    if (
      !destination?.trim() ||
      !title?.trim() ||
      !description?.trim()
    ) {
      return res.status(400).json({
        message:
          "Destination, title and description are required.",
      });
    }

    const allowedCategories = [
      "Food",
      "Hidden Gem",
      "Hotel",
      "Safety",
      "Transport",
      "Shopping",
      "Other",
    ];

    if (
      category &&
      !allowedCategories.includes(category)
    ) {
      return res.status(400).json({
        message: "Invalid category.",
      });
    }

    // Create tip
    const tip = await TravelTip.create({
      destination: destination.trim(),
      title: title.trim(),
      description: description.trim(),
      category: category || "Other",
      author: req.user.id,
    });

    // ======================================
    // REWARD AUTHOR: +10 POINTS
    // ======================================

    const user = await User.findById(req.user.id);

    if (user) {
      user.points = (user.points || 0) + 10;

      user.badge = getBadge(user.points);

      await user.save();
    }

    // Populate author for frontend
    const populatedTip =
      await TravelTip.findById(tip._id).populate(
        "author",
        "name badge points"
      );

    return res.status(201).json({
      message: "Travel tip shared successfully.",
      tip: populatedTip,
    });
  } catch (error) {
    console.error(
      "Create travel tip error:",
      error
    );

    return res.status(500).json({
      message: "Unable to create travel tip.",
    });
  }
});

// ==========================================
// GET COMMUNITY TIPS BY DESTINATION
//
// /api/travel-tips/Goa
// /api/travel-tips/Goa?sort=helpful
// /api/travel-tips/Goa?sort=newest
// ==========================================

router.get("/:destination", async (req, res) => {
  try {
    const destination =
      req.params.destination.trim();

    const sort = req.query.sort || "helpful";

    let sortOption;

    if (sort === "newest") {
      sortOption = {
        createdAt: -1,
      };
    } else if (sort === "upvoted") {
      sortOption = {
        upvotes: -1,
        createdAt: -1,
      };
    } else {
      // Most Helpful
      sortOption = {
        upvotes: -1,
        downvotes: 1,
        createdAt: -1,
      };
    }

    // Escape regex special characters
    const escapedDestination =
      destination.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

    const tips = await TravelTip.find({
      destination: {
        $regex: new RegExp(
          `^${escapedDestination}$`,
          "i"
        ),
      },
    })
      .populate(
        "author",
        "name badge points"
      )
      .sort(sortOption);

    return res.status(200).json(tips);
  } catch (error) {
    console.error(
      "Get travel tips error:",
      error
    );

    return res.status(500).json({
      message: "Unable to fetch travel tips.",
    });
  }
});

// ==========================================
// UPVOTE TRAVEL TIP
// ==========================================

router.post(
  "/:id/upvote",
  authMiddleware,
  async (req, res) => {
    try {
      const tip = await TravelTip.findById(
        req.params.id
      );

      if (!tip) {
        return res.status(404).json({
          message: "Travel tip not found.",
        });
      }

      const existingVote = await Vote.findOne({
        user: req.user.id,
        tip: tip._id,
      });

      // ======================================
      // ALREADY UPVOTED -> REMOVE UPVOTE
      // ======================================

      if (
        existingVote &&
        existingVote.voteType === "upvote"
      ) {
        await existingVote.deleteOne();

        tip.upvotes = Math.max(
          0,
          (tip.upvotes || 0) - 1
        );

        await tip.save();

        // Remove previously awarded point
        if (
          tip.author.toString() !== req.user.id
        ) {
          const owner = await User.findById(
            tip.author
          );

          if (owner) {
            owner.points = Math.max(
              0,
              (owner.points || 0) - 2
            );

            owner.badge = getBadge(
              owner.points
            );

            await owner.save();
          }
        }

        return res.status(200).json({
          message: "Upvote removed.",
          upvotes: tip.upvotes,
          downvotes: tip.downvotes || 0,
          userVote: null,
        });
      }

      // ======================================
      // CHANGE DOWNVOTE -> UPVOTE
      // ======================================

      if (
        existingVote &&
        existingVote.voteType === "downvote"
      ) {
        existingVote.voteType = "upvote";

        await existingVote.save();

        tip.downvotes = Math.max(
          0,
          (tip.downvotes || 0) - 1
        );

        tip.upvotes =
          (tip.upvotes || 0) + 1;

        await tip.save();

        // Reward author because an upvote
        // has now been added
        if (
          tip.author.toString() !== req.user.id
        ) {
          const owner = await User.findById(
            tip.author
          );

          if (owner) {
            owner.points =
              (owner.points || 0) + 2;

            owner.badge = getBadge(
              owner.points
            );

            await owner.save();
          }
        }

        return res.status(200).json({
          message: "Vote changed to upvote.",
          upvotes: tip.upvotes,
          downvotes: tip.downvotes,
          userVote: "upvote",
        });
      }

      // ======================================
      // FIRST UPVOTE
      // ======================================

      await Vote.create({
        user: req.user.id,
        tip: tip._id,
        voteType: "upvote",
      });

      tip.upvotes =
        (tip.upvotes || 0) + 1;

      await tip.save();

      // Reward tip author
      // Do not reward self-upvotes
      if (
        tip.author.toString() !== req.user.id
      ) {
        const owner = await User.findById(
          tip.author
        );

        if (owner) {
          owner.points =
            (owner.points || 0) + 2;

          owner.badge = getBadge(
            owner.points
          );

          await owner.save();
        }
      }

      return res.status(200).json({
        message: "Upvoted successfully.",
        upvotes: tip.upvotes,
        downvotes: tip.downvotes || 0,
        userVote: "upvote",
      });
    } catch (error) {
      console.error(
        "Travel tip upvote error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to upvote travel tip.",
      });
    }
  }
);

// ==========================================
// DOWNVOTE TRAVEL TIP
// ==========================================

router.post(
  "/:id/downvote",
  authMiddleware,
  async (req, res) => {
    try {
      const tip = await TravelTip.findById(
        req.params.id
      );

      if (!tip) {
        return res.status(404).json({
          message: "Travel tip not found.",
        });
      }

      const existingVote = await Vote.findOne({
        user: req.user.id,
        tip: tip._id,
      });

      // ======================================
      // ALREADY DOWNVOTED -> REMOVE
      // ======================================

      if (
        existingVote &&
        existingVote.voteType === "downvote"
      ) {
        await existingVote.deleteOne();

        tip.downvotes = Math.max(
          0,
          (tip.downvotes || 0) - 1
        );

        await tip.save();

        return res.status(200).json({
          message: "Downvote removed.",
          upvotes: tip.upvotes || 0,
          downvotes: tip.downvotes,
          userVote: null,
        });
      }

      // ======================================
      // CHANGE UPVOTE -> DOWNVOTE
      // ======================================

      if (
        existingVote &&
        existingVote.voteType === "upvote"
      ) {
        existingVote.voteType =
          "downvote";

        await existingVote.save();

        tip.upvotes = Math.max(
          0,
          (tip.upvotes || 0) - 1
        );

        tip.downvotes =
          (tip.downvotes || 0) + 1;

        await tip.save();

        // Remove point previously awarded
        // for the upvote
        if (
          tip.author.toString() !== req.user.id
        ) {
          const owner = await User.findById(
            tip.author
          );

          if (owner) {
            owner.points = Math.max(
              0,
              (owner.points || 0) - 2
            );

            owner.badge = getBadge(
              owner.points
            );

            await owner.save();
          }
        }

        return res.status(200).json({
          message:
            "Vote changed to downvote.",
          upvotes: tip.upvotes,
          downvotes: tip.downvotes,
          userVote: "downvote",
        });
      }

      // ======================================
      // FIRST DOWNVOTE
      // ======================================

      await Vote.create({
        user: req.user.id,
        tip: tip._id,
        voteType: "downvote",
      });

      tip.downvotes =
        (tip.downvotes || 0) + 1;

      await tip.save();

      // A normal downvote does NOT
      // subtract reputation points.

      return res.status(200).json({
        message: "Downvoted successfully.",
        upvotes: tip.upvotes || 0,
        downvotes: tip.downvotes,
        userVote: "downvote",
      });
    } catch (error) {
      console.error(
        "Travel tip downvote error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to downvote travel tip.",
      });
    }
  }
);

// ==========================================
// UPDATE OWN TRAVEL TIP
// ==========================================

router.put(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
      } = req.body;

      if (
        !title?.trim() ||
        !description?.trim()
      ) {
        return res.status(400).json({
          message:
            "Title and description are required.",
        });
      }

      const allowedCategories = [
        "Food",
        "Hidden Gem",
        "Hotel",
        "Safety",
        "Transport",
        "Shopping",
        "Other",
      ];

      if (
        category &&
        !allowedCategories.includes(category)
      ) {
        return res.status(400).json({
          message: "Invalid category.",
        });
      }

      const tip = await TravelTip.findById(
        req.params.id
      );

      if (!tip) {
        return res.status(404).json({
          message: "Travel tip not found.",
        });
      }

      // Only author can edit
      if (
        tip.author.toString() !== req.user.id
      ) {
        return res.status(403).json({
          message:
            "You can only edit your own travel tip.",
        });
      }

      tip.title = title.trim();

      tip.description =
        description.trim();

      if (category) {
        tip.category = category;
      }

      await tip.save();

      await tip.populate(
        "author",
        "name badge points"
      );

      return res.status(200).json({
        message:
          "Travel tip updated successfully.",
        tip,
      });
    } catch (error) {
      console.error(
        "Update travel tip error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to update travel tip.",
      });
    }
  }
);

// ==========================================
// DELETE OWN TRAVEL TIP
// ==========================================

router.delete(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const tip = await TravelTip.findById(
        req.params.id
      );

      if (!tip) {
        return res.status(404).json({
          message: "Travel tip not found.",
        });
      }

      // Only author can delete
      if (
        tip.author.toString() !== req.user.id
      ) {
        return res.status(403).json({
          message:
            "You can only delete your own travel tip.",
        });
      }

      // Delete votes associated with tip
      await Vote.deleteMany({
        tip: tip._id,
      });

      await tip.deleteOne();

      return res.status(200).json({
        message:
          "Travel tip deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete travel tip error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to delete travel tip.",
      });
    }
  }
);

module.exports = router;