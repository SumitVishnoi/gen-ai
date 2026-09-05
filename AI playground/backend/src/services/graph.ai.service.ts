import {
  StateSchema,
  MessagesValue,
  type GraphNode,
  ReducedValue,
  StateGraph,
  START,
  END,
} from "@langchain/langgraph";
import { z } from "zod";
import { cohereModel, geminiModel, mistralAIModel } from "./model.ai.js";
import { HumanMessage, providerStrategy } from "langchain";
import { createAgent} from "langchain";

const State = new StateSchema({
  messages: MessagesValue,
  solution_1: new ReducedValue(z.string().default(""), {
    reducer: (current, next) => {
      return next;
    },
  }),
  solution_2: new ReducedValue(z.string().default(""), {
    reducer: (current, next) => {
      return next;
    },
  }),
  judge_recommendation: new ReducedValue(
    z
      .object({
        solution_1_score: z.number(),
        solution_2_score: z.number(),
      })
      .default({
        solution_1_score: 0,
        solution_2_score: 0,
      }),
    {
      reducer: (current, next) => {
        return next;
      },
    },
  ),
});

const solutionNode: GraphNode<typeof State> = async (state: typeof State) => {
  const [gemini, cohere_solution] = await Promise.all([
    geminiModel.invoke(state.messages[0].text),
    cohereModel.invoke(state.messages[0].text),
  ]);

  return {
    solution_1: gemini.text,
    solution_2: cohere_solution.text,
  };
};

const judgeNode: GraphNode<typeof State> = async (state: typeof State) => {
    
  const { solution_1, solution_2 } = state;

  console.log("Calling Mistral judge...");
console.log("Solution 1 length:", solution_1.length);
console.log("Solution 2 length:", solution_2.length);

  const judge = createAgent({
    model: mistralAIModel,
    tools: [],
    responseFormat: providerStrategy(
      z.object({
        solution_1_score: z.number().min(0).max(10),
        solution_2_score: z.number().min(0).max(10),
      }),
    ),
  });

  try {
  const judgeResponse = await judge.invoke({
    messages: [
      new HumanMessage(`
        You are a judge tasked with evaluating the quality of two solutions.

        Problem: ${state.messages[0].text}

        Solution 1: ${solution_1}

        Solution 2: ${solution_2}
      `),
    ],
  });

  console.log("Mistral response received");

  return {
    judge_recommendation: judgeResponse.structuredResponse,
  };

} catch (error) {
  console.error("MISTRAL ERROR:", error);
  throw error;
}

//   const result = judgeResponse.structuredResponse

//   return {
//     judge_recommendation: result
//   }
};

const graph = new StateGraph(State)
  .addNode("solution", solutionNode)
  .addNode("judge", judgeNode)
  .addEdge(START, "solution")
  .addEdge("solution", "judge")
  .addEdge("judge", END)
  .compile();

export default async function (userMessage: string) {
  const result = await graph.invoke({
    messages: [new HumanMessage(userMessage)],
  });

  console.log(result);
  return result.messages;
}
