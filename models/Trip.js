const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    destination: {
        type: String,
        required: true
    },

    startDate: {
        type: Date,
        required: true
    },

    endDate: {
        type: Date,
        required: true
    },

    budget: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["planned", "ongoing", "completed"],
         default: "planned"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    savedSuggestions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PlaceSuggestion"
        }
    ],
    itinerary: {
    type: String,
    default: ""
},

}, { timestamps: true });

module.exports = mongoose.model("Trip", tripSchema);