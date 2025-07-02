# Medcom 

A full-stack medical routing and benchmarking application with FastAPI backend, React frontend, MongoDB persistence, and OSRM routing engine.

## Features

- **User & Doctor Management**: CRUD operations for users and doctors with location data
- **Routing Engine**: OSRM integration for real-world routing calculations
- **APSP Algorithms**: Implementation of Floyd-Warshall, Dijkstra, and Bellman-Ford algorithms
- **TSP Solver**: Traveling Salesman Problem optimization using Google OR-Tools
- **Benchmarking**: Performance comparison of different routing algorithms
- **Modern UI**: React frontend with responsive design

For get the OSRM runing with geofabric data run this commands in the project dir

```bash
mkdir -p ./data/osm
wget https://download.geofabrik.de/south-america/peru-latest.osm.pbf -O ./data/osm/peru-latest.osm.pbf
```