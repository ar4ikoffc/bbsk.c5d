"""API request handlers and route logic for the application."""

from fastapi import APIRouter, HTTPException, Path
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import json
import os
import math
from enum import Enum

router = APIRouter(prefix="/api", tags=["routing"])

# ============================================================
# BUILDINGS DATA LOADING
# ============================================================

def get_buildings_json_path() -> str:
    """Get path to buildings.json from env var or default location."""
    env_path = os.getenv("BUILDINGS_JSON_PATH")
    if env_path:
        return env_path
    # Project root is parent of bbsk.c5d (i.e., G:\SHIIIIT)
    current_dir = os.path.dirname(os.path.abspath(__file__))  # map-module
    project_root = os.path.dirname(os.path.dirname(current_dir))  # SHIIIIT
    return os.path.join(project_root, "data", "buildings.json")


def load_buildings_data() -> dict:
    """Load buildings data from JSON file."""
    path = get_buildings_json_path()
    if not os.path.exists(path):
        raise FileNotFoundError(f"Buildings data file not found at: {path}")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


_buildings_cache = None


def get_buildings_data() -> dict:
    """Get cached buildings data, loading on first call."""
    global _buildings_cache
    if _buildings_cache is None:
        _buildings_cache = load_buildings_data()
    return _buildings_cache


def reload_buildings_data() -> dict:
    """Force reload buildings data from file."""
    global _buildings_cache
    _buildings_cache = load_buildings_data()
    return _buildings_cache


# ============================================================
# TYPES & MODELS
# ============================================================

class PointType(str, Enum):
    SERVICE_CENTER = "service_center"
    ABONENT = "abonent"


class PointCreate(BaseModel):
    id: str
    name: str
    point_type: PointType = PointType.ABONENT


class PointUpdate(BaseModel):
    name: Optional[str] = None
    point_type: Optional[PointType] = None


class PointResponse(BaseModel):
    id: str
    name: str
    point_type: PointType
    lat: float
    lng: float


class RouteDistributionPoint(BaseModel):
    index: int
    lat: float
    lng: float
    name: str


class RouteDistributionRequest(BaseModel):
    start_lat: float
    start_lng: float
    points: List[RouteDistributionPoint]
    n_routes: int


class RouteDistributionResponse(BaseModel):
    routes: List[List[int]]
    total_distances_km: List[float]
    route_details: List[List[dict]]


class RoutePoint(BaseModel):
    lat: float
    lng: float
    name: str


class RouteRequest(BaseModel):
    start_point_id: str
    abonent_ids: List[str]
    service_time_minutes: int = 15


class RouteResult(BaseModel):
    route_id: int
    path_sequence: List[str]
    total_distance_m: float
    total_time_minutes: float
    details: List[dict]


class ReequipmentRequest(BaseModel):
    brigade_id: str
    current_equipment_count: int
    required_equipment_count: int
    start_point_id: str


# ============================================================
# BUILDINGS DATA MODELS
# ============================================================

class HourlyFactor(BaseModel):
    hour: int
    factor: float


class TravelMatrixRequest(BaseModel):
    matrix_id: str
    points: List[str]
    durations_sec: List[List[int]]
    distances_m: List[List[int]]
    hourly_factors: List[HourlyFactor]


class BuildingsResponse(BaseModel):
    matrix_id: str
    points: List[str]
    durations_sec: List[List[int]]
    distances_m: List[List[int]]
    hourly_factors: List[HourlyFactor]


# ============================================================
# ROUTE PLANNING MODELS
# ============================================================

class TimeSlot(BaseModel):
    start: str  # HH:MM format
    end: str    # HH:MM format


class ShiftSchedule(BaseModel):
    start: str      # HH:MM format, e.g., "08:00"
    end: str        # HH:MM format, e.g., "17:00"
    lunch_start: Optional[str] = "13:00"
    lunch_end: Optional[str] = "14:00"


class EquipmentConfig(BaseModel):
    initial_count: int
    consumption_per_order: int = 1


class Order(BaseModel):
    id: str
    point_id: str
    point_type: PointType = PointType.ABONENT
    lat: float
    lng: float
    time_slot: Optional[TimeSlot] = None
    deadline: Optional[str] = None  # ISO datetime or HH:MM for same-day
    service_time_minutes: int = 15
    is_repeat: bool = False
    priority: int = 1
    equipment_required: int = 1


