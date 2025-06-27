from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from modules.routers import users, doctors, benchmark
from modules.config import init_db
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="Medcom Routing Dashboard API",
    description="Backend API for medical routing and benchmarking",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)
app.include_router(doctors.router)
app.include_router(benchmark.router)

@app.get("/")
async def root():
    return {"message": "Medcom Routing Dashboard API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 
print("Starting server hello...")