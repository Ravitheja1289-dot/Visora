import { ExampleImageItem } from "@/types/image";

// Pre-packaged offline visual reasoning examples in high-contrast vector SVG format
const UI_DASHBOARD_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg width="800" height="500" viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="500" fill="#0c0c10"/>
  <rect x="20" y="20" width="760" height="460" rx="10" fill="#141419" stroke="#26262e" stroke-width="1.5"/>
  <!-- Top Bar -->
  <rect x="20" y="20" width="760" height="54" rx="10" fill="#1a1a22"/>
  <circle cx="50" cy="47" r="6" fill="#ef4444"/>
  <circle cx="68" cy="47" r="6" fill="#f59e0b"/>
  <circle cx="86" cy="47" r="6" fill="#10b981"/>
  <text x="115" y="52" fill="#a1a1aa" font-family="monospace" font-size="13">Visora Analytics Dashboard • v2.4</text>
  <rect x="660" y="36" width="100" height="26" rx="5" fill="#2563eb"/>
  <text x="680" y="53" fill="#ffffff" font-family="sans-serif" font-size="11" font-weight="bold">Export Data</text>
  
  <!-- Left Sidebar -->
  <rect x="20" y="74" width="160" height="406" fill="#121217" stroke="#26262e" stroke-width="1"/>
  <rect x="35" y="95" width="130" height="28" rx="4" fill="#26262e"/>
  <text x="50" y="113" fill="#ffffff" font-family="sans-serif" font-size="12">Overview</text>
  <text x="50" y="145" fill="#71717a" font-family="sans-serif" font-size="12">Telemetry</text>
  <text x="50" y="175" fill="#71717a" font-family="sans-serif" font-size="12">Reasoning Logs</text>
  <text x="50" y="205" fill="#71717a" font-family="sans-serif" font-size="12">Settings</text>
  
  <!-- Main Grid -->
  <!-- Metric Card 1 -->
  <rect x="200" y="95" width="175" height="100" rx="8" fill="#1a1a22" stroke="#2e2e38"/>
  <text x="216" y="122" fill="#71717a" font-family="sans-serif" font-size="11">Total Reasoning Steps</text>
  <text x="216" y="156" fill="#ffffff" font-family="monospace" font-size="24" font-weight="bold">14,892</text>
  <text x="216" y="178" fill="#10b981" font-family="sans-serif" font-size="10">+12.4% vs yesterday</text>
  
  <!-- Metric Card 2 -->
  <rect x="390" y="95" width="175" height="100" rx="8" fill="#1a1a22" stroke="#2e2e38"/>
  <text x="406" y="122" fill="#71717a" font-family="sans-serif" font-size="11">Avg Latency (Time to First Token)</text>
  <text x="406" y="156" fill="#3b82f6" font-family="monospace" font-size="24" font-weight="bold">280ms</text>
  <text x="406" y="178" fill="#a1a1aa" font-family="sans-serif" font-size="10">Gemini 2.0 Flash</text>

  <!-- Metric Card 3 -->
  <rect x="580" y="95" width="180" height="100" rx="8" fill="#1a1a22" stroke="#2e2e38"/>
  <text x="596" y="122" fill="#71717a" font-family="sans-serif" font-size="11">HITL Interrupt Rate</text>
  <text x="596" y="156" fill="#f59e0b" font-family="monospace" font-size="24" font-weight="bold">4.2%</text>
  <text x="596" y="178" fill="#f59e0b" font-family="sans-serif" font-size="10">Requires Clarification</text>

  <!-- Chart Area -->
  <rect x="200" y="215" width="560" height="240" rx="8" fill="#16161d" stroke="#2e2e38"/>
  <text x="220" y="245" fill="#f4f4f5" font-family="sans-serif" font-size="13" font-weight="bold">Visual Processing Throughput</text>
  <!-- Grid Lines -->
  <line x1="220" y1="280" x2="740" y2="280" stroke="#242430" stroke-dasharray="4 4"/>
  <line x1="220" y1="330" x2="740" y2="330" stroke="#242430" stroke-dasharray="4 4"/>
  <line x1="220" y1="380" x2="740" y2="380" stroke="#242430" stroke-dasharray="4 4"/>
  <line x1="220" y1="420" x2="740" y2="420" stroke="#2e2e38"/>
  <!-- Chart Line -->
  <path d="M 230 400 Q 280 340, 340 360 T 450 290 T 560 320 T 670 250 T 730 270" fill="none" stroke="#3b82f6" stroke-width="3"/>
  <circle cx="670" cy="250" r="5" fill="#60a5fa" stroke="#1e3a8a" stroke-width="2"/>
  <rect x="635" y="215" width="70" height="22" rx="4" fill="#1e3a8a"/>
  <text x="643" y="230" fill="#ffffff" font-family="monospace" font-size="11">Peak: 98fps</text>
