import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Mock mode if key is missing
const MOCK_MODE = !API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY || "mock_key");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

const SYSTEM_PROMPT = `
You are a Physics Challenge Generator. Create a unique, interesting projectile motion problem.
You must output VALID JSON only. No markdown formatting.
Schema:
{
  "title": "String (Campaign style title)",
  "scenario": "String (Short descriptive scenario)",
  "planet": "String (Earth, Mars, Moon, Jupiter)",
  "gravity": Number, // m/s^2
  "targetDistance": Number, // Expected range or specific target x
  "constraints": {
    "v0_min": Number,
    "v0_max": Number,
    "angle_min": Number,
    "angle_max": Number
  },
  "question": "String (The prediction question)",
  "options": [
    { "id": "A", "text": "String", "correct": Boolean },
    { "id": "B", "text": "String", "correct": Boolean },
    { "id": "C", "text": "String", "correct": Boolean }
  ],
  "hint": "String"
}
`;

const mockChallenge = () => ({
    title: "Martian Canyon Jump",
    scenario: "You need to clear a canyon on Mars. Gravity is 3.72 m/s². The canyon is 75m wide.",
    planet: "Mars",
    gravity: 3.72,
    targetDistance: 75,
    constraints: { v0_min: 10, v0_max: 30, angle_min: 0, angle_max: 90 },
    question: "To clear 75m with minimal speed, what angle is best?",
    options: [
        { id: "A", text: "30 degrees", correct: false },
        { id: "B", text: "45 degrees", correct: true },
        { id: "C", text: "60 degrees", correct: false }
    ],
    hint: "45 degrees provides the maximum range for a given speed in a vacuum."
});

export const generateChallenge = async (difficulty = 'intermediate') => {
    if (MOCK_MODE) {
        console.log("Generating Mock Challenge...");
        return new Promise(resolve => setTimeout(() => resolve(mockChallenge()), 1000));
    }

    try {
        const prompt = `Generate a ${difficulty} level projectile physics challenge.`;
        const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, '').trim();
        return JSON.parse(text);
    } catch (e) {
        console.error("Gemini Generation Failed:", e);
        return mockChallenge(); // Fallback
    }
};
