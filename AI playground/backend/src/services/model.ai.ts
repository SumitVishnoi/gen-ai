import { ChatGoogle } from "@langchain/google";
import { ChatCohere } from "@langchain/cohere";
import config from "../config/config.js";

export const geminiModel = new ChatGoogle({
  apiKey: config.GOOGLE_API_KEY,
  model: "gemini-3.5-flash",
});

export const cohereModel = new ChatCohere({
  apiKey: config.COHERE_API_KEY,
  model: "command-a-03-2025",
});
