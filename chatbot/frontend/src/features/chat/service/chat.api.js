import axios from "axios";

export const chatApiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
  timeout: 60000,
});

export const getAttachmentUrl = (url) =>
  new URL(url, chatApiInstance.defaults.baseURL).toString();

export const sendMessage = async ({
  chatId,
  message,
  file,
  includeCitations = true,
}) => {
  const body = new FormData();
  body.append("message", message);
  body.append("includeCitations", String(includeCitations));
  if (chatId) body.append("chatId", chatId);
  if (file) body.append("file", file);

  const response = await chatApiInstance.post("/api/chats/message", body);
  return response.data;
};

export const getChats = async () => {
  const response = await chatApiInstance.get("/api/chats");
  return response.data;
};

export const getMessages = async (chatId) => {
  const response = await chatApiInstance.get(`/api/chats/${chatId}/messages`);
  return response.data;
};

export const deleteChat = async (chatId) => {
  const response = await chatApiInstance.delete(`/api/chats/delete/${chatId}`);
  return response.data;
};
