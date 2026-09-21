import messageModel from "../models/message.model.js"



//send message
export const sendMessage = async (req, res) => {
    try {
        const userId = req.user._id
        const {content} = req.body

        if(!content) {
            return res.status(400).json({
                success: false,
                message: "content is required"
            })
        }

        const isAlreadyMessage = await messageModel.find({
            user: userId,
        })

        const message = await messageModel.create({
            user: userId,
            content
        })



    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}