"use client";

import React from "react";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessage, AnalysisState, GenerationStatus } from "@/types/chat";

interface ChatWorkspaceProps {
  messages: ChatMessage[];
  analysisState?: AnalysisState;
  generationStatus: GenerationStatus;
  onSendMessage: (message: string) => void;
  onStop: () => void;
  onToggleAnalysisCollapse?: () => void;
  clarificationOptions?: string[];
}

export function ChatWorkspace({
  messages,
  generationStatus,
  onSendMessage,
  onStop,
  clarificationOptions,
}: ChatWorkspaceProps) {
  return (
    <div className="flex flex-col h-full w-full min-h-0 rounded-[24px] border border-white/[0.08] bg-[#0c0d12]/90 backdrop-blur-md overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {/* Assistant Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] bg-black/20 px-5 py-3.5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0071e3]/10">
            <div className="h-2.5 w-2.5 rounded-full bg-[#0071e3] shadow-[0_0_10px_#0071e3]" />
          </div>
          <h3 className="text-[15px] font-semibold tracking-tight text-white/95">
            Assistant
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[12px] font-medium text-[#86868b]">
          <span>Multimodal Session</span>
        </div>
      </div>

      {/* Message Viewport */}
      <MessageList messages={messages} />

      {/* Bottom Composer */}
      <ChatInput
        onSendMessage={onSendMessage}
        onStop={onStop}
        generationStatus={generationStatus}
        clarificationOptions={clarificationOptions}
      />
    </div>
  );
}
