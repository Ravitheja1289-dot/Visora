"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useCopilotChat, useCopilotReadable } from "@copilotkit/react-core";
import { TextMessage, Role } from "@copilotkit/runtime-client-gql";
import { ChatMessage, AnalysisStage, AnalysisState, GenerationStatus } from "@/types/chat";
import { UploadedImageState } from "@/types/image";

const INITIAL_STAGES: AnalysisStage[] = [
  { id: "stage-1", label: "Examining image", status: "pending" },
  { id: "stage-2", label: "Identifying visual elements", status: "pending" },
  { id: "stage-3", label: "Analyzing spatial relationships", status: "pending" },
  { id: "stage-4", label: "Ready", status: "pending" },
];

interface UseCopilotVisoraChatProps {
  selectedImage: UploadedImageState | null;
}

export function useCopilotVisoraChat({ selectedImage }: UseCopilotVisoraChatProps) {
  // 1. Expose clean image metadata context to CopilotKit without embedding raw base64 into chat state
  useCopilotReadable({
    description: "Currently inspected image in Visora visual canvas",
    value: selectedImage
      ? {
          imageId: selectedImage.metadata.name,
          imageName: selectedImage.metadata.name,
          imageType: selectedImage.metadata.type,
          imageDimensions: `${selectedImage.metadata.width || 0}x${selectedImage.metadata.height || 0}px`,
          imageSizeBytes: selectedImage.metadata.size,
        }
      : null,
  });

  // 2. Real CopilotKit Chat Integration Hook
  const {
    visibleMessages,
    appendMessage,
    stopGeneration: copilotStopGeneration,
    isLoading: isCopilotLoading,
    reset: copilotReset,
  } = useCopilotChat();

  const [localStatus, setLocalStatus] = useState<"idle" | "analyzing" | "stopped">("idle");
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isCollapsed: false,
    status: "idle",
    stages: INITIAL_STAGES,
    currentStageIndex: 0,
  });

  const analysisTimersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = useCallback(() => {
    analysisTimersRef.current.forEach(clearTimeout);
    analysisTimersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  // Map CopilotKit visibleMessages to Visora ChatMessage[]
  const mappedMessages = useMemo<ChatMessage[]>(() => {
    const list: ChatMessage[] = [];

    // If analysis is completed and no messages yet, provide the initial assistant prompt
    if (analysisState.status === "completed" && (!visibleMessages || visibleMessages.length === 0)) {
      list.push({
        id: "msg-greeting",
        role: "assistant",
        content: "I've analyzed the image. What would you like to know?",
        timestamp: new Date(),
      });
    }

    (visibleMessages || []).forEach((msg: any, index: number) => {
      const isUser = msg.role === Role.User || msg.role === "user";
      const content =
        typeof msg.content === "string"
          ? msg.content
          : Array.isArray(msg.content)
          ? msg.content.map((c: any) => c.text || "").join(" ")
          : msg.text || "";

      // Check if message is currently streaming (last assistant message while copilot is loading)
      const isStreaming = !isUser && isCopilotLoading && index === visibleMessages.length - 1;

      list.push({
        id: msg.id || `msg-${index}`,
        role: isUser ? "user" : "assistant",
        content,
        timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date(),
        isStreaming,
        isStopped: false,
      });
    });

    return list;
  }, [visibleMessages, analysisState.status, isCopilotLoading]);

  // Calculate composite generation status
  const generationStatus: GenerationStatus = useMemo(() => {
    if (localStatus === "analyzing") return "analyzing";
    if (isCopilotLoading) return "streaming";
    if (localStatus === "stopped") return "stopped";
    if (connectionError) return "error";
    return "idle";
  }, [localStatus, isCopilotLoading, connectionError]);

  // Send message through the real CopilotKit agent pipeline
  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isCopilotLoading || localStatus === "analyzing") return;

      setConnectionError(null);
      setLocalStatus("idle");

      try {
        await appendMessage(
          new TextMessage({
            role: Role.User,
            content: trimmed,
          })
        );
      } catch (err: any) {
        console.error("[CopilotKit] Send message failed:", err);
        setConnectionError(
          err?.message || "Failed to reach CopilotKit runtime at /api/copilotkit."
        );
      }
    },
    [appendMessage, isCopilotLoading, localStatus]
  );

  // Stop Generation
  const stopGeneration = useCallback(() => {
    clearAllTimers();
    copilotStopGeneration();

    if (localStatus === "analyzing") {
      setLocalStatus("stopped");
      setAnalysisState((prev) => ({ ...prev, status: "stopped" }));
    } else {
      setLocalStatus("stopped");
    }
  }, [clearAllTimers, copilotStopGeneration, localStatus]);

  // Start analysis progression
  const startAnalysis = useCallback(
    (initialPrompt?: string) => {
      clearAllTimers();
      setConnectionError(null);
      setLocalStatus("analyzing");
      setAnalysisState({
        isCollapsed: false,
        status: "analyzing",
        stages: INITIAL_STAGES.map((s, idx) => ({
          ...s,
          status: idx === 0 ? "in_progress" : "pending",
        })),
        currentStageIndex: 0,
      });

      const stageDelays = [500, 1100, 1700, 2300];

      const t1 = setTimeout(() => {
        setAnalysisState((prev) => ({
          ...prev,
          currentStageIndex: 1,
          stages: prev.stages.map((s, i) =>
            i === 0 ? { ...s, status: "completed" } : i === 1 ? { ...s, status: "in_progress" } : s
          ),
        }));
      }, stageDelays[0]);

      const t2 = setTimeout(() => {
        setAnalysisState((prev) => ({
          ...prev,
          currentStageIndex: 2,
          stages: prev.stages.map((s, i) =>
            i <= 1 ? { ...s, status: "completed" } : i === 2 ? { ...s, status: "in_progress" } : s
          ),
        }));
      }, stageDelays[1]);

      const t3 = setTimeout(() => {
        setAnalysisState((prev) => ({
          ...prev,
          currentStageIndex: 3,
          stages: prev.stages.map((s, i) =>
            i <= 2 ? { ...s, status: "completed" } : i === 3 ? { ...s, status: "in_progress" } : s
          ),
        }));
      }, stageDelays[2]);

      const t4 = setTimeout(() => {
        setAnalysisState((prev) => ({
          ...prev,
          status: "completed",
          stages: prev.stages.map((s) => ({ ...s, status: "completed" })),
        }));
        setLocalStatus("idle");

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
    copilotReset();
    setLocalStatus("idle");
    setConnectionError(null);
    setAnalysisState({
      isCollapsed: false,
      status: "idle",
      stages: INITIAL_STAGES,
      currentStageIndex: 0,
    });
  }, [clearAllTimers, copilotReset]);

  return {
    messages: mappedMessages,
    generationStatus,
    analysisState,
    connectionError,
    startAnalysis,
    sendMessage,
    stopGeneration,
    resetChat,
    toggleAnalysisCollapse,
  };
}
