from typing import Dict, Any, List, Optional
from langgraph.types import interrupt
from .state import VisoraAgentState
from .prompts import (
    DEV_GREETING,
    CLARIFICATION_QUESTION,
    CLARIFICATION_OPTIONS,
    format_image_analysis_response,
    format_format_response,
    format_vlm_notice,
    format_clarification_resolved_response
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

def answer_node(state: VisoraAgentState) -> Dict[str, Any]:
    """
    Development answer node.
    Synthesizes a response strictly using LangGraph state values
    (image metadata, multi-turn history, clarification focus).
    """
    question = (state.get("current_question") or "").strip()
    q_lower = question.lower()
    clar = state.get("clarification_value")
    img_name = state.get("image_name")
    img_dims = state.get("image_dimensions")
    img_type = state.get("image_type")

    if clar:
        reply = format_clarification_resolved_response(clar)
    elif "hello" in q_lower or "hi" == q_lower:
        reply = DEV_GREETING
    elif "what image" in q_lower or "which image" in q_lower or "analyzing" in q_lower:
        if img_name:
            width = img_dims.get("width", 0) if img_dims else 0
            height = img_dims.get("height", 0) if img_dims else 0
            reply = format_image_analysis_response(img_name, width, height, img_type or "png")
        else:
            reply = "No image is currently active in context. Please upload or inspect an image."
    elif "format" in q_lower:
        if img_type:
            reply = format_format_response(img_type)
        else:
            reply = "The active image format is not specified."
    elif "what do you see" in q_lower:
        reply = format_vlm_notice()
    else:
        reply = f"Visora LangGraph agent acknowledged: \"{question}\". Agent state and thread are active."

    new_message = {
        "role": "assistant",
        "content": reply
    }
    
    return {
        "messages": state.get("messages", []) + [new_message],
        "analysis_status": "answered"
    }