class Brigade(BaseModel):
    id: str
    start_point_id: str
    start_lat: float
    start_lng: float
    shift: ShiftSchedule
    equipment: EquipmentConfig
    current_orders: List[str] = []  # order IDs already assigned


class RoutePlanRequest(BaseModel):
    brigades: List[Brigade]
    orders: List[Order]
    matrix_id: Optional[str] = None  # if provided, use buildings travel matrix
    optimization_goals: List[str] = ["min_transfers", "min_travel_time", "respect_slots", "respect_deadlines"]


class RouteStop(BaseModel):
    order_id: Optional[str] = None
    point_id: str
    point_type: PointType
    lat: float
    lng: float
    arrival_time: str  # HH:MM
    departure_time: str  # HH:MM
    service_time_minutes: int = 0
    is_service_center: bool = False
    is_lunch_break: bool = False
    equipment_before: int
    equipment_after: int
    travel_time_minutes: float = 0
    distance_m: float = 0


class BrigadeRoute(BaseModel):
    brigade_id: str
    stops: List[RouteStop]
    total_distance_m: float
    total_time_minutes: float
    orders_completed: List[str]
    orders_missed: List[str]
    equipment_used: int
    return_to_base: bool = True


class RoutePlanResponse(BaseModel):
    routes: List[BrigadeRoute]
    unassigned_orders: List[str]
    summary: dict


class RerouteRequest(BaseModel):
    brigade_id: str
    current_route: BrigadeRoute
    current_position: dict  # lat, lng, current_time
    remaining_orders: List[Order]
    new_orders: List[Order] = []
    cancelled_orders: List[str] = []
    reason: str = "reroute"


class RerouteResponse(BaseModel):
    new_route: BrigadeRoute
    changes: List[dict]


# ============================================================
# IN-MEMORY STORAGE (would be PostgreSQL in production)
# ============================================================

points_db = {}


# ============================================================
# GEO HELPERS
# ============================================================

shortest_path_cache = {}


import os
from urllib.request import urlopen
from urllib.error import URLError, HTTPError

# OSRM Configuration
OSRM_BASE_URL = os.getenv("OSRM_BASE_URL", "http://localhost:5000")
USE_OSRM = os.getenv("USE_OSRM", "false").lower() == "true"


def haversine_dist_m(lat1, lng1, lat2, lng2) -> float:
    """Calculate approximate distance in meters between two coordinates."""
    import math
    R = 6371000
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)
    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def get_path_length_m(start_lat: float, start_lng: float, end_lat: float, end_lng: float) -> float:
    """Get shortest path length in meters using OSRM if available, else haversine fallback."""
    cache_key = f"{start_lat}_{start_lng}_{end_lat}_{end_lng}"
    if cache_key in shortest_path_cache:
        return shortest_path_cache[cache_key]

    if USE_OSRM:
        try:
            url = f"{OSRM_BASE_URL}/route/v1/driving/{start_lng},{start_lat};{end_lng},{end_lat}"
            params = {"overview": "false", "steps": "false"}
            full_url = url + "?" + "&".join([f"{k}={v}" for k, v in params.items()])
            with urlopen(full_url, timeout=5.0) as response:
                data = __import__('json').load(response)
            if data.get("code") == "Ok" and data.get("waypoints"):
                distance = data["routes"][0]["distance"]  # in meters
                shortest_path_cache[cache_key] = distance
                return distance
        except (URLError, HTTPError, Exception):
            pass  # Fall through to haversine

    import math
    R = 6371000
    phi1 = math.radians(start_lat)
    phi2 = math.radians(end_lat)
    delta_phi = math.radians(end_lat - start_lat)
    delta_lambda = math.radians(end_lng - start_lng)
    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    dist = R * c
    shortest_path_cache[cache_key] = dist
    return dist


get_path_length_m._cache = {}


# ============================================================
# CRUD ENDPOINTS
# ============================================================

@router.post("/points", response_model=PointResponse)
async def create_point(point: PointCreate):
    if point.id in points_db:
        raise HTTPException(400, detail="Point ID already exists")
    points_db[point.id] = {
        "id": point.id, "name": point.name,
        "point_type": point.point_type, "lat": 0.0, "lng": 0.0
    }
    return points_db[point.id]


@router.get("/points", response_model=List[PointResponse])
async def get_all_points():
    return list(points_db.values())


