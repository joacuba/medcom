import httpx
from typing import List, Tuple, Dict, Any
import asyncio

class OSRMClient:
    """
    OSRM (Open Source Routing Machine) client for making routing requests.
    
    Supports:
    - Table service: Get distance/duration matrix between multiple points
    - Route service: Get detailed route between two points with geometry
    """
    
    def __init__(self, base_url: str = "http://osrm:5000"):
        self.base_url = base_url.rstrip('/')
    
    async def get_nearest_neighbors(self, point_id: str, k: int, waypoints: List[Dict[str, float]]) -> List[Tuple[str, float]]:
        """
        Get k nearest neighbors for a given point using OSRM table service.
        
        Args:
            point_id: ID of the source point (index in waypoints list)
            k: Number of nearest neighbors to find
            waypoints: List of waypoints with lat/lon coordinates
            
        Returns:
            List of tuples (neighbor_id, distance_in_meters)
        """
        # Build coordinates string for OSRM table service
        # Format: "lon1,lat1;lon2,lat2;lon3,lat3"
        coords = []
        for wp in waypoints:
            coords.append(f"{wp['longitude']},{wp['latitude']}")
        
        coordinates = ";".join(coords)
        
        # OSRM table service URL - returns distance/duration matrix
        url = f"{self.base_url}/table/v1/driving/{coordinates}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            
            # Get distances from source point to all other points
            source_idx = int(point_id)
            distances = data['distances'][source_idx]
            
            # Create list of (point_id, distance) tuples, excluding self
            point_distances = []
            for i, distance in enumerate(distances):
                if i != source_idx and distance is not None:
                    point_distances.append((str(i), distance))
            
            # Sort by distance and return top k
            point_distances.sort(key=lambda x: x[1])
            return point_distances[:k]
    
    async def get_route(self, i: str, j: str, waypoints: List[Dict[str, float]]) -> Dict[str, Any]:
        """
        Get route between two points using OSRM route service.
        
        Args:
            i: Source point ID (index in waypoints list)
            j: Destination point ID (index in waypoints list)
            waypoints: List of waypoints with lat/lon coordinates
            
        Returns:
            Route information including distance, duration, and GeoJSON geometry
        """
        # Get coordinates for source and destination
        source = waypoints[int(i)]
        dest = waypoints[int(j)]
        
        # Format: "lon1,lat1;lon2,lat2"
        coordinates = f"{source['longitude']},{source['latitude']};{dest['longitude']},{dest['latitude']}"
        
        # OSRM route service URL with full geometry
        url = f"{self.base_url}/route/v1/driving/{coordinates}?overview=full&geometries=geojson"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            
            # Extract route information
            route = data['routes'][0]
            return {
                'distance': route['distance'],  # meters
                'duration': route['duration'],  # seconds
                'geometry': route['geometry']   # GeoJSON LineString
            } 
    
    async def get_full_route(self, waypoints: List[Dict[str, float]]) -> Dict[str, Any]:
        """
        Get route for a sequence of waypoints using OSRM route service.
        Args:
            waypoints: List of waypoints with lat/lon coordinates (ordered)
        Returns:
            Route information including distance, duration, and GeoJSON geometry
        """
        if len(waypoints) < 2:
            raise ValueError("At least two waypoints are required for a route.")
        # Format: "lon1,lat1;lon2,lat2;..."
        coordinates = ";".join(f"{wp['longitude']},{wp['latitude']}" for wp in waypoints)
        url = f"{self.base_url}/route/v1/driving/{coordinates}?overview=full&geometries=geojson"
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            route = data['routes'][0]
            return {
                'distance': route['distance'],
                'duration': route['duration'],
                'geometry': route['geometry']
            } 
    
    async def get_duration_matrix(self, waypoints: List[Dict[str, float]]) -> Any:
        """
        Get the duration matrix (in seconds) between all waypoints using OSRM table service.
        Args:
            waypoints: List of waypoints with lat/lon coordinates
        Returns:
            durations: 2D list of durations in seconds
        """
        coords = [f"{wp['longitude']},{wp['latitude']}" for wp in waypoints]
        coordinates = ";".join(coords)
        url = f"{self.base_url}/table/v1/driving/{coordinates}?annotations=duration"
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            return data['durations'] 