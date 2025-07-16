from pydantic import BaseModel
from typing import Dict


class VoiceResponse(BaseModel):
    transcript: str
    intent: str
    entities: Dict[str, str]