</svg>
`)}`;

const ARCHITECTURE_DIAGRAM_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg width="800" height="500" viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="500" fill="#0d1117"/>
  <rect x="20" y="20" width="760" height="460" rx="10" fill="#161b22" stroke="#30363d"/>
  <text x="40" y="55" fill="#f0f6fc" font-family="sans-serif" font-size="16" font-weight="bold">Agent Pipeline & State Machine</text>
  
  <!-- Client Layer -->
  <rect x="50" y="90" width="180" height="120" rx="8" fill="#21262d" stroke="#58a6ff" stroke-width="1.5"/>
  <text x="65" y="120" fill="#58a6ff" font-family="monospace" font-size="12" font-weight="bold">Client (Next.js)</text>
  <text x="65" y="145" fill="#8b949e" font-family="sans-serif" font-size="11">• CopilotKit React UI</text>
  <text x="65" y="165" fill="#8b949e" font-family="sans-serif" font-size="11">• Streaming Thought Panel</text>
  <text x="65" y="185" fill="#8b949e" font-family="sans-serif" font-size="11">• AbortController Hook</text>

  <!-- Arrow Right -->
  <path d="M 235 150 L 305 150" stroke="#8b949e" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Runtime Layer -->
  <rect x="310" y="90" width="190" height="120" rx="8" fill="#21262d" stroke="#3fb950" stroke-width="1.5"/>
  <text x="325" y="120" fill="#3fb950" font-family="monospace" font-size="12" font-weight="bold">Copilot Runtime</text>
  <text x="325" y="145" fill="#8b949e" font-family="sans-serif" font-size="11">• /api/copilotkit endpoint</text>
  <text x="325" y="165" fill="#8b949e" font-family="sans-serif" font-size="11">• SSE State Streamer</text>
  <text x="325" y="185" fill="#8b949e" font-family="sans-serif" font-size="11">• Action Dispatcher</text>

  <!-- Arrow Down -->
  <path d="M 405 215 L 405 275" stroke="#8b949e" stroke-width="2"/>

  <!-- LangGraph Agent Layer -->
  <rect x="250" y="280" width="310" height="160" rx="8" fill="#21262d" stroke="#d29922" stroke-width="1.5"/>
  <text x="270" y="310" fill="#d29922" font-family="monospace" font-size="13" font-weight="bold">LangGraph Orchestrator</text>
  <rect x="270" y="325" width="120" height="40" rx="6" fill="#30363d"/>
  <text x="280" y="350" fill="#e6edf3" font-family="sans-serif" font-size="11">VLM Reasoner</text>
  <rect x="420" y="325" width="120" height="40" rx="6" fill="#30363d" stroke="#f85149"/>
  <text x="430" y="350" fill="#f85149" font-family="sans-serif" font-size="11">HITL Interrupt</text>
  <text x="270" y="405" fill="#8b949e" font-family="monospace" font-size="11">Memory Checkpoint: Postgres / In-memory</text>

  <!-- External VLM -->
  <rect x="580" y="90" width="170" height="120" rx="8" fill="#21262d" stroke="#a371f7" stroke-width="1.5"/>
  <text x="595" y="120" fill="#a371f7" font-family="monospace" font-size="12" font-weight="bold">Multimodal VLM</text>
  <text x="595" y="145" fill="#8b949e" font-family="sans-serif" font-size="11">• Gemini 2.0 / Flash</text>
  <text x="595" y="165" fill="#8b949e" font-family="sans-serif" font-size="11">• Thought tokens</text>
  <text x="595" y="185" fill="#8b949e" font-family="sans-serif" font-size="11">• Vision inspection</text>

  <!-- Arrow Right to VLM -->
  <path d="M 505 150 L 575 150" stroke="#8b949e" stroke-width="2"/>
</svg>
`)}`;

