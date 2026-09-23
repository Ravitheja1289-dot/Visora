"use client";

import React, { useState, useRef, useCallback } from "react";
import { 
  Upload, 
  AlertCircle, 
  ArrowUpRight, 
  Plus, 
  Layers, 
  Layout, 
  Cpu, 
  Maximize,
  Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UploadedImageState, ExampleImageItem } from "@/types/image";
import { EXAMPLE_IMAGES } from "@/lib/examples";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
  onImageSelected: (image: UploadedImageState) => void;
}

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

const EXAMPLE_ICONS = {
  "ui-dashboard": Layout,
  "arch-pipeline": Cpu,
  "spatial-geometry": Compass,
};

export function ImageDropzone({ onImageSelected }: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      setErrorMessage(null);

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setErrorMessage("Unsupported format. Please upload PNG, JPG, or WEBP.");
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setErrorMessage("File exceeds 15MB limit.");
        return;
      }

      setIsLoading(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;

        const img = new window.Image();
        img.onload = () => {
          setIsLoading(false);
          onImageSelected({
            dataUrl,
            file,
            metadata: {
              name: file.name,
              size: file.size,
              type: file.type,
              width: img.width,
              height: img.height,
              aspectRatio: `${img.width}:${img.height}`,
            },
          });
        };
        img.onerror = () => {
          setIsLoading(false);
          setErrorMessage("Failed to decode image data.");
        };
        img.src = dataUrl;
      };

      reader.onerror = () => {
        setIsLoading(false);
        setErrorMessage("Error reading file from disk.");
      };

      reader.readAsDataURL(file);
    },
    [onImageSelected]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleExampleSelect = (example: ExampleImageItem) => {
    onImageSelected({
      dataUrl: example.dataUrl,
      metadata: example.metadata,
    });
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        onChange={handleFileInputChange}
        className="hidden"
        tabIndex={-1}
        aria-label="Upload visual asset"
      />

      {/* Apple Frosted Glass Drop Target */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            fileInputRef.current?.click();
          }
        }}
        className={cn(
          "group relative w-full cursor-pointer rounded-[28px] border transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2997ff]/60",
          "p-8 sm:p-10 text-center shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl",
          isDragging
            ? "border-[#2997ff] bg-white/[0.08] shadow-[0_0_60px_rgba(41,151,255,0.25)] scale-[1.01]"
            : "border-white/[0.12] bg-gradient-to-b from-white/[0.05] to-white/[0.02] hover:border-white/[0.22] hover:bg-white/[0.06]"
        )}
      >
        {/* Subtle Specular Top Highlight */}
        <div 
          className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent" 
        />

        <div className="flex flex-col items-center justify-center gap-4">
          {/* Apple Lens Aperture Center Icon */}
          <div
            className={cn(
              "relative flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-300",
              isDragging
                ? "border-[#2997ff]/70 bg-[#2997ff]/20 text-[#2997ff] scale-110"
                : "border-white/[0.14] bg-white/[0.05] text-white/90 group-hover:scale-105 group-hover:border-white/[0.25] group-hover:bg-white/[0.1]"
            )}
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              <Upload className="h-6 w-6 stroke-[1.75]" />
            )}
            {/* Subtle corner reticles */}
            <div className="absolute -top-1 -left-1 h-2 w-2 border-t-2 border-l-2 border-white/20 rounded-tl" />
            <div className="absolute -bottom-1 -right-1 h-2 w-2 border-b-2 border-r-2 border-white/20 rounded-br" />
          </div>

          {/* Typography */}
          <div className="flex flex-col items-center gap-1 max-w-sm">
            <h3 className="text-base sm:text-lg font-semibold tracking-tight text-white">
              Drag and drop an image
            </h3>
            <p className="text-xs sm:text-sm text-[#86868b] leading-relaxed">
              Drop UI designs, diagrams, or spatial scenes to interrogate.
            </p>
          </div>

          {/* Action Trigger */}
          <div className="pt-1">
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isLoading}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              leftIcon={<Plus className="h-3.5 w-3.5 stroke-[2.2]" />}
            >
              Browse files
            </Button>
          </div>

          {/* Supported Formats */}
          <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-[#86868b]">
            <span>Supports PNG, JPG, WEBP</span>
            <span>•</span>
            <span>Up to 15MB</span>
          </div>
        </div>

        {/* Error Alert Display */}
        {errorMessage && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs text-red-300 animate-fade-in"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* "Explore with an example" - Elevated Bento Cards */}
      <div className="mt-8 w-full">
        <div className="mb-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-[#2997ff]" />
            <span className="text-xs font-semibold tracking-wider uppercase text-white/70">
              Or try a benchmark visual
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#86868b]">3 interactive presets</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {EXAMPLE_IMAGES.map((example) => {
            const Icon = EXAMPLE_ICONS[example.id as keyof typeof EXAMPLE_ICONS] || Layout;

            return (
              <button
                key={example.id}
                type="button"
                onClick={() => handleExampleSelect(example)}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.015] p-4 text-left backdrop-blur-xl transition-all duration-200 hover:border-white/[0.22] hover:bg-white/[0.06] hover:shadow-[0_12px_32px_rgba(0,0,0,0.6)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2997ff]/60"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/80 group-hover:text-white group-hover:border-white/[0.18]">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <Badge variant="default" size="sm" className="text-[10px] bg-white/[0.06]">
                      {example.category}
                    </Badge>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold tracking-tight text-white group-hover:text-[#2997ff] transition-colors">
                    {example.title}
                  </h4>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#86868b] line-clamp-2">
                    {example.description}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2 text-[10px] text-white/40 group-hover:text-white/70">
                  <span>Inspect benchmark</span>
                  <ArrowUpRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
