from schemas.request import SolverRequest
from api.routers.optimize import optimize_routes, health_check


def test_health():
    res = health_check()
    assert res == {"status": "ok", "service": "python-solver"}


def test_optimize_routes():
    payload = {
        "date": "2026-10-26",
        "now": "2026-10-26T08:00:00+05:00",
        "service_centers": [
            {
                "id": "SC-01",
                "building_id": "B-SC",
                "open_from": "08:00",
                "open_to": "21:00",
                "restock_duration_min": 20
            }
        ],
        "staff": [
            {
                "staff_id": "ST-01",
                "service_center_id": "SC-01",
                "profiles": ["INSTALL"],
                "technologies": ["PON", "FTTB"],
                "height_permit": True,
                "shift": {
                    "start": "09:00",
                    "end": "18:00",
                    "break_duration_min": 60,
                    "break_window": {"from": "12:00", "to": "15:00"}
                },
                "equipment_start": {"ONT": 3, "ROUTER": 4, "STB": 2},
                "equipment_capacity": {"ONT": 6, "ROUTER": 6, "STB": 4},
                "frozen_stops": []
            }
        ],
        "orders": [
            {
                "order_id": "ORD-001",
                "building_id": "B-00412",
                "work_type": "INST_PON_MKD",
                "profiles": ["INSTALL"],
                "technology": "PON",
                "requires_height": False,
                "duration_min": 90,
                "slot": {
                    "start": "2026-10-26T09:00:00+05:00",
                    "end": "2026-10-26T11:00:00+05:00"
                },
                "latest_start": "2026-10-26T11:00:00+05:00",
                "deadline": "2026-10-26T18:00:00+05:00",
                "required_equipment": {"ONT": 1, "ROUTER": 1, "STB": 0},
                "is_repeat": False
            }
        ]
    }

    req = SolverRequest.model_validate(payload)
    res = optimize_routes(req)

    assert res.status == "SUCCESS"
    assert len(res.routes) == 1
    route = res.routes[0]
    assert route.staff_id == "ST-01"
    assert route.total_orders == 1
    assert len(res.unassigned_orders) == 0
