import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { generateChatResponse } from "../services/ai.graph.js";
import { generateChatTitle } from "../services/ai.models.js";
import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";
import mongoose from "mongoose";

// Initialize these once at module level, not per request.
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
  outputDimensionality: 1024,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const pineconeIndex = pinecone.index("chatbot");

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
});

export const sendMessage = async (req, res) => {
  let parser;

  try {
    const userId = req.user._id;
    const body = req.body || {};
    const message =
      typeof body.message === "string" ? body.message.trim() : "";
    const includeCitations = body.includeCitations !== "false";
    const requestedChatId = body.chatId || body.chat;
    const prompt = message || (req.file ? "Summarize this document." : "");

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Please provide a message or upload a PDF",
      });
    }

    if (requestedChatId && !mongoose.isValidObjectId(requestedChatId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat ID",
      });
    }

    if (
      req.file &&
      (req.file.mimetype !== "application/pdf" || !req.file.buffer?.length)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please upload a valid PDF file",
      });
    }

    let chunks = [];
    if (req.file) {
      parser = new PDFParse({
        data: Buffer.from(req.file.buffer),
      });

      let pdfResult;
      try {
        pdfResult = await parser.getText();
      } catch (error) {
        console.error("PDF parsing error:", error);
        return res.status(400).json({
          success: false,
          message: "Unable to read the uploaded PDF",
        });
      } finally {
        await parser.destroy();
        parser = null;
      }

      const extractedText = pdfResult.text?.trim();

      if (!extractedText) {
        return res.status(400).json({
          success: false,
          message: "No readable text found in the PDF",
        });
      }

      chunks = await textSplitter.splitText(extractedText);
      if (!chunks.length) {
        return res.status(400).json({
          success: false,
          message: "Could not generate text chunks from PDF",
        });
      }
    }

    // Validate the chat before processing the uploaded document.
    let chat;
    let title = null;

    if (requestedChatId) {
      chat = await chatModel.findOne({
        _id: requestedChatId,
        user: userId,
      });

      if (!chat) {
        return res.status(404).json({
          success: false,
          message: "Chat not found",
        });
      }
    } else {
      title = await generateChatTitle(
        req.file && !message ? `Uploaded document: ${req.file.originalname}` : prompt,
      );

      chat = await chatModel.create({
        user: userId,
        title,
      });
    }

    // Keep this chat's uploaded-document context available for follow-up turns.
    const documentId =
      chat.hasDocument || req.file ? String(chat._id) : null;

    if (req.file) {
      const vectors = await embeddings.embedDocuments(chunks);

      const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const records = chunks.map((chunk, i) => ({
        id: `${documentId}-${uploadId}-${i}`,
        values: vectors[i],
        metadata: {
          chatId: documentId,
          userId: String(userId),
          uploadId,
          chunkIndex: i,
          text: chunk,
          fileName: req.file.originalname,
        },
      }));

      // Upsert in batches to avoid excessively large requests.
      const batchSize = 100;

      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);

        await pineconeIndex.upsert(batch);
      }

      if (!chat.hasDocument) {
        chat.hasDocument = true;
        await chat.save();
      }
    }

    const chatMessages = await messageModel
      .find({ chat: chat._id })
      .sort({ createdAt: 1 });

    const messages = [
      ...chatMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: prompt },
    ];

    const result = await generateChatResponse({
      messages,
      documentId,
      userId: String(userId),
      includeCitations,
    });

    const userMessage = await messageModel.create({
      chat: chat._id,
      content: prompt,
      role: "user",
    });

    const aiMessage = await messageModel.create({
      chat: chat._id,
      content: result.response,
      role: "ai",
    });
    chat.updatedAt = new Date();
    await chat.save();

    return res.status(201).json({
      success: true,
      message: aiMessage,
      userMessage,
      title,
      chat,
      route: result.route,
    });
  } catch (error) {
    console.error("sendMessage error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process message",
    });
  } finally {
    // Ensure PDF parser resources are released on errors too.
    if (parser) {
      await parser.destroy().catch(() => {});
    }
  }
};

//get chats
export const getChats = async (req, res) => {
  try {
    const user = req.user._id;

    const chats = await chatModel.find({ user }).sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Chats fetched successfully",
      chats,
    });
  } catch (error) {
    console.error("getChats error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch chats",
    });
  }
};

// get messsages
export const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId } = req.params;

    if (!mongoose.isValidObjectId(chatId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat ID",
      });
    }

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

    const messages = await messageModel
      .find({ chat: chatId })
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      message: "Message fetched successfully",
      messages,
    });
  } catch (error) {
    console.error("getMessages error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch messages",
    });
  }
};

//delete chat
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!mongoose.isValidObjectId(chatId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat ID",
      });
    }

    const chat = await chatModel.findOne({
      _id: chatId,
      user: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    await messageModel.deleteMany({ chat: chat._id });
    await chatModel.deleteOne({ _id: chat._id, user: req.user._id });

    return res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (error) {
    console.error("deleteChat error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete chat",
    });
  }
};
