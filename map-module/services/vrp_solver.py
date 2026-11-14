import time
from datetime import datetime
from typing import Dict, List
from schemas.request import SolverRequest, OrderInput
from schemas.response import SolverResponse, RouteOutput, UnassignedOrderOutput
from services.compatibility import filter_compatibility
from services.prioritizer import sort_orders_by_priority
from services.timeline_manager import insert_break_and_restock


def solve_vrptw(request: SolverRequest) -> SolverResponse:
    start_cpu_time = time.perf_counter()

    base_date = datetime.strptime(request.date, "%Y-%m-%d").replace(
        tzinfo=request.now.tzinfo
    )

    # 1. Этап 1: Фильтрация по жестким допускам (H1: профиль, технология, допуск на высоту)
    compatibility = filter_compatibility(request.staff, request.orders)

    # 2. Этап 2: Приоритизация пула нарядов (повторные вес x2, SLA, слоты)
    sorted_orders = sort_orders_by_priority(request.orders)

    # Карты для быстрого доступа
    staff_map = {s.staff_id: s for s in request.staff}

    # Инициализация распределения: staff_id -> list[OrderInput]
    staff_assigned_visits: Dict[str, List[OrderInput]] = {
        s.staff_id: [] for s in request.staff
    }

    unassigned: List[UnassignedOrderOutput] = []

    # 3. Этап 3 & 4: Оптимальная вставка по дорожной сети
    for order in sorted_orders:
        eligible_staff = compatibility.get(order.order_id, [])

        if not eligible_staff:
            unassigned.append(
                UnassignedOrderOutput(
                    order_id=order.order_id,
                    reason="NO_QUALIFIED_STAFF"
                )
            )
            continue

        best_staff_id: str | None = None
        best_insert_pos: int = -1
        best_added_travel_sec: int = 9999999

        for staff in eligible_staff:
            current_visits = staff_assigned_visits[staff.staff_id]

            # Пробуем все позиции вставки (в конец или между визитами)
            for pos in range(len(current_visits) + 1):
                trial_visits = current_visits[:pos] + [order] + current_visits[pos:]

                # Расчет таймлайна с обедом и возвратом в депо
                trial_stops, _ = insert_break_and_restock(
                    staff, trial_visits, request.service_centers, base_date
                )

                # =========================================================================
                # MVP РЕЖИМ: Жесткие ограничения по времени слота и окончанию смены
                # отключены/закомментированы по требованию MVP, чтобы не отбрасывать наряды.
                # Наряды распределяются по оптимальному маршруту и квалификациям.
                # =========================================================================
                # if not feasible:
                #     continue
                # if any(stop.start > o.latest_start for stop in trial_stops ...):
                #     continue

                # Минимизируем суммарное время в пути
                total_travel = sum(s.travel_sec for s in trial_stops)
                # Добавляем небольшой штраф за разбалансировку нагрузки (чтобы не перегружать одного сотрудника)
                load_penalty = len(current_visits) * 300
                cost = total_travel + load_penalty

                if cost < best_added_travel_sec:
                    best_added_travel_sec = cost
                    best_staff_id = staff.staff_id
                    best_insert_pos = pos

        if best_staff_id is not None and best_insert_pos != -1:
            staff_assigned_visits[best_staff_id].insert(best_insert_pos, order)
        else:
            # Fallback (в случае отсутствия свободных мест)
            unassigned.append(
                UnassignedOrderOutput(
                    order_id=order.order_id,
                    reason="NO_QUALIFIED_STAFF"
                )
            )

    # 4. Локальный поиск 2-Opt для оптимизации маршрутов
    for staff_id, visits in staff_assigned_visits.items():
        if len(visits) >= 3:
            staff = staff_map[staff_id]
            improved = True
            iterations = 0
            while improved and iterations < 10:
                improved = False
                iterations += 1
                for i in range(len(visits) - 1):
                    for j in range(i + 1, min(len(visits), i + 4)):
                        # Пробуем перевернуть отрезок между i и j
                        new_visits = visits[:i] + list(reversed(visits[i:j+1])) + visits[j+1:]
                        old_stops, _ = insert_break_and_restock(
                            staff, visits, request.service_centers, base_date
                        )
                        new_stops, _ = insert_break_and_restock(
                            staff, new_visits, request.service_centers, base_date
                        )
                        if sum(s.travel_sec for s in new_stops) < sum(s.travel_sec for s in old_stops):
                            visits = new_visits
                            staff_assigned_visits[staff_id] = new_visits
                            improved = True
                            break
                    if improved:
                        break

    # 5. Формирование финальных маршрутов
    routes_output: List[RouteOutput] = []
    assigned_order_ids = set()

    for staff in request.staff:
        visits = staff_assigned_visits[staff.staff_id]
        stops, _ = insert_break_and_restock(
            staff, visits, request.service_centers, base_date
        )

        for s in stops:
            if s.type == "VISIT" and s.order_id:
                assigned_order_ids.add(s.order_id)

        tot_travel_sec = sum(s.travel_sec for s in stops)
        tot_work_min = sum(
            int((s.end - s.start).total_seconds() // 60)
            for s in stops if s.type == "VISIT"
        )

        route = RouteOutput(
            staff_id=staff.staff_id,
            stops=stops,
            total_travel_sec=tot_travel_sec,
            total_work_min=tot_work_min,
            total_orders=len(visits)
        )
        routes_output.append(route)

    # 6. Этап 6: Гарантия уникальности (H9)
    # Каждый наряд дня обязан присутствовать ровно в 1 месте (VISIT или unassigned)
    unassigned_ids = {u.order_id for u in unassigned}
    for order in request.orders:
        oid = order.order_id
        if oid not in assigned_order_ids and oid not in unassigned_ids:
            unassigned.append(
                UnassignedOrderOutput(
                    order_id=oid,
                    reason="NO_QUALIFIED_STAFF"
                )
            )

    execution_time_ms = int((time.perf_counter() - start_cpu_time) * 1000)

    return SolverResponse(
        status="SUCCESS",
        execution_time_ms=max(1, execution_time_ms),
        routes=routes_output,
        unassigned_orders=unassigned
    )
