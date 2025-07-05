from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from modules.benchmark.runner import benchmark_algorithms
from modules.models.doctor import Doctor
from modules.models.user import User
from modules.preprocess.graph_builder import Node, build_sparse_graph
from modules.preprocess.osrm_client import OSRMClient
from modules.config import OSRM_BASE_URL
from modules.algorithms.tsp_solver import solve_tsp
from modules.algorithms.dijkstra_all_pairs import dijkstra_route
from modules.algorithms.bellman_ford_all_pairs import bellman_ford_route
from modules.algorithms.floyd_warshall import floyd_warshall_route

router = APIRouter(prefix="/api/benchmark", tags=["benchmark"])

class BenchmarkRequest(BaseModel):
    doctorId: str
    userIds: List[str]
    algorithm: str = "tsp"
    priorities: Optional[Dict[str, bool]] = None

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

    # --- NEW: Apply priorities to adjacency/duration matrix for Bellman-Ford and Floyd-Warshall ---
    if data.priorities and data.algorithm in ("bellmanFord", "floydWarshall"):
        idx_to_userid = {i: data.userIds[i-1] for i in range(1, n)}
        idx_to_userid[0] = data.doctorId
        for from_idx in range(n):
            user_id = idx_to_userid.get(from_idx)
            if user_id and data.priorities.get(user_id):
                for to_idx in range(n):
                    if from_idx != to_idx and adj_matrix[from_idx][to_idx] > 0:
                        adj_matrix[from_idx][to_idx] = -1e6  # Strong negative edge
    # --- END NEW ---

    # --- NEW: Rebuild adj_list from adj_matrix for Bellman-Ford ---
    def matrix_to_adj_list(matrix):
        n = len(matrix)
        adj_list = {}
        for i in range(n):
            adj_list[i] = []
            for j in range(n):
                if i != j and matrix[i][j] != float('inf'):
                    adj_list[i].append((j, matrix[i][j]))
        return adj_list
    if data.algorithm == "bellmanFord":
        adj_list = matrix_to_adj_list(adj_matrix)
    # --- END NEW ---

    # Run benchmarks
    results = benchmark_algorithms(adj_matrix, adj_list)

    # Determine visiting order based on selected algorithm
    start_idx = 0
    user_indices = list(range(1, n))
    visiting_order = []
    if data.algorithm == "tsp":
        visiting_order = solve_tsp(adj_matrix)
    elif data.algorithm == "dijkstra":
        visiting_order = dijkstra_route(adj_list, start_idx, user_indices)
    elif data.algorithm == "bellmanFord":
        idx_to_userid = {i: data.userIds[i-1] for i in range(1, n)}
        idx_to_userid[0] = data.doctorId
        visiting_order = bellman_ford_route(
            adj_list, start_idx, user_indices,
            priorities=data.priorities,
            idx_to_userid=idx_to_userid
        )
    elif data.algorithm == "floydWarshall":
        visiting_order = floyd_warshall_route(adj_matrix, start_idx, user_indices)
    else:
        visiting_order = [0] + user_indices  # fallback: doctor then users in order

    # Ensure visiting_order is valid and starts at 0
    if not visiting_order or visiting_order[0] != 0:
        visiting_order = [0] + [i for i in user_indices if i != 0]

    # Map visiting_order indices to coordinates
    ordered_coords = [
        {"latitude": waypoints[i].latitude, "longitude": waypoints[i].longitude}
        for i in visiting_order
    ]

    # Get full route geometry for the visiting order
    visiting_order_route = await osrm_client.get_full_route(ordered_coords)

    # Get route geometry for each segment (as before)
    route_geojson = []
    for i in range(1, len(visiting_order)):
        i_from = visiting_order[i - 1]
        i_to = visiting_order[i]
        route = await osrm_client.get_route(str(i_from), str(i_to), [
            {"latitude": wp.latitude, "longitude": wp.longitude} for wp in waypoints
        ])
        route_geojson.append(route['geometry'])

    # --- NEW: Get total time for the optimal route ---
    # Get duration matrix for all waypoints
    waypoint_dicts = [{"latitude": wp.latitude, "longitude": wp.longitude} for wp in waypoints]
    durations = await osrm_client.get_duration_matrix(waypoint_dicts)
    total_time = 0.0
    for i in range(1, len(visiting_order)):
        from_idx = visiting_order[i-1]
        to_idx = visiting_order[i]
        seg_time = durations[from_idx][to_idx]
        if seg_time is not None:
            total_time += seg_time
    results['totalTime'] = total_time
    # --- END NEW ---

    if data.algorithm == "tsp":
        results['routeGeoJSON'] = route_geojson
    else:
        results['routeGeoJSON'] = [visiting_order_route['geometry']]
    results['tspRouteOrder'] = visiting_order
    return results 