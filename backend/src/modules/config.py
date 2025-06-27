import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from modules.models.user import User
from modules.models.doctor import Doctor
from modules.models.recommendation import Recommendation

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "medcom_routing")

# OSRM configuration
OSRM_BASE_URL = os.getenv("OSRM_BASE_URL", "http://localhost:5000")

# Algorithm configuration
K_NEAREST_NEIGHBORS = int(os.getenv("K_NEAREST_NEIGHBORS", "10"))
MAX_GRAPH_SIZE = int(os.getenv("MAX_GRAPH_SIZE", "1000"))

# Benchmark configuration
BENCHMARK_TIMEOUT = int(os.getenv("BENCHMARK_TIMEOUT", "300"))  # 5 minutes

async def init_db():
    """Initialize database connection and Beanie ODM"""
    client = AsyncIOMotorClient(MONGODB_URL)
    await init_beanie(
        database=client[DATABASE_NAME],
        document_models=[User, Doctor, Recommendation]
    ) 