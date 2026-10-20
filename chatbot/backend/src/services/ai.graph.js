
import "dotenv/config";

import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";

import {
  Annotation,
  MessagesAnnotation,
  StateGraph,
  START,
  END,
} from "@langchain/langgraph";

import { ChatGoogle } from "@langchain/google";
import { TavilySearch } from "@langchain/tavily";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import { z } from "zod";

// --------------------------------------------------
// 1. Models and integrations
// --------------------------------------------------

const decisionModel = new ChatGoogle({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-3.5-flash-lite",
  temperature: 0,
});

const responseModel = new ChatGoogle({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-3.5-flash-lite",
});

const tavilySearch = new TavilySearch({
  maxResults: 5,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const pineconeIndex = pinecone.index("chatbot");

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GOOGLE_API_KEY,
  model: "gemini-embedding-001",
  outputDimensionality: 1024,
});

// --------------------------------------------------
// 2. Validate environment variables
// --------------------------------------------------

if (!process.env.GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY is missing from environment variables.");
}

if (!process.env.PINECONE_API_KEY) {
  throw new Error("PINECONE_API_KEY is missing from environment variables.");
}

if (!process.env.TAVILY_API_KEY) {
  console.warn("TAVILY_API_KEY is missing. Internet search may fail.");
}

// --------------------------------------------------
// 3. Graph state
// --------------------------------------------------

const ChatState = Annotation.Root({
  ...MessagesAnnotation.spec,

  userMessage: Annotation({
    reducer: (_, next) => next,
    default: () => "",
  }),

  // This must be the MongoDB chat ID used in Pinecone metadata.
  documentId: Annotation({
    reducer: (_, next) => next,
    default: () => null,
  }),

  userId: Annotation({
    reducer: (_, next) => next,
    default: () => null,
  }),

  route: Annotation({
    reducer: (_, next) => next,
    default: () => "direct",
  }),

  webResults: Annotation({
    reducer: (_, next) => next,
    default: () => "",
  }),

  ragResults: Annotation({
    reducer: (_, next) => next,
    default: () => "",
  }),
});

// --------------------------------------------------
// 4. Routing model
// --------------------------------------------------

const routeSchema = z.object({
  route: z.enum(["direct", "web", "rag", "both"]),
});

const router = decisionModel.withStructuredOutput(routeSchema);

// --------------------------------------------------
// 5. Decision node
// --------------------------------------------------

async function decisionNode(state) {
  console.log("--- DECISION NODE EXECUTED ---");

  const hasDocument = Boolean(state.documentId);

  const conversationHistory = (state.messages ?? [])
    .slice(-8)
    .map((message) => {
      const role =
        message instanceof HumanMessage
          ? "User"
          : message instanceof AIMessage
            ? "Assistant"
            : "System";

      const content =
        typeof message.content === "string"
          ? message.content
          : JSON.stringify(message.content);

      return `${role}: ${content}`;
    })
    .join("\n");

  const routingPrompt = `
You are a routing assistant for a chatbot.

Choose exactly one route:
- direct: General questions answerable without web search or PDF retrieval.
- web: Questions requiring current internet information.
- rag: Questions that need information from the uploaded PDF.
- both: Questions requiring both PDF context and current internet information.

Document available: ${hasDocument ? "YES" : "NO"}

Latest user question:
${state.userMessage || "No user question provided"}

Recent conversation:
${conversationHistory || "No conversation history"}

Rules:
- If a document is available and the question depends on its contents, choose rag.
- Use conversation history to understand follow-up questions.
- Choose both when the answer needs the PDF and current web information.
- If no document is available, never choose rag or both.
- Otherwise, choose direct unless web search is needed.

Return a JSON object with one property named "route".
Example: {"route":"direct"}
`;

  if (!routingPrompt.trim()) {
    throw new Error("Routing prompt is empty.");
  }

  // Send the routing prompt as a HumanMessage.
  const decision = await router.invoke([
    new HumanMessage(routingPrompt),
  ]);

  let route = decision?.route;

  // Validate the returned route.
  const validRoutes = ["direct", "web", "rag", "both"];

  if (!validRoutes.includes(route)) {
    route = "direct";
  }

  // Never run PDF retrieval without an associated document.
  if (!hasDocument) {
    if (route === "rag") route = "direct";
    if (route === "both") route = "web";
  }

  console.log("Document available:", hasDocument);
  console.log("Selected route:", route);

  return { route };
}

// --------------------------------------------------
// 6. Internet search node
// --------------------------------------------------

async function internetSearchNode(state) {
  console.log("--- INTERNET SEARCH NODE EXECUTED ---");

  try {
    const searchResult = await tavilySearch.invoke({
      query: state.userMessage,
    });

    const webResults =
      typeof searchResult === "string"
        ? searchResult
        : JSON.stringify(searchResult);

    console.log("Internet search completed.");

    return { webResults };
  } catch (error) {
    console.error("Internet search error:", error.message);

    return {
      webResults:
        "Internet search failed. Do not invent search results.",
    };
  }
}

// --------------------------------------------------
// 7. RAG search node
//    Uses your existing Pinecone metadata:
//    chatId, userId, text, uploadId, chunkIndex, fileName
// --------------------------------------------------

