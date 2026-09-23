import json
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "visora-langgraph-backend"

def parse_sse_events(raw_text: str):
    events = []
    for line in raw_text.split("\n"):
        line = line.strip()
        if line.startswith("data:"):
            json_part = line[5:].strip()
            if json_part:
                events.append(json.loads(json_part))
    return events

def test_agent_run_hello():
    payload = {
        "threadId": "test-hello-thread",
        "runId": "run-1",
        "messages": [{"role": "user", "content": "Hello"}],
        "context": []
    }
    response = client.post("/agent/run", json=payload)
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]
    events = parse_sse_events(response.text)
    event_types = [e["type"] for e in events]
    assert "RUN_STARTED" in event_types
    assert "TEXT_MESSAGE_CONTENT" in event_types
    assert "RUN_FINISHED" in event_types

    # Verify content mentions connected
    full_content = "".join([e.get("delta", "") for e in events if e["type"] == "TEXT_MESSAGE_CONTENT"])
    assert "Visora's LangGraph agent is connected" in full_content

def test_agent_run_image_metadata():
    payload = {
        "threadId": "test-image-thread",
        "runId": "run-img-1",
        "messages": [{"role": "user", "content": "What image am I analyzing?"}],
        "context": [
            {
                "description": "Active Image Metadata",
                "value": json.dumps({
                    "imageId": "img-999",
                    "imageName": "dashboard.png",
                    "imageType": "image/png",
                    "imageDimensions": {"width": 1920, "height": 1080},
                    "fileSize": 450000
                })
            }
        ]
    }
    response = client.post("/agent/run", json=payload)
    assert response.status_code == 200
    events = parse_sse_events(response.text)
    full_content = "".join([e.get("delta", "") for e in events if e["type"] == "TEXT_MESSAGE_CONTENT"])
    assert "dashboard.png" in full_content
    assert "1920 × 1080" in full_content
    assert "PNG" in full_content

    # Multi-turn turn 2: "What format is it?" in same thread WITHOUT sending context again
    payload_turn2 = {
        "threadId": "test-image-thread",
        "runId": "run-img-2",
        "messages": [
            {"role": "user", "content": "What image am I analyzing?"},
            {"role": "assistant", "content": full_content},
            {"role": "user", "content": "What format is it?"}
        ],
        "context": []
    }
    response2 = client.post("/agent/run", json=payload_turn2)
    assert response2.status_code == 200
    events2 = parse_sse_events(response2.text)
    full_content2 = "".join([e.get("delta", "") for e in events2 if e["type"] == "TEXT_MESSAGE_CONTENT"])
    assert "PNG" in full_content2

def test_clarification_interrupt_and_resume():
    clar_thread = "test-clar-thread"
    payload = {
        "threadId": clar_thread,
        "runId": "run-clar-1",
        "messages": [{"role": "user", "content": "Is this design good?"}],
        "context": []
    }
    response = client.post("/agent/run", json=payload)
    assert response.status_code == 200
    events = parse_sse_events(response.text)
    full_content = "".join([e.get("delta", "") for e in events if e["type"] == "TEXT_MESSAGE_CONTENT"])
    assert "What should I evaluate?" in full_content
    assert "Accessibility" in full_content

    run_finished = next(e for e in events if e["type"] == "RUN_FINISHED")
    assert run_finished["outcome"]["type"] == "interrupt"

    # Now resume with "Accessibility"
    resume_payload = {
        "threadId": clar_thread,
        "runId": "run-clar-2",
        "messages": [
            {"role": "user", "content": "Is this design good?"},
            {"role": "assistant", "content": full_content},
            {"role": "user", "content": "Accessibility"}
        ],
        "context": []
    }
    response_resumed = client.post("/agent/run", json=resume_payload)
    assert response_resumed.status_code == 200
    resumed_events = parse_sse_events(response_resumed.text)
    resumed_content = "".join([e.get("delta", "") for e in resumed_events if e["type"] == "TEXT_MESSAGE_CONTENT"])
    assert "accessibility" in resumed_content.lower()
    assert "Phase 5" in resumed_content
