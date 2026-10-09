import { useState, useEffect, useCallback } from "react";
import { deleteChat, getChats, getMessages, sendMessage } from "../service/chat.api";

export const useChat = () => {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChatTitle, setActiveChatTitle] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all chats
  const handleGetChats = useCallback(async () => {
    try {
      setLoadingChats(true);
      setError(null);
      const data = await getChats();
      if (data?.success && Array.isArray(data?.chats)) {
        setChats(data.chats);
        return data.chats;
      }
      return [];
    } catch (err) {
      console.warn("Failed to load chats from backend:", err?.message);
      // Graceful degradation
      return [];
    } finally {
      setLoadingChats(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    handleGetChats();
  }, [handleGetChats]);

  // Load messages for a specific chat
  const handleSelectChat = useCallback(async (chatId) => {
    if (!chatId) return;
    try {
      setLoadingMessages(true);
      setActiveChatId(chatId);
      setError(null);

      const found = chats.find((c) => c._id === chatId);
      if (found) {
        setActiveChatTitle(found.title || "Conversation");
      }

      const data = await getMessages(chatId);
      if (data?.success && Array.isArray(data?.messages)) {
        setMessages(data.messages);
      } else {
        setMessages([]);
      }cd 
    } catch (err) {
      console.warn("Failed to load messages for chat:", chatId, err?.message);
      setError(err?.message || "Failed to load messages");
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, [chats]);

  // Start new thread (reset to hero dashboard view)
  const handleNewThread = useCallback(() => {
    setActiveChatId(null);
    setActiveChatTitle("");
    setMessages([]);
    setError(null);
  }, []);

  // Send message
  const handleSendMessage = useCallback(async ({ chatId, message }) => {
    if (!message || !message.trim()) return null;
    const targetChatId = chatId || activeChatId;

    const tempUserMsg = {
      _id: "temp-" + Date.now(),
      role: "user",
      content: message.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setSendingMessage(true);
    setError(null);

    try {
      const data = await sendMessage({
        chatId: targetChatId,
        message: message.trim(),
      });

      if (data?.success) {
        const aiMsg = data.message;
        const newChat = data.chat;

        if (newChat && (!targetChatId || targetChatId !== newChat._id)) {
          setActiveChatId(newChat._id);
          setActiveChatTitle(newChat.title || data.title || "New Thread");
          setChats((prev) => [newChat, ...prev.filter((c) => c._id !== newChat._id)]);
        }

        if (aiMsg) {
          setMessages((prev) => [...prev, aiMsg]);
        }

        // Refresh chats list to keep sidebar updated
        handleGetChats();
        return data;
      } else {
        throw new Error(data?.message || "Server did not return a successful response");
      }
    } catch (err) {
      console.warn("Backend sendMessage error, providing fallback simulation:", err?.message);
      const isNetworkOrAuthError = err.response?.status === 401 || err.code === "ERR_NETWORK" || !err.response;

      // Provide a helpful intelligent simulated response if backend is offline or unauthenticated
      const fallbackAiMsg = {
        _id: "sim-" + Date.now(),
        role: "ai",
        content: isNetworkOrAuthError
          ? `I've received your query: "${message.trim()}". \n\n*(Note: Running in preview mode. Connect and start the backend server at localhost:3000 to enable real-time Gemini AI persistence and database synchronization.)*`
          : `I encountered an issue processing your request: ${err.response?.data?.message || err.message}`,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, fallbackAiMsg]);

      // If this was a new thread, create a local simulated chat so it shows up in history
      if (!targetChatId) {
        const simulatedId = "local-" + Date.now();
        const simulatedTitle = message.slice(0, 32) + (message.length > 32 ? "..." : "");
        const localChat = {
          _id: simulatedId,
          title: simulatedTitle,
          createdAt: new Date().toISOString(),
        };
        setActiveChatId(simulatedId);
        setActiveChatTitle(simulatedTitle);
        setChats((prev) => [localChat, ...prev]);
      }

      return { success: false, error: err?.message };
    } finally {
      setSendingMessage(false);
    }
  }, [activeChatId, handleGetChats]);

  // Delete chat
  const handleDeleteChat = useCallback(async (chatId) => {
    try {
      await deleteChat(chatId);
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (activeChatId === chatId) {
        handleNewThread();
      }
      return { success: true };
    } catch (err) {
      console.warn("Failed to delete chat:", err?.message);
      // Also delete from local state
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (activeChatId === chatId) {
        handleNewThread();
      }
      return { success: false, error: err?.message };
    }
  }, [activeChatId, handleNewThread]);

  return {
    chats,
    activeChatId,
    activeChatTitle,
    messages,
    loadingChats,
    loadingMessages,
    sendingMessage,
    error,
    handleGetChats,
    handleSelectChat,
    handleNewThread,
    handleSendMessage,
    handleDeleteChat,
  };
};