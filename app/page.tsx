"use client";

import React, { useState } from "react";
import { Shell } from "@/components/layout/shell";
import { ImageDropzone } from "@/components/image/image-dropzone";
import { ImagePreview } from "@/components/image/image-preview";
import { ImageWorkspace } from "@/components/image/image-workspace";
import { ChatWorkspace } from "@/components/chat/chat-workspace";
import { UploadedImageState } from "@/types/image";
import { CopilotProvider } from "@/components/copilot/copilot-provider";
import { useCopilotVisoraChat } from "@/hooks/use-copilot-visora-chat";
import { ImageIcon, MessageSquare, AlertTriangle } from "lucide-react";

function VisoraApp() {
  const [selectedImage, setSelectedImage] = useState<UploadedImageState | null>(null);
  const [isWorkspaceActive, setIsWorkspaceActive] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<"image" | "assistant">("image");

  const {
    messages,
    generationStatus,
    analysisState,
    connectionError,
    startAnalysis,
    sendMessage,
    stopGeneration,
    resetChat,
    toggleAnalysisCollapse,
    clarificationOptions,
  } = useCopilotVisoraChat({ selectedImage });

  const handleReset = () => {
    setSelectedImage(null);
    setIsWorkspaceActive(false);
    resetChat();
  };

  const handleImageSelected = (image: UploadedImageState) => {
    setSelectedImage(image);
    setIsWorkspaceActive(false);
    resetChat();
  };

  const handleStartAnalysis = (prompt?: string) => {
    setIsWorkspaceActive(true);
    setMobileTab("assistant");
    startAnalysis(prompt);
  };

  return (
    <Shell
      onReset={handleReset}
      hasActiveImage={!!selectedImage}
      isWorkspaceActive={isWorkspaceActive}
    >
      {/* 1. Empty State */}
      {!selectedImage && (
        <div className="flex flex-col items-center text-center animate-fade-in py-2">
          {/* Hero Header */}
          <div className="mb-10 max-w-2xl mt-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-1.5 backdrop-blur-xl shadow-sm transition-all hover:bg-white/[0.05]">
              <span className="h-2 w-2 rounded-full bg-[#0071e3] shadow-[0_0_8px_rgba(0,113,227,0.8)]" />
              <span className="text-[13px] font-medium tracking-wide text-white/90">
                Visual Reasoning Assistant
              </span>
            </div>

            <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl md:text-[72px] leading-[1.05]">
              See it. Question it. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#ffffff] via-[#a5a5ac] to-[#424245]">
                Understand it.
              </span>
            </h1>

            <p className="mt-6 text-[17px] leading-[1.4] text-[#86868b] font-medium max-w-[28rem] mx-auto tracking-[-0.015em]">
              Interrogate interfaces, architecture schematics, and spatial scenes.
              Inspect layout hierarchies and question visual claims with transparent reasoning.
            </p>
          </div>

          {/* Large Dropzone & Curated Examples */}
          <div className="w-full max-w-2xl">
            <ImageDropzone onImageSelected={handleImageSelected} />
          </div>
        </div>
      )}

      {/* 2. Image Inspection / Preview State (Pre-Analysis) */}
      {selectedImage && !isWorkspaceActive && (
        <div className="w-full max-w-4xl mx-auto py-2 animate-fade-in">
          <ImagePreview
            image={selectedImage}
            onClear={handleReset}
            onReplace={handleReset}
            onAnalyze={handleStartAnalysis}
          />
        </div>
      )}

      {/* 3. Main Workspace State (Dual-Pane Desktop / Responsive Mobile) */}
      {selectedImage && isWorkspaceActive && (
        <div className="w-full h-full min-h-0 flex-1 flex flex-col overflow-hidden animate-fade-in">
          {/* Connection Error Banner (Clean Dev Feedback, never hidden) */}
          {connectionError && (
            <div className="mb-3 flex items-center justify-between rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-2 text-xs text-red-200 shrink-0">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                <span>CopilotKit Runtime Error: {connectionError}</span>
              </div>
            </div>
          )}

          {/* Mobile Tab Switcher */}
          <div className="flex sm:hidden items-center justify-center mb-3 shrink-0">
            <div className="inline-flex rounded-full border border-white/[0.12] bg-white/[0.05] p-1 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setMobileTab("image")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all ${
                  mobileTab === "image"
                    ? "bg-white text-black shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Image</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileTab("assistant")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all ${
                  mobileTab === "assistant"
                    ? "bg-white text-black shadow-sm"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Assistant</span>
              </button>
            </div>
          </div>

          {/* Desktop Dual-Pane Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full min-h-0 flex-1 overflow-hidden">
            {/* Left Pane: Image Canvas */}
            <div
              className={`lg:col-span-7 h-full min-h-0 overflow-hidden ${
                mobileTab === "image" ? "flex flex-col" : "hidden lg:flex lg:flex-col"
              }`}
            >
              <ImageWorkspace
                image={selectedImage}
                onReplace={handleReset}
                onRemove={handleReset}
              />
            </div>

            {/* Right Pane: Assistant Chat Workspace */}
            <div
              className={`lg:col-span-5 h-full min-h-0 overflow-hidden ${
                mobileTab === "assistant" ? "flex flex-col" : "hidden lg:flex lg:flex-col"
              }`}
            >
              <ChatWorkspace
                messages={messages}
                analysisState={analysisState}
                generationStatus={generationStatus}
                onSendMessage={sendMessage}
                onStop={stopGeneration}
                onToggleAnalysisCollapse={toggleAnalysisCollapse}
                clarificationOptions={clarificationOptions}
              />
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}

export default function HomePage() {
  return (
    <CopilotProvider>
      <VisoraApp />
    </CopilotProvider>
  );
}
