def bellman_ford_all_pairs(adj_list):
    """
    All-Pairs Shortest Path using Bellman-Ford algorithm.
    Args:
        adj_list: Dict[int, List[Tuple[int, float]]] adjacency list
    Returns:
        dist: Dict[int, Dict[int, float]] shortest path distances
    """
    nodes = list(adj_list.keys())
    n = len(nodes)
    all_dist = {}
    for src in nodes:
        dist = {node: float('inf') for node in nodes}
        dist[src] = 0
        for _ in range(n - 1):
            for u in nodes:
                for v, w in adj_list[u]:
                    if dist[u] + w < dist[v]:
                        dist[v] = dist[u] + w
        all_dist[src] = dist
    return all_dist 