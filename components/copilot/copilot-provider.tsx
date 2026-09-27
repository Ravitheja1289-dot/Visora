"use client";

import React from "react";
import { CopilotKit } from "@copilotkit/react-core";

interface CopilotProviderProps {
  children: React.ReactNode;
}

/**
 * CopilotProvider
 * 
 * Establishes the CopilotKit client boundary connected to /api/copilotkit.
 * Preserves component decoupling by isolating CopilotKit context at the shell level.
 */
export function CopilotProvider({ children }: CopilotProviderProps) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="default" agentId="default" useSingleEndpoint>
      {children}
    </CopilotKit>
  );
}
