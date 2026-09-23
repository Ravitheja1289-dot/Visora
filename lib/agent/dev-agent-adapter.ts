import {
  CopilotServiceAdapter,
  CopilotRuntimeChatCompletionRequest,
  CopilotRuntimeChatCompletionResponse,
} from "@copilotkit/runtime";
import { randomUUID } from "crypto";

/**
 * VisoraDevAgentAdapter
 * 
 * Implements a real CopilotServiceAdapter to establish the pipeline boundary
 * between Visora and CopilotKit runtime without external VLM keys.
 * 
 * In Phase 4, this adapter will be upgraded to the full LangGraph VLM agent.
 */
export class VisoraDevAgentAdapter implements CopilotServiceAdapter {
  get name(): string {
    return "VisoraDevAgentAdapter";
  }

  async process(
    request: CopilotRuntimeChatCompletionRequest
  ): Promise<CopilotRuntimeChatCompletionResponse> {
    const threadId = request.threadId || randomUUID();
    const messageId = randomUUID();

    // Extract the latest user query from the messages list
    let userQuery = "";
    if (request.messages && request.messages.length > 0) {
      const lastMsg: any = request.messages[request.messages.length - 1];
      if (typeof lastMsg.content === "string") {
        userQuery = lastMsg.content;
      } else if (Array.isArray(lastMsg.content)) {
        userQuery = lastMsg.content.map((c: any) => c.text || "").join(" ");
      } else if (lastMsg.text) {
        userQuery = lastMsg.text;
      }
    }

    const normalized = userQuery.toLowerCase().trim();

    // Construct deterministic response verifying real pipeline communication
    let responseText = "Visora agent connection is working.";

    if (normalized && !normalized.includes("hello") && !normalized.includes("hi")) {
      responseText = `Visora agent connection is working. Interrogating query: "${userQuery}". Visual reasoning agent will attach in Phase 4.`;
    }

    // Stream the response tokens via CopilotKit runtime events
    await request.eventSource.stream(async (eventStream: any) => {
      eventStream.sendTextMessage(messageId, responseText);
    });

    return { threadId };
  }
}
