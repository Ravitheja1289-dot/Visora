"use client";

import React from "react";
import { ReasoningPanel } from "@/components/reasoning/reasoning-panel";
import { MessageList } from "@/components/chat/message-list";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessage, AnalysisState, GenerationStatus } from "@/types/chat";

interface ChatWorkspaceProps {
  messages: ChatMessage[];
  analysisState: AnalysisState;
  generationStatus: GenerationStatus;
  onSendMessage: (message: string) => void;
  onStop: () => void;
  onToggleAnalysisCollapse: () => void;
}

export function ChatWorkspace({
  messages,
  analysisState,
  generationStatus,
  onSendMessage,
  onStop,
  onToggleAnalysisCollapse,
}: ChatWorkspaceProps) {
  return (
    <div className="flex h-full w-full flex-col rounded-[24px] border border-white/[0.09] bg-white/[0.02] backdrop-blur-2xl overflow-hidden shadow-apple-card">
      {/* Assistant Header */}
      <div className="flex items-center justify-between border-b border-white/[0.07] bg-white/[0.03] px-5 py-3.5">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#2997ff] shadow-[0_0_8px_#2997ff]" />
          <h3 className="text-xs font-semibold tracking-tight text-white">
            Assistant
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#86868b]">
          <span>Multimodal Session</span>
        </div>
      </div>

      {/* Message Viewport with Top Analysis Panel */}
      <MessageList messages={messages}>
        <div className="pt-1 pb-2">
          <ReasoningPanel
            analysisState={analysisState}
            onToggleCollapse={onToggleAnalysisCollapse}
          />
        </div>
      </MessageList>

      {/* Bottom Composer */}
      <ChatInput
        onSendMessage={onSendMessage}
        onStop={onStop}
        generationStatus={generationStatus}
      />
    </div>
  );
}
