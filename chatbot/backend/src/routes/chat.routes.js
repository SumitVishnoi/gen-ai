import express from "express"
import { deleteChat, getChats, getMessages, sendMessage } from "../controller/chat.controller.js"
import { authenticateUser } from "../middlewares/user.middleware.js"
import multer from "multer";

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype !== "application/pdf") {
      return callback(new Error("Only PDF files are supported"));
    }
    callback(null, true);
  },
})

const router = express.Router()

const handlePdfUpload = (req, res, next) => {
  upload.single("file")(req, res, (error) => {
    if (!error) return next();

    const tooLarge = error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE";
    return res.status(tooLarge ? 413 : 400).json({
      success: false,
      message: tooLarge ? "PDF must be 10 MB or smaller" : error.message,
    });
  });
};

router.post("/message", authenticateUser, handlePdfUpload, sendMessage)

router.get("/", authenticateUser, getChats)

router.get("/:chatId/messages", authenticateUser, getMessages)

router.delete("/delete/:chatId", authenticateUser, deleteChat)
export default router