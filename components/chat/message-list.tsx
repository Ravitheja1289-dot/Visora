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

  // Auto-scroll to bottom on messages update or streaming tokens
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
      {/* Top Slot (e.g. Analysis Panel) */}
      {children}

      {/* Render Message List */}
      <div className="flex flex-col gap-3 pt-2">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
      </div>

      <div ref={bottomRef} />
    </div>
  );
}
