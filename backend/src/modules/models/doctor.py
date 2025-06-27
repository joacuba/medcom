from beanie import Document # Object Document Mapper build on top of pydantic
from pydantic import EmailStr # EmailStr is a pydantic field that validates that the email is a valid email address
from typing import Optional, List # Optional is a type that allows for None values, List is a type that allows for a list of values
from .recommendation import Recommendation

class Doctor(Document):
    name: str
    email: EmailStr
    specialty: Optional[str] = None
    recommendations: Optional[List[Recommendation]] = None
    latitude: float
    longitude: float

    class Settings:
        name = "doctors" 