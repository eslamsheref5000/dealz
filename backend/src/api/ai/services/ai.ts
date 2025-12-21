
import { GoogleGenAI } from "@google/genai";

export default ({ strapi }) => ({
    async analyzeImage(imagePath: string, mimeType: string) {
        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

            // Initialize new SDK Client
            const ai = new GoogleGenAI({ apiKey });

            // Optimized model list to handle Rate Limits (429) better.
            // prioritized Flash-Lite as it's often more efficient for limits.
            const modelsToTry = [
                "gemini-2.5-flash",          // Newest Stable
                "gemini-2.0-flash-lite-001", // Lightweight (Lower quota usage likely)
                "gemini-flash-latest",       // Generic alias
                "gemini-2.5-pro",            // Fallback High-Quality
                "gemini-2.0-flash-exp"       // Experimental Fallback
            ];

            let lastError;
            const fs = require('fs');

            for (const modelName of modelsToTry) {
                try {
                    console.log(`Attempting analysis with model: ${modelName} (New SDK)`);

                    const imageBase64 = fs.readFileSync(imagePath).toString("base64");

                    const prompt = `Analyze this product image for a classifieds app. 
                    Return ONLY a raw JSON object (no markdown, no backticks) with the following fields:
                    - title: A short, catchy title (max 50 chars).
                    - price: An estimated price in AED (just the number).
                    - category: The most likely category from this list: [Motors, Properties, Mobiles, Electronics, Furniture & Garden, Jobs, Services, Community, Pets, Fashion & Beauty, Hobbies, Sports & Kids].
                    - description: A sleek, professional description (max 200 chars).
                    
                    Example: {"title": "iPhone 14 Pro Max", "price": 3500, "category": "Mobiles", "description": "Pristine condition iPhone 14 Pro Max..."}`;

                    const response = await ai.models.generateContent({
                        model: modelName,
                        contents: [
                            {
                                role: "user",
                                parts: [
                                    { text: prompt },
                                    {
                                        inlineData: {
                                            mimeType: mimeType,
                                            data: imageBase64
                                        }
                                    }
                                ]
                            }
                        ]
                    });

                    const text = response.text;

                    if (!text) throw new Error("Empty response from AI");

                    // Clean up markdown if Gemini adds it
                    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

                    return JSON.parse(cleanText);

                } catch (error: any) {
                    console.warn(`Model ${modelName} failed:`, error.message);
                    lastError = error;

                    // If we hit a rate limit (429), maybe wait a second before trying the next model?
                    // But usually, all models share the quota on free tier. 
                    // We just continue hoping 'Lite' uses a different bucket.
                }
            }

            // If all failed
            console.error("All models failed. Last error: " + lastError?.message);
            throw new Error(`AI Analysis Failed (Quota/Error). Please try again in 1 minute. Details: ${lastError?.message}`);

        } catch (error: any) {
            console.error("Gemini Analysis Error Full:", JSON.stringify(error, null, 2));
            const msg = error.message || "Unknown Gemini Error";
            throw new Error(`AI Service Failed: ${msg}`);
        }
    },
});
