"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ChatMessage, AnalysisStage, AnalysisState, GenerationStatus } from "@/types/chat";
import { getMockResponseForQuery } from "@/lib/mock-responses";

const INITIAL_STAGES: AnalysisStage[] = [
  { id: "stage-1", label: "Examining image", status: "pending" },
  { id: "stage-2", label: "Identifying visual elements", status: "pending" },
  { id: "stage-3", label: "Analyzing spatial relationships", status: "pending" },
  { id: "stage-4", label: "Ready", status: "pending" },
];

export function useVisoraChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>("idle");
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isCollapsed: false,
    status: "idle",
    stages: INITIAL_STAGES,
    currentStageIndex: 0,
  });

  // Timer references for clean cancellation on Stop
  const analysisTimersRef = useRef<NodeJS.Timeout[]>([]);
  const streamTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear all pending timers
  const clearAllTimers = useCallback(() => {
    analysisTimersRef.current.forEach(clearTimeout);
    analysisTimersRef.current = [];
    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  // Stop Generation
  const stopGeneration = useCallback(() => {
    clearAllTimers();

    if (generationStatus === "analyzing") {
      setGenerationStatus("stopped");
      setAnalysisState((prev) => ({
        ...prev,
        status: "stopped",
      }));
    } else if (generationStatus === "streaming") {
      setGenerationStatus("stopped");
      setMessages((prev) =>
        prev.map((msg) =>
          msg.isStreaming ? { ...msg, isStreaming: false, isStopped: true } : msg
        )
      );
    }
  }, [clearAllTimers, generationStatus]);

  // Stream assistant message response
  const streamAssistantResponse = useCallback(
    (fullText: string) => {
      const assistantMessageId = `msg-asst-${Date.now()}`;
      const newAssistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, newAssistantMessage]);
      setGenerationStatus("streaming");

      let currentIndex = 0;
      const step = 4; // Characters per tick for realistic smooth typing

      streamTimerRef.current = setInterval(() => {
        currentIndex += step;
        if (currentIndex >= fullText.length) {
          if (streamTimerRef.current) clearInterval(streamTimerRef.current);
          streamTimerRef.current = null;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: fullText, isStreaming: false }
                : msg
            )
          );
          setGenerationStatus("idle");
        } else {
          const partial = fullText.slice(0, currentIndex);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId ? { ...msg, content: partial } : msg
            )
          );
        }
      }, 25);
    },
    []
  );

  // Send a user message and trigger response stream
  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || generationStatus === "analyzing" || generationStatus === "streaming") {
        return;
      }

      const userMsg: ChatMessage = {
        id: `msg-user-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);

      // Calculate deterministic response based on user inquiry
      const targetResponse = getMockResponseForQuery(trimmed);

      // Brief latency pause before streaming
      const delayTimer = setTimeout(() => {
        streamAssistantResponse(targetResponse);
      }, 400);

      analysisTimersRef.current.push(delayTimer);
    },
    [generationStatus, streamAssistantResponse]
  );

  // Run the 4-stage initial analysis sequence
  const startAnalysis = useCallback(
    (initialPrompt?: string) => {
      clearAllTimers();
      setGenerationStatus("analyzing");
      setAnalysisState({
        isCollapsed: false,
        status: "analyzing",
        stages: INITIAL_STAGES.map((s, idx) => ({
          ...s,
          status: idx === 0 ? "in_progress" : "pending",
        })),
        currentStageIndex: 0,
      });

      // Stage progression timings
      const stageDelays = [600, 1300, 2000, 2700];

      // Stage 2
      const t1 = setTimeout(() => {
        setAnalysisState((prev) => ({
          ...prev,
          currentStageIndex: 1,
          stages: prev.stages.map((s, i) =>
            i === 0 ? { ...s, status: "completed" } : i === 1 ? { ...s, status: "in_progress" } : s
          ),
        }));
      }, stageDelays[0]);

      // Stage 3
      const t2 = setTimeout(() => {
        setAnalysisState((prev) => ({
          ...prev,
          currentStageIndex: 2,
          stages: prev.stages.map((s, i) =>
            i <= 1 ? { ...s, status: "completed" } : i === 2 ? { ...s, status: "in_progress" } : s
          ),
        }));
      }, stageDelays[1]);

      // Stage 4 (Ready)
      const t3 = setTimeout(() => {
        setAnalysisState((prev) => ({
          ...prev,
          currentStageIndex: 3,
          stages: prev.stages.map((s, i) =>
            i <= 2 ? { ...s, status: "completed" } : i === 3 ? { ...s, status: "in_progress" } : s
          ),
        }));
      }, stageDelays[2]);

      // Complete Analysis and show initial greeting
      const t4 = setTimeout(() => {
        setAnalysisState((prev) => ({
          ...prev,
          status: "completed",
          stages: prev.stages.map((s) => ({ ...s, status: "completed" })),
        }));
        setGenerationStatus("idle");

        // Initial assistant greeting
        const greetingMsg: ChatMessage = {
          id: `msg-init-${Date.now()}`,
          role: "assistant",
          content: "I've analyzed the image. What would you like to know?",
          timestamp: new Date(),
        };

        setMessages([greetingMsg]);

        // If an initial prompt was provided in the preview step, trigger it now
        if (initialPrompt && initialPrompt.trim()) {
          setTimeout(() => {
            sendMessage(initialPrompt.trim());
          }, 300);
        }
      }, stageDelays[3]);

      analysisTimersRef.current.push(t1, t2, t3, t4);
    },
    [clearAllTimers, sendMessage]
  );

  const toggleAnalysisCollapse = useCallback(() => {
    setAnalysisState((prev) => ({ ...prev, isCollapsed: !prev.isCollapsed }));
  }, []);

  const resetChat = useCallback(() => {
    clearAllTimers();
    setMessages([]);
    setGenerationStatus("idle");
    setAnalysisState({
      isCollapsed: false,
      status: "idle",
      stages: INITIAL_STAGES,
      currentStageIndex: 0,
    });
  }, [clearAllTimers]);

  return {
    messages,
    generationStatus,
    analysisState,
    startAnalysis,
    sendMessage,
    stopGeneration,
    resetChat,
    toggleAnalysisCollapse,
  };
}
