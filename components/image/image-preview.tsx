"use client";

import React, { useState } from "react";
import { 
  X, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  ArrowRight,
  Info,
  Sliders,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UploadedImageState } from "@/types/image";
import { formatBytes } from "@/lib/utils";

interface ImagePreviewProps {
  image: UploadedImageState;
  onClear: () => void;
  onReplace: () => void;
  onAnalyze?: (prompt?: string) => void;
}

export function ImagePreview({
  image,
  onClear,
  onReplace,
  onAnalyze,
}: ImagePreviewProps) {
  const [zoomFit, setZoomFit] = useState<"contain" | "original">("contain");
  const [promptInput, setPromptInput] = useState("");
  const [analysisTriggered, setAnalysisTriggered] = useState(false);

  const handleAnalyzeClick = () => {
    setAnalysisTriggered(true);
    if (onAnalyze) {
      onAnalyze(promptInput);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      {/* Apple Frosted Glass Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.09] bg-white/[0.04] p-3.5 sm:px-5 backdrop-blur-2xl shadow-apple-card">
        {/* File metadata info */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white">
            <Sliders className="h-4 w-4" />
          </div>
          <div className="flex flex-col truncate">
            <span className="truncate text-sm font-semibold tracking-tight text-white">
              {image.metadata.name}
            </span>
            <div className="flex items-center gap-2 pt-0.5 text-xs text-[#86868b]">
              <span>{formatBytes(image.metadata.size)}</span>
              {image.metadata.width && image.metadata.height && (
                <>
                  <span>•</span>
                  <span>{image.metadata.width} × {image.metadata.height} px</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* View Controls & Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setZoomFit(zoomFit === "contain" ? "original" : "contain")}
            className="flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-white/80 hover:bg-white/[0.12] hover:text-white transition-all"
            title="Toggle zoom mode"
          >
            {zoomFit === "contain" ? (
              <>
                <Maximize2 className="h-3 w-3" />
                <span className="hidden sm:inline">Fit View</span>
              </>
            ) : (
              <>
                <Minimize2 className="h-3 w-3" />
                <span className="hidden sm:inline">Actual Size</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onReplace}
            className="rounded-full border border-white/[0.12] bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-white/80 hover:bg-white/[0.12] hover:text-white transition-all"
          >
            Replace
          </button>

          <button
            type="button"
            onClick={onClear}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.06] text-white/70 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 transition-all"
            title="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Image Viewport with Apple Glass Styling */}
      <div className="relative flex min-h-[380px] max-h-[600px] w-full items-center justify-center overflow-auto rounded-[28px] border border-white/[0.09] bg-black/60 p-6 backdrop-blur-2xl shadow-apple-card">
        {/* Ambient Backlight under Image */}
        <div 
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(41,151,255,0.06)_0%,transparent_70%)]" 
        />

        {/* The Rendered Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.dataUrl}
          alt={image.metadata.name}
          className={
            zoomFit === "contain"
              ? "max-h-[520px] max-w-full object-contain rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-white/[0.08] transition-all duration-300"
              : "max-w-none rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-white/[0.08] transition-all duration-300"
          }
        />

        {/* Floating Apple Pill Status */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full border border-white/[0.14] bg-black/75 px-3 py-1.5 backdrop-blur-xl shadow-lg">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span className="text-[11px] font-medium text-white/90">Ready to Analyze</span>
        </div>
      </div>

      {/* Spotlight-Style Prompt & Reasoning Initiation Card */}
      <div className="flex flex-col gap-4 rounded-3xl border border-white/[0.09] bg-white/[0.04] p-5 sm:p-6 backdrop-blur-2xl shadow-apple-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#2997ff]" />
            <span className="text-sm font-semibold tracking-tight text-white">
              Visual Question or Instruction
            </span>
          </div>
          <Badge variant="accent" size="sm">
            Phase 1
          </Badge>
        </div>

        {/* Spotlight-style Input Field */}
        <div className="relative">
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAnalyzeClick();
              }
            }}
            placeholder="Ask about layout hierarchy, spatial arrangement, colors, or UI elements..."
            className="w-full rounded-2xl border border-white/[0.12] bg-black/40 px-5 py-3.5 text-sm text-white placeholder-[#86868b] backdrop-blur-xl transition-all duration-200 focus:border-[#2997ff] focus:bg-black/60 focus:outline-none focus:ring-4 focus:ring-[#2997ff]/20"
          />
        </div>

        {/* Bottom Actions Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-[#86868b]">
            <Info className="h-3.5 w-3.5 text-white/50 shrink-0" />
            <span>Gemini 2.5 Flash Vision & LangGraph streaming reasoning active.</span>
          </div>

          <Button
            type="button"
            variant="accent"
            size="md"
            onClick={handleAnalyzeClick}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Analyze image
          </Button>
        </div>

        {/* Confirmation note when clicked */}
        {analysisTriggered && (
          <div className="mt-1 flex items-center gap-2 rounded-xl border border-[#2997ff]/30 bg-[#2997ff]/10 p-3 text-xs text-white/90 animate-fade-in">
            <Check className="h-4 w-4 text-[#2997ff] shrink-0" />
            <span>
              Image primed for analysis: &ldquo;{promptInput.trim() || "Full visual reasoning inspection"}&rdquo;. Architecture ready for CopilotKit streaming agent.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
