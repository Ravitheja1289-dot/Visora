"use client";

import React, { useEffect, useRef } from "react";
import { ChatMessage } from "@/types/chat";
import { Message } from "./message";

interface MessageListProps {
  messages: ChatMessage[];
  children?: React.ReactNode;
}

export function MessageList({ messages, children }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-3 space-y-3 overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.18)_transparent]"
    >
      {/* Optional Top Slot */}
      {children}

      {/* Render Message List */}
      <div className="flex flex-col gap-3 pt-1 w-full min-w-0 break-words">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
      </div>

      <div ref={bottomRef} className="h-px shrink-0" />
    </div>
  );
}
