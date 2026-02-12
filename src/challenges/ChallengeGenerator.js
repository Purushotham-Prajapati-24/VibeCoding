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

const PLANETS = [
  { name: "Earth", g: 9.81, context: "a standard field" },
  { name: "Mars", g: 3.71, context: "a dusty red canyon" },
  { name: "Moon", g: 1.62, context: "a lunar crater" },
  { name: "Jupiter", g: 24.79, context: "a high-gravity training chamber" },
  { name: "Triton", g: 0.78, context: "an ice cryovolcano" }
];

const SCENARIOS = [
  "clear a gap of",
  "hit a target at",
  "deliver a package to a base at",
  "launch a probe to a sensor at"
];

const generateMockChallenge = () => {
  // 1. Randomize Environment
  const planet = PLANETS[Math.floor(Math.random() * PLANETS.length)];
  const distance = 50 + Math.floor(Math.random() * 200); // 50m to 250m
  const scenarioAction = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];

  // 2. Physics Calculation (Reverse Engineering)
  // We want a solvable problem. Let's pick a logical 45 degree shot for max range logic
  // Range = (v^2 * sin(2theta)) / g
  // Let's fix 45 degrees as the 'optimal' answer for distance optimization questions
  // So required v0 = sqrt(distance * g)

  const requiredV0 = Math.sqrt(distance * planet.g);
  const v0Display = Math.round(requiredV0);

  // 3. Construct the "AI" Response
  return {
    title: `${planet.name} ${scenarioAction.split(' ')[0]} Mission`,
    scenario: `You are on ${planet.name} (${planet.g} m/s²). You need to ${scenarioAction} ${distance}m away. precise calculation is required.`,
    planet: planet.name,
    gravity: planet.g,
    targetDistance: distance,
    constraints: { v0_min: 10, v0_max: 100, angle_min: 0, angle_max: 90 },
    question: `To hit exactly ${distance}m with a launch speed of ${v0Display} m/s, what implies the optimal launch angle for maximum efficiency?`,
    options: [
      { id: "A", text: "30 degrees", correct: false },
      { id: "B", text: "45 degrees", correct: true }, // Simplified logic for mock
      { id: "C", text: "60 degrees", correct: false }
    ],
    hint: `Remember that 45° yields the maximum range in a vacuum interaction.`
  };
};

export const generateChallenge = async (difficulty = 'intermediate') => {
  if (MOCK_MODE) {
    console.log("Generating Dynamic Mock Challenge...");
    return new Promise(resolve => setTimeout(() => resolve(generateMockChallenge()), 800));
  }

  try {
    // Add timestamp to force unique generation
    const seed = Date.now();
    const prompt = `Generate a unique ${difficulty} level projectile physics challenge. Random Seed: ${seed}. Vary the planet and constraints.`;

    const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch (e) {
    console.error("Gemini Generation Failed (Falling back to dynamic mock):", e);
    return generateMockChallenge();
  }
};
