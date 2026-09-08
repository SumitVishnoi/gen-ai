import express from "express"
import runGraph from "./services/graph.ai.js"

const app = express()

app.get("/", async (req, res)=> {
   const result = await runGraph("write a program to reverse the linked list")
   return result

})

export default app;