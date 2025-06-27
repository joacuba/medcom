from fastapi import APIRouter, HTTPException
from modules.models.doctor import Doctor
from typing import List
from modules.services.crud import add_recommendation, list_recommendations
from modules.models.recommendation import Recommendation

router = APIRouter(prefix="/api/doctors", tags=["doctors"])

@router.post("/", response_model=Doctor)
async def create_doctor(doctor: Doctor):
    await doctor.insert()
    return doctor

@router.get("/", response_model=List[Doctor])
async def list_doctors():
    return await Doctor.find_all().to_list()

@router.put("/{doctor_id}", response_model=Doctor)
async def update_doctor(doctor_id: str, doctor: Doctor):
    db_doctor = await Doctor.get(doctor_id)
    if not db_doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    doctor.id = db_doctor.id
    await doctor.replace()
    return doctor

@router.delete("/{doctor_id}")
async def delete_doctor(doctor_id: str):
    doctor = await Doctor.get(doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    await doctor.delete()
    return {"ok": True}

@router.post("/{doctor_id}/recommendations", response_model=Recommendation)
async def create_recommendation(doctor_id: str, rec: Recommendation):
    doctor = await add_recommendation(doctor_id, Recommendation(**rec.model_dump()))
    return (doctor.recommendations or [])[-1]

@router.get("/{doctor_id}/recommendations", response_model=List[Recommendation])
async def get_recommendations(doctor_id: str):
    return await list_recommendations(doctor_id) 