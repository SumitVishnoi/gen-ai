import { StateSchema, MessagesValue, ReducedValue, StateGraph, START, END, } from "@langchain/langgraph";
import { z } from "zod";
import { cohereModel, mistralModel } from "./api.service.js";
import { HumanMessage } from "@langchain/core/messages";
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
    judge_recommendation: new ReducedValue(z
        .object({
        solution_1_score: z.number(),
        solution_2_score: z.number(),
    })
        .default({
        solution_1_score: 0,
        solution_2_score: 0,
    }), {
        reducer: (current, next) => {
            return next;
        },
    }),
});
const solutionNode = async (state) => {
    const message = state.messages[0];
    if (!message) {
        throw new Error("No message provided");
    }
    const [mistralSolution, cohereSolution] = await Promise.all([
        mistralModel.invoke(message.content),
        cohereModel.invoke(message.content),
    ]);
    return {
        solution_1: typeof mistralSolution.content === "string"
            ? mistralSolution.content
            : JSON.stringify(mistralSolution.content),
        solution_2: typeof cohereSolution.content === "string"
            ? cohereSolution.content
            : JSON.stringify(cohereSolution.content),
    };
};
const graph = new StateGraph(State)
    .addNode("solution", solutionNode)
    .addEdge(START, "solution")
    .addEdge("solution", END)
    .compile();
export default async function (userMessage) {
    const result = await graph.invoke({
        messages: [new HumanMessage(userMessage)],
    });
    console.log(result);
    return {
        solution_1: result.solution_1,
        solution_2: result.solution_2
    };
}
//# sourceMappingURL=graph.ai.service.js.map