const SPATIAL_REASONING_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg width="800" height="500" viewBox="0 0 800 500" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="500" fill="#0b0f14"/>
  <rect x="20" y="20" width="760" height="460" rx="8" fill="#121820" stroke="#222e3c"/>
  
  <text x="40" y="55" fill="#e2e8f0" font-family="sans-serif" font-size="15" font-weight="bold">Spatial Geometry & Visual Grounding Test</text>
  
  <!-- Coordinate Guides -->
  <line x1="40" y1="260" x2="760" y2="260" stroke="#1e293b" stroke-width="1" stroke-dasharray="5 5"/>
  <line x1="400" y1="80" x2="400" y2="450" stroke="#1e293b" stroke-width="1" stroke-dasharray="5 5"/>
  
  <!-- Shapes -->
  <!-- Top Left: Cyan Triangle -->
  <polygon points="180,100 120,200 240,200" fill="#06b6d4" fill-opacity="0.8" stroke="#22d3ee" stroke-width="2"/>
  <text x="140" y="225" fill="#94a3b8" font-family="monospace" font-size="11">Obj A: Cyan Triangle (Quadrant II)</text>
  
  <!-- Top Right: Violet Circle inside Orange Square -->
  <rect x="520" y="100" width="120" height="120" rx="8" fill="#ea580c" fill-opacity="0.25" stroke="#f97316" stroke-width="2"/>
  <circle cx="580" cy="160" r="42" fill="#8b5cf6" stroke="#c084fc" stroke-width="2"/>
  <text x="495" y="245" fill="#94a3b8" font-family="monospace" font-size="11">Obj B: Purple Circle in Orange Box</text>

  <!-- Bottom Left: Overlapping Diamonds -->
  <rect x="130" y="300" width="80" height="80" transform="rotate(45 170 340)" fill="#10b981" fill-opacity="0.4" stroke="#34d399" stroke-width="2"/>
  <rect x="180" y="300" width="80" height="80" transform="rotate(45 220 340)" fill="#f59e0b" fill-opacity="0.4" stroke="#fbbf24" stroke-width="2"/>
  <text x="110" y="430" fill="#94a3b8" font-family="monospace" font-size="11">Obj C: Overlapping Emerald & Amber Diamonds</text>

  <!-- Bottom Right: Bounding Target with crosshair -->
  <rect x="500" y="290" width="180" height="110" rx="4" fill="#1e293b" stroke="#e11d48" stroke-width="2" stroke-dasharray="6 4"/>
  <circle cx="590" cy="345" r="15" fill="#e11d48"/>
  <line x1="565" y1="345" x2="615" y2="345" stroke="#ffffff" stroke-width="1.5"/>
  <line x1="590" y1="320" x2="590" y2="370" stroke="#ffffff" stroke-width="1.5"/>
  <text x="510" y="425" fill="#f43f5e" font-family="monospace" font-size="11">Target Reticle [590, 345]</text>
</svg>
`)}`;

export const EXAMPLE_IMAGES: ExampleImageItem[] = [
  {
    id: "ui-dashboard",
    title: "UI Design & Analytics",
    category: "Interface Design",
    description: "Multi-card dashboard with buttons, metrics, and line charts",
    promptSuggestion: "Why is 'Export Data' identified as a primary call-to-action button, and what is its visual hierarchy?",
    dataUrl: UI_DASHBOARD_SVG,
    metadata: {
      name: "visora-analytics-ui.svg",
      size: 4280,
      type: "image/svg+xml",
      width: 800,
      height: 500,
      aspectRatio: "16:10",
    },
  },
  {
    id: "arch-pipeline",
    title: "Agent Architecture",
    category: "System Diagram",
    description: "CopilotKit, Next.js, and LangGraph orchestrator flow",
    promptSuggestion: "Describe the spatial flow between the client layer and the orchestrator layer.",
    dataUrl: ARCHITECTURE_DIAGRAM_SVG,
    metadata: {
      name: "agent-architecture.svg",
      size: 3820,
      type: "image/svg+xml",
      width: 800,
      height: 500,
      aspectRatio: "16:10",
    },
  },
  {
    id: "spatial-geometry",
    title: "Spatial Relationships",
    category: "Spatial Grounding",
    description: "Geometric shapes, coordinates, color overlaps, and target reticle",
    promptSuggestion: "Which object is positioned in the bottom-right quadrant and what is inside it?",
    dataUrl: SPATIAL_REASONING_SVG,
    metadata: {
      name: "spatial-test-quadrants.svg",
      size: 3410,
      type: "image/svg+xml",
      width: 800,
      height: 500,
      aspectRatio: "16:10",
    },
  },
];
