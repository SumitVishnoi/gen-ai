import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";

import { tool } from "@langchain/core/tools";
import { ChatGoogle } from "@langchain/google";
import { TavilySearch } from "@langchain/tavily";
import { z } from "zod";

import {
  StateGraph,
  MessagesAnnotation,
  START,
  END,
} from "@langchain/langgraph";

import { ToolNode } from "@langchain/langgraph/prebuilt";
import { geminiModel } from "./ai.models.js";


// 2. Define the internet search tool
const tavilySearch = new TavilySearch({
  maxResults: 5,
  tavilyApiKey: process.env.TAVILY_API_KEY
});

const searchInternet = tool(
  async ({ query }) => {
    return await tavilySearch.invoke({ query });
  },
  {
    name: "searchInternet",
    description:
      "Search the internet for current information, recent events, " +
      "or facts that need verification.",
    schema: z.object({
      query: z.string().describe("The search query"),
    }),
  }
);

// 3. Bind the tool to Gemini
const modelWithTools = geminiModel.bindTools([
  searchInternet,
]);

// 4. Define the system prompt
const systemMessage = new SystemMessage(`
  You are a helpful and precise assistant.

  If you don't know the answer, say so.
  For questions requiring current or up-to-date information,
  use the searchInternet tool before answering.

  After receiving search results, answer the user's question
  using relevant information from those results.
`);

// 5. Create the only LLM node
async function generateResponse(state) {
  const response = await modelWithTools.invoke([
    systemMessage,
    ...state.messages,
  ]);

  return {
    messages: [response],
  };
}

// 6. Create the search tool node
const internetSearchNode = new ToolNode([
  searchInternet,
]);

// 7. Conditional routing
function routeAfterResponse(state) {
  const lastMessage =
    state.messages[state.messages.length - 1];

  if (lastMessage.tool_calls?.length > 0) {
    return "internetSearch";
  }

  return END;
}

// 8. Build the graph
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("generateResponse", generateResponse)
  .addNode("internetSearch", internetSearchNode)

  .addEdge(START, "generateResponse")

  .addConditionalEdges("generateResponse", routeAfterResponse, {
    internetSearch: "internetSearch",
    [END]: END,
  })

  .addEdge("internetSearch", "generateResponse");

// 9. Compile
export const chatbotGraph = workflow.compile();

// 10. Public function for your existing backend
export async function generateChatResponse(messages) {
  const formattedMessages = messages
    .map((msg) => {
      if (msg.role === "user") {
        return new HumanMessage(msg.content);
      }

      if (msg.role === "ai") {
        return new AIMessage(msg.content);
      }

      return null;
    })
    .filter(Boolean);

  const result = await chatbotGraph.invoke({
    messages: formattedMessages,
  });

  return result.messages[result.messages.length - 1].text;
}