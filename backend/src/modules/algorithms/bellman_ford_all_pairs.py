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

# New function for visiting order
def bellman_ford_route(adj_list, start_idx, user_indices):
    """
    Returns a visiting order using a greedy nearest neighbor approach with Bellman-Ford algorithm.
    """
    order = [start_idx]
    unvisited = set(user_indices)
    current = start_idx
    nodes = list(adj_list.keys())
    n = len(nodes)
    while unvisited:
        # Bellman-Ford from current
        dist = {node: float('inf') for node in nodes}
        dist[current] = 0
        for _ in range(n - 1):
            for u in nodes:
                for v, w in adj_list[u]:
                    if dist[u] + w < dist[v]:
                        dist[v] = dist[u] + w
        # Find nearest unvisited
        next_node = min(unvisited, key=lambda x: dist[x])
        order.append(next_node)
        unvisited.remove(next_node)
        current = next_node
    return order 