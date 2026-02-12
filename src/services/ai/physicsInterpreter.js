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
Extract the following parameters from the natural language input.

You must output VALID JSON only. No markdown formatting.
Schema:
{
  "scenarioType": "projectile_motion" | "free_fall" | "incline_plane",
  "object": "string",
  "parameters": {
    "initialVelocity": number, // m/s
    "angle": number, // degrees
    "gravity": number // m/s^2
  },
  "environment": "Earth" | "Mars" | "Moon" | "Jupiter",
  "requestedOutputs": ["visualize", "maximum_height", "range", "time_of_flight"],
  "assumptions": ["string"], // e.g., "Assumed 45 degrees since angle not specified"
  "confidenceScore": number // 0.0 to 1.0
}
`;

/**
 * Parses natural language input to extract physics parameters.
 * @param {string} text - User's physics problem
 * @returns {Promise<object>} - Extracted parameters matching schema
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
        const textResponse = response.text();
        // Clean markdown code blocks if present
        const jsonString = textResponse.replace(/^```json\s*|\s*```$/g, '').trim();
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Gemini Interpretation Failed:", error);
        return mockParse(text);
    }
};

// Fallback / Mock Logic using Regex
const mockParse = (text) => {
    const lower = text.toLowerCase();

    // Velocity
    const velMatch = text.match(/(\d+)\s*(m\/s|km\/h|mph)/i) || text.match(/(\d+)\s*velocity/i);
    let initialVelocity = velMatch ? parseFloat(velMatch[1]) : 20;

    // Angle
    const angleMatch = text.match(/(\d+)\s*(degree|deg|°)/i);
    let angle = angleMatch ? parseFloat(angleMatch[1]) : 45;

    // Planet
    let gravity = 9.81;
    let environment = "Earth";
    if (lower.includes("mars")) { gravity = 3.71; environment = "Mars"; }
    else if (lower.includes("moon")) { gravity = 1.62; environment = "Moon"; }
    else if (lower.includes("jupiter")) { gravity = 24.79; environment = "Jupiter"; }

    return {
        scenarioType: "projectile_motion",
        object: "ball",
        parameters: {
            initialVelocity,
            angle,
            gravity
        },
        environment,
        requestedOutputs: ["visualize"],
        assumptions: !angleMatch ? ["Assumed 45 degrees since angle not specified"] : [],
        confidenceScore: 0.85
    };
};
