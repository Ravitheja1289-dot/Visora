import os
from google import genai
from langchain_core.callbacks.manager import adispatch_custom_event
from typing import List, Dict, Any

# Simple in-memory bounded cache for Gemini uploads (image_path -> uploaded_file_object)
MAX_CACHE_ENTRIES = 50
_UPLOAD_CACHE = {}

# Instruction for the Gemini agent
SYSTEM_INSTRUCTION = """
You are Visora, a multimodal visual reasoning assistant inspired by Apple Pro design.
You analyze provided images, distinguish observations from assumptions, and answer questions about visual content, layout, color, and spatial relationships.
When asked "why", explain your visual evidence clearly.
Acknowledge uncertainty if details are not visible.
Do not invent details not supported by the image.
Do not expose private chain-of-thought or internal reasoning markers. Provide clear, direct, and helpful answers.
"""

async def analyze_image(
    image_path: str,
    mime_type: str,
    question: str,
    history: List[Dict[str, Any]],
    focus_area: str = None
) -> str:
    """
    Analyzes an image using Gemini, maintaining multi-turn context.
    Streams the response tokens using LangGraph's adispatch_custom_event.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set.")

    # Initialize async Gemini client
    client = genai.Client(api_key=api_key)
    
    # Check cache or upload
    if image_path in _UPLOAD_CACHE:
        uploaded_file = _UPLOAD_CACHE[image_path]
    else:
        try:
            await adispatch_custom_event("visora_progress", {"text": "Uploading visual canvas and generating visual embedding...\n"})
            uploaded_file = await client.aio.files.upload(file=image_path, config={'mime_type': mime_type})
            _UPLOAD_CACHE[image_path] = uploaded_file
            if len(_UPLOAD_CACHE) > MAX_CACHE_ENTRIES:
                oldest_key = next(iter(_UPLOAD_CACHE))
                del _UPLOAD_CACHE[oldest_key]
        except Exception as e:
            raise RuntimeError(f"Failed to upload image to Gemini: {e}")

    from google.genai import types
    
    # Build contents from history
    contents = []
    
    # Convert previous messages to Gemini format
    for msg in history:
        role = "user" if msg.get("role") == "user" else "model"
        content_val = msg.get("content", "")
        # Skip empty messages
        if not content_val:
            continue
        # Strip thinking block from prior history if present so model gets clean text
        if "<thinking>" in content_val and "</thinking>" in content_val:
            content_val = content_val.split("</thinking>")[-1].strip()
        contents.append(
            types.Content(role=role, parts=[types.Part.from_text(text=content_val)])
        )

    # Append current question and image
    current_parts = [
        types.Part.from_uri(file_uri=uploaded_file.uri, mime_type=uploaded_file.mime_type),
        types.Part.from_text(text=question)
    ]
    
    if focus_area:
        current_parts.append(types.Part.from_text(text=f"(Please focus your evaluation specifically on: {focus_area})"))
        
    contents.append(types.Content(role="user", parts=current_parts))

    try:
        await adispatch_custom_event("visora_progress", {"text": "Analyzing visual composition, contrast, typography, and motifs...\n"})
        response_stream = await client.aio.models.generate_content_stream(
            model="gemini-2.5-flash",
            contents=contents,
            config={
                "system_instruction": SYSTEM_INSTRUCTION
            }
        )
        
        def safe_log(msg: str):
            try:
                print(msg)
            except Exception:
                try:
                    print(msg.encode("ascii", errors="replace").decode("ascii"))
                except Exception:
                    pass

        full_text = ""
        safe_log(f"[GEMINI DEBUG] Starting stream for question: {question}")
        async for chunk in response_stream:
            if chunk.text:
                safe_log(f"[GEMINI DEBUG] Chunk: {chunk.text}")
                full_text += chunk.text
                # Dispatch custom event for LangGraph to catch
                await adispatch_custom_event("gemini_token", {"token": chunk.text})
                
        safe_log(f"[GEMINI DEBUG] Full response: {full_text}")
        return full_text
        
    except Exception as e:
        raise RuntimeError(f"Gemini generation failed: {e}")
    # Note: We do not delete the file in a finally block anymore, so the cache is preserved.

