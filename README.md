# Visora - Multimodal Reasoning Assistant

Visora is an image reasoning chatbot built for the AI Team Internship Assignment. It allows users to upload an image and interactively ask questions about UI layouts, colors, and spatial relationships.

---

## Setup Instructions

### 1. Backend (FastAPI + LangGraph)
1. Open a terminal and navigate to the `backend` directory.
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # Windows: .venv\Scripts\activate
   # Mac/Linux: source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install "fastapi[standard]" langgraph google-genai pydantic langchain-core python-multipart uvicorn httpx
   ```
4. Create a `.env` file in the `backend` directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
5. Start the backend server on port 8000:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```

### 2. Frontend (Next.js + CopilotKit)
1. Open a second terminal in the root project directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` in your browser.

---

## Architecture

* **Frontend**: Next.js (App Router), React, Tailwind CSS, CopilotKit UI components.
* **Middle Layer**: Next.js API Route (`/api/copilotkit`) acting as the CopilotKit runtime endpoint, proxying requests via HTTP.
* **Backend**: FastAPI serving two endpoints:
  - `POST /upload`: Handles multipart image uploads and stores them locally.
  - `POST /agent/run`: The main Server-Sent Events (SSE) endpoint that executes the LangGraph agent.
* **Agent Orchestration**: LangGraph manages the state machine, conversational checkpoint memory (`MemorySaver`), and interrupts.
* **LLM**: Google Gemini 2.5 Flash Vision (via `google-genai` SDK) for multimodal processing.

---

## Decisions Made and Why

1. **CopilotKit over Custom SSE Hook**: Required by the assignment, but also simplifies message rendering and state tracking on the frontend.
2. **LangGraph for State Management**: Chosen because it provides a first-class `interrupt()` primitive, making the Human-in-the-Loop clarification pause robust and easy to implement compared to managing raw while-loops.
3. **Local File Storage over S3**: Images are uploaded to a local temporary `/uploads` directory on the backend. This was chosen for speed of development and to avoid requiring external cloud bucket setup for reviewers.
4. **Gemini 2.5 Flash Vision**: Selected for its exceptionally fast response times and generous free tier for multimodal inputs compared to GPT-4o.

---

## Tradeoffs

* **Stateless CopilotKit vs Stateful LangGraph**: CopilotKit expects to send the entire conversation history on every request, but LangGraph natively manages its own memory checkpoints. I traded off perfect sync by using LangGraph's `MemorySaver` as the single source of truth for the conversation state, mapping the frontend's thread ID to LangGraph's config.
* **Server-side cancellation**: The `google-genai` Python SDK does not natively expose a cancellation token or async abort signal mid-generation. When a user hits stop, the HTTP socket closes, which breaks the generator, but the LLM process may still complete in the background before Python garbage collects it.

---

## Known Limitations

* **Memory Leak in Development**: The local image upload folder doesn't have an automated cron job to delete old images, meaning disk space will slowly grow over time unless manually cleared.
* **First-load timeout**: Next.js development mode (`npm run dev`) takes a few seconds to compile the `/api/copilotkit` route on the very first request, which can occasionally trip CopilotKit's internal 5-second connection timeout. Refreshing the browser instantly resolves this.

---

## What's Real vs. Faked

* **Real**: 
  * Multimodal visual analysis (Gemini genuinely looks at the uploaded image).
  * Streaming text responses (tokens are yielded in real-time).
  * Human-in-the-Loop interruption (the graph legitimately pauses execution and waits for client state).
  * Multi-turn memory (LangGraph successfully tracks conversation turns).
* **Faked / Simulated**: 
  * **The `<thinking>` stream / Reasoning Panel**: The model does *not* expose actual probabilistic internal reasoning tokens. The UI "thought process" is simulated by tracking and streaming deterministic LangGraph node transitions (`receive_question`, `inspect_context`, `vision_analysis`) to the frontend before the actual LLM generation starts.

---

## Reflection Questions

### 1. Where does your "thinking" stream actually come from: real reasoning tokens from the model, or a prompted step-by-step narration? Did you know the difference before you started building?
My "thinking" stream is **simulated via node-based execution tracking**, not genuine reasoning tokens. Before starting, I knew the difference: models like OpenAI's `o1` or Claude 3.7 Sonnet expose genuine, internal chain-of-thought tokens that represent the model's actual probabilistic deliberation. Standard Gemini Flash models do not expose this. To create a transparent UI without faking model tokens via prompts, Visora tracks the deterministic state machine transitions of the LangGraph backend. These node transitions are streamed to the frontend via hidden metadata SSE events (`__visora_stage__`) and rendered as the thought process.

### 2. Walk through exactly what happens on the backend when the user hits stop: mid-token, mid-tool-call, mid-reasoning-step. What state is left behind?
When the user hits stop mid-token:
1. **Frontend**: CopilotKit instantly aborts the HTTP POST request socket, transitioning the UI to a `stopped` state.
2. **FastAPI**: Inside the SSE generator (`astream_events`), the framework detects the broken pipe (`await request.is_disconnected()`) and explicitly breaks the yield loop.
3. **LangGraph State Left Behind**: LangGraph's `MemorySaver` checkpointing only persists state successfully at the *end* of a node's full execution. Because we forcefully disconnected mid-stream during the `vision_analysis` node, the checkpoint for that specific turn is not saved. The conversation state safely rolls back to right before the prompt was sent, leaving it in a clean, resumable state rather than polluting the permanent memory with half a generated sentence.

### 3. Show a case where the model contradicted itself or hallucinated when you asked it to justify an answer about the image. What did you do about it, if anything?
**Case**: When evaluating a complex dashboard screenshot, I asked, "Why do you think the primary action button is disabled?" The model confidently justified it by claiming "the button text is grayed out (#888888) and lacks a hover state," even though the button was actually a vibrant blue and fully active. 
**Resolution**: VLMs often suffer from "anchoring bias"—if you ask *why* something is disabled, the model assumes it *must be* disabled and hallucinates visual evidence to justify your premise. To mitigate this, I built the Human-in-the-Loop clarification system. By forcing the graph to pause on ambiguous evaluation requests and asking the user to strictly define the evaluation scope (e.g., "Layout", "Colors", "Accessibility") via buttons, we constrain the prompt context and prevent the model from blindly following leading questions.

### 4. What would you cut or change with twice the time? With half the time?
**With twice the time**: I would implement **Region-grounded justification** (Stretch Goal 4). I would configure the model to return spatial bounding box coordinates alongside its text, pass them to the frontend, and draw dynamic SVG overlays on the image canvas (which is already prepped with zoom/pan controls) so the model could physically highlight the exact UI element it is talking about.
**With half the time**: I would cut the custom `__visora_stage__` SSE metadata parsing and the polished Apple Pro glassmorphism UI. I would fall back to a plain CopilotKit chat window and dump a raw string like `[System: Analyzing Image...]` directly into the chat stream instead of building a dedicated Reasoning accordion panel.

### 5. Was there a part of CopilotKit's abstraction that you found yourself fighting against? What was it, and how did you work around it (or did you)?
I fought heavily against CopilotKit's abstraction when trying to implement the **Human-in-the-Loop Clarification UI** and the **Dynamic Reasoning Stages**. CopilotKit is highly opinionated towards a simple "User -> LLM -> Text" flow and expects all server-sent events to be standard text messages or tool calls. Because LangGraph operates on internal state nodes (`interrupt()`), getting CopilotKit to natively recognize a graph pause and render custom React buttons was difficult. 
**Workaround**: I worked around this by intercepting the LangGraph stream in FastAPI, manually injecting hidden text strings (`__visora_clarification__:{...}`), and writing a custom React hook (`useCopilotVisoraChat`) wrapped over `useCopilotChatInternal` to strip these strings out of the viewport before they rendered, manually parsing them into the interactive React buttons instead.
