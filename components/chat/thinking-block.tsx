"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  Check,
  Loader2,
  Sparkles,
  Brain,
  Zap,
  Search,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ThinkingBlockProps {
  thinkingText: string;
  isThinking: boolean;
}

export function ThinkingBlock({ thinkingText, isThinking }: ThinkingBlockProps) {
  // If initially mounted while thinking, stay expanded; if already finished, start collapsed
  const [isCollapsed, setIsCollapsed] = useState(!isThinking);
  const prevThinkingRef = useRef(isThinking);

  // Watch isThinking transitions:
  // When isThinking transitions from true -> false (output generated), AUTO-COLLAPSE
  // When isThinking transitions from false -> true, AUTO-EXPAND
  useEffect(() => {
    if (prevThinkingRef.current && !isThinking) {
      setIsCollapsed(true);
    } else if (!prevThinkingRef.current && isThinking) {
      setIsCollapsed(false);
    }
    prevThinkingRef.current = isThinking;
  }, [isThinking]);

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
      return <Check className="h-3 w-3 text-emerald-400" />;
    }
    const lower = text.toLowerCase();
    if (lower.includes("initializ") || lower.includes("query") || lower.includes("processing")) {
      return <Zap className="h-3 w-3 text-[#2997ff] animate-pulse" />;
    }
    if (lower.includes("inspect") || lower.includes("canvas")) {
      return <Search className="h-3 w-3 text-[#2997ff] animate-pulse" />;
    }
    if (lower.includes("upload") || lower.includes("embedding") || lower.includes("caching")) {
      return <Camera className="h-3 w-3 text-[#2997ff] animate-pulse" />;
    }
    if (lower.includes("reason") || lower.includes("analyzing") || lower.includes("examining")) {
      return <Brain className="h-3 w-3 text-[#2997ff] animate-pulse" />;
    }
    return <Loader2 className="h-3 w-3 text-[#2997ff] animate-spin" />;
  };

  const cleanStepText = (text: string) => {
    return text.replace(/^[*>\s-]+/, "").replace(/[*_]/g, "").trim();
  };

  return (
    <div className="w-full my-1.5 rounded-lg border border-white/[0.08] bg-[#12131a]/60 overflow-hidden transition-all text-left">
      {/* Sleek Minimal Header Bar */}
      <button
        type="button"
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="w-full flex items-center justify-between px-3 py-1.5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer group text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0071e3]/15 text-[#2997ff]">
            {isThinking ? (
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
            ) : (
              <Sparkles className="h-2.5 w-2.5 text-white/50 group-hover:text-emerald-400 transition-colors" />
            )}
          </div>
          <span className="text-[12px] font-medium text-white/70 group-hover:text-white/90 transition-colors truncate">
            {isThinking
              ? "Thinking & Reasoning..."
              : `Thought process (${steps.length} ${steps.length === 1 ? "step" : "steps"})`}
          </span>
          {isThinking && (
            <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-[#0071e3]/20 text-[#42a1ff] border border-[#0071e3]/30">
              Live
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-white/40 group-hover:text-white/70 transition-colors shrink-0 ml-2">
          {isCollapsed ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5" />
          )}
        </div>
      </button>

      {/* Expanded Step Timeline */}
      {!isCollapsed && (
        <div className="border-t border-white/[0.05] bg-black/25 px-3 py-2 space-y-1.5 max-h-56 overflow-y-auto overscroll-contain">
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1;
            const isCurrent = isThinking && isLast;

            return (
              <div
                key={idx}
                className={cn(
                  "flex items-start gap-2 text-[11px] leading-snug transition-all",
                  isCurrent
                    ? "text-[#42a1ff] font-medium py-1 px-2 rounded-md bg-[#0071e3]/10 border border-[#0071e3]/20"
                    : "text-white/60 py-0.5"
                )}
              >
                <div className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                  {getStepIcon(step, isCurrent)}
                </div>
                <span className="break-words min-w-0 flex-1">
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
