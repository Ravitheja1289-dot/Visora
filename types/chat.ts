export type GenerationStatus = "idle" | "analyzing" | "streaming" | "stopped" | "error";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  isStopped?: boolean;
}

export interface AnalysisStage {
  id: string;
  label: string;
  status: "pending" | "in_progress" | "completed";
}

export interface AnalysisState {
  isCollapsed: boolean;
  status: "idle" | "analyzing" | "completed" | "stopped";
  stages: AnalysisStage[];
  currentStageIndex: number;
}
