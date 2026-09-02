import { ChatGoogle } from "@langchain/google";
import { ChatMistralAI } from "@langchain/mistralai"
import { ChatCohere } from "@langchain/cohere"
import config from "../config/config.js";

export const gemini = new ChatGoogle({
  apiKey: config.GOOGLE_API_KEY,
  model: "gemini-latest-flash",
});


export const mistral = new ChatMistralAI({
    model: "mistral-medium-latest",
})

export const cohere = new ChatCohere({
    model: "command-a-plus-05-2026"
})