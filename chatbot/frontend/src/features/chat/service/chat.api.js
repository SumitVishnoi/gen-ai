import axios from "axios"

const chatApiInstance = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true
})


export const sendMessage = async ({chatId, message}) {
    const response = await chatApiInstance.post("/api/chats/message", {chatId, message})
    return response.data
}

export const getChats = async ()=> {
    const response = await chatApiInstance.get("/api/chats")
    return response.data 
}

export const getMessages = async (chatId)=> {
    const response = await chatApiInstance.get(`/api/chats/${chatId}/messages`)
    return response.data
}

export const deleteChat = async (chatId)=> {
    const response = await chatApiInstance.delete(`/api/chats/delete/${chatId}`)
    return response.data
}

