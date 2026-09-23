from typing import TypedDict, Optional, List, Dict, Any

class VisoraAgentState(TypedDict):
    """
    Typed LangGraph state for the Visora visual reasoning agent.
    Maintains multi-turn conversation memory, active image metadata,
    and human-in-the-loop clarification status.
    """
    conversation_id: str
    messages: List[Dict[str, Any]]
    image_id: Optional[str]
    image_name: Optional[str]
    image_type: Optional[str]
    image_dimensions: Optional[Dict[str, int]]
    image_file_size: Optional[int]
    current_question: Optional[str]
    analysis_status: str
    needs_clarification: bool
    clarification_value: Optional[str]
