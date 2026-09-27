"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Square, Sparkles } from "lucide-react";
import { GenerationStatus } from "@/types/chat";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onStop: () => void;
  generationStatus: GenerationStatus;
  disabled?: boolean;
  clarificationOptions?: string[];
}

export function ChatInput({
  onSendMessage,
  onStop,
  generationStatus,
  disabled = false,
  clarificationOptions = [],
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isGenerating = generationStatus === "running";

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

  const displayOptions = clarificationOptions && clarificationOptions.length > 0 
    ? clarificationOptions 
    : ["Layout", "Colors", "Accessibility"]; // Fallback if backend didn't send them

  return (
    <div className="shrink-0 border-t border-white/[0.08] bg-black/40 p-4 backdrop-blur-md flex flex-col gap-3">
      
      {/* HITL Clarification UI */}
      {generationStatus === "waiting_for_clarification" && (
        <div className="animate-fade-in flex flex-col gap-2.5 rounded-2xl border border-[#0071e3]/30 bg-gradient-to-b from-[#0071e3]/10 to-transparent p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#2997ff]" />
            <h4 className="text-sm font-semibold tracking-tight text-white">I need a little clarification</h4>
          </div>
          <p className="text-[13px] font-normal leading-relaxed text-white/80">
            What would you like me to focus on for this evaluation?
          </p>
          <div className="flex flex-wrap gap-2 mt-1">
            {displayOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onSendMessage(opt)}
                className="rounded-full border border-white/[0.12] bg-white/[0.06] px-4 py-1.5 text-[13px] font-medium text-white transition-all hover:bg-white/[0.1] active:scale-95 shadow-sm"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col rounded-[22px] border border-white/[0.12] bg-white/[0.03] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] transition-all duration-200 focus-within:border-white/[0.24] focus-within:bg-white/[0.06] focus-within:ring-4 focus-within:ring-[#0071e3]/20"
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
              : generationStatus === "waiting_for_clarification"
              ? "Or type a custom focus area here..."
              : "Ask anything about this image..."
          }
          className="max-h-[140px] min-h-[44px] w-full resize-none bg-transparent px-4 py-3.5 text-[15px] font-normal leading-relaxed text-white placeholder-white/40 focus:outline-none disabled:opacity-50"
        />

        {/* Bottom Toolbar inside Composer */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-white/40 pl-1">
            <Sparkles className="h-3.5 w-3.5 text-[#2997ff]" />
            <span className="hidden sm:inline">Visual Reasoning Mode</span>
          </div>

          <div className="flex items-center gap-2 pr-1">
            {isGenerating ? (
              <button
                type="button"
                onClick={onStop}
                className="flex h-8 items-center gap-1.5 rounded-full border border-[#ff3b30]/30 bg-[#ff3b30]/15 px-3.5 text-[13px] font-medium text-[#ff453a] hover:bg-[#ff3b30]/25 transition-all cursor-pointer active:scale-95"
                title="Stop generation"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() || disabled}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition-all hover:bg-white/90 disabled:opacity-30 disabled:pointer-events-none cursor-pointer active:scale-95 shadow-sm"
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