@router.get("/points/{point_id}", response_model=PointResponse)
async def get_point(point_id: str):
    if point_id not in points_db:
        raise HTTPException(404, detail="Point not found")
    return points_db[point_id]


@router.put("/points/{point_id}", response_model=PointResponse)
async def update_point(point_id: str, point: PointUpdate):
    if point_id not in points_db:
        raise HTTPException(404, detail="Point not found")
    p = points_db[point_id]
    if point.name is not None:
        p["name"] = point.name
    if point.point_type is not None:
        p["point_type"] = point.point_type
    return p


@router.delete("/points/{point_id}")
async def delete_point(point_id: str):
    if point_id not in points_db:
        raise HTTPException(404, detail="Point not found")
    del points_db[point_id]
    return {"status": "deleted"}


# ============================================================
# ROUTE ENDPOINTS
# ============================================================

@router.post("/routes/distribute", response_model=RouteDistributionResponse)
async def distribute_routes(request: RouteDistributionRequest):
    """Distribute points into routes using round-robin distribution."""
    n_points = len(request.points)
    n_routes = request.n_routes
    if n_routes < 1:
        raise HTTPException(400, detail="n_routes must be >= 1")
    if n_points == 0:
        raise HTTPException(400, detail="No points provided")

    n_total = n_points + 1
    dist_matrix = [[0.0] * n_total for _ in range(n_total)]

    for i, point in enumerate(request.points):
        dist_matrix[0][i + 1] = get_path_length_m(
            request.start_lat, request.start_lng, point.lat, point.lng)
        dist_matrix[i + 1][0] = dist_matrix[0][i + 1]

    for i in range(n_points):
        for j in range(i + 1, n_points):
            d = get_path_length_m(
                request.points[i].lat, request.points[i].lng,
                request.points[j].lat, request.points[j].lng)
            dist_matrix[i + 1][j + 1] = d
            dist_matrix[j + 1][i + 1] = d

    # Round-robin distribution
    routes = [[] for _ in range(n_routes)]
    point_indices = list(range(n_points))
    for i, pt_idx in enumerate(point_indices):
        routes[i % n_routes].append(pt_idx)

    # Calculate route distances
    route_distances = [0.0] * n_routes
    route_details = [[] for _ in range(n_routes)]

    for r in range(n_routes):
        route_total = 0.0
        for i in range(len(routes[r]) - 1):
            from_idx = routes[r][i] if routes[r][i] > 0 else 0
            to_idx = routes[r][i + 1] if routes[r][i + 1] > 0 else 0
            if from_idx > 0 and to_idx > 0:
                d = get_path_length_m(
                    request.points[from_idx - 1].lat, request.points[from_idx - 1].lng,
                    request.points[to_idx - 1].lat, request.points[to_idx - 1].lng)
                route_total += d
        route_distances[r] = route_total / 1000  # km
        route_details[r] = [
            {"index": idx, "lat": request.points[idx].lat, "lng": request.points[idx].lng, "name": request.points[idx].name}
            for idx in routes[r]
        ]

    return {
        "routes": routes,
        "total_distances_km": route_distances,
        "route_details": route_details
    }


@router.post("/routes/reequipment")
async def plan_reequipment(request: ReequipmentRequest):
    """Check if reequipment is needed."""
    if request.start_point_id not in points_db:
        raise HTTPException(404, detail="Start point not found")
    if request.current_equipment_count >= request.required_equipment_count:
        return {
            "needs_reequipment": False,
            "message": "Brigade has sufficient equipment",
            "route": None
        }
    return {
        "needs_reequipment": True,
        "equipment_deficit": request.required_equipment_count - request.current_equipment_count,
        "start_point_id": request.start_point_id,
        "message": "Brigade needs reequipment from service center",
        "route_suggestion": {
            "description": "Brigade should go to service center, pick up equipment, and return",
            "start_point_id": request.start_point_id,
            "current_equipment": request.current_equipment_count,
            "required_equipment": request.required_equipment_count
        }
    }


# ============================================================
# BUILDINGS ENDPOINTS
# ============================================================

@router.get("/buildings", response_model=BuildingsResponse)
async def get_buildings():
    """Get buildings travel matrix data."""
    try:
        data = get_buildings_data()
        return data
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Invalid JSON format: {e}")


@router.post("/buildings/reload")
async def reload_buildings():
    """Force reload buildings data from file."""
    try:
        data = reload_buildings_data()
        return {"status": "reloaded", "matrix_id": data.get("matrix_id")}
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Invalid JSON format: {e}")


