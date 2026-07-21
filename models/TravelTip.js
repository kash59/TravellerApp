const mongoose = require("mongoose");

const travelTipSchema = new mongoose.Schema(
  {
    destination: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: [
        "Food",
        "Hidden Gem",
        "Hotel",
        "Safety",
        "Transport",
        "Shopping",
        "Other",
      ],
      default: "Other",
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    upvotes: {
      type: Number,
      default: 0,
    },

    downvotes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TravelTip", travelTipSchema);