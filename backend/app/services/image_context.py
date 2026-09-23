import json
from typing import List, Dict, Any, Optional
from ..models.schemas import ContextItem, ImageMetadata, ImageDimensions

def extract_image_metadata(context_items: List[ContextItem]) -> Optional[ImageMetadata]:
    """
    Extracts and normalizes structured image metadata from CopilotKit context array.
    Guarantees no raw image binaries/base64 are processed into agent state.
    """
    for item in context_items:
        raw_val = item.value
        data: Dict[str, Any] = {}
        if isinstance(raw_val, str):
            try:
                data = json.loads(raw_val)
            except Exception:
                continue
        elif isinstance(raw_val, dict):
            data = raw_val

        # Check for image metadata markers
        if "imageId" in data or "imageName" in data or "imageDimensions" in data:
            dims_data = data.get("imageDimensions")
            dims = None
            if isinstance(dims_data, dict):
                dims = ImageDimensions(
                    width=dims_data.get("width", 0),
                    height=dims_data.get("height", 0)
                )

            return ImageMetadata(
                imageId=data.get("imageId"),
                imageName=data.get("imageName"),
                imageType=data.get("imageType"),
                imageDimensions=dims,
                fileSize=data.get("fileSize") or data.get("imageSizeBytes")
            )
            
    return None
