import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGoogle } from "@langchain/google";

const geminiModel = new ChatGoogle({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-3.5-flash",
});


export async function generateResponse(message) {
    const response = await geminiModel.invoke([
        new HumanMessage(message)
    ])

    return response.text
} 

export async function generateChatTitle(message) {
    const response = await geminiModel.invoke([
        new SystemMessage(`
            You are a helpful assistant that geneates a title for a chat based on the user's message.

            You should generate a title that is concise, desctiptive, and relevant to the content of the message. The title should be no more that 2-4 words long. Please provide the title in a single line without any additional text or formatting.
            `),

        new HumanMessage(message)
    ])

    return response.text
}
