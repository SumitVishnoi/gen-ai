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
      throw new Error(data?.message || "Unable to load chat history");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to load chat history");
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
      setMessages([]);
      setError(null);

      const found = chats.find((c) => c._id === chatId);
      setActiveChatTitle(found?.title || "Conversation");

      const data = await getMessages(chatId);
      if (data?.success && Array.isArray(data?.messages)) {
        setMessages(data.messages);
      } else {
        throw new Error(data?.message || "Unable to load messages");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load messages");
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
  const handleSendMessage = useCallback(async ({
    chatId,
    message,
    file,
    includeCitations = true,
  }) => {
    if ((!message || !message.trim()) && !file) return null;
    const targetChatId = chatId || activeChatId;
    const content = message?.trim() || "Summarize this document.";
    const pendingId = `temp-${Date.now()}`;

    const tempUserMsg = {
      _id: pendingId,
      role: "user",
      content,
      files: file
        ? [{ fileName: file.name, mimeType: file.type, size: file.size }]
        : [],
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setSendingMessage(true);
    setError(null);

    try {
      const data = await sendMessage({
        chatId: targetChatId,
        message: content,
        file,
        includeCitations,
      });

      if (data?.success) {
        const aiMsg = data.message;
        const savedUserMessage = data.userMessage;
        const newChat = data.chat;

        if (newChat && (!targetChatId || targetChatId !== newChat._id)) {
          setActiveChatId(newChat._id);
          setActiveChatTitle(newChat.title || data.title || "New Thread");
          setChats((prev) => [newChat, ...prev.filter((c) => c._id !== newChat._id)]);
        }

        setMessages((prev) => [
          ...prev.filter((msg) => msg._id !== pendingId),
          ...(savedUserMessage ? [savedUserMessage] : [tempUserMsg]),
          ...(aiMsg ? [aiMsg] : []),
        ]);

        // Refresh chats list to keep sidebar updated
        handleGetChats();
        return data;
      } else {
        throw new Error(data?.message || "Server did not return a successful response");
      }
    } catch (err) {
      setMessages((prev) => prev.filter((msg) => msg._id !== pendingId));
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to send message";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSendingMessage(false);
    }
  }, [activeChatId, handleGetChats]);

  // Delete chat
  const handleDeleteChat = useCallback(async (chatId) => {
    try {
      const data = await deleteChat(chatId);
      if (!data?.success) {
        throw new Error(data?.message || "Unable to delete chat");
      }
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (activeChatId === chatId) {
        handleNewThread();
      }
      return { success: true };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to delete chat";
      setError(errorMessage);
      return { success: false, error: errorMessage };
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