"""
Prompts and deterministic development response templates for Visora Phase 4.
All responses are clearly documented as development answers while external
VLM / Gemini 2.0 integration is slated for Phase 5.
"""

DEV_GREETING = "Visora's LangGraph agent is connected."

CLARIFICATION_QUESTION = (
    "What should I evaluate?\n\n"
    "Options:\n"
    "- Visual Design\n"
    "- Accessibility\n"
    "- Mobile UX"
)

CLARIFICATION_OPTIONS = ["Visual Design", "Accessibility", "Mobile UX"]

def format_image_analysis_response(image_name: str, width: int, height: int, image_type: str) -> str:
    clean_type = (image_type or "image").replace("image/", "").upper()
    return f"You're currently analyzing {image_name}, a {width} × {height} {clean_type} image."

def format_format_response(image_type: str) -> str:
    clean_type = (image_type or "image").replace("image/", "").upper()
    return f"It's a {clean_type}."

def format_vlm_notice() -> str:
    return "I have the image context available, but visual analysis will be connected to the VLM in Phase 5."

def format_clarification_resolved_response(focus: str) -> str:
    return f"I'll evaluate the image with {focus} as the selected focus. Detailed visual analysis will be connected in Phase 5."
