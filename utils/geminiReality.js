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
            return `Review ${index + 1}: ${review.comment || ""}`;
        })
        .join("\n");

    const prompt = `
You are analyzing real traveller reviews for a travel website.

Analyze ONLY the information present in these reviews.

Reviews:
${reviewText}

Extract the following:

1. bestTime
2. crowdLevel
3. photography
4. valueForMoney
5. accessibility
6. aiSummary

Allowed values:

crowdLevel:
- Low
- Moderate
- High
- Unknown

photography:
- Poor
- Average
- Good
- Excellent
- Unknown

valueForMoney:
- Poor
- Average
- Good
- Excellent
- Unknown

accessibility:
- Difficult
- Limited
- Good
- Excellent
- Unknown

For bestTime:
- Give a short description such as "Early morning", "Evening", "Weekdays", etc.
- If there is not enough evidence, return "Not enough data".

Important:
- Do not invent information.
- Do not assume something that is not mentioned.
- If the reviews do not provide enough evidence for an attribute, use "Unknown".
- The summary must be based only on the reviews.

Return ONLY valid JSON in this exact format:

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