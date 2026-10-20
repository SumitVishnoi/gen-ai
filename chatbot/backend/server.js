import "dotenv/config"
import app from "./src/app.js"
import http from "http"
import { initSocket } from "./src/socket/initSocket.js";
import connectDB from "./src/config/db.js";


const server = http.createServer(app);

initSocket(server)

try {
    await connectDB();
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
        console.log(`server is running on port ${port}`);
    });
} catch (error) {
    console.error("Unable to start server:", error);
    process.exitCode = 1;
}