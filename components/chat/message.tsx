"use client";

import React from "react";
import { ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Sparkles, Ban } from "lucide-react";

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
          <div className="rounded-2xl rounded-tr-sm border border-white/[0.1] bg-white/[0.08] px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm">
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          <span className="px-1 text-[10px] text-white/30">{formattedTime}</span>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex w-full justify-start animate-fade-in py-1">
      <div className="flex max-w-[92%] items-start gap-3">
        {/* Subtle Assistant Avatar Glyph */}
        <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04] text-white/80">
          <Sparkles className="h-3 w-3 text-[#2997ff]" />
        </div>

        {/* Content Container (no heavy card) */}
        <div className="flex flex-col gap-1.5 pt-0.5">
          <div className="text-sm leading-relaxed text-white/90">
            {message.content ? (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            ) : message.isStreaming ? (
              <span className="inline-block h-4 w-1 animate-pulse bg-[#2997ff]" />
            ) : null}

            {/* Streaming Cursor */}
            {message.isStreaming && message.content && (
              <span className="ml-1 inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-[#2997ff]" />
            )}
          </div>

          {/* Stopped indicator */}
          {message.isStopped && (
            <div className="inline-flex items-center gap-1.5 text-[11px] text-amber-400/80 pt-0.5">
              <Ban className="h-3 w-3" />
              <span>Generation stopped</span>
            </div>
          )}

          <span className="text-[10px] text-white/30">{formattedTime}</span>
        </div>
      </div>
    </div>
  );
}
