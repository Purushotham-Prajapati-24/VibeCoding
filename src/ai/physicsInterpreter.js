import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
let genAI = null;
let model = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
}

// System prompt for physics extraction
const SYSTEM_PROMPT = `
You are a precise physics problem interpreter. 
Extract the following parameters from the natural language input:
- velocity (in m/s)
- angle (in degrees)
- gravity (value in m/s^2) - Detect "Mars", "Moon", "Jupiter", or default to Earth (9.81)
- objectType (string) - What is being thrown?

Respond ONLY with valid JSON. No markdown formatting.
Schema:
{
  "velocity": number,
  "angle": number,
  "gravity": number,
  "planet": "Earth" | "Mars" | "Moon" | "Jupiter",
  "object": string
}
`;

/**
 * Parses natural language input to extract physics parameters.
 * @param {string} text - User's physics problem (e.g., "Launch a ball at 50 m/s on Mars")
 * @returns {Promise<object>} - Extracted parameters
 */
export const parsePhysicsProblem = async (text) => {
    // 1. Mock Mode (if no API key)
    if (!API_KEY) {
        console.warn("Gemini API Key missing. Using Mock Interpreter.");
        return mockParse(text);
    }

    try {
        // 2. Real Gemini Call
        const result = await model.generateContent([
            SYSTEM_PROMPT,
            `Input: "${text}"`
        ]);
        const response = await result.response;
        const jsonString = response.text().replace(/```json|```/g, '').trim();
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Gemini Interpretation Failed:", error);
        // Fallback to mock/regex if AI fails
        return mockParse(text);
    }
};

// Fallback / Mock Logic using Regex
const mockParse = (text) => {
    const lower = text.toLowerCase();

    // Velocity
    const velMatch = text.match(/(\\d+)\\s*(m\/s|km\/h|mph)/i) || text.match(/(\\d+)\\s*velocity/i);
    let velocity = velMatch ? parseFloat(velMatch[1]) : 20; // default

    // Angle
    const angleMatch = text.match(/(\\d+)\\s*(degree|deg|°)/i);
    let angle = angleMatch ? parseFloat(angleMatch[1]) : 45; // default

    // Planet
    let gravity = 9.81;
    let planet = "Earth";
    if (lower.includes("mars")) { gravity = 3.71; planet = "Mars"; }
    else if (lower.includes("moon")) { gravity = 1.62; planet = "Moon"; }
    else if (lower.includes("jupiter")) { gravity = 24.79; planet = "Jupiter"; }

    return {
        velocity,
        angle,
        gravity,
        planet,
        object: "ball"
    };
};
