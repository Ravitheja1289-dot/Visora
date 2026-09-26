"use client";

import React, { useState } from "react";
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  X, 
  Sliders, 
  ArrowLeft 
} from "lucide-react";
import { UploadedImageState } from "@/types/image";
import { formatBytes } from "@/lib/utils";

interface ImageWorkspaceProps {
  image: UploadedImageState;
  onReplace: () => void;
  onRemove: () => void;
}

export function ImageWorkspace({
  image,
  onReplace,
  onRemove,
}: ImageWorkspaceProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [fitMode, setFitMode] = useState<"contain" | "actual">("contain");

  const handleZoomIn = () => {
    setFitMode("actual");
    setZoomLevel((prev) => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setFitMode("actual");
    setZoomLevel((prev) => Math.max(prev - 25, 50));
  };

  const handleFitToggle = () => {
    if (fitMode === "contain") {
      setFitMode("actual");
      setZoomLevel(100);
    } else {
      setFitMode("contain");
      setZoomLevel(100);
    }
  };

  return (
    <div className="flex h-full w-full flex-col rounded-[24px] border border-white/[0.08] bg-white/[0.015] backdrop-blur-[40px] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {/* Top Specular Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] bg-black/20 px-4 py-3">
        {/* File Metadata Info */}
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-white/80">
            <Sliders className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col truncate">
            <span className="truncate text-xs font-semibold tracking-tight text-white">
              {image.metadata.name}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-[#86868b]">
              <span>{formatBytes(image.metadata.size)}</span>
              {image.metadata.width && image.metadata.height && (
                <>
                  <span>•</span>
                  <span>{image.metadata.width} × {image.metadata.height}px</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Viewport Zoom & Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Zoom controls */}
          <div className="flex items-center rounded-full border border-white/[0.1] bg-white/[0.04] p-0.5">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 50}
              className="flex h-6 w-6 items-center justify-center rounded-full text-white/70 hover:bg-white/[0.08] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Zoom out"
            >
              <ZoomOut className="h-3 w-3" />
            </button>
            <span className="w-10 text-center font-mono text-[10px] text-white/60">
              {fitMode === "contain" ? "Fit" : `${zoomLevel}%`}
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 300}
              className="flex h-6 w-6 items-center justify-center rounded-full text-white/70 hover:bg-white/[0.08] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Zoom in"
            >
              <ZoomIn className="h-3 w-3" />
            </button>
          </div>

          {/* Fit / Actual size toggle */}
          <button
            type="button"
            onClick={handleFitToggle}
            className="flex items-center gap-1 rounded-full border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/70 hover:bg-white/[0.08] hover:text-white transition-all"
            title="Toggle fit mode"
          >
            <Maximize2 className="h-3 w-3" />
            <span className="hidden sm:inline">
              {fitMode === "contain" ? "100%" : "Fit"}
            </span>
          </button>

          {/* Replace Button */}
          <button
            type="button"
            onClick={onReplace}
            className="rounded-full border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/70 hover:bg-white/[0.08] hover:text-white transition-all"
            title="Change current image"
          >
            Replace
          </button>

          {/* Remove / Close Button */}
          <button
            type="button"
            onClick={onRemove}
            className="flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-white/60 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 transition-all"
            title="Remove image"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Interactive Image Canvas Viewport */}
      <div className="relative flex flex-1 min-h-[350px] items-center justify-center overflow-auto p-4 bg-black/40">
        {/* Subtle grid pattern background */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:20px_20px]" 
        />

        {/* The Visual Canvas Element */}
        <div className="relative flex items-center justify-center transition-all duration-200 ease-out">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.dataUrl}
            alt={image.metadata.name}
            style={
              fitMode === "actual"
                ? { transform: `scale(${zoomLevel / 100})`, transformOrigin: "center" }
                : undefined
            }
            className={
              fitMode === "contain"
                ? "max-h-[calc(100vh-16rem)] max-w-full object-contain rounded-xl shadow-2xl border border-white/[0.08]"
                : "max-w-none rounded-xl shadow-2xl border border-white/[0.08] transition-transform duration-150"
            }
          />
        </div>

        {/* Canvas Corner Watermark */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-black/60 px-2.5 py-0.5 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2997ff]" />
          <span className="text-[10px] font-mono text-white/50">Active Canvas</span>
        </div>
      </div>
    </div>
  );
}
