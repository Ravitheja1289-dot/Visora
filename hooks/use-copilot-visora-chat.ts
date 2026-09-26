"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useCopilotChat, useCopilotReadable } from "@copilotkit/react-core";
import { TextMessage, Role } from "@copilotkit/runtime-client-gql";
import { ChatMessage, AnalysisState, GenerationStatus, AnalysisStage } from "@/types/chat";
import { UploadedImageState } from "@/types/image";

const CLARIFICATION_QUESTION = "What should I evaluate?";

interface UseCopilotVisoraChatProps {
  selectedImage: UploadedImageState | null;
}

export function useCopilotVisoraChat({ selectedImage }: UseCopilotVisoraChatProps) {
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

  const {
    visibleMessages,
    appendMessage,
    stopGeneration: copilotStopGeneration,
    isLoading: isCopilotLoading,
    reset: copilotReset,
  } = useCopilotChat();

  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isManuallyStopped, setIsManuallyStopped] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [clarificationOptions, setClarificationOptions] = useState<string[]>([]);
  const [dynamicStages, setDynamicStages] = useState<string[]>([]);

  // Parse hidden metadata messages from the CopilotKit stream
  const { list: mappedMessagesList, hasClarification, stages: mappedStages, opts: mappedOpts } = useMemo(() => {
    const list: ChatMessage[] = [];
    let isWaitingForClarification = false;
    let currentStages: string[] = [];
    let currentClarificationOpts: string[] = [];

    (visibleMessages || []).forEach((msg: any, index: number) => {
      const isUser = msg.role === Role.User || msg.role === "user";
      const content =
        typeof msg.content === "string"
          ? msg.content
          : Array.isArray(msg.content)
          ? msg.content.map((c: any) => c.text || "").join(" ")
          : msg.text || "";

      if (!isUser) {
        if (content.startsWith("__visora_stage__:!")) {
          return;
        }
        if (content.startsWith("__visora_stage__:text")) return; // CopilotKit sometimes buffers partial string

        // Check for stage transitions
        if (content.includes("__visora_stage__:text") || content.includes("__visora_stage__:!")) return;

        if (content.startsWith("__visora_stage__:text")) return; // partial chunk from CopilotKit maybe?
        
        // Exact prefix matching handling partial chunks
        const stageMatch = content.match(/__visora_stage__:([\w_]+)/);
        if (stageMatch) {
          const stageName = stageMatch[1];
          if (!currentStages.includes(stageName)) {
            currentStages.push(stageName);
          }
          return; // Hide this message
        }

        const clarMatch = content.match(/__visora_clarification__:(.+)/);
        if (clarMatch) {
          isWaitingForClarification = true;
          try {
            const parsed = JSON.parse(clarMatch[1]);
            if (parsed.options) {
              currentClarificationOpts = parsed.options;
            }
          } catch (e) {
            console.error("Failed to parse clarification payload", e);
          }
          return; // Hide this message
        }
        
        // Fallback for old hardcoded prompt just in case
        if (content.includes(CLARIFICATION_QUESTION)) {
            isWaitingForClarification = true;
            return;
        }
      }

      const isStreaming = !isUser && isCopilotLoading && index === visibleMessages.length - 1;
      const isStoppedMsg = !isUser && isManuallyStopped && index === visibleMessages.length - 1;

      if (content.trim()) {
        list.push({
          id: msg.id || `msg-${index}`,
          role: isUser ? "user" : "assistant",
          content,
          timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date(),
          isStreaming,
          isStopped: isStoppedMsg,
        });
      }
    });

    return { list, hasClarification: isWaitingForClarification, stages: currentStages, opts: currentClarificationOpts };
  }, [visibleMessages, isCopilotLoading, isManuallyStopped]);

  useEffect(() => {
    if (mappedOpts && mappedOpts.length > 0) {
      setClarificationOptions(mappedOpts);
    }
  }, [mappedOpts]);

  useEffect(() => {
    setDynamicStages(mappedStages);
  }, [mappedStages]);

  // Derive generation status from actual CopilotKit state
  const generationStatus: GenerationStatus = useMemo(() => {
    if (connectionError) return "error";
    if (isManuallyStopped) return "stopped";
    if (isCopilotLoading) return "running";
    if (hasClarification) return "waiting_for_clarification";
    if (visibleMessages && visibleMessages.length > 0) return "completed";
    if (selectedImage) return "ready";
    return "idle";
  }, [isCopilotLoading, connectionError, isManuallyStopped, visibleMessages, selectedImage, hasClarification]);

  // Compute Analysis State for Reasoning Panel based on generationStatus
  const analysisState: AnalysisState = useMemo(() => {
    // Map internal node names to human readable labels
    const NODE_LABELS: Record<string, string> = {
      receive_question: "Processing request",
      inspect_context: "Inspecting visual context",
      clarification: "Waiting for user input",
      vision_analysis: "Synthesizing visual logic"
    };

    let computedStages: AnalysisStage[] = [
      { id: "img-recv", label: "Image received", status: "completed" },
    ];
    
    // Add dynamic stages executed so far
    dynamicStages.forEach((stage, idx) => {
        computedStages.push({
            id: `stage-${stage}-${idx}`,
            label: NODE_LABELS[stage] || stage,
            status: "completed"
        });
    });

    if (generationStatus === "running") {
        if (computedStages.length > 1) {
            // Mark the last dynamic stage as in_progress
            computedStages[computedStages.length - 1].status = "in_progress";
        } else {
            computedStages.push({ id: "analyzing", label: "Analyzing...", status: "in_progress" });
        }
    } else if (generationStatus === "completed" || generationStatus === "waiting_for_clarification") {
      // all completed
    } else if (generationStatus === "stopped") {
        if (computedStages.length > 1) {
            computedStages[computedStages.length - 1].status = "stopped";
        }
    } else if (generationStatus === "error") {
        if (computedStages.length > 1) {
            computedStages[computedStages.length - 1].status = "error";
        }
    }

    return {
      isCollapsed,
      status: generationStatus,
      stages: computedStages,
    };
  }, [generationStatus, selectedImage, isCollapsed, dynamicStages]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isCopilotLoading) return;

      setConnectionError(null);
      setIsManuallyStopped(false);

      try {
        await appendMessage(
          new TextMessage({
            role: Role.User,
            content: trimmed,
          })
        );
      } catch (err: any) {
        console.error("[CopilotKit] Send message failed:", err);
        setConnectionError("Visual analysis is temporarily unavailable. Please try again.");
      }
    },
    [appendMessage, isCopilotLoading]
  );

  const stopGeneration = useCallback(() => {
    copilotStopGeneration();
    setIsManuallyStopped(true);
  }, [copilotStopGeneration]);

  const startAnalysis = useCallback(
    (initialPrompt?: string) => {
      if (initialPrompt && initialPrompt.trim()) {
         sendMessage(initialPrompt.trim());
      }
    },
    [sendMessage]
  );

  const toggleAnalysisCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const resetChat = useCallback(() => {
    copilotReset();
    setIsManuallyStopped(false);
    setConnectionError(null);
    setIsCollapsed(false);
  }, [copilotReset]);

  return {
    messages: mappedMessagesList,
    generationStatus,
    analysisState,
    connectionError,
    startAnalysis,
    sendMessage,
    stopGeneration,
    resetChat,
    toggleAnalysisCollapse,
    clarificationOptions,
  };
}
