import React, { useState } from "react";
import { MessageSquare, Trash2, X, Plus, Search, Calendar } from "lucide-react";

export const ChatHistoryDrawer = ({
  isOpen = false,
  onClose,
  chats = [],
  activeChatId,
  onSelectChat,
  onDeleteChat,
  onNewThread,
  isLoading = false,
}) => {
  const [searchFilter, setSearchFilter] = useState("");

  if (!isOpen) return null;

  const filteredChats = chats.filter((c) =>
    (c.title || "Untitled Chat")
      .toLowerCase()
      .includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-neutral-900/20 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer content */}
      <div className="relative ml-16 md:ml-[72px] w-80 max-w-[85vw] h-full bg-white border-r border-[#EAEAE7] shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#EAEAE7] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-violet-600" />
            <h3 className="text-sm font-semibold text-neutral-900">
              Chat History
            </h3>
            <span className="text-xs text-neutral-400">({chats.length})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action & Search */}
        <div className="p-3 border-b border-neutral-100 space-y-2">
          <button
            onClick={() => {
              onNewThread?.();
              onClose?.();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Thread</span>
          </button>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter threads..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <div className="p-6 text-center text-xs text-neutral-400">
              Loading chat threads...
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400">
              {searchFilter
                ? "No matching threads found"
                : "No saved chat threads yet"}
            </div>
          ) : (
            filteredChats.map((chat) => {
              const isActive = chat._id === activeChatId;
              return (
                <div
                  key={chat._id}
                  className={`group flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                    isActive
                      ? "bg-violet-50 text-violet-900 font-medium"
                      : "hover:bg-neutral-50 text-neutral-700"
                  }`}
                  onClick={() => {
                    onSelectChat?.(chat._id);
                    onClose?.();
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <MessageSquare
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? "text-violet-600" : "text-neutral-400"
                      }`}
                    />
                    <span className="truncate">
                      {chat.title || "Untitled Thread"}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat?.(chat._id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-all shrink-0"
                    title="Delete thread"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
