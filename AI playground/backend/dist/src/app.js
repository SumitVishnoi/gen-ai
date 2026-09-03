import express from "express";
import useGraph from "./services/graph.ai.service.js";
const app = express();
app.use(express.json());
app.post("/use-graph", async (req, res) => {
    await useGraph("What is the capital of India?");
});
export default app;
//# sourceMappingURL=app.js.map