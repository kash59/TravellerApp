const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function analyzeReality(reviews) {

    if (!reviews || reviews.length === 0) {
        return {
            bestTime: "Not enough data",
            crowdLevel: "Unknown",
            photography: "Unknown",
            valueForMoney: "Unknown",
            accessibility: "Unknown",
            aiSummary: ""
        };
    }

   const reviewText = reviews
    .map((review, index) => {
        return `
Review ${index + 1}:
Rating: ${review.rating}/5
Comment: ${review.comment || "No written comment"}
`;
    })
    .join("\n");

   const prompt = `
You are an AI travel experience analyst for a travel website.

Your task is to analyze ONLY the traveller reviews provided below.

${reviewText}

Identify practical information that would help a future traveller decide how and when to visit this place.

Analyze these aspects:

1. bestTime
   - Identify the best time mentioned by travellers.
   - Examples: "Early morning", "Evening", "Weekdays", "Before 10 AM".
   - If the reviews do not provide enough evidence, return "Not enough data".

2. crowdLevel
   Allowed values:
   - Low
   - Moderate
   - High
   - Unknown

3. photography
   Allowed values:
   - Poor
   - Average
   - Good
   - Excellent
   - Unknown

4. valueForMoney
   Allowed values:
   - Poor
   - Average
   - Good
   - Excellent
   - Unknown

5. accessibility
   Allowed values:
   - Difficult
   - Limited
   - Good
   - Excellent
   - Unknown

6. aiSummary
   - Write a concise 2-3 sentence summary.
   - Summarize what travellers actually experienced.
   - Mention positive experiences as well as important warnings or drawbacks when present.
   - Do not simply repeat the reviews word-for-word.

IMPORTANT RULES:

- Use ONLY information explicitly supported by the reviews.
- Do NOT use outside knowledge.
- Do NOT invent facts.
- Do NOT assume information that is not mentioned.
- If there is insufficient evidence for an attribute, return "Unknown".
- Ratings alone should not be treated as evidence for crowd, accessibility, photography, or best time.
- Multiple reviews should be considered together.
- If travellers disagree, reflect the overall evidence rather than inventing certainty.

Return ONLY valid JSON.

Use exactly this structure:

{
  "bestTime": "",
  "crowdLevel": "",
  "photography": "",
  "valueForMoney": "",
  "accessibility": "",
  "aiSummary": ""
}
`;

    try {

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        let text = response.text.trim();

        // Remove markdown code fences if Gemini adds them
        text = text.replace(/^```json\s*/i, "");
        text = text.replace(/^```\s*/i, "");
        text = text.replace(/```$/i, "");

        return JSON.parse(text);

    } catch (error) {

        console.error("Gemini Reality Analysis Error:", error);

        return {
            bestTime: "Not enough data",
            crowdLevel: "Unknown",
            photography: "Unknown",
            valueForMoney: "Unknown",
            accessibility: "Unknown",
            aiSummary: ""
        };
    }
}

module.exports = analyzeReality;