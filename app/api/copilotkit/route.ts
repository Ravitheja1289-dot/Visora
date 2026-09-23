import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { HttpAgent } from "@ag-ui/client";

/**
 * Visora CopilotKit Runtime Endpoint (Phase 4)
 * 
 * Replaces the Phase 3 placeholder VisoraDevAgent with a real LangGraph
 * agent running in the Python FastAPI backend service.
 * Mediates communication via the AG-UI SSE protocol.
 */
const LANGGRAPH_AGENT_URL =
  process.env.LANGGRAPH_AGENT_URL || "http://127.0.0.1:8000/agent/run";

const runtime = new CopilotRuntime({
  agents: {
    default: new HttpAgent({
      url: LANGGRAPH_AGENT_URL,
    }),
  },
});

const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
  runtime,
  endpoint: "/api/copilotkit",
});

export const POST = async (req: Request) => {
  return handleRequest(req);
};
