import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { generateChatTitle, generateResponse } from "../services/ai.models.js";

//send message
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId);
    const { message, chat: chatId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "content is required",
      });
    }

    let title = null;
    let chat = null;

    if (!chatId) {
       title = await generateChatTitle(message);
       chat = await chatModel.create({
        user: userId,
        title,
      });
    }

    const userMessage = await messageModel.create({
        chat: chatId || chat._id,
        content: message,
        role: "user"
    })

    const messages = await messageModel.find({chat: chatId || chat._id})
    
    const result = await generateResponse(messages);
    const aiMessage = await messageModel.create({
      chat: chat._id,
      content: result,
      role: "ai",
    });

    return res.status(201).json({
      success: true,
      message: aiMessage,
      title,
      chat
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//get chats
export const getChats = async (req, res) => {
  try {
    console.log(req.user._id)
    const user = req.user._id

    const chats = await chatModel.find({
      user
    })

    return res.status(200).json({
      success: true,
      message: "Chats fetched successfully",
      chats
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }
}

// get messsages
export const getMessages = async (req, res) => {
  try {
    const userId = req.user._id
    const {chatId} = req.params

    const chat = await chatModel.findOne({
      _id: chatId,
      user: userId
    })

    if(!chat) {
      return res.status(404).json({
        success: false,
        message: "chat not found"
      })
    }

    const messages = await messageModel.find({
      chat: chatId
    })

    return res.status(200).json({
      success: true,
      message: "Message fetched successfully",
      messages
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }
}

//delete chat
export const deleteChat = async (req, res) => {
  try {
    const {chatId} = req.params

    await chatModel.findOneAndDelete({
      _id: chatId,
      user: req.user._id
    })

    if(!chat) {
      return res.status(404).json({
        success: false,
        message: "chat not found"
      })
    }

    await messageModel.deleteMany({
      chat: chatId
    })

    return res.status(200).json({
      success: true,
      message: "Chat deleted successfully"
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }
}