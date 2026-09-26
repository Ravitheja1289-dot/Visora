import json
import time
import asyncio
import os
import uuid
from typing import AsyncGenerator
from fastapi import FastAPI, Request, UploadFile, File
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from langgraph.types import Command

from .models.schemas import AgentRunInput
from .services.image_context import extract_image_metadata
from .agent.graph import visora_graph, shared_checkpointer
from .agent.prompts import CLARIFICATION_QUESTION

app = FastAPI(
    title="Visora LangGraph Agent Service",
    description="Dedicated LangGraph orchestration service for Visora multimodal assistant.",
    version="0.1.0"
)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Enable CORS for local Next.js frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "visora-langgraph-backend",
        "version": "0.1.0",
        "timestamp": time.time()
    }

def format_sse(event_data: dict) -> str:
    """Formats a dictionary as an SSE data payload."""
    return f"data: {json.dumps(event_data, separators=(',', ':'))}\n\n"

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Accepts image uploads and saves them temporarily, returning an image_id."""
    if not file.content_type.startswith("image/"):
        return JSONResponse(status_code=400, content={"error": "File must be an image"})
    
    # Cleanup files older than 1 hour (3600 seconds)
    current_time = time.time()
    for filename in os.listdir(UPLOAD_DIR):
        file_path = os.path.join(UPLOAD_DIR, filename)
        if os.path.isfile(file_path):
            if current_time - os.path.getmtime(file_path) > 3600:
                try:
                    os.remove(file_path)
                except Exception:
                    pass

    image_id = str(uuid.uuid4())
    ext = file.filename.split('.')[-1] if '.' in file.filename else ''
    filename = f"{image_id}.{ext}" if ext else image_id
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
        
    return {"imageId": filename, "path": file_path}

@app.get("/agent/info")
@app.get("/agent/run/info")
async def get_agent_info():
    return {}

@app.post("/agent/run")
async def run_agent(request: Request):
    """
    Main AG-UI SSE endpoint for CopilotKit runtime.
    Executes the LangGraph StateGraph, managing state, interrupts, and responses.
    """
    try:
        body = await request.json()
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": f"Invalid JSON payload: {str(e)}"})

    try:
        run_input = AgentRunInput(**body)
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": "Schema validation failed", "details": str(e)})

    thread_id = run_input.threadId or f"thread-{int(time.time())}"
    run_id = run_input.runId or f"run-{int(time.time()*1000)}"
    config = {"configurable": {"thread_id": thread_id}}

    # Extract clean image metadata
    image_meta = extract_image_metadata(run_input.context)

    # Convert incoming messages to dicts
    input_messages = []
    for m in run_input.messages:
        content_val = m.content
        if isinstance(content_val, list):
            # Extract plain text from parts if present
            text_parts = [p.get("text", "") for p in content_val if isinstance(p, dict) and p.get("type") == "text"]
            content_val = " ".join(text_parts) if text_parts else str(content_val)
        input_messages.append({
            "id": m.id or f"msg-{int(time.time()*1000)}",
            "role": m.role,
            "content": content_val
        })

    last_user_message = ""
    for m in reversed(input_messages):
        if m.get("role") == "user":
            last_user_message = m.get("content", "")
            break

    async def sse_event_stream() -> AsyncGenerator[str, None]:
        # 1. Emit RUN_STARTED event
        yield format_sse({
            "type": "RUN_STARTED",
            "runId": run_id,
            "threadId": thread_id
        })

        # Check existing state in checkpointer
        current_state_snapshot = visora_graph.get_state(config)
        has_pending_interrupt = bool(
            current_state_snapshot.tasks and current_state_snapshot.tasks[0].interrupts
        )

        try:
            msg_id = f"msg-asst-{int(time.time()*1000)}"
            
            # Determine input
            if has_pending_interrupt or run_input.resume is not None:
                resume_val = run_input.resume or last_user_message or "General"
                if isinstance(resume_val, dict) and "payload" in resume_val:
                    resume_val = resume_val.get("payload")
                elif isinstance(resume_val, list) and resume_val and isinstance(resume_val[0], dict):
                    resume_val = resume_val[0].get("payload", resume_val[0].get("value"))
                input_data = Command(resume=resume_val)
            else:
                existing_values = current_state_snapshot.values or {}
                dims_dict = None
                if image_meta and image_meta.imageDimensions:
                    dims_dict = {
                        "width": image_meta.imageDimensions.width,
                        "height": image_meta.imageDimensions.height
                    }
                elif existing_values.get("image_dimensions"):
                    dims_dict = existing_values.get("image_dimensions")

                input_data = {
                    "conversation_id": thread_id,
                    "messages": input_messages,
                    "image_id": image_meta.imageId if image_meta else existing_values.get("image_id"),
                    "image_name": image_meta.imageName if image_meta else existing_values.get("image_name"),
                    "image_type": image_meta.imageType if image_meta else existing_values.get("image_type"),
                    "image_dimensions": dims_dict,
                    "image_file_size": image_meta.fileSize if image_meta else existing_values.get("image_file_size"),
                    "analysis_status": "idle",
                    "needs_clarification": False,
                    "clarification_value": existing_values.get("clarification_value"),
                }

            yield format_sse({
                "type": "TEXT_MESSAGE_START",
                "messageId": msg_id,
                "role": "assistant"
            })
            
            streamed_tokens = False
            async for event in visora_graph.astream_events(input_data, config, version="v2"):
                if await request.is_disconnected():
                    break
                    
                if event["event"] == "on_custom_event" and event["name"] == "gemini_token":
                    chunk = event["data"]["token"]
                    streamed_tokens = True
                    yield format_sse({
                        "type": "TEXT_MESSAGE_CONTENT",
                        "messageId": msg_id,
                        "delta": chunk,
                        "content": chunk
                    })
                elif event["event"] == "on_chain_start":
                    node_name = event.get("name")
                    if node_name in ["receive_question", "inspect_context", "vision_analysis"]:
                        stage_msg_id = f"msg-stage-{int(time.time()*1000)}"
                        stage_content = f"__visora_stage__:{node_name}"
                        yield format_sse({
                            "type": "TEXT_MESSAGE_START",
                            "messageId": stage_msg_id,
                            "role": "assistant"
                        })
                        yield format_sse({
                            "type": "TEXT_MESSAGE_CONTENT",
                            "messageId": stage_msg_id,
                            "delta": stage_content,
                            "content": stage_content
                        })
                        yield format_sse({
                            "type": "TEXT_MESSAGE_END",
                            "messageId": stage_msg_id
                        })

            if await request.is_disconnected():
                # Client disconnected, we should abort
                return

            post_run_state = visora_graph.get_state(config)
            is_interrupted = bool(post_run_state.tasks and post_run_state.tasks[0].interrupts)
            
            if is_interrupted:
                interrupt_data = post_run_state.tasks[0].interrupts[0].value
                clar_payload = json.dumps(interrupt_data) if interrupt_data else "{}"
                clar_text = f"__visora_clarification__:{clar_payload}"
                yield format_sse({
                    "type": "TEXT_MESSAGE_CONTENT",
                    "messageId": msg_id,
                    "delta": clar_text,
                    "content": clar_text
                })
                yield format_sse({
                    "type": "TEXT_MESSAGE_END",
                    "messageId": msg_id
                })
                
                yield format_sse({
                    "type": "RUN_FINISHED",
                    "runId": run_id,
                    "threadId": thread_id,
                    "outcome": {
                        "type": "interrupt",
                        "interrupts": [
                            {
                                "id": f"int-{run_id}",
                                "reason": "Clarification required",
                                "value": interrupt_data or {"question": "What should I evaluate?"}
                            }
                        ]
                    }
                })
            else:
                if not streamed_tokens:
                    final_messages = post_run_state.values.get("messages", [])
                    assistant_reply = "Visora agent responded."
                    for m in reversed(final_messages):
                        if m.get("role") == "assistant":
                            assistant_reply = m.get("content", "")
                            break
                            
                    # Stream the fallback or non-streamed text
                    chunk_size = 20
                    for i in range(0, len(assistant_reply), chunk_size):
                        chunk = assistant_reply[i:i+chunk_size]
                        yield format_sse({
                            "type": "TEXT_MESSAGE_CONTENT",
                            "messageId": msg_id,
                            "delta": chunk,
                            "content": chunk
                        })
                        await asyncio.sleep(0.01)

                yield format_sse({
                    "type": "TEXT_MESSAGE_END",
                    "messageId": msg_id
                })

                yield format_sse({
                    "type": "RUN_FINISHED",
                    "runId": run_id,
                    "threadId": thread_id,
                    "outcome": {"type": "success"}
                })

        except Exception as e:
            # Emit run error
            yield format_sse({
                "type": "RUN_ERROR",
                "message": "Visual analysis is temporarily unavailable. Please try again.",
                "code": "LANGGRAPH_EXECUTION_FAILURE"
            })
            yield format_sse({
                "type": "RUN_FINISHED",
                "runId": run_id,
                "threadId": thread_id,
                "outcome": {
                    "type": "error",
                    "error": "Visual analysis is temporarily unavailable."
                }
            })

    return StreamingResponse(
        sse_event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
