const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");

// The "*-latest" aliases can point at models that spend a long time reasoning
// before answering. On serverless hosts (Vercel kills requests at 10-60s) that
// turns into a timeout page instead of JSON, which the browser then fails to
// parse. A pinned, non-thinking Flash-Lite model answers in a few seconds.
const MODEL_NAME = "gemini-3.5-flash-lite";

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];


export function getAiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel(
    {
      model: MODEL_NAME,
      generationConfig,
      safetySettings,
    },
    {
      // Abort before the route's maxDuration so the API can return a JSON
      // error message instead of the platform's HTML timeout page.
      timeout: 45000,
    }
  );
}