async function ragSearchNode(state) {
  console.log("--- RAG NODE EXECUTED ---");

  const { documentId, userId, userMessage } = state;

  if (!documentId || !userId) {
    console.log("Document ID or user ID is missing.");

    return {
      ragResults: "",
    };
  }

  try {
    // Convert the user's question into an embedding.
    const queryVector = await embeddings.embedQuery(userMessage);

    // Search only within this user's current chat/document.
    const searchResult = await pineconeIndex.query({
      vector: queryVector,
      topK: 5,
      filter: {
        chatId: { $eq: String(documentId) },
        userId: { $eq: String(userId) },
      },
      includeMetadata: true,
    });

    const matches = searchResult.matches ?? [];

    console.log("Pinecone matches:", matches.length);

    const relevantChunks = matches
      .filter(
        (match) =>
          typeof match.metadata?.text === "string" &&
          match.metadata.text.trim().length > 0
      )
      .map((match) => ({
        text: match.metadata.text,
        score: match.score,
        fileName: match.metadata.fileName,
        chunkIndex: match.metadata.chunkIndex,
      }));

    if (relevantChunks.length === 0) {
      console.log("No matching PDF chunks found.");

      return {
        ragResults:
          "No relevant content could be retrieved from the uploaded document.",
      };
    }

    const ragResults = relevantChunks
      .map((chunk, index) => {
        return [
          `Chunk ${index + 1}`,
          `File: ${chunk.fileName ?? "Uploaded document"}`,
          `Chunk index: ${chunk.chunkIndex ?? "Unknown"}`,
          `Similarity score: ${chunk.score ?? "Unknown"}`,
          chunk.text,
        ].join("\n");
      })
      .join("\n\n--------------------\n\n");

    console.log("Retrieved PDF chunks:", relevantChunks.length);

    return { ragResults };
  } catch (error) {
    console.error("Pinecone RAG error:", error);

    return {
      ragResults:
        "PDF retrieval failed because of a search error. Do not invent document content.",
    };
  }
}

// --------------------------------------------------
// 8. Generate response node
// --------------------------------------------------

async function generateResponse(state) {
  console.log("--- GENERATE RESPONSE NODE EXECUTED ---");

  const hasRagContext = Boolean(state.ragResults.trim());
  const hasWebContext = Boolean(state.webResults.trim());

  const systemPrompt = `
You are a helpful AI assistant.

Follow these rules carefully:

1. Answer the user's latest question directly.
2. Use the conversation history to understand follow-up questions.
3. When PDF context is provided, use it as the source for document-related answers.
4. Do not claim that you read or retrieved information from a PDF unless
   relevant PDF context is actually provided.
5. If PDF retrieval reports that no relevant content was found, explain
   that the relevant information could not be retrieved. Do not fabricate
   PDF content.
6. When web search results are provided, use them for current information.
7. Do not invent facts, search results, citations, or document contents.
8. If the available context does not answer the question, be transparent.

Current route: ${state.route}

PDF context:
${hasRagContext ? state.ragResults : "No PDF context was retrieved."}

Internet search results:
${hasWebContext ? state.webResults : "No internet search results were provided."}
`;

  const response = await responseModel.invoke([
    new SystemMessage(systemPrompt),
    ...state.messages,
  ]);

  return {
    messages: [response],
  };
}

// --------------------------------------------------
// 9. Build graph
// --------------------------------------------------

const graphBuilder = new StateGraph(ChatState);

graphBuilder.addNode("decision", decisionNode);
graphBuilder.addNode("internetSearch", internetSearchNode);
graphBuilder.addNode("ragSearch", ragSearchNode);
graphBuilder.addNode("generateResponse", generateResponse);

graphBuilder.addEdge(START, "decision");

graphBuilder.addConditionalEdges(
  "decision",
  (state) => state.route,
  {
    direct: "generateResponse",
    web: "internetSearch",
    rag: "ragSearch",
    both: "internetSearch",
  }
);

// For "both", search the web first and then retrieve PDF content.
graphBuilder.addConditionalEdges(
  "internetSearch",
  (state) => (state.route === "both" ? "ragSearch" : "generateResponse"),
  {
    ragSearch: "ragSearch",
    generateResponse: "generateResponse",
  }
);

graphBuilder.addEdge("ragSearch", "generateResponse");
graphBuilder.addEdge("generateResponse", END);

export const chatbotGraph = graphBuilder.compile();

// --------------------------------------------------
// 10. Public function called by your controller
// --------------------------------------------------

export async function generateChatResponse({
  messages,
  documentId = null,
  userId = null,
}) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("At least one chat message is required.");
  }

  const formattedMessages = messages
    .map((message) => {
      if (!message || typeof message.content !== "string") {
        return null;
      }

      if (message.role === "user") {
        return new HumanMessage(message.content);
      }

      if (message.role === "assistant" || message.role === "ai") {
        return new AIMessage(message.content);
      }

      if (message.role === "system") {
        return new SystemMessage(message.content);
      }

      return null;
    })
    .filter(Boolean);

  const lastUserMessage = [...messages]
    .reverse()
    .find(
      (message) =>
        message?.role === "user" &&
        typeof message.content === "string" &&
        message.content.trim().length > 0
    );

  if (!lastUserMessage) {
    throw new Error("A user message is required.");
  }

  const result = await chatbotGraph.invoke({
    messages: formattedMessages,
    userMessage: lastUserMessage.content,
    documentId: documentId ? String(documentId) : null,
    userId: userId ? String(userId) : null,
  });

  const finalMessage = result.messages[result.messages.length - 1];

  const content = finalMessage?.content;

  const response =
    typeof content === "string"
      ? content
      : JSON.stringify(content ?? "");

  console.log("Final route:", result.route);
  console.log("AI response:", response);

  return {
    response,
    route: result.route,
  };
}
