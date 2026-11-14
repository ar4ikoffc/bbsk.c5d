from datetime import datetime, timezone, timedelta
from schemas.request import StaffInput, OrderInput, ShiftInput, BreakWindowInput, SlotInput, ServiceCenterInput
from services.timeline_manager import insert_break_and_restock


def test_timeline_manager_break_and_restock():
    base_date = datetime(2026, 10, 26, 8, 0, tzinfo=timezone.utc)

    sc = ServiceCenterInput(
        id="SC-01",
        building_id="B-SC",
        open_from="08:00",
        open_to="21:00",
        restock_duration_min=20
    )

    staff = StaffInput(
        staff_id="ST-01",
        service_center_id="SC-01",
        profiles=["INSTALL"],
        technologies=["PON"],
        height_permit=False,
        shift=ShiftInput(
            start="09:00",
            end="18:00",
            break_duration_min=60,
            break_window=BreakWindowInput(from_time="12:00", to_time="15:00")
        ),
        equipment_start={"ONT": 1, "ROUTER": 1, "STB": 1},
        equipment_capacity={"ONT": 5, "ROUTER": 5, "STB": 5}
    )

    # Order 1 needs 1 ONT (depletes start balance)
    o1 = OrderInput(
        order_id="ORD-1",
        building_id="B-01",
        work_type="INST_PON_MKD",
        profiles=["INSTALL"],
        technology="PON",
        duration_min=60,
        slot=SlotInput(
            start=datetime(2026, 10, 26, 9, 30, tzinfo=timezone.utc),
            end=datetime(2026, 10, 26, 11, 30, tzinfo=timezone.utc)
        ),
        latest_start=datetime(2026, 10, 26, 11, 30, tzinfo=timezone.utc),
        deadline=datetime(2026, 10, 26, 18, 0, tzinfo=timezone.utc),
        required_equipment={"ONT": 1, "ROUTER": 0, "STB": 0}
    )

    # Order 2 also needs 1 ONT -> should trigger RESTOCK at SC
    o2 = OrderInput(
        order_id="ORD-2",
        building_id="B-02",
        work_type="INST_PON_MKD",
        profiles=["INSTALL"],
        technology="PON",
        duration_min=60,
        slot=SlotInput(
            start=datetime(2026, 10, 26, 14, 0, tzinfo=timezone.utc),
            end=datetime(2026, 10, 26, 16, 0, tzinfo=timezone.utc)
        ),
        latest_start=datetime(2026, 10, 26, 16, 0, tzinfo=timezone.utc),
        deadline=datetime(2026, 10, 26, 18, 0, tzinfo=timezone.utc),
        required_equipment={"ONT": 1, "ROUTER": 0, "STB": 0}
    )

    stops, feasible = insert_break_and_restock(staff, [o1, o2], [sc], base_date)

    stop_types = [s.type for s in stops]

    assert "DEPOT_START" in stop_types
    assert "VISIT" in stop_types
    assert "RESTOCK" in stop_types
    assert "BREAK" in stop_types
    assert "DEPOT_END" in stop_types

    # Find the BREAK stop and verify duration is 60 minutes
    break_stop = next(s for s in stops if s.type == "BREAK")
    assert (break_stop.end - break_stop.start) == timedelta(minutes=60)
