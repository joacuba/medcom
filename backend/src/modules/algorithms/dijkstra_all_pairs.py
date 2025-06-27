import heapq

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