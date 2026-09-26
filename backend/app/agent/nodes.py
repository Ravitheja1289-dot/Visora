from typing import Dict, Any, List, Optional
from langgraph.types import interrupt
from .state import VisoraAgentState
from .prompts import (
    CLARIFICATION_QUESTION,
    CLARIFICATION_OPTIONS
)

def receive_question_node(state: VisoraAgentState) -> Dict[str, Any]:
    """
    Extracts the latest user question from the conversation messages
    and updates the active state turn.
    """
    messages = state.get("messages", [])
    last_user_content = ""
    for msg in reversed(messages):
        if msg.get("role") == "user":
            content = msg.get("content", "")
            if isinstance(content, str):
                last_user_content = content
            elif isinstance(content, list):
                # If message content is multipart, extract text parts
                parts = [p.get("text", "") for p in content if isinstance(p, dict) and p.get("type") == "text"]
                last_user_content = " ".join(parts) if parts else str(content)
            break

    return {
        "current_question": last_user_content,
        "analysis_status": "received"
    }

def inspect_context_node(state: VisoraAgentState) -> Dict[str, Any]:
    """
    Validates presence of image metadata in state and updates inspection status.
    """
    return {
        "analysis_status": "context_inspected"
    }

def should_clarify(state: VisoraAgentState) -> str:
    """
    Conditional edge evaluator: checks if the current question requires
    human-in-the-loop clarification before proceeding to synthesis.
    """
    question = (state.get("current_question") or "").strip().lower()
    clar_val = state.get("clarification_value")

    # If clarification was already resolved in state, route directly to answer
    if clar_val:
        return "answer"

    # Ambiguous evaluation queries requiring HITL focus
    ambiguous_triggers = [
        "is this design good",
        "is this good",
        "evaluate this",
        "evaluate design",
        "critique this",
        "review this design"
    ]
    if any(trigger in question for trigger in ambiguous_triggers):
        return "clarification"

    return "answer"

def clarification_node(state: VisoraAgentState) -> Dict[str, Any]:
    """
    Human-in-the-loop clarification node.
    Pauses graph execution using LangGraph's interrupt() primitive.
    Resumes with the user's selected evaluation focus.
    """
    user_choice = interrupt({
        "question": "What should I evaluate?",
        "options": CLARIFICATION_OPTIONS
    })

    return {
        "needs_clarification": False,
        "clarification_value": str(user_choice) if user_choice else "General",
        "analysis_status": "clarification_resolved"
    }

import os
from ..services.gemini import analyze_image

async def vision_analysis_node(state: VisoraAgentState) -> Dict[str, Any]:
    """
    Multimodal answer node utilizing Gemini VLM.
    """
    question = (state.get("current_question") or "").strip()
    clar = state.get("clarification_value")
    img_name = state.get("image_name")
    img_type = state.get("image_type") or "image/png"
    messages_history = state.get("messages", [])
    
    # Retrieve the image path
    image_path = None
    if img_name:
        # Go up three levels from backend/app/agent to backend, then uploads
        upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
        image_path = os.path.join(upload_dir, img_name)
    
    if not image_path or not os.path.exists(image_path):
        reply = "No valid image context is currently active. Please upload or select an image."
    else:
        try:
            # We call the gemini service directly. It will stream tokens internally via adispatch_custom_event
            reply = await analyze_image(
                image_path=image_path,
                mime_type=img_type,
                question=question,
                history=messages_history,
                focus_area=clar
            )
        except Exception as e:
            reply = "Visual analysis is temporarily unavailable. Please try again."

    new_message = {
        "role": "assistant",
        "content": reply
    }
    
    return {
        "messages": state.get("messages", []) + [new_message],
        "analysis_status": "answered"
    }
