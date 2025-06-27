import time
from modules.algorithms.floyd_warshall import floyd_warshall
from modules.algorithms.dijkstra_all_pairs import dijkstra_all_pairs
from modules.algorithms.bellman_ford_all_pairs import bellman_ford_all_pairs


def benchmark_algorithms(adj_matrix, adj_list, runs_per_algo=3):
    results = {}
    # Floyd-Warshall
    fw_times = []
    for _ in range(runs_per_algo):
        start = time.perf_counter()
        floyd_warshall(adj_matrix)
        fw_times.append(time.perf_counter() - start)
    results['fwTime'] = sum(fw_times) / runs_per_algo

    # Dijkstra
    dijkstra_times = []
    for _ in range(runs_per_algo):
        start = time.perf_counter()
        dijkstra_all_pairs(adj_list)
        dijkstra_times.append(time.perf_counter() - start)
    results['dijkstraTime'] = sum(dijkstra_times) / runs_per_algo

    # Bellman-Ford
    bf_times = []
    for _ in range(runs_per_algo):
        start = time.perf_counter()
        bellman_ford_all_pairs(adj_list)
        bf_times.append(time.perf_counter() - start)
    results['bellmanFordTime'] = sum(bf_times) / runs_per_algo

    return results 