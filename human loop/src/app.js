import express from "express";
import { createAgent, tool, humanInTheLoopMiddleware } from "langchain";
import * as z from "zod";
import { ChatGoogle } from "@langchain/google";
import { MemorySaver } from "@langchain/langgraph";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

const app = express();
app.use(express.json());

/* ---------------- EMAIL DATA ---------------- */

const email = {
  messages: [
    // your existing emails...
  ],
};

/* ---------------- TOOLS ---------------- */

const getEmails = tool(
  () => {
    return JSON.stringify(email);
  },
  {
    name: "get_emails",
    description: "Get the emails from inbox",
  }
);

const refund = tool(
  ({ emails }) => {
    console.log("\n💰 Processing refunds...");
    console.log("Emails:", emails);

    return "Successfully refunded! ✅";
  },
  {
    name: "refund",
    description:
      "Process refunds for the specified email addresses. Call this when refund requests are found.",
    schema: z.object({
      emails: z
        .array(z.string())
        .describe("Email addresses whose refund should be processed"),
    }),
  }
);

/* ---------------- MODEL ---------------- */

const geminiModel = new ChatGoogle({
  model: "gemini-3.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
});

/* ---------------- AGENT ---------------- */

const agent = createAgent({
  model: geminiModel,

  tools: [getEmails, refund],

  middleware: [
    humanInTheLoopMiddleware({
      interruptOn: {
        refund: {
          allowedDecisions: ["approve", "reject"],
        },
      },
    }),
  ],

  checkpointer: new MemorySaver(),
});

/* ---------------- TERMINAL ---------------- */

const rl = readline.createInterface({
  input,
  output,
});

const threadId = "terminal-thread-1";

async function main() {
  console.log("🤖 Email Agent");
  console.log("Type your request below.\n");

  while (true) {
    const userQuery = await rl.question("You: ");

    if (!userQuery.trim()) {
      continue;
    }

    if (userQuery.toLowerCase() === "exit") {
      console.log("Goodbye 👋");
      break;
    }

    const result = await agent.invoke(
      {
        messages: [
          {
            role: "user",
            content: userQuery,
          },
        ],
      },
      {
        configurable: {
          thread_id: threadId,
        },
      }
    );

    /* ---------------- INTERRUPT ---------------- */

    if (result.__interrupt__) {
      console.log("\n" + "=".repeat(60));
      console.log("🛑 HUMAN APPROVAL REQUIRED");
      console.log("=".repeat(60));

      const interrupt = result.__interrupt__[0];

      console.log("\nInterrupt ID:");
      console.log(interrupt.id);

      console.log("\nInterrupt Data:");

      console.dir(interrupt.value, {
        depth: null,
        colors: true,
      });

      console.log("\n" + "-".repeat(60));

      const decision = await rl.question(
        "\nApprove or reject? (approve/reject): "
      );

      console.log("-".repeat(60));

      if (
        decision.toLowerCase() !== "approve" &&
        decision.toLowerCase() !== "reject"
      ) {
        console.log("❌ Invalid decision.");
        continue;
      }

      /*
       * Resume the interrupted agent here.
       *
       * Use the HITL resume command supported by
       * your installed LangChain version.
       */

      console.log(`\nHuman decision: ${decision}`);
    } else {
      const lastMessage =
        result.messages[result.messages.length - 1];

      console.log("\n🤖 Agent:", lastMessage.content);
    }

    console.log("\n");
  }

  rl.close();
}

main();

export default app;