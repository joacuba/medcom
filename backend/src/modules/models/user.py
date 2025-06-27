from beanie import Document
from pydantic import EmailStr
from typing import Optional

class User(Document):
    name: str
    email: EmailStr
    age: Optional[int] = None
    latitude: float
    longitude: float
    phone_number: Optional[str] = None

    class Settings:
        name = "users" 