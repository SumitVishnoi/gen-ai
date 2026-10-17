import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { generateChatResponse } from "../services/ai.graph.js";
import { generateChatTitle } from "../services/ai.models.js";
import ImageKit, { toFile } from "@imagekit/nodejs";
import { PDFParse } from "pdf-parse";

const client = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

//send message
export const sendMessage = async (req, res) => {
  const userId = req.user._id;

  // Match the frontend's { chatId, message } format.
  const { message, chatId: requestedChatId, chat: legacyChatId } = req.body;

  console.log(req.file);

  if (req.file) {
    const uploadedFile = await client.files.upload({
      file: await toFile(Buffer.from(req.file.buffer), "file"),
      fileName: "fileName",
    });

    const queryId = requestedChatId || legacyChatId;

    const updatedMessage = await messageModel.findByIdAndUpdate(
      queryId,
      {
        $push: {
          files: {
            url: uploadedFile.url,
            fileName: req.file.originalname,
          },
        },
      },
      {
        new: true,
      },
    );

    if (updatedMessage?.files?.length > 0) {
      // Files is an array; get the latest file.
      const latestFile = updatedMessage.files[updatedMessage.files.length - 1];

      // Parse the actual PDF buffer, not the URL string.
      const parser = new PDFParse({
        data: Buffer.from(req.file.buffer),
      });

      try {
        const result = await parser.getText();
        console.log(result.text);
      } finally {
        await parser.destroy();
      }
    }

    const existingChatId = requestedChatId || legacyChatId;

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    let chat;
    let title = null;

    // Find the existing chat and verify ownership, or create a new one.
    if (existingChatId) {
      chat = await chatModel.findOne({
        _id: existingChatId,
        user: userId,
      });

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: "Chat not found",
        });
      }
    } else {
      title = await generateChatTitle(message.trim());

      chat = await chatModel.create({
        user: userId,
        title,
      });
    }

    // Save the user's message.
    await messageModel.create({
      chat: chat._id,
      content: message.trim(),
      role: "user",
    });

    // Fetch conversation history in chronological order.
    const chatMessages = await messageModel
      .find({ chat: chat._id })
      .sort({ createdAt: 1 });

    // Pass plain messages in the format expected by LangGraph.
    const messages = chatMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Keep RAG disabled until you supply a verified document ID.
    const result = await generateChatResponse({
      messages,
      documentId: null,
    });

    // LangGraph returns { response, route }, not a plain string.
    const aiMessage = await messageModel.create({
      chat: chat._id,
      content: result.response,
      role: "ai",
    });

    return res.status(201).json({
      success: true,
      message: aiMessage,
      title,
      chat,
      route: result.route,
    });
  }
};

//get chats
export const getChats = async (req, res) => {
  try {
    console.log(req.user._id);
    const user = req.user._id;

    const chats = await chatModel.find({
      user,
    });

    return res.status(200).json({
      success: true,
      message: "Chats fetched successfully",
      chats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// get messsages
export const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.params;

    const chat = await chatModel.findOne({
      _id: chatId,
      user: userId,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "chat not found",
      });
    }

    const messages = await messageModel.find({
      chat: chatId,
    });

    return res.status(200).json({
      success: true,
      message: "Message fetched successfully",
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//delete chat
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    await chatModel.findOneAndDelete({
      _id: chatId,
      user: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "chat not found",
      });
    }

    await messageModel.deleteMany({
      chat: chatId,
    });

    return res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
