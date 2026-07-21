const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    tip: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TravelTip",
        required: true
    },

    voteType: {
        type: String,
        enum: ["upvote", "downvote"],
        required: true
    }

});

voteSchema.index(
    {
        user: 1,
        tip: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model("Vote", voteSchema);