const mongoose = require("mongoose");

const placeSuggestionSchema = new mongoose.Schema({

    city: {
        type: String,
        required: true
    },

    placeName: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    category: {
        type: String,
        enum: ["Hidden Gem", "Food", "Nature", "Adventure", "Shopping"],
        default: "Hidden Gem"
    },

    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    upvotes: {
        type: Number,
        default: 0
    },

    downvotes: {
        type: Number,
        default: 0
    },

    score: {
        type: Number,
        default: 0
    },

    ratingAverage: {
        type: Number,
        default: 0
    },

    ratingCount: {
        type: Number,
        default: 0
    },

    trendingScore: {
        type: Number,
        default: 0
    },

    reality: {
    bestTime: {
        type: String,
        default: "Not enough data"
    },

    crowdLevel: {
        type: String,
        enum: ["Low", "Moderate", "High", "Unknown"],
        default: "Unknown"
    },

    photography: {
        type: String,
        enum: ["Poor", "Average", "Good", "Excellent", "Unknown"],
        default: "Unknown"
    },

    valueForMoney: {
        type: String,
        enum: ["Poor", "Average", "Good", "Excellent", "Unknown"],
        default: "Unknown"
    },

    accessibility: {
        type: String,
        enum: ["Difficult", "Limited", "Good", "Excellent", "Unknown"],
        default: "Unknown"
    },

    aiSummary: {
        type: String,
        default: ""
    }
},
    reviews: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            rating: {
                type: Number,
                min: 1,
                max: 5,
                required: true
            },
            comment: {
                type: String,
                trim: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],

    votes: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            voteType: {
                type: String,
                enum: ["upvote", "downvote"]
            }
        }
    ],
    

}, { timestamps: true });

module.exports = mongoose.model("PlaceSuggestion", placeSuggestionSchema);