@router.get("/buildings/path")
async def get_buildings_path():
    """Get the current buildings.json file path being used."""
    return {"path": get_buildings_json_path()}


# ============================================================
# ROUTE PLANNING HELPERS
# ============================================================

_travel_matrix_cache = {}


def get_travel_matrix(matrix_id: Optional[str] = None) -> Optional[dict]:
    """Get travel matrix from buildings data."""
    if matrix_id:
        data = get_buildings_data()
        if data.get("matrix_id") == matrix_id:
            return data
        return None
    data = get_buildings_data()
    return data


def get_matrix_distance_duration(from_point: str, to_point: str, matrix_id: Optional[str] = None) -> tuple:
    """Get distance (m) and duration (sec) between two points from travel matrix."""
    matrix = get_travel_matrix(matrix_id)
    if not matrix:
        return None, None
    
    points = matrix.get("points", [])
    try:
        from_idx = points.index(from_point)
        to_idx = points.index(to_point)
        distance = matrix["distances_m"][from_idx][to_idx]
        duration = matrix["durations_sec"][from_idx][to_idx]
        return distance, duration
    except (ValueError, IndexError):
        return None, None


def get_hourly_factor(hour: int, matrix_id: Optional[str] = None) -> float:
    """Get traffic factor for a given hour."""
    matrix = get_travel_matrix(matrix_id)
    if not matrix:
        return 1.0
    
    for factor in matrix.get("hourly_factors", []):
        if factor["hour"] == hour:
            return factor["factor"]
    return 1.0


def time_to_minutes(time_str: str) -> int:
    """Convert HH:MM to minutes since midnight."""
    h, m = map(int, time_str.split(":"))
    return h * 60 + m


def minutes_to_time(minutes: int) -> str:
    """Convert minutes since midnight to HH:MM."""
    h = minutes // 60
    m = minutes % 60
    return f"{h:02d}:{m:02d}"


def add_minutes(time_str: str, minutes: int) -> str:
    """Add minutes to HH:MM time string."""
    total = time_to_minutes(time_str) + minutes
    return minutes_to_time(total)


def is_within_slot(arrival: str, slot: TimeSlot) -> bool:
    """Check if arrival time is within the time slot."""
    arr_min = time_to_minutes(arrival)
    start_min = time_to_minutes(slot.start)
    end_min = time_to_minutes(slot.end)
    return start_min <= arr_min <= end_min


def calculate_travel_time(from_lat: float, from_lng: float, to_lat: float, to_lng: float, 
                          departure_time: str, matrix_id: Optional[str] = None) -> tuple:
    """Calculate travel time and distance between two points."""
    distance, base_duration = get_matrix_distance_duration(
        f"{from_lat},{from_lng}", f"{to_lat},{to_lng}", matrix_id)
    
    if distance is None or base_duration is None:
        # Fallback to haversine
        distance = get_path_length_m(from_lat, from_lng, to_lat, to_lng)
        # Assume average speed 40 km/h
        base_duration = (distance / 1000) / 40 * 3600  # seconds
    
    # Apply hourly factor
    departure_hour = time_to_minutes(departure_time) // 60
    factor = get_hourly_factor(departure_hour, matrix_id)
    adjusted_duration = base_duration * factor
    
    return distance, adjusted_duration / 60  # distance in m, time in minutes


def find_service_center(brigade: Brigade, orders: List[Order]) -> Optional[Order]:
    """Find the nearest service center."""
    for order in orders:
        if order.point_type == PointType.SERVICE_CENTER:
            return order
    return None


