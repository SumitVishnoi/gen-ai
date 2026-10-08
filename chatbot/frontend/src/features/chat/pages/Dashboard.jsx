import React, { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { TopNavbar } from "../components/TopNavbar";
import { HeroSection } from "../components/HeroSection";
import { PromptInputCard } from "../components/PromptInputCard";
import { StarterCards } from "../components/StarterCards";
import { ActiveChatView } from "../components/ActiveChatView";
import { ChatHistoryDrawer } from "../components/ChatHistoryDrawer";
import { useChat } from "../hook/useChat";
import useAuth from "../../auth/hook/useAuth";
import { initializedSocketConnection } from "../service/chat.socket";


const Dashboard = () => {
  const { user } = useAuth();
  const {
    chats,
    activeChatId,
    activeChatTitle,
    messages,
    loadingChats,
    sendingMessage,
    handleSelectChat,
    handleNewThread,
    handleSendMessage,
    handleDeleteChat,
  } = useChat();

  const [activeTab, setActiveTab] = useState("home");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState("ChatGPT 4o");
  const [initialPrompt, setInitialPrompt] = useState("");

  const handleSendPrompt = (text) => {
    handleSendMessage({
      chatId: activeChatId,
      message: text,
    });
    setInitialPrompt("");
  };

  const handleSelectStarterCard = (promptText) => {
    setInitialPrompt(promptText);
  };

  const isConversationActive = Boolean(activeChatId || messages.length > 0);

  useEffect(() => {
    try {
      initializedSocketConnection();
    } catch (e) {
      console.warn("Socket connection failed silently:", e);
    }
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FBFBFA] font-sans antialiased text-[#191919]">
      {/* 1. Sleek Left Icon Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === "home") {
            handleNewThread();
          }
        }}
        onToggleHistory={() => setHistoryOpen(!historyOpen)}
        historyOpen={historyOpen}
        chatsCount={chats.length}
      />

      {/* 2. Chat History Drawer (Backend sync) */}
      <ChatHistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onNewThread={handleNewThread}
        isLoading={loadingChats}
      />

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Minimalist Header */}
        <TopNavbar
          currentModel={currentModel}
          onModelChange={setCurrentModel}
          onNewThread={handleNewThread}
          onSearchClick={() => setHistoryOpen(true)}
        />

        {/* Content View: Switch between Dashboard Hero and Active Chat Stream */}
        {isConversationActive ? (
          <ActiveChatView
            chatTitle={activeChatTitle}
            messages={messages}
            isLoading={sendingMessage}
            onSend={handleSendPrompt}
            onBackToHome={handleNewThread}
            onDeleteChat={handleDeleteChat}
            chatId={activeChatId}
          />
        ) : (
          <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-6 md:py-10 flex flex-col justify-between">
            <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col justify-center">
              {/* Center Hero with Glowing Purple Orb & Greeting */}
              <HeroSection userName={user?.name || "Jason"} />

              {/* Center Prompt Input Box */}
              <div className="w-full mt-2">
                <PromptInputCard
                  onSend={handleSendPrompt}
                  isLoading={sendingMessage}
                  initialPrompt={initialPrompt}
                />
              </div>

              {/* 4 Starter Example Cards */}
              <StarterCards onSelectCard={handleSelectStarterCard} />
            </div>

            {/* Subtle Footer with Ample Breathing Space */}
            <footer className="w-full text-center py-4 text-xs text-neutral-400 select-none">
              AI can make mistakes. Verify critical facts and information.
            </footer>
          </main>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
