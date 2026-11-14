from datetime import datetime
from pydantic import BaseModel, Field


class StopOutput(BaseModel):
    seq: int
    type: str = Field(..., examples=["DEPOT_START", "VISIT", "BREAK", "RESTOCK", "DEPOT_END"])
    order_id: str | None = None
    building_id: str
    arrival: datetime
    start: datetime
    end: datetime
    travel_sec: int = 0
    equipment_after: dict[str, int] = Field(default_factory=dict)


class RouteOutput(BaseModel):
    staff_id: str
    stops: list[StopOutput]
    total_travel_sec: int
    total_work_min: int
    total_orders: int


class UnassignedOrderOutput(BaseModel):
    order_id: str
    reason: str = Field(..., examples=["NO_QUALIFIED_STAFF", "SHIFT_EXCEEDED", "SLOT_UNFEASIBLE", "CAPACITY_EXCEEDED"])


class SolverResponse(BaseModel):
    status: str = Field("SUCCESS", examples=["SUCCESS", "ERROR"])
    execution_time_ms: int
    routes: list[RouteOutput]
    unassigned_orders: list[UnassignedOrderOutput]
