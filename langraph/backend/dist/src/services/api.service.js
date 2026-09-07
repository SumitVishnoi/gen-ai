import { ChatGoogle } from "@langchain/google";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatCohere } from "@langchain/cohere";
import config from "../config/config.js";
export const geminiModel = new ChatGoogle({
    apiKey: config.GOOGLE_API_KEY,
    model: "gemini-latest-flash",
});
export const mistralModel = new ChatMistralAI({
    model: "mistral-medium-latest",
});
export const cohereModel = new ChatCohere({
    model: "command-a-plus-05-2026"
});
//# sourceMappingURL=api.service.js.map