from typing import List, Dict, Tuple, Any
from .osrm_client import OSRMClient

class Node:
    """Represents a waypoint/node in the routing graph."""
    def __init__(self, id: str, latitude: float, longitude: float):
        self.id = id
        self.latitude = latitude
        self.longitude = longitude

async def build_sparse_graph(waypoints: List[Node], k: int, osrm_client: OSRMClient | None = None) -> Dict[int, List[Tuple[int, float]]]:
    """
    Build a sparse adjacency-list graph from OSRM using a k-nearest strategy.
    
    This function creates a sparse graph where each node is connected to its k nearest neighbors
    based on actual driving distances from OSRM, rather than Euclidean distances.
    
    Args:
        waypoints: List of Node objects with id, latitude, longitude
        k: Number of nearest neighbors to connect for each node
        osrm_client: OSRM client instance (optional, creates default if None)
        
    Returns:
        Dictionary mapping node_id (int) to list of (neighbor_id, distance) tuples
        where distance is in meters
    """
    if osrm_client is None:
        osrm_client = OSRMClient()
    
    # Convert waypoints to format expected by OSRM client
    waypoint_dicts = []
    for wp in waypoints:
        waypoint_dicts.append({
            'latitude': wp.latitude,
            'longitude': wp.longitude
        })
    
    # Build sparse graph
    graph: Dict[int, List[Tuple[int, float]]] = {}
    
    for i, node in enumerate(waypoints):
        try:
            # Get k nearest neighbors for this node using OSRM table service
            neighbors = await osrm_client.get_nearest_neighbors(
                str(i), k, waypoint_dicts
            )
            
            # Convert string IDs to integers and store in graph
            graph[i] = [(int(neighbor_id), distance) for neighbor_id, distance in neighbors]
            
        except Exception as e:
            print(f"Error getting neighbors for node {i}: {e}")
            # If OSRM fails, create empty adjacency list
            graph[i] = []
    
    return graph 