def build_route_for_brigade(brigade: Brigade, available_orders: List[Order], 
                            matrix_id: Optional[str] = None) -> BrigadeRoute:
    """Build optimal route for a single brigade."""
    # Sort orders by priority (repeat calls first, then by deadline, then by time slot)
    sorted_orders = sorted(available_orders, key=lambda o: (
        -o.priority,
        o.deadline or "9999",
        o.time_slot.start if o.time_slot else "23:59"
    ))
    
    shift_start_min = time_to_minutes(brigade.shift.start)
    shift_end_min = time_to_minutes(brigade.shift.end)
    lunch_start_min = time_to_minutes(brigade.shift.lunch_start) if brigade.shift.lunch_start else None
    lunch_end_min = time_to_minutes(brigade.shift.lunch_end) if brigade.shift.lunch_end else None
    
    current_time = brigade.shift.start
    current_lat = brigade.start_lat
    current_lng = brigade.start_lng
    equipment = brigade.equipment.initial_count
    stops = []
    completed_orders = []
    missed_orders = []
    
    for order in sorted_orders:
        if order.id in brigade.current_orders:
            continue
        
        # Check if we have enough equipment
        if equipment < order.equipment_required:
            # Need to go to service center first
            sc = find_service_center(brigade, available_orders)
            if sc:
                # Travel to service center
                dist, travel_time = calculate_travel_time(
                    current_lat, current_lng, sc.lat, sc.lng, current_time, matrix_id)
                arrival = add_minutes(current_time, int(travel_time))
                
                # Refill equipment (assume full refill)
                equipment = brigade.equipment.initial_count
                
                stops.append(RouteStop(
                    order_id=None,
                    point_id=sc.id,
                    point_type=PointType.SERVICE_CENTER,
                    lat=sc.lat,
                    lng=sc.lng,
                    arrival_time=arrival,
                    departure_time=add_minutes(arrival, 10),  # 10 min for refill
                    service_time_minutes=10,
                    is_service_center=True,
                    equipment_before=equipment - order.equipment_required,
                    equipment_after=equipment,
                    travel_time_minutes=travel_time,
                    distance_m=dist
                ))
                
                current_time = add_minutes(arrival, 10)
                current_lat = sc.lat
                current_lng = sc.lng
        
        # Check if we can reach order within shift
        dist, travel_time = calculate_travel_time(
            current_lat, current_lng, order.lat, order.lng, current_time, matrix_id)
        arrival = add_minutes(current_time, int(travel_time))
        arrival_min = time_to_minutes(arrival)
        
        # Check lunch break
        if lunch_start_min and lunch_end_min:
            if lunch_start_min <= arrival_min < lunch_end_min:
                # Need to take lunch break first
                lunch_start = brigade.shift.lunch_start
                lunch_end = brigade.shift.lunch_end
                stops.append(RouteStop(
                    order_id=None,
                    point_id="LUNCH",
                    point_type=PointType.ABONENT,
                    lat=current_lat,
                    lng=current_lng,
                    arrival_time=lunch_start,
                    departure_time=lunch_end,
                    service_time_minutes=lunch_end_min - lunch_start_min,
                    is_lunch_break=True,
                    equipment_before=equipment,
                    equipment_after=equipment,
                    travel_time_minutes=0,
                    distance_m=0
                ))
                current_time = lunch_end
                arrival = add_minutes(current_time, int(travel_time))
                arrival_min = time_to_minutes(arrival)
        
        # Check if arrival is after shift end
        if arrival_min > shift_end_min:
            missed_orders.append(order.id)
            continue
        
        # Check time slot
        if order.time_slot and not is_within_slot(arrival, order.time_slot):
            # Try to wait until slot starts
            slot_start_min = time_to_minutes(order.time_slot.start)
            if arrival_min < slot_start_min:
                wait_time = slot_start_min - arrival_min
                arrival = order.time_slot.start
                arrival_min = slot_start_min
            else:
                missed_orders.append(order.id)
                continue
        
        departure = add_minutes(arrival, order.service_time_minutes)
        departure_min = time_to_minutes(departure)
        
        # Check if work extends beyond shift
        if departure_min > shift_end_min:
            missed_orders.append(order.id)
            continue
        
        # Check deadline
        if order.deadline:
            deadline_min = time_to_minutes(order.deadline.split("T")[-1][:5]) if "T" in order.deadline else time_to_minutes(order.deadline)
            if arrival_min > deadline_min:
                missed_orders.append(order.id)
                continue
        
        # All checks passed, add stop
        equipment -= order.equipment_required
        stops.append(RouteStop(
            order_id=order.id,
            point_id=order.point_id,
            point_type=order.point_type,
            lat=order.lat,
            lng=order.lng,
            arrival_time=arrival,
            departure_time=departure,
            service_time_minutes=order.service_time_minutes,
            equipment_before=equipment + order.equipment_required,
            equipment_after=equipment,
            travel_time_minutes=travel_time,
            distance_m=dist
        ))
        
        current_time = departure
        current_lat = order.lat
        current_lng = order.lng
        completed_orders.append(order.id)
    
    # Return to base (start point)
    return_to_base = True
    if stops:
        last_stop = stops[-1]
        dist, travel_time = calculate_travel_time(
            last_stop.lat, last_stop.lng, brigade.start_lat, brigade.start_lng, current_time, matrix_id)
        arrival = add_minutes(current_time, int(travel_time))
        stops.append(RouteStop(
            order_id=None,
            point_id=brigade.start_point_id,
            point_type=PointType.SERVICE_CENTER,
            lat=brigade.start_lat,
            lng=brigade.start_lng,
            arrival_time=arrival,
            departure_time=arrival,
            service_time_minutes=0,
            is_service_center=True,
            equipment_before=equipment,
            equipment_after=equipment,
            travel_time_minutes=travel_time,
            distance_m=dist
        ))
    
    total_distance = sum(s.distance_m for s in stops)
    total_time = sum(s.travel_time_minutes + s.service_time_minutes for s in stops)
    
    return BrigadeRoute(
        brigade_id=brigade.id,
        stops=stops,
        total_distance_m=total_distance,
        total_time_minutes=total_time,
        orders_completed=completed_orders,
        orders_missed=missed_orders,
        equipment_used=brigade.equipment.initial_count - equipment,
        return_to_base=return_to_base
    )


