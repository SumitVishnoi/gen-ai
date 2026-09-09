import express from "express";
import runGraph from "./services/graph.ai.js";
import cors from "cors";

const app = express();
app.use(express.json());

app.use(cors({
   origin: "http://localhost:5173",
   methods: ["POST", "GET"],
   credentials: true
}))

app.get("/", async (req, res) => {
  const result = await runGraph("write a program to reverse the linked list");
  return result;
});

app.post("/invoke", async (req, res) => {
  const { input } = req.body;
  const result = await runGraph(input);

  res.status(200).json({
    message: "Graph executed successfully",
    success: true,
    result,
  });

});

export default app;
