from beanie import Document
from typing import Optional
from datetime import datetime

class Recommendation(Document):
    text: str
    date: Optional[datetime] = None
    
    class Settings:
        name = "recommendations" 