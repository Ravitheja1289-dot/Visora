"use client";

import React from "react";
import { ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Sparkles, Ban } from "lucide-react";

import ReactMarkdown from "react-markdown";
import { ThinkingBlock } from "./thinking-block";

function parseThinking(content: string, isStreaming: boolean) {
  const startTag = "<thinking>";
  const endTag = "</thinking>";
  const startIndex = content.indexOf(startTag);

  if (startIndex === -1) {
    return { thinkingText: null, isThinking: false, responseText: content };
  }

  const endIndex = content.indexOf(endTag);
  if (endIndex === -1) {
    // Thinking is currently in progress
    const thinkingText = content.slice(startIndex + startTag.length).trim();
    return {
      thinkingText,
      isThinking: isStreaming,
      responseText: "",
    };
  }

  const thinkingText = content.slice(startIndex + startTag.length, endIndex).trim();
  const responseText = content.slice(endIndex + endTag.length).trim();
  return {
    thinkingText,
    isThinking: false,
    responseText,
  };
}

interface MessageProps {
  message: ChatMessage;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === "user";

  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(message.timestamp);

  if (isUser) {
    return (
      <div className="flex w-full justify-end animate-fade-in py-1">
        <div className="flex max-w-[85%] flex-col items-end gap-1">
          <div className="rounded-[20px] rounded-tr-[4px] bg-[#0071e3] px-4 py-2.5 text-[15px] font-normal leading-relaxed text-white shadow-sm">
            <p className="whitespace-pre-wrap break-words m-0">{message.content}</p>
          </div>
          <span className="px-1 text-[10px] font-medium text-white/30">{formattedTime}</span>
        </div>
      </div>
    );
  }

  // Assistant message
  const { thinkingText, isThinking, responseText } = parseThinking(
    message.content,
    Boolean(message.isStreaming)
  );

  return (
    <div className="flex w-full justify-start animate-fade-in py-1.5">
      <div className="flex w-full max-w-[95%] items-start gap-3">
        {/* Apple Intelligence Style Avatar */}
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#0071e3]/20 to-[#42a1ff]/20 border border-[#0071e3]/30 text-[#42a1ff] shadow-[0_0_12px_rgba(0,113,227,0.15)]">
          <Sparkles className="h-3.5 w-3.5" />
        </div>

        {/* Content Container */}
        <div className="flex flex-col gap-1.5 pt-1 w-full min-w-0">
          {/* ChatGPT / Gemini Style Execution Flow */}
          {thinkingText && (
            <ThinkingBlock
              thinkingText={thinkingText}
              isThinking={isThinking}
            />
          )}

          <div className="text-[15px] font-normal leading-relaxed text-white/95">
            {responseText ? (
              <div className="prose prose-invert prose-p:leading-[1.6] prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 max-w-none break-words tracking-[-0.015em]">
                <ReactMarkdown>{responseText}</ReactMarkdown>
              </div>
            ) : message.isStreaming && !thinkingText ? (
              <span className="inline-block h-4 w-1 animate-pulse bg-[#0071e3] mt-1" />
            ) : null}

            {/* Streaming Cursor */}
            {message.isStreaming && responseText && (
              <span className="ml-1 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-[#0071e3] align-middle" />
            )}
          </div>

          {/* Stopped indicator */}
          {message.isStopped && (
            <div className="inline-flex items-center gap-1.5 text-[11px] text-amber-500/90 pt-0.5 font-medium">
              <Ban className="h-3 w-3" />
              <span>Generation stopped</span>
            </div>
          )}

          <span className="text-[10px] font-medium text-white/30 pt-0.5">{formattedTime}</span>
        </div>
      </div>
    </div>
  );
}
