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