/**
 * lib/mock-responses.ts
 * 
 * LOCAL MOCK INTERACTION DATA (PHASE 2 ONLY)
 * 
 * NOTE: This file isolates local deterministic responses for UI interaction prototyping.
 * It will be replaced by real CopilotKit / LangGraph streamed agent events in Phase 3.
 * Do not connect external APIs here.
 */

export function getMockResponseForQuery(query: string): string {
  const normalized = query.toLowerCase().trim();

  if (
    normalized.includes("primary button") ||
    normalized.includes("main button") ||
    normalized.includes("call to action") ||
    normalized.includes("cta")
  ) {
    return "The primary button in this interface appears to be the blue action button in the top right ('Export Data' / 'LOGIN'). It has the highest visual weight due to its saturated accent fill against the dark background, rounded corners, and bold contrasting label.";
  }

  if (
    normalized.includes("color") ||
    normalized.includes("palette") ||
    normalized.includes("contrast")
  ) {
    return "The color system uses a deep dark neutral palette (#0C0C10 to #1A1A22) as the foundation, punctuated by functional status accents: green (#10B981) for positive metrics, amber (#F59E0B) for warnings, and blue (#3B82F6) for active primary actions and interactive charts.";
  }

  if (
    normalized.includes("layout") ||
    normalized.includes("hierarchy") ||
    normalized.includes("structure")
  ) {
    return "The layout follows a standard dashboard grid: a top utility bar, a persistent left navigation sidebar (occupying roughly 20% width), a 3-column metric KPI summary row, and a full-width telemetry/chart canvas anchored at the bottom.";
  }

  if (
    normalized.includes("spatial") ||
    normalized.includes("quadrant") ||
    normalized.includes("position") ||
    normalized.includes("coordinate")
  ) {
    return "Analyzing spatial coordinates: The primary focal point sits in the central grid area. In multi-quadrant tests, objects are arranged with distinct quadrant separation (e.g., cyan triangle in Quadrant II, purple circle within orange boundary in Quadrant I, and targeting reticles at coordinates [590, 345]).";
  }

  if (
    normalized.includes("architecture") ||
    normalized.includes("flow") ||
    normalized.includes("orchestrat")
  ) {
    return "The architectural flow maps out a three-tier pipeline: The Client layer (Next.js & CopilotKit UI) dispatches SSE state events to the Copilot Runtime API, which connects downstream to the LangGraph Orchestrator managing VLM reasoning and HITL interrupt checks.";
  }

  if (
    normalized.includes("why") ||
    normalized.includes("justify") ||
    normalized.includes("think that")
  ) {
    return "Justification based on visual evidence: This conclusion is drawn from three visual properties: 1) Relative luminance difference exceeding WCAG standards against the container; 2) Consistent 8px padding and 4px border radius conforming to standard interactive component affordances; and 3) Spatial placement aligned with standard user eye-tracking scan paths.";
  }

  // Default fallback response
  return `Based on the visual elements in this image, I can confirm the layout hierarchy, typography groupings, and interface controls are clearly distinguishable. You can ask specific questions about particular UI components, spatial relationships, or color contrast.`;
}
