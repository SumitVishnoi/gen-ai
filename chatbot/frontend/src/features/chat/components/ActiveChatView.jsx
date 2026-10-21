import React, { useEffect, useRef } from "react";
import {
  Sparkles,
  User,
  Copy,
  Check,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { PromptInputCard } from "./PromptInputCard";
import { marked } from "marked";

const formatMessageTime = (createdAt) => {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;

  return {
    dateTime: date.toISOString(),
    label: new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(date),
  };
};

export const ActiveChatView = ({
  chatTitle = "New Conversation",
  messages = [],
  isLoading = false,
  onSend,
  onBackToHome,
  onDeleteChat,
  chatId,
  error,
}) => {
  const messagesEndRef = useRef(null);
  const [copiedId, setCopiedId] = React.useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#FBFBFA]">
      {/* Conversation Header */}
      <div className="z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[#EAEAE7] bg-white/70 px-3 backdrop-blur-md sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            onClick={onBackToHome}
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <span className="text-neutral-300 hidden sm:inline">/</span>
          <h2 className="max-w-[55vw] truncate text-sm font-semibold text-neutral-800 sm:max-w-md">
            {chatTitle || "Conversation"}
          </h2>
        </div>

        {chatId && onDeleteChat && (
          <button
            onClick={() => onDeleteChat(chatId)}
            className="text-xs text-neutral-400 hover:text-red-600 flex items-center gap-1 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
            title="Delete this chat thread"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="mx-auto w-full max-w-4xl min-h-0 flex-1 space-y-6 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 md:px-12">
        {error && (
          <p
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-neutral-400 py-16">
            <Sparkles className="w-8 h-8 text-violet-400 mb-2 stroke-[1.5]" />
            <p className="text-sm">Start your conversation below</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === "user";
            const sentTime = formatMessageTime(msg.createdAt);
            const messageContent = isUser
              ? (msg.content || "").replace(
                  /\n?\[Include verified citations and references where applicable\]/g,
                  ""
                )
              : msg.content || "";
            return (
              <div
                key={msg._id || index}
                className={`flex gap-3 sm:gap-4 ${
                  isUser ? "justify-end" : "justify-start"
                } animate-in fade-in slide-in-from-bottom-2 duration-200`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-violet-600/10 text-violet-600 flex items-center justify-center shrink-0 mt-0.5 border border-violet-200">
                    <Sparkles className="w-4 h-4 stroke-[2]" />
                  </div>
                )}

                <div
                  className={`relative group min-w-0 max-w-[90%] sm:max-w-[75%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed ${
                    isUser
                      ? "bg-[#1E1E1E] text-white rounded-br-xs shadow-xs"
                      : "bg-white text-neutral-800 border border-[#EAEAE7] rounded-bl-xs shadow-xs"
                  }`}
                >
                  {/* Message Content */}
                  <div
                    className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]"
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(messageContent),
                    }}
                  />
                  {sentTime && (
                    <time
                      dateTime={sentTime.dateTime}
                      className={`mt-2 block text-[10px] leading-none ${
                        isUser ? "text-right text-neutral-300" : "text-neutral-400"
                      }`}
                    >
                      {sentTime.label}
                    </time>
                  )}

                  {/* Copy Action on AI Message */}
                  {!isUser && (
                    <button
                      onClick={() =>
                        copyToClipboard(msg.content, msg._id || index)
                      }
                      className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-7 right-1 flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-800 bg-white border border-neutral-200 px-2 py-0.5 rounded-md shadow-2xs"
                    >
                      {copiedId === (msg._id || index) ? (
                        <>
                          <Check className="w-3 h-3 text-green-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold">
                    <User className="w-4 h-4 stroke-[2]" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* AI Typing / Generating Indicator */}
        {isLoading && (
          <div className="flex gap-3 sm:gap-4 justify-start animate-in fade-in">
            <div className="w-8 h-8 rounded-full bg-violet-600/10 text-violet-600 flex items-center justify-center shrink-0 border border-violet-200 animate-pulse">
              <Sparkles className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="bg-white border border-[#EAEAE7] rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-neutral-400 ml-1">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Docked Prompt Input Bar at Bottom */}
      <div className="shrink-0 bg-gradient-to-t from-[#FBFBFA] via-[#FBFBFA]/90 to-transparent p-2 sm:p-4 md:p-6">
        <PromptInputCard onSend={onSend} isLoading={isLoading} />
      </div>
    </div>
  );
};
