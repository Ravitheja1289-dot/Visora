"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Square, Sparkles } from "lucide-react";
import { GenerationStatus } from "@/types/chat";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onStop: () => void;
  generationStatus: GenerationStatus;
  disabled?: boolean;
}

export function ChatInput({
  onSendMessage,
  onStop,
  generationStatus,
  disabled = false,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isGenerating = generationStatus === "analyzing" || generationStatus === "streaming";

  // Auto-resize textarea up to 140px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isGenerating) {
      onStop();
      return;
    }
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSendMessage(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-white/[0.08] bg-black/40 p-3.5 backdrop-blur-2xl">
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col rounded-2xl border border-white/[0.12] bg-white/[0.04] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] transition-all focus-within:border-white/[0.24] focus-within:bg-white/[0.06] focus-within:ring-2 focus-within:ring-[#0071e3]/30"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isGenerating}
          rows={1}
          placeholder={
            isGenerating
              ? "Assistant is reasoning..."
              : "Ask anything about this image (Enter to send, Shift+Enter for newline)..."
          }
          className="max-h-[140px] min-h-[44px] w-full resize-none bg-transparent px-4 py-3 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none disabled:opacity-50"
        />

        {/* Bottom Toolbar inside Composer */}
        <div className="flex items-center justify-between px-3 pb-2 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-white/35">
            <Sparkles className="h-3 w-3 text-[#2997ff]" />
            <span className="hidden sm:inline">Visual Reasoning Mode</span>
          </div>

          <div className="flex items-center gap-2">
            {isGenerating ? (
              <button
                type="button"
                onClick={onStop}
                className="flex h-7 items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/20 px-3 text-xs font-medium text-red-300 hover:bg-red-500/30 transition-all cursor-pointer active:scale-95"
                title="Stop generation"
              >
                <Square className="h-3 w-3 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() || disabled}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black transition-all hover:bg-white/90 disabled:opacity-25 disabled:pointer-events-none cursor-pointer active:scale-95 shadow-sm"
                title="Send message"
              >
                <ArrowUp className="h-4 w-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
