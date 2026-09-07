import { StateGraph, type GraphNode, StateSchema, START} from "@langchain/langgraph";
import {z} from "zod"
import { cohereModel, geminiModel } from "./model.ai.js";


const state = new StateSchema({
    problem: z.string().default(""),
    solution_1: z.string().default(""),
    solution_2: z.string().default(""),
    judge: z.object({
        solution_1_score: z.number().default(0),
        solution_2_score: z.number().default(0),
        solution_1_reasoning: z.string().default(""),
        solution_2_reasoning: z.string().default(""),
    })
})

const solutionNode: GraphNode < typeof state > = async (state) => {
    const [geminiResponse, cohereResponse] = await Promise.all([
        geminiModel.invoke(state.problem),
        cohereModel.invoke(state.problem)
    ])

    return {
        solution_1: geminiResponse.text,
        solution_2: cohereResponse.text
    }
}

const graph = new StateGraph(state)
  .addNode("solution", solutionNode)
  .addEdge(START, "solution")
  .addEdge("solution", END)
  .compile();

