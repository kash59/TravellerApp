const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        unique: true
    },

    description: {
        type: String
    },

    hotels: [
        {
            type: String
        }
    ],

    places: [
        {
            type: String
        }
    ],

    foods: [
        {
            type: String
        }
    ]

}, {
    timestamps: true
});

module.exports = mongoose.model("City", citySchema);