import { deleteModel } from "mongoose"
import { deleteChat, getChats, getMessages, sendMessage } from "../service/chat.api"


export const useChat = ()=> {
    const handleSendMessage = async ({chatId, message}) => {
        const data = await sendMessage({chatId, message})

        console.log(data)
    }

    const handleGetChats = async ()=> {
        const data = await getChats()
        console.log(data)
    }

    const handleGetMessages = async (chatId)=> {
        const data = await getMessages(chatId)
        console.log(data)
    }

    const handleDeleteChat = async (chatId)=> {
        const data = await deleteChat(chatId)
        console.log(data)
    }
    return {
        handleSendMessage,
        handleGetChats,
        handleGetMessages,
        handleDeleteChat
    }
}