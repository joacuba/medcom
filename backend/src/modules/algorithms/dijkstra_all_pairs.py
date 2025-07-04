import heapq
from typing import Dict, List, Tuple

def dijkstra_all_pairs(adj_list):
    """
    All-Pairs Shortest Path using Dijkstra's algorithm.
    Args:
        adj_list: Dict[int, List[Tuple[int, float]]] adjacency list
    Returns:
        dist: Dict[int, Dict[int, float]] shortest path distances
    """
    def dijkstra(source):
        dist = {node: float('inf') for node in adj_list}
        dist[source] = 0
        heap = [(0.0, source)]
        while heap:
            d, u = heapq.heappop(heap)
            if d > dist[u]:
                continue
            for v, w in adj_list[u]:
                if dist[u] + w < dist[v]:
                    dist[v] = dist[u] + w
                    heapq.heappush(heap, (dist[v], v))
        return dist
    
    all_dist = {}
    for node in adj_list:
        all_dist[node] = dijkstra(node)
    return all_dist 

# New function for visiting order
def dijkstra_route(adj_list: Dict[int, List[Tuple[int, float]]], start_idx: int, user_indices: List[int]) -> List[int]:
    """
    Returns a visiting order using a greedy nearest neighbor approach with Dijkstra's algorithm.
    """
    order = [start_idx]
    unvisited = set(user_indices)
    current = start_idx
    while unvisited:
        # Compute shortest paths from current node
        dist = {node: float('inf') for node in adj_list}
        dist[current] = 0
        heap = [(0.0, current)]
        while heap:
            d, u = heapq.heappop(heap)
            if d > dist[u]:
                continue
            for v, w in adj_list[u]:
                if dist[u] + w < dist[v]:
                    dist[v] = dist[u] + w
                    heapq.heappush(heap, (dist[v], v))
        # Find nearest unvisited
        next_node = min(unvisited, key=lambda x: dist[x])
        order.append(next_node)
        unvisited.remove(next_node)
        current = next_node
    return order 