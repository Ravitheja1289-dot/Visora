export type GenerationStatus = 
  | "idle" 
  | "uploading" 
  | "ready" 
  | "running" 
  | "waiting_for_clarification" 
  | "resuming" 
  | "completed" 
  | "stopped" 
  | "error";

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
  status: "pending" | "in_progress" | "completed" | "error" | "stopped";
}

export interface AnalysisState {
  isCollapsed: boolean;
  status: GenerationStatus;
  stages: AnalysisStage[];
}
