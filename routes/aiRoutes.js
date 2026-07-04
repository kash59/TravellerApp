const express = require("express");
const router = express.Router();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

router.post("/itinerary", async (req, res) => {
  try {
    const { destination, budget, days } = req.body;

    const prompt = `
You are an expert travel planner.

Create a ${days}-day travel itinerary.

Destination: ${destination}
Budget: ₹${budget}

For each day include:
Morning
Afternoon
Evening
Recommended food

Keep it realistic and budget-friendly.
`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({
      itinerary: result.text,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to generate itinerary",
    });
  }
});

module.exports = router;