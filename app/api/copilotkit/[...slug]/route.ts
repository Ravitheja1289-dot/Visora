import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { HttpAgent } from "@ag-ui/client";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

export const GET = async (req: Request) => {
  return handleRequest(req);
};
