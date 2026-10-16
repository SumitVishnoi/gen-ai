import express from "express"
import { deleteChat, getChats, getMessages, sendMessage } from "../controller/chat.controller.js"
import { authenticateUser } from "../middlewares/user.middleware.js"
import multer from "multer";

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const router = express.Router()

router.post("/message", authenticateUser,upload.single("file"), sendMessage)

router.get("/", authenticateUser, getChats)

router.get("/:chatId/messages", authenticateUser, getMessages)

router.delete("/delete/:chatId", authenticateUser, deleteChat)
export default router