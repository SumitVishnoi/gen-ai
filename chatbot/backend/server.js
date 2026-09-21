import "dotenv/config"
import app from "./src/app.js"
import http from "http"
import { Server } from "socket.io"
import { initSocket } from "./src/socket/initSocket.js";
import connectDB from "./src/config/db.js";
import { geminiModel } from "./src/services/ai.models.js";
import { HumanMessage } from "@langchain/core/messages";


connectDB()
const server = http.createServer(app);

initSocket(server)

const messages = [];

//ai
messages.push(
    new HumanMessage("what is the capital of Rajasthan?")
)
const result = await geminiModel.invoke(messages);
messages.push(result.content)

console.log(...messages)

server.listen(3000, ()=> {
    console.log("server is running on port 3000")
})