"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Github, Eye } from "lucide-react";

interface NavbarProps {
  onReset?: () => void;
  hasActiveImage?: boolean;
}

export function Navbar({ onReset, hasActiveImage }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.07] bg-black/65 backdrop-blur-2xl transition-colors">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4 sm:px-6">
        {/* Logo and Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="group flex items-center gap-2 text-left focus-visible:outline-none"
            title="Visora Home"
          >
            {/* Apple-style minimalist lens/aperture icon */}
            <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.08] border border-white/[0.14] transition-all duration-300 group-hover:bg-white/[0.14] group-hover:border-white/[0.25]">
              <Eye className="h-3.5 w-3.5 text-white/90 transition-transform duration-200 group-hover:scale-110" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-white">
                Visora
              </span>
              <Badge variant="default" size="sm" className="hidden text-[10px] text-white/70 sm:inline-flex">
                Preview
              </Badge>
            </div>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {hasActiveImage && (
            <button
              onClick={onReset}
              className="text-xs font-medium text-white/80 hover:text-white transition-colors px-3 py-1 rounded-full border border-white/[0.12] bg-white/[0.06] hover:bg-white/[0.12]"
            >
              New Image
            </button>
          )}

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.1] transition-all"
            aria-label="GitHub Repository"
          >
            <Github className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
}
