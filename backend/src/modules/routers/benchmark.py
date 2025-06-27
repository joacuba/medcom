from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from modules.benchmark.runner import benchmark_algorithms
from modules.models.doctor import Doctor
from modules.models.user import User
from modules.preprocess.graph_builder import Node, build_sparse_graph
from modules.preprocess.osrm_client import OSRMClient
from modules.config import OSRM_BASE_URL

router = APIRouter(prefix="/api/benchmark", tags=["benchmark"])

class BenchmarkRequest(BaseModel):
    doctorId: str
    userIds: List[str]

@router.post("/", response_model=Dict[str, Any])
async def run_benchmark(data: BenchmarkRequest):
    # Fetch doctor and users from DB
    doctor = await Doctor.get(data.doctorId)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    users = [await User.get(uid) for uid in data.userIds]
    if any(u is None for u in users):
        raise HTTPException(status_code=404, detail="One or more users not found")

    # Build waypoints: doctor first, then users
    waypoints = [Node("0", doctor.latitude, doctor.longitude)]
    for i, user in enumerate(users, 1):
        if user is not None:
            waypoints.append(Node(str(i), user.latitude, user.longitude))

    # Build sparse graph (adjacency list)
    osrm_client = OSRMClient(base_url=OSRM_BASE_URL)
    k = 4  # or load from config
    adj_list = await build_sparse_graph(waypoints, k, osrm_client)

    # Build adjacency matrix for Floyd-Warshall
    n = len(waypoints)
    adj_matrix = [[float('inf')] * n for _ in range(n)]
    for i in range(n):
        adj_matrix[i][i] = 0.0
    for i, neighbors in adj_list.items():
        for j, w in neighbors:
            adj_matrix[i][j] = w

    # Run benchmarks
    results = benchmark_algorithms(adj_matrix, adj_list)

    # Get route geometry from doctor to all users (as a simple example)
    route_geojson = []
    for i in range(1, n):
        route = await osrm_client.get_route("0", str(i), [
            {"latitude": wp.latitude, "longitude": wp.longitude} for wp in waypoints
        ])
        route_geojson.append(route['geometry'])

    results['routeGeoJSON'] = route_geojson
    return results 