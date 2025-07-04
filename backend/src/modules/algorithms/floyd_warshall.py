def floyd_warshall(adj_matrix):
    """
    All-Pairs Shortest Path using Floyd-Warshall algorithm.
    Args:
        adj_matrix: 2D list or numpy array representing adjacency matrix (with inf for no edge)
    Returns:
        dist: 2D list or array of shortest path distances
    """
    n = len(adj_matrix)
    # Copy the adjacency matrix to avoid mutating the input
    dist = [row[:] for row in adj_matrix]
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]
    return dist

# New function for visiting order
def floyd_warshall_route(adj_matrix, start_idx, user_indices):
    """
    Returns a visiting order using a greedy nearest neighbor approach with Floyd-Warshall distances.
    """
    n = len(adj_matrix)
    dist = floyd_warshall(adj_matrix)
    order = [start_idx]
    unvisited = set(user_indices)
    current = start_idx
    while unvisited:
        # Find nearest unvisited
        next_node = min(unvisited, key=lambda x: dist[current][x])
        order.append(next_node)
        unvisited.remove(next_node)
        current = next_node
    return order 