from modules.models.doctor import Doctor
from modules.models.recommendation import Recommendation
from typing import List
from fastapi import HTTPException

async def add_recommendation(doctor_id: str, recommendation: Recommendation) -> Doctor:
    doctor = await Doctor.get(doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    if doctor.recommendations is None:
        doctor.recommendations = []
    doctor.recommendations.append(recommendation)
    await doctor.save()
    return doctor

async def list_recommendations(doctor_id: str) -> List[Recommendation]:
    doctor = await Doctor.get(doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    return doctor.recommendations or [] 