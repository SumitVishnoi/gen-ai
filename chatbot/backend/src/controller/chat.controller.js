import chatModel from "../models/chat.model.js"
import messageModel from "../models/message.model.js"
import { generateChatTitle, generateResponse } from "../services/ai.models.js"



//send message
export const sendMessage = async (req, res) => {
    try {
        const userId = req.user._id
        console.log(userId)
        const {message} = req.body

        if(!message) {
            return res.status(400).json({
                success: false,
                message: "content is required"
            })
        }

        const title = await generateChatTitle(message)

        const result = await generateResponse(message)

        const chat = await chatModel.create({
            user: userId,
            title
        })

        const aiMessage = await messageModel.create({
            chat: chat._id,
            content: result,
            role: "ai"
        })

        return res.status(201).json({
            success: true,
            message: aiMessage,
            title
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}