"use client";

import React from "react";
import { Navbar } from "./navbar";
import { cn } from "@/lib/utils";

interface ShellProps {
  children: React.ReactNode;
  onReset?: () => void;
  hasActiveImage?: boolean;
  isWorkspaceActive?: boolean;
}

export function Shell({
  children,
  onReset,
  hasActiveImage,
  isWorkspaceActive,
}: ShellProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col bg-[#050507] text-[#f5f5f7] selection:bg-[#0071e3]/40 selection:text-white",
        isWorkspaceActive ? "h-screen overflow-hidden" : "min-h-screen"
      )}
    >
      {/* Apple Pro Ambient Spotlight Glow */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_65%_45%_at_50%_5%,rgba(41,151,255,0.12),rgba(140,100,255,0.04),transparent_70%)]" 
        aria-hidden="true"
      />

      {/* Subtle Precision Dot Matrix with Radial Vignette */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] [background-image:radial-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_60%,transparent_100%)]"
        aria-hidden="true"
      />

      {/* Header Navigation */}
      <Navbar onReset={onReset} hasActiveImage={hasActiveImage} />

      {/* Main View Area */}
      <main
        className={cn(
          "relative z-10 flex flex-col",
          isWorkspaceActive
            ? "flex-1 min-h-0 overflow-hidden p-3 md:p-4"
            : "flex-1 justify-center px-4 py-6 sm:px-6 md:py-10"
        )}
      >
        <div
          className={cn(
            "mx-auto w-full",
            isWorkspaceActive
              ? "h-full min-h-0 flex-1 flex flex-col max-w-[1600px] overflow-hidden"
              : "max-w-6xl"
          )}
        >
          {children}
        </div>
      </main>

      {/* Apple-style Minimal Footer - Hidden when workspace is active */}
      {!isWorkspaceActive && (
        <footer className="relative z-10 border-t border-white/[0.06] bg-black/30 py-4 px-6 text-center text-xs text-[#86868b] backdrop-blur-md shrink-0">
          <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white/80">Visora</span>
              <span>·</span>
              <span>Multimodal Visual Reasoning Assistant</span>
            </div>
            <div className="flex items-center gap-3 text-white/40">
              <span>PNG · JPG · WEBP</span>
              <span>•</span>
              <span>Client Workspace Active</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
