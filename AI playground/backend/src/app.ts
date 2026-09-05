import express from 'express';
import userMessage from "./services/graph.ai.service.js"

const app = express();
app.use(express.json())

app.post("/use-graph", async (req, res) => {
    await userMessage("write code for sliding window pattern in DSA ?")
})





export default app;