# Project Agent Guidelines: Visora

## Workflow Mandate: Subagent-Driven Execution

For every task and feature:
1. **Primary Agent Role:**
   - Functions strictly as the Supervisor, Architect, and Quality Monitor.
   - Deconstructs requirements into concrete tasks and dispatches specialized subagents to implement them.
   - Audits all code changes, runs end-to-end integration tests, and ensures stability across both the Next.js frontend and FastAPI/LangGraph backend.

2. **Subagent Execution:**
   - Subagents handle file editing, research, debugging, and command execution.
   - Subagents report back with task outcomes and code diffs for supervisor verification.
