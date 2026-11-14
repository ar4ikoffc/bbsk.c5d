from datetime import datetime, timezone
from schemas.request import StaffInput, OrderInput, ShiftInput, BreakWindowInput, SlotInput
from services.compatibility import filter_compatibility


def test_filter_compatibility():
    staff_install = StaffInput(
        staff_id="ST-01",
        service_center_id="SC-01",
        profiles=["INSTALL"],
        technologies=["PON", "FTTB"],
        height_permit=False,
        shift=ShiftInput(
            start="09:00",
            end="18:00",
            break_duration_min=60,
            break_window=BreakWindowInput(from_time="12:00", to_time="15:00")
        )
    )

    staff_ltp3_height = StaffInput(
        staff_id="ST-02",
        service_center_id="SC-01",
        profiles=["LTP3"],
        technologies=["PON", "FTTB"],
        height_permit=True,
        shift=ShiftInput(
            start="09:00",
            end="18:00",
            break_duration_min=60,
            break_window=BreakWindowInput(from_time="12:00", to_time="15:00")
        )
    )

    order_pon = OrderInput(
        order_id="ORD-01",
        building_id="B-01",
        work_type="INST_PON_MKD",
        profiles=["INSTALL"],
        technology="PON",
        requires_height=False,
        duration_min=90,
        slot=SlotInput(
            start=datetime(2026, 10, 26, 9, 0, tzinfo=timezone.utc),
            end=datetime(2026, 10, 26, 11, 0, tzinfo=timezone.utc)
        ),
        latest_start=datetime(2026, 10, 26, 11, 0, tzinfo=timezone.utc),
        deadline=datetime(2026, 10, 26, 18, 0, tzinfo=timezone.utc)
    )

    order_repair = OrderInput(
        order_id="ORD-02",
        building_id="B-02",
        work_type="REPAIR",
        profiles=["LTP3"],
        technology="PON",
        requires_height=False,
        duration_min=60,
        slot=SlotInput(
            start=datetime(2026, 10, 26, 9, 0, tzinfo=timezone.utc),
            end=datetime(2026, 10, 26, 11, 0, tzinfo=timezone.utc)
        ),
        latest_start=datetime(2026, 10, 26, 11, 0, tzinfo=timezone.utc),
        deadline=datetime(2026, 10, 26, 18, 0, tzinfo=timezone.utc)
    )

    order_height = OrderInput(
        order_id="ORD-03",
        building_id="B-03",
        work_type="INST_PRIVATE_VLS",
        profiles=["INSTALL"],
        technology="PON",
        requires_height=True,
        duration_min=180,
        slot=SlotInput(
            start=datetime(2026, 10, 26, 9, 0, tzinfo=timezone.utc),
            end=datetime(2026, 10, 26, 11, 0, tzinfo=timezone.utc)
        ),
        latest_start=datetime(2026, 10, 26, 11, 0, tzinfo=timezone.utc),
        deadline=datetime(2026, 10, 26, 18, 0, tzinfo=timezone.utc)
    )

    res = filter_compatibility([staff_install, staff_ltp3_height], [order_pon, order_repair, order_height])

    # order_pon should only match staff_install
    assert [s.staff_id for s in res["ORD-01"]] == ["ST-01"]
    # order_repair should only match staff_ltp3_height
    assert [s.staff_id for s in res["ORD-02"]] == ["ST-02"]
    # order_height requires INSTALL profile AND height permit -> neither has both!
    assert [s.staff_id for s in res["ORD-03"]] == []
