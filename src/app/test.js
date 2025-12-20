import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY is not set in the environment variables");
}

console.log("OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

async function testModels() {
  try {
    const response = await openai.chat.completions.create({
      // model: "openai/gpt-4o-mini",
      model: "mistralai/devstral-2512:free",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Explain AI in 2 sentences." }
      ]
    });

    console.log("Response:", response.choices[0].message.content);

  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
  }
}

testModels();
