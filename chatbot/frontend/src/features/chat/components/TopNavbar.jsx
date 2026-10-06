import React, { useState } from "react";
import {
  Sparkles,
  ChevronDown,
  Search,
  UserPlus,
  Plus,
  Check,
} from "lucide-react";

export const TopNavbar = ({
  currentModel = "ChatGPT 4o",
  onModelChange,
  onNewThread,
  onSearchClick,
  searchQuery = "",
  onSearchChange,
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  const availableModels = [
    { id: "gpt-4o", name: "ChatGPT 4o", desc: "Omni model for complex reasoning and speed" },
    { id: "claude-3-7", name: "Claude 3.7 Sonnet", desc: "Advanced coding and nuanced synthesis" },
    { id: "gemini-2-5", name: "Gemini 2.5 Flash", desc: "High velocity multimodal intelligence" },
    { id: "deepseek-r1", name: "DeepSeek R1", desc: "Open reasoning and deep logic analysis" },
  ];

  const handleCopyInvite = () => {
    navigator.clipboard?.writeText(window.location.origin);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  return (
    <header className="h-16 w-full flex items-center justify-between px-6 sm:px-10 bg-transparent select-none z-20">
      {/* Left: Model Selector Pill */}
      <div className="relative">
        <button
          onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#EAEAE7] hover:border-neutral-300 text-sm font-medium text-[#1c1b1b] shadow-xs hover:bg-neutral-50 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-violet-600 stroke-[2]" />
          <span>{currentModel}</span>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400 stroke-[2.5]" />
        </button>

        {/* Model dropdown menu */}
        {modelDropdownOpen && (
          <div className="absolute top-11 left-0 w-64 bg-white rounded-2xl shadow-xl border border-[#EAEAE7] p-2 z-50 animate-in fade-in zoom-in-95">
            <div className="px-2 py-1 text-[11px] font-semibold text-neutral-400 tracking-wider uppercase">
              Select AI Model
            </div>
            <div className="space-y-1 mt-1">
              {availableModels.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    onModelChange?.(m.name);
                    setModelDropdownOpen(false);
                  }}
                  className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors ${
                    currentModel === m.name
                      ? "bg-violet-50 text-violet-900"
                      : "hover:bg-neutral-50 text-neutral-800"
                  }`}
                >
                  <div className="mt-0.5">
                    {currentModel === m.name ? (
                      <Check className="w-4 h-4 text-violet-600 stroke-[2.5]" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-neutral-300" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-semibold">{m.name}</div>
                    <div className="text-[11px] text-neutral-500 leading-tight">
                      {m.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search Thread */}
        <div className="relative">
          <div
            onClick={onSearchClick}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/80 border border-[#EAEAE7] hover:border-neutral-300 text-xs sm:text-sm text-neutral-600 shadow-xs cursor-pointer hover:bg-white transition-all"
          >
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden sm:inline">Search thread</span>
            <span className="sm:hidden">Search</span>
          </div>
        </div>

        {/* Invite Button */}
        <button
          onClick={() => setInviteModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-[#EAEAE7] hover:border-neutral-300 text-xs sm:text-sm font-medium text-neutral-700 shadow-xs hover:bg-neutral-50 transition-all cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5 text-neutral-500" />
          <span>Invite</span>
        </button>

        {/* New Thread CTA Button */}
        <button
          onClick={onNewThread}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#121212] hover:bg-neutral-800 text-white text-xs sm:text-sm font-medium shadow-sm transition-all duration-150 active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Thread</span>
        </button>
      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/30 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#EAEAE7] animate-in fade-in zoom-in-95">
            <h3 className="text-base font-semibold text-neutral-900">
              Invite your team
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Share this workspace link to collaborate in real-time with AI.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={window.location.origin}
                className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-neutral-700 select-all"
              />
              <button
                onClick={handleCopyInvite}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors whitespace-nowrap"
              >
                {copiedInvite ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setInviteModalOpen(false)}
                className="text-xs text-neutral-500 hover:text-neutral-800 px-3 py-1.5 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
