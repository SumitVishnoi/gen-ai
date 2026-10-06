import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Paperclip,
  ChevronDown,
  ArrowUp,
  Loader2,
  Check,
  X,
} from "lucide-react";

export const PromptInputCard = ({
  onSend,
  isLoading = false,
  initialPrompt = "",
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [citationEnabled, setCitationEnabled] = useState(true);
  const [writingStyle, setWritingStyle] = useState("Writing Styles");
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync external prompt changes (e.g. from starter cards)
  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [initialPrompt]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        220
      )}px`;
    }
  }, [prompt]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!prompt.trim() || isLoading) return;

    let finalMessage = prompt.trim();
    if (writingStyle !== "Writing Styles") {
      finalMessage += `\n\n[Style Directive: Please format response in ${writingStyle} tone]`;
    }
    if (citationEnabled) {
      finalMessage += `\n[Include verified citations and references where applicable]`;
    }

    onSend?.(finalMessage);
    setPrompt("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachments((prev) => [
        ...prev,
        ...files.map((f) => ({ name: f.name, size: f.size })),
      ]);
    }
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const stylesList = [
    "Default",
    "Concise & Direct",
    "Professional & Formal",
    "Creative & Engaging",
    "Academic & Detailed",
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl md:rounded-[22px] border border-[#E5E5E2] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-200 focus-within:border-violet-300 focus-within:ring-4 focus-within:ring-violet-500/10 p-4 md:p-5">
        {/* Top input row with sparkle icon */}
        <div className="flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-neutral-400 mt-1 shrink-0 stroke-[2]" />
          <textarea
            ref={textareaRef}
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI a question or make a request."
            className="w-full resize-none border-none bg-transparent p-0 text-[#191919] placeholder:text-[#8E8E93] text-sm md:text-[15px] leading-relaxed focus:outline-none focus:ring-0 min-h-[44px]"
          />
        </div>

        {/* Selected attachments chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-neutral-100">
            {attachments.map((file, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 text-xs text-neutral-700 font-medium"
              >
                <Paperclip className="w-3 h-3 text-neutral-500" />
                <span className="max-w-[120px] truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(i)}
                  className="hover:text-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between gap-3 mt-4 pt-1">
          {/* Left tools: Attach & Writing Styles */}
          <div className="flex items-center gap-2">
            {/* Attach button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#EAEAE7] hover:border-neutral-300 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <span className="text-neutral-500">@</span>
              <span>Attach</span>
            </button>

            {/* Writing Styles dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setStyleDropdownOpen(!styleDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#EAEAE7] hover:border-neutral-300 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <span>{writingStyle}</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 stroke-[2.5]" />
              </button>

              {styleDropdownOpen && (
                <div className="absolute left-0 bottom-9 w-48 bg-white rounded-xl shadow-xl border border-[#EAEAE7] p-1.5 z-40 animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Tone & Style
                  </div>
                  {stylesList.map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => {
                        setWritingStyle(style === "Default" ? "Writing Styles" : style);
                        setStyleDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-neutral-700 hover:bg-neutral-100 transition-colors text-left"
                    >
                      <span>{style}</span>
                      {((style === "Default" && writingStyle === "Writing Styles") ||
                        writingStyle === style) && (
                        <Check className="w-3.5 h-3.5 text-violet-600 stroke-[2.5]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right tools: Citation toggle & Send button */}
          <div className="flex items-center gap-3">
            {/* Citation toggle */}
            <button
              type="button"
              onClick={() => setCitationEnabled(!citationEnabled)}
              className="flex items-center gap-2 group cursor-pointer"
              title="Toggle Web & Academic Citations"
            >
              {/* Toggle switch track */}
              <div
                className={`w-8 h-4.5 rounded-full transition-colors relative flex items-center p-0.5 ${
                  citationEnabled ? "bg-[#7C3AED]" : "bg-neutral-300"
                }`}
              >
                {/* Thumb */}
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform transform ${
                    citationEnabled ? "translate-x-3.5" : "translate-x-0"
                  }`}
                />
              </div>
              <span className="text-xs font-medium text-neutral-600 group-hover:text-neutral-900 transition-colors">
                Citation
              </span>
            </button>

            {/* Send circular button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!prompt.trim() || isLoading}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                prompt.trim() && !isLoading
                  ? "bg-[#121212] hover:bg-neutral-800 text-white shadow-xs active:scale-95"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
              title="Send (Enter)"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
