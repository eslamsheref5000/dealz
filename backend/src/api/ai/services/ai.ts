
import { GoogleGenerativeAI } from '@google/generative-ai';

export default ({ strapi }) => ({
    async analyzeImage(imagePath: string, mimeType: string) {
        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

            const genAI = new GoogleGenerativeAI(apiKey);
            // Fallback logic for models
            const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro-vision"];
            let lastError;

            for (const modelName of modelsToTry) {
                try {
                    console.log(`Attempting analysis with model: ${modelName}`);
                    const model = genAI.getGenerativeModel({ model: modelName });

                    const prompt = `Analyze this product image for a classifieds app. 
                    Return ONLY a raw JSON object (no markdown, no backticks) with the following fields:
                    - title: A short, catchy title (max 50 chars).
                    - price: An estimated price in AED (just the number).
                    - category: The most likely category from this list: [Motors, Properties, Mobiles, Electronics, Furniture & Garden, Jobs, Services, Community, Pets, Fashion & Beauty, Hobbies, Sports & Kids].
                    - description: A sleek, professional description (max 200 chars).
                    
                    Example: {"title": "iPhone 14 Pro Max", "price": 3500, "category": "Mobiles", "description": "Pristine condition iPhone 14 Pro Max..."}`;

                    const imagePart = fileToGenerativePart(imagePath, mimeType);

                    const result = await model.generateContent([prompt, imagePart]);
                    const response = await result.response;
                    const text = response.text();

                    // Clean up markdown if Gemini adds it
                    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

                    return JSON.parse(cleanText);

                } catch (error: any) {
                    console.warn(`Model ${modelName} failed:`, error.message);
                    lastError = error;
                    // Continue to next model
                }
            }

            // If all failed
            throw lastError;
        } catch (error: any) {
            console.error("Gemini Analysis Error Full:", JSON.stringify(error, null, 2));
            const msg = error.message || "Unknown Gemini Error";

            // Check for specific Google API errors
            if (msg.includes("API key")) {
                throw new Error("Invalid or Missing API Key");
            }

            throw new Error(`AI Service Failed: ${msg}`);
        }
    },
});
