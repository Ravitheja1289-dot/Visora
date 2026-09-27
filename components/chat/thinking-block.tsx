"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Check, Loader2, Sparkles, Brain, Zap, Search, Camera, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThinkingBlockProps {
  thinkingText: string;
  isThinking: boolean;
}

export function ThinkingBlock({ thinkingText, isThinking }: ThinkingBlockProps) {
  // Auto-expand while thinking, allow toggle
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Parse lines into distinct execution steps
  const steps = React.useMemo(() => {
    return thinkingText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }, [thinkingText]);

  if (steps.length === 0) return null;

  const getStepIcon = (text: string, isCurrent: boolean) => {
    if (!isCurrent) {
      return <Check className="h-3.5 w-3.5 text-emerald-400" />;
    }
    const lower = text.toLowerCase();
    if (lower.includes("initializ") || lower.includes("query") || lower.includes("processing")) {
      return <Zap className="h-3.5 w-3.5 text-[#2997ff] animate-pulse" />;
    }
    if (lower.includes("inspect") || lower.includes("canvas")) {
      return <Search className="h-3.5 w-3.5 text-[#2997ff] animate-pulse" />;
    }
    if (lower.includes("upload") || lower.includes("embedding") || lower.includes("caching")) {
      return <Camera className="h-3.5 w-3.5 text-[#2997ff] animate-pulse" />;
    }
    if (lower.includes("reason") || lower.includes("analyzing") || lower.includes("examining")) {
      return <Brain className="h-3.5 w-3.5 text-[#2997ff] animate-pulse" />;
    }
    return <Loader2 className="h-3.5 w-3.5 text-[#2997ff] animate-spin" />;
  };

  const cleanStepText = (text: string) => {
    return text.replace(/^[*>\s-]+/, "").replace(/[*_]/g, "").trim();
  };

  return (
    <div className="w-full my-2.5 rounded-xl border border-white/[0.08] bg-[#12131a]/80 backdrop-blur-md overflow-hidden transition-all shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
      {/* Header Bar */}
      <button
        type="button"
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0071e3]/15 text-[#2997ff]">
            {isThinking ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3 text-emerald-400" />
            )}
          </div>
          <span className="text-[12px] font-medium text-white/90">
            {isThinking ? "Thinking & Reasoning..." : `Thought Process (${steps.length} steps)`}
          </span>
          {isThinking && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#0071e3]/20 text-[#42a1ff] border border-[#0071e3]/30">
              Live
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-white/40 hover:text-white/80 transition-colors">
          <span className="text-[11px] font-normal">
            {isCollapsed ? "Show" : "Hide"}
          </span>
          {isCollapsed ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5" />
          )}
        </div>
      </button>

      {/* Expanded Step Timeline */}
      {!isCollapsed && (
        <div className="border-t border-white/[0.05] bg-black/20 px-3.5 py-2.5 space-y-2">
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1;
            const isCurrent = isThinking && isLast;

            return (
              <div
                key={idx}
                className={cn(
                  "flex items-start gap-2.5 text-[12px] transition-all",
                  isCurrent ? "text-[#42a1ff] font-medium py-1 px-2 rounded-lg bg-[#0071e3]/10 border border-[#0071e3]/20" : "text-white/70 py-0.5"
                )}
              >
                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                  {getStepIcon(step, isCurrent)}
                </div>
                <span className="leading-snug break-words">
                  {cleanStepText(step)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
