import express from "express";
import { createAgent, tool } from "langchain";
import * as z from "zod";
import { ChatGoogle } from "@langchain/google";

const app = express();
app.use(express.json());

const email = {
  messages: [
    {
      id: "173ijiod83j899933",
      threadId: "23iojdjj3892mdo5",
      labelIds: ["INBOX", "UNREAD"],
      snippet:
        "Hello team, I need to request a refund for the full stack course I bought 4 days ago. I am facing some financial difficulties and cannot continue...",
      payload: {
        headers: [
          { name: "From", value: "mike.chen@example.com" },
          { name: "To", value: "support@team.com" },
          {
            name: "Subject",
            value: "Course Refund Request - Order #CR-2025-1532",
          },
          { name: "Date", value: "Sat, 2 Nov 2025 09:15:00 +0000" },
        ],
        body: {
          data: "SGVDOAIOJN3UUnjnjfj78NJKNIYYni89ji89jyjk8kui89ioNu99k89ucj89jj893kjJioujdkjhi89HIhjIIOJIDOU",
        },
      },
      internalDate: "1730547000000",
    },

    {
      id: "173ijiod83j899934",
      threadId: "23iojdjj3892mdo6",
      labelIds: ["INBOX", "UNREAD"],
      snippet:
        "I purchased the React course last week but would like to request a refund. The course does not match what I expected...",
      payload: {
        headers: [
          { name: "From", value: "sarah.wilson@example.com" },
          { name: "To", value: "support@team.com" },
          {
            name: "Subject",
            value: "Refund Request for React Course - Order #RC-88421",
          },
          { name: "Date", value: "Sat, 2 Nov 2025 10:30:00 +0000" },
        ],
        body: {
          data: "UmVmdW5kIHJlcXVlc3QgZm9yIFJlYWN0IGNvdXJzZQ==",
        },
      },
      internalDate: "1730552400000",
    },

    {
      id: "173ijiod83j899935",
      threadId: "23iojdjj3892mdo7",
      labelIds: ["INBOX"],
      snippet:
        "I am unable to access the course videos after logging into my account. Could you please help me resolve this issue?",
      payload: {
        headers: [
          { name: "From", value: "john.doe@example.com" },
          { name: "To", value: "support@team.com" },
          { name: "Subject", value: "Unable to Access Course Videos" },
          { name: "Date", value: "Sat, 2 Nov 2025 11:05:00 +0000" },
        ],
        body: {
          data: "Q291cnNlIHZpZGVvcyBhcmUgbm90IGFjY2Vzc2libGU=",
        },
      },
      internalDate: "1730555100000",
    },

    {
      id: "173ijiod83j899936",
      threadId: "23iojdjj3892mdo8",
      labelIds: ["INBOX", "UNREAD"],
      snippet:
        "I was charged twice for the same course subscription. Please check the transaction and refund the duplicate payment...",
      payload: {
        headers: [
          { name: "From", value: "emily.johnson@example.com" },
          { name: "To", value: "billing@team.com" },
          {
            name: "Subject",
            value: "Duplicate Payment Charged - Order #PAY-48291",
          },
          { name: "Date", value: "Sat, 2 Nov 2025 12:20:00 +0000" },
        ],
        body: {
          data: "RHVwbGljYXRlIHBheW1lbnQgcmVmdW5kIHJlcXVlc3Q=",
        },
      },
      internalDate: "1730559600000",
    },

    {
      id: "173ijiod83j899937",
      threadId: "23iojdjj3892mdo9",
      labelIds: ["INBOX"],
      snippet:
        "I forgot my password and cannot log into my account. I have tried resetting it but I am not receiving the reset email...",
      payload: {
        headers: [
          { name: "From", value: "olivia.martin@example.com" },
          { name: "To", value: "support@team.com" },
          { name: "Subject", value: "Unable to Reset Password" },
          { name: "Date", value: "Sat, 2 Nov 2025 14:25:00 +0000" },
        ],
        body: {
          data: "UGFzc3dvcmQgcmVzZXQgaXNzdWU=",
        },
      },
      internalDate: "1730567100000",
    },
  ],
};

const getEmails = tool(() => {
    return JSON.stringify(email)
}, {
  name: "get_emails",
  description: "get the emails from inbox",
});

const refund = tool(({email}) => {
    return "successfully! ✅"
}, {
  name: "refund",
  description: "Process the refund for given emails",
  schema: z.object({
    emails: z.array(z.string()).describe("The list of the email which need to be refund")
  })
});

const geminiModel = new ChatGoogle({
    model: "gemini-3.5-flash",
    apiKey: process.env.GOOGLE_API_KEY
});

const agent = createAgent({ 
    model: geminiModel,
    tools: [getEmails, refund] 
});


const result = await agent.invoke({
    messages: [{ role: "user", content: "check there is any refund request, I want to refunds them" }],
})

console.log(result.messages[result.messages.length - 1].content);

export default app;
