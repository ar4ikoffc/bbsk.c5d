from typing import List
from schemas.request import OrderInput

# Приоритет типов работ по SLA: чем меньше число, тем выше приоритет
WORK_TYPE_SLA_RANK = {
    "REPAIR": 1,
    "DEGRADATION": 2,
    "SURVEY_PRIVATE": 3,
    "ADD_SERVICE": 4,
    "INST_PON_MKD": 5,
    "INST_FTTB_MKD": 6,
    "INST_PRIVATE_VLS": 7,
    "DISMANTLE": 8,
}


def sort_orders_by_priority(orders: List[OrderInput]) -> List[OrderInput]:
    """
    Этап 2: Приоритизация пула нарядов
    1. Повторные обращения (is_repeat = True) — наивысший приоритет (вес x2, REPAIR <= 12ч)
    2. Тип работ и SLA: REPAIR -> DEGRADATION -> SURVEY -> INSTALL -> DISMANTLE
    3. Время начала клиентского слота (slot.start)
    4. Крайний срок начала (latest_start)
    """
    return sorted(
        orders,
        key=lambda o: (
            0 if o.is_repeat else 1,
            WORK_TYPE_SLA_RANK.get(o.work_type, 10),
            o.slot.start,
            o.latest_start,
            o.deadline,
        )
    )