# ============================================================
# ROUTE PLANNING ENDPOINTS
# ============================================================

@router.post("/routes/plan", response_model=RoutePlanResponse)
async def plan_routes(request: RoutePlanRequest):
    """Plan optimal routes for brigades considering equipment, shifts, time slots, and deadlines."""
    all_orders = {o.id: o for o in request.orders}
    assigned_order_ids = set()
    routes = []
    
    for brigade in request.brigades:
        # Filter orders not yet assigned
        available = [o for o in request.orders if o.id not in assigned_order_ids]
        if not available:
            break
        
        route = build_route_for_brigade(brigade, available, request.matrix_id)
        routes.append(route)
        assigned_order_ids.update(route.orders_completed)
    
    unassigned = [o.id for o in request.orders if o.id not in assigned_order_ids]
    
    summary = {
        "total_brigades": len(request.brigades),
        "total_orders": len(request.orders),
        "assigned_orders": len(assigned_order_ids),
        "unassigned_orders": len(unassigned),
        "total_distance_km": sum(r.total_distance_m for r in routes) / 1000,
        "total_time_hours": sum(r.total_time_minutes for r in routes) / 60,
    }
    
    return RoutePlanResponse(
        routes=routes,
        unassigned_orders=unassigned,
        summary=summary
    )


@router.post("/routes/reroute", response_model=RerouteResponse)
async def reroute_brigade(request: RerouteRequest):
    """Reroute a brigade based on current position and new constraints."""
    # Merge remaining and new orders
    all_orders = request.remaining_orders + request.new_orders
    # Remove cancelled
    all_orders = [o for o in all_orders if o.id not in request.cancelled_orders]
    
    # Create a temporary brigade with current position and time
    current_time = request.current_position.get("current_time", "08:00")
    brigade = Brigade(
        id=request.brigade_id,
        start_point_id="CURRENT",
        start_lat=request.current_position["lat"],
        start_lng=request.current_position["lng"],
        shift=ShiftSchedule(
            start=current_time,
            end="23:59",  # Extended for reroute
            lunch_start=None,
            lunch_end=None
        ),
        equipment=EquipmentConfig(initial_count=0),  # Equipment tracked in route
        current_orders=[]
    )
    
    # Estimate current equipment from last stop
    if request.current_route.stops:
        last_stop = request.current_route.stops[-1]
        brigade.equipment.initial_count = last_stop.equipment_after
    
    new_route = build_route_for_brigade(brigade, all_orders)
    
    # Calculate changes
    old_order_ids = set(request.current_route.orders_completed)
    new_order_ids = set(new_route.orders_completed)
    added = new_order_ids - old_order_ids
    removed = old_order_ids - new_order_ids
    reordered = []
    
    changes = []
    for oid in added:
        changes.append({"type": "added", "order_id": oid})
    for oid in removed:
        changes.append({"type": "removed", "order_id": oid})
    
    return RerouteResponse(
        new_route=new_route,
        changes=changes
    )


# ============================================================
# STATIC FILES
# ============================================================

@router.get("/static/{path:path}")
async def static_files(path: str):
    """Serve static files from the map-module directory."""
    file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), path.lstrip("/"))
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="File not found")