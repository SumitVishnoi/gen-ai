import {
  StateGraph,
  type GraphNode,
  StateSchema,
  START,
  END,
} from "@langchain/langgraph";
import { z } from "zod";
import { cohereModel, geminiModel } from "./model.ai.js";
import { createAgent, HumanMessage } from "langchain";

const state = new StateSchema({
  problem: z.string().default(""),
  solution_1: z.string().default(""),
  solution_2: z.string().default(""),
  judge: z.object({
    solution_1_score: z.number().default(0),
    solution_2_score: z.number().default(0),
    solution_1_reasoning: z.string().default(""),
    solution_2_reasoning: z.string().default(""),
  }),
});

const solutionNode: GraphNode<typeof state> = async (state) => {
  const [geminiResponse, cohereResponse] = await Promise.all([
    geminiModel.invoke(state.problem),
    cohereModel.invoke(state.problem),
  ]);

  return {
    solution_1: geminiResponse.text,
    solution_2: cohereResponse.text,
  };
};

const judgeNode: GraphNode<typeof state> = async (state) => {
  const { problem, solution_1, solution_2 } = state;

  const judge = createAgent({
    model: geminiModel,
    responseFormat: z.object({
      solution_1_score: z.number().min(0).max(10),
      solution_2_score: z.number().min(0).max(10),
      solution_1_reasoning: z.string(),
      solution_2_reasoning: z.string(),
    }),
  });

  const judgeResponse = await judge.invoke({
    messages: [
      new HumanMessage(`
                Problem: ${problem}
                Solution 1: ${solution_1}
                Solution 2: ${solution_2}
                Please evaluate the solutions and provide scores and reasoning.
                `),
    ],
  });

  const { solution_1_score, solution_2_score, solution_1_reasoning, solution_2_reasoning } = judgeResponse.structuredResponse

  return {
    judge: {
        solution_1_score,
        solution_2_score,
        solution_1_reasoning,
        solution_2_reasoning
    }
  }
};

const graph = new StateGraph(state)
  .addNode("solution", solutionNode)
  .addNode("jduge_edge", judgeNode)
  .addEdge(START, "solution")
  .addEdge("solution", "jduge_edge")
  .addEdge("jduge_edge", END)
  .compile();


export default async function (problem: string) {
    const result = await graph.invoke({
        problem: problem
    })

    return result
}