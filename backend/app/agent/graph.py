from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from .state import VisoraAgentState
from .nodes import (
    receive_question_node,
    inspect_context_node,
    should_clarify,
    clarification_node,
    answer_node
)

def create_visora_graph(checkpointer: MemorySaver = None):
    """
    Constructs and compiles the Visora Phase 4 LangGraph workflow.
    Uses in-memory checkpointing for multi-turn state persistence.
    """
    builder = StateGraph(VisoraAgentState)

    builder.add_node("receive_question", receive_question_node)
    builder.add_node("inspect_context", inspect_context_node)
    builder.add_node("clarification", clarification_node)
    builder.add_node("answer", answer_node)

    builder.add_edge(START, "receive_question")
    builder.add_edge("receive_question", "inspect_context")
    builder.add_conditional_edges(
        "inspect_context",
        should_clarify,
        {
            "clarification": "clarification",
            "answer": "answer"
        }
    )
    builder.add_edge("clarification", "answer")
    builder.add_edge("answer", END)

    if checkpointer is None:
        checkpointer = MemorySaver()

    return builder.compile(checkpointer=checkpointer)

# Shared graph instance with persistent in-memory checkpointer across runs
shared_checkpointer = MemorySaver()
visora_graph = create_visora_graph(shared_checkpointer)
