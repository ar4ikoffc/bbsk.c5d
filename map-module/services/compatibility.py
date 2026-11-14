from typing import Dict, List
from schemas.request import StaffInput, OrderInput


def filter_compatibility(
    staff_list: List[StaffInput],
    orders: List[OrderInput]
) -> Dict[str, List[StaffInput]]:
    """
    Этап 1: Фильтрация совместимости по жестким допускам (H1)
    Valid(staff, order) <=>
      (order.profiles ∩ staff.profiles ≠ ∅) ∧
      (order.technology is None ∨ order.technology ∈ staff.technologies) ∧
      (order.requires_height => staff.height_permit)
    """
    compatibility: Dict[str, List[StaffInput]] = {}

    for order in orders:
        compatible_staff = []
        for staff in staff_list:
            # 1. Профиль квалификации (INSTALL vs 3ЛТП)
            if order.profiles:
                if not any(p in staff.profiles for p in order.profiles):
                    continue

            # 2. Технология подключения (PON, FTTB, XDSL, DOCSIS)
            if order.technology:
                if order.technology not in staff.technologies:
                    continue

            # 3. Допуск на высотные работы (частный сектор, ВЛС)
            if order.requires_height and not staff.height_permit:
                continue

            compatible_staff.append(staff)

        compatibility[order.order_id] = compatible_staff

    return compatibility
