from fastapi import APIRouter, HTTPException
from modules.models.user import User
from typing import List

router = APIRouter(prefix="/api/users", tags=["users"])

@router.post("/", response_model=User)
async def create_user(user: User):
    await user.insert()
    return user

@router.get("/", response_model=List[User])
async def list_users():
    return await User.find_all().to_list()

@router.put("/{user_id}", response_model=User)
async def update_user(user_id: str, user: User):
    db_user = await User.get(user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    user.id = db_user.id
    await user.replace()
    return user

@router.delete("/{user_id}")
async def delete_user(user_id: str):
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await user.delete()
    return {"ok": True} 