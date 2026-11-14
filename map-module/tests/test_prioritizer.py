from datetime import datetime, timezone
from schemas.request import OrderInput, SlotInput
from services.prioritizer import sort_orders_by_priority


def test_sort_orders_by_priority():
    base_time = datetime(2026, 10, 26, 9, 0, tzinfo=timezone.utc)

    o_install = OrderInput(
        order_id="O_INSTALL",
        building_id="B-1",
        work_type="INST_PON_MKD",
        duration_min=90,
        slot=SlotInput(start=base_time, end=base_time),
        latest_start=base_time,
        deadline=base_time,
        is_repeat=False
    )

    o_repair = OrderInput(
        order_id="O_REPAIR",
        building_id="B-2",
        work_type="REPAIR",
        duration_min=60,
        slot=SlotInput(start=base_time, end=base_time),
        latest_start=base_time,
        deadline=base_time,
        is_repeat=False
    )

    o_repeat = OrderInput(
        order_id="O_REPEAT",
        building_id="B-3",
        work_type="INST_PON_MKD",
        duration_min=90,
        slot=SlotInput(start=base_time, end=base_time),
        latest_start=base_time,
        deadline=base_time,
        is_repeat=True
    )

    sorted_res = sort_orders_by_priority([o_install, o_repair, o_repeat])
    order_ids = [o.order_id for o in sorted_res]

    # Repeat is #1, then REPAIR over INSTALL
    assert order_ids == ["O_REPEAT", "O_REPAIR", "O_INSTALL"]
