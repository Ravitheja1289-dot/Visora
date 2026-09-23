from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field

class ImageDimensions(BaseModel):
    width: int
    height: int

class ImageMetadata(BaseModel):
    imageId: Optional[str] = None
    imageName: Optional[str] = None
    imageType: Optional[str] = None
    imageDimensions: Optional[ImageDimensions] = None
    fileSize: Optional[int] = None

class ContextItem(BaseModel):
    description: Optional[str] = None
    value: Union[str, Dict[str, Any]]

class MessageItem(BaseModel):
    id: Optional[str] = None
    role: str
    content: Union[str, List[Any]]

class AgentRunInput(BaseModel):
    threadId: Optional[str] = None
    runId: Optional[str] = None
    messages: List[MessageItem] = Field(default_factory=list)
    tools: List[Dict[str, Any]] = Field(default_factory=list)
    context: List[ContextItem] = Field(default_factory=list)
    state: Optional[Dict[str, Any]] = None
    resume: Optional[Any] = None
    forwardedProps: Optional[Dict[str, Any]] = None
