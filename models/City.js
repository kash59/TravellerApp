const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },

        description: {
            type: String
        },

        // City center coordinates
        location: {
            latitude: {
                type: Number
            },
            longitude: {
                type: Number
            }
        },

        hotels: [
            {
                type: String
            }
        ],

        // Existing places - KEEP THIS
        places: [
            {
                type: String
            }
        ],

        // Coordinates for map attraction markers
        placeLocations: [
            {
                name: {
                    type: String,
                    required: true
                },

                latitude: {
                    type: Number,
                    required: true
                },

                longitude: {
                    type: Number,
                    required: true
                }
            }
        ],

        foods: [
            {
                type: String
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("City", citySchema);