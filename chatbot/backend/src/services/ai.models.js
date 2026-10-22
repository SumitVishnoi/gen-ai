import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGoogle } from "@langchain/google";

export const geminiModel = new ChatGoogle({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-3.5-flash-lite",
});

function buildFallbackTitle(message) {
  const cleaned = String(message ?? "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "New Chat";

  const words = cleaned.split(" ").slice(0, 4);
  return words.join(" ") || "New Chat";
}

export async function generateChatTitle(message) {
  if (!process.env.GOOGLE_API_KEY) {
    return buildFallbackTitle(message);
  }

  try {
    const response = await geminiModel.invoke([
      new SystemMessage(`
              You are a helpful assistant that generates concise and descriptive titles for chat conversations.
              
              User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words. The title should be clear, relevant, and engaging, giving users a quick understanding of the chat's topic.    
          `),
      new HumanMessage(`
              Generate a title for a chat conversation based on the following first message:
              "${message}"
              `),
    ]);

    return response.text || buildFallbackTitle(message);
  } catch (error) {
    console.warn("Chat title generation failed, using a fallback title.", error.message);
    return buildFallbackTitle(message);
  }
}
