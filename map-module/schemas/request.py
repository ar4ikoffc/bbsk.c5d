from datetime import datetime
from pydantic import BaseModel, Field


class SlotInput(BaseModel):
    start: datetime
    end: datetime


class BreakWindowInput(BaseModel):
    from_time: str = Field(alias="from", examples=["12:00"])
    to_time: str = Field(alias="to", examples=["15:00"])

    class Config:
        populate_by_name = True


class ShiftInput(BaseModel):
    start: str = Field(..., examples=["09:00"])
    end: str = Field(..., examples=["18:00"])
    break_duration_min: int = Field(60, examples=[60])
    break_window: BreakWindowInput


class FrozenStopInput(BaseModel):
    seq: int
    type: str = Field(..., examples=["DEPOT_START", "VISIT", "BREAK", "RESTOCK", "DEPOT_END"])
    order_id: str | None = None
    building_id: str
    arrival: datetime
    start: datetime
    end: datetime
    travel_sec: int = 0
    equipment_after: dict[str, int] = Field(default_factory=dict)


class ServiceCenterInput(BaseModel):
    id: str = Field(..., examples=["SC-01"])
    building_id: str = Field(..., examples=["B-00001"])
    open_from: str = Field("08:00", examples=["08:00"])
    open_to: str = Field("21:00", examples=["21:00"])
    restock_duration_min: int = Field(20, examples=[20])


class StaffInput(BaseModel):
    staff_id: str = Field(..., examples=["ST-001"])
    service_center_id: str = Field(..., examples=["SC-01"])
    profiles: list[str] = Field(..., examples=[["INSTALL"]])
    technologies: list[str] = Field(..., examples=[["PON", "FTTB"]])
    height_permit: bool = Field(False, examples=[True])
    shift: ShiftInput
    equipment_start: dict[str, int] = Field(default_factory=dict, examples=[{"ONT": 3, "ROUTER": 4, "STB": 2}])
    equipment_capacity: dict[str, int] = Field(default_factory=dict, examples=[{"ONT": 6, "ROUTER": 6, "STB": 4}])
    frozen_stops: list[FrozenStopInput] = Field(default_factory=list)


class OrderInput(BaseModel):
    order_id: str = Field(..., examples=["ORD-20261026-0001"])
    building_id: str = Field(..., examples=["B-00412"])
    work_type: str = Field(..., examples=["INST_PON_MKD"])
    profiles: list[str] = Field(default_factory=list, examples=[["INSTALL"]])
    technology: str | None = Field(None, examples=["PON"])
    requires_height: bool = Field(False, examples=[False])
    duration_min: int = Field(60, examples=[90])
    slot: SlotInput
    latest_start: datetime
    deadline: datetime
    required_equipment: dict[str, int] = Field(default_factory=dict, examples=[{"ONT": 1, "ROUTER": 1, "STB": 0}])
    is_repeat: bool = Field(False, examples=[False])


class SolverRequest(BaseModel):
    date: str = Field(..., examples=["2026-10-26"])
    now: datetime
    service_centers: list[ServiceCenterInput]
    staff: list[StaffInput]
    orders: list[OrderInput]
