import { ChatGoogle } from "@langchain/google";

export const geminiModel = new ChatGoogle({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-3.5-flash"
});


