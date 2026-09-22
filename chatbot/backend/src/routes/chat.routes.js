import express from "express"
import { sendMessage } from "../controller/chat.controller.js"
import { authenticateUser } from "../middlewares/user.middleware.js"

const router = express.Router()

router.post("/send", authenticateUser, sendMessage)

export default router