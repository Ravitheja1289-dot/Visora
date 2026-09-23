import { AbstractAgent, EventType, RunAgentInput, BaseEvent } from "@ag-ui/client";
import { Observable } from "rxjs";
import { randomUUID } from "crypto";

/**
 * VisoraDevAgent
 * 
 * Concrete CopilotKit development agent subclassing AbstractAgent (AG-UI standard).
 * Emits real streaming SSE events via CopilotRuntime to verify the agent-to-UI
 * communication boundary without external VLM keys.
 * 
 * In Phase 4, this agent connects to LangGraph for multimodal visual reasoning.
 */
export class VisoraDevAgent extends AbstractAgent {
  run(input: RunAgentInput): Observable<BaseEvent> {
    return new Observable<BaseEvent>((subscriber) => {
      const messageId = `msg-asst-${Date.now()}`;

      // Extract the latest user query from the input messages
      let userQuery = "";
      if (input.messages && input.messages.length > 0) {
        const lastMsg = input.messages[input.messages.length - 1];
        if (typeof lastMsg.content === "string") {
          userQuery = lastMsg.content;
        } else if (Array.isArray(lastMsg.content)) {
          userQuery = lastMsg.content.map((c: any) => c.text || "").join(" ");
        }
      }

      const normalized = userQuery.toLowerCase().trim();

      // Deterministic responses verifying real agent pipeline
      let responseText = "Visora agent connection is working.";

      if (normalized && !normalized.includes("hello") && !normalized.includes("hi")) {
        responseText = `Visora agent connection is working. Interrogating query: "${userQuery}". Visual reasoning agent will attach in Phase 4.`;
      }

      // 1. RUN_STARTED event
      subscriber.next({
        type: EventType.RUN_STARTED,
        runId: input.runId,
        threadId: input.threadId,
      } as BaseEvent);

      // 2. TEXT_MESSAGE_START event
      subscriber.next({
        type: EventType.TEXT_MESSAGE_START,
        messageId,
        role: "assistant",
      } as BaseEvent);

      // 3. TEXT_MESSAGE_CONTENT event
      subscriber.next({
        type: EventType.TEXT_MESSAGE_CONTENT,
        messageId,
        content: responseText,
      } as BaseEvent);

      // 4. TEXT_MESSAGE_END event
      subscriber.next({
        type: EventType.TEXT_MESSAGE_END,
        messageId,
      } as BaseEvent);

      // 5. RUN_FINISHED event
      subscriber.next({
        type: EventType.RUN_FINISHED,
        runId: input.runId,
        threadId: input.threadId,
        outcome: { type: "success" },
      } as BaseEvent);

      subscriber.complete();
    });
  }
}
