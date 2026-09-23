"use client";

import React from "react";
import { ChevronDown, ChevronUp, Check, ArrowRight, Loader2, Sparkles, Ban } from "lucide-react";
import { AnalysisState } from "@/types/chat";
import { cn } from "@/lib/utils";

interface ReasoningPanelProps {
  analysisState: AnalysisState;
  onToggleCollapse: () => void;
}

export function ReasoningPanel({
  analysisState,
  onToggleCollapse,
}: ReasoningPanelProps) {
  const { isCollapsed, status, stages } = analysisState;

  const getStatusBadge = () => {
    switch (status) {
      case "analyzing":
        return (
          <span className="flex items-center gap-1.5 rounded-full border border-[#0071e3]/40 bg-[#0071e3]/15 px-2.5 py-0.5 text-[10px] font-medium text-[#2997ff]">
            <Loader2 className="h-2.5 w-2.5 animate-spin" />
            Analyzing
          </span>
        );
      case "completed":
        return (
          <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400">
            <Check className="h-2.5 w-2.5" />
            Complete
          </span>
        );
      case "stopped":
        return (
          <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-medium text-amber-400">
            <Ban className="h-2.5 w-2.5" />
            Stopped
          </span>
        );
      default:
        return (
          <span className="rounded-full border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-white/50">
            Ready to analyze
          </span>
        );
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.03] backdrop-blur-xl transition-all">
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={onToggleCollapse}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/[0.03] focus-visible:outline-none"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-[#2997ff]" />
          <span className="text-xs font-semibold tracking-tight text-white">
            Analysis
          </span>
          {getStatusBadge()}
        </div>

        <div className="flex items-center gap-1 text-white/50 hover:text-white">
          <span className="text-[11px] font-medium text-white/40">
            {isCollapsed ? "Show details" : "Hide"}
          </span>
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* Collapsible Body */}
      {!isCollapsed && (
        <div className="border-t border-white/[0.06] bg-black/30 px-4 py-3">
          <div className="flex flex-col gap-2">
            {stages.map((stage) => {
              const isCompleted = stage.status === "completed";
              const isInProgress = stage.status === "in_progress";
              const isPending = stage.status === "pending";

              return (
                <div
                  key={stage.id}
                  className={cn(
                    "flex items-center gap-2.5 text-xs transition-colors py-0.5",
                    isCompleted && "text-white/80",
                    isInProgress && "text-[#2997ff] font-medium",
                    isPending && "text-white/30"
                  )}
                >
                  {/* Status Indicator Icon */}
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {isCompleted ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : isInProgress ? (
                      status === "stopped" ? (
                        <Ban className="h-3.5 w-3.5 text-amber-400" />
                      ) : (
                        <ArrowRight className="h-3.5 w-3.5 animate-pulse text-[#2997ff]" />
                      )
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                    )}
                  </div>

                  {/* Stage Label */}
                  <span>{stage.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
