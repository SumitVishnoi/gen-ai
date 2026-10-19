import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { generateChatResponse } from "../services/ai.graph.js";
import { generateChatTitle } from "../services/ai.models.js";
import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";

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
    console.log(userId);
    // Keep the existing frontend request format.
    const { message, chatId: requestedChatId, chat: legacyChatId } = req.body;

    const existingChatId = requestedChatId || legacyChatId;

    console.log("file fetched", req.file);

    if (!message?.trim() && !req.file) {
      return res.status(400).json({
        success: false,
        message: "Please provide a message or upload a PDF",
      });
    }

    // Validate the chat before processing the uploaded document.
    let chat;
    let title = null;

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
      const initialMessage =
        message?.trim() || `Uploaded document: ${req.file.originalname}`;
      title = await generateChatTitle(initialMessage);

      chat = await chatModel.create({
        user: userId,
        title,
      });
    }

    // Use the chat ID to isolate this document's vectors.
    const documentId = req.file ? String(chat._id) : null;

    // ------------------------------------------------
    // 1. Parse PDF directly from the in-memory buffer
    // ------------------------------------------------

    console.log("Uploaded file:", req.file?.originalname);
    console.log("MIME type:", req.file?.mimetype);
    console.log("Buffer exists:", !!req.file?.buffer);
    console.log("Buffer size:", req.file?.buffer?.length);

    if (req.file) {
      if (req.file.mimetype !== "application/pdf" || !req.file.buffer?.length) {
        return res.status(400).json({
          success: false,
          message: "Please upload a valid PDF file",
        });
      }

      parser = new PDFParse({
        data: Buffer.from(req.file.buffer),
      });

      const pdfResult = await parser.getText();
      const extractedText = pdfResult.text?.trim();

      console.log("file read", extractedText);

      await parser.destroy();
      parser = null;

      if (!extractedText) {
        return res.status(400).json({
          success: false,
          message: "No readable text found in the PDF",
        });
      }

      // -----------------------------------------------
      // 2. Split extracted text into smaller chunks
      // -----------------------------------------------

      const chunks = await textSplitter.splitText(extractedText);

      console.log("chunking done", chunks);

      if (!chunks.length) {
        return res.status(400).json({
          success: false,
          message: "Could not generate text chunks from PDF",
        });
      }

      // -----------------------------------------------
      // 3. Generate embeddings for every chunk
      // -----------------------------------------------
      const vectors = await embeddings.embedDocuments(chunks);

      // -----------------------------------------------
      // 4. Save vectors directly to Pinecone
      // -----------------------------------------------
      // IDs are unique per upload. Metadata lets RAG
      // retrieve only chunks belonging to this chat.
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

      console.log(records);

      // Upsert in batches to avoid excessively large requests.
      const batchSize = 100;

      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);

        await pineconeIndex.upsert(batch);

        console.log(`Upserted ${batch.length} vectors`);
      }

      console.log(`PDF processed: ${records.length} vectors saved to Pinecone`);
    }

    // -----------------------------------------------
    // 5. Save only the message in MongoDB
    // -----------------------------------------------
    // No file URL, PDF buffer, or file object is stored.
    if (message?.trim()) {
      await messageModel.create({
        chat: chat._id,
        content: message.trim(),
        role: "user",
      });
    }

    // -----------------------------------------------
    // 6. Load chat history
    // -----------------------------------------------
    const chatMessages = await messageModel
      .find({ chat: chat._id })
      .sort({ createdAt: 1 });

    const messages = chatMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // -----------------------------------------------
    // 7. Generate the response using your RAG pipeline
    // -----------------------------------------------
    const result = await generateChatResponse({
      messages,
      documentId,
      userId: String(userId),
    });

    // -----------------------------------------------
    // 8. Save AI response in MongoDB
    // -----------------------------------------------
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
