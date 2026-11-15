import json
import urllib.request
import urllib.error
import time

BASE_URL = "http://localhost:8080"

def send(method, path, data=None):
    url = f"{BASE_URL}{path}"
    req_headers = {"Content-Type": "application/json"}
    encoded = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=encoded, headers=req_headers, method=method)
    
    t0 = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            elapsed = round((time.perf_counter() - t0) * 1000, 1)
            parsed = json.loads(body) if body else {}
            return resp.status, parsed, elapsed
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        elapsed = round((time.perf_counter() - t0) * 1000, 1)
        parsed = json.loads(body) if body else {}
        return e.code, parsed, elapsed
    except Exception as e:
        print(f"❌ Ошибка подключения к {url}: {e}")
        return 0, {}, 0

def seed():
    print("==================================================")
    print("🚀 НАПОЛНЕНИЕ БАЗЫ ДАННЫХ BBSK ТЕСТОВЫМИ ДАННЫМИ")
    print(f"🌐 Сервер: {BASE_URL}")
    print("==================================================\n")

    # 1. Проверка доступности
    code, resp, ms = send("GET", "/api/v1/health")
    if code != 200:
        print(f"❌ Бэкенд недоступен на {BASE_URL} (HTTP {code}). Убедитесь, что контейнеры запущены.")
        return
    print(f"✅ 1/4 Бэкенд готов (Health: OK, {ms} мс)")

    # 2. Пакетная загрузка справочников (Bulk Reference)
    ref_payload = {
        "service_centers": [
            {
                "service_center_id": "SC-01",
                "name": "СЦ «Север» (Базовое депо №1)",
                "address": "г. Екатеринбург, ул. Победы, 30",
                "lat": 56.8941,
                "lon": 60.6105,
                "opening_hours": {"open": "08:00", "close": "21:00"},
                "restock_duration_min": 15
            },
            {
                "service_center_id": "SC-02",
                "name": "СЦ «Юг» (Базовое депо №2)",
                "address": "г. Екатеринбург, ул. 8 Марта, 150",
                "lat": 56.8123,
                "lon": 60.6012,
                "opening_hours": {"open": "08:00", "close": "20:00"},
                "restock_duration_min": 15
            }
        ],
        "staff": [
            {
                "staff_id": "TECH-01",
                "name": "Иванов Иван Иванович",
                "service_center_id": "SC-01",
                "shift": {
                    "start": "08:00",
                    "end": "20:00",
                    "break_duration_min": 60,
                    "break_window": {"from": "12:00", "to": "15:00"}
                },
                "profiles": ["INSTALL"],
                "technologies": ["PON", "FTTB"],
                "equipment_start": {"ONT": 4, "ROUTER": 2, "STB": 2},
                "equipment_capacity": {"ONT": 6, "ROUTER": 4, "STB": 4},
                "height_permit": False,
                "experience_years": 3.5
            },
            {
                "staff_id": "TECH-02",
                "name": "Петров Петр Сергеевич",
                "service_center_id": "SC-01",
                "shift": {
                    "start": "09:00",
                    "end": "18:00",
                    "break_duration_min": 60,
                    "break_window": {"from": "13:00", "to": "15:00"}
                },
                "profiles": ["LTP3"],
                "technologies": ["PON"],
                "equipment_start": {"ONT": 2, "ROUTER": 2, "STB": 1},
                "equipment_capacity": {"ONT": 4, "ROUTER": 4, "STB": 2},
                "height_permit": True,
                "experience_years": 5.0
            },
            {
                "staff_id": "TECH-03",
                "name": "Сидоров Алексей Михайлович",
                "service_center_id": "SC-02",
                "shift": {
                    "start": "08:00",
                    "end": "20:00",
                    "break_duration_min": 60,
                    "break_window": {"from": "12:00", "to": "14:00"}
                },
                "profiles": ["INSTALL", "LTP3"],
                "technologies": ["FTTB"],
                "equipment_start": {"ONT": 3, "ROUTER": 3, "STB": 2},
                "equipment_capacity": {"ONT": 5, "ROUTER": 5, "STB": 3},
                "height_permit": True,
                "experience_years": 4.0
            }
        ],
        "access_nodes": [
            {
                "access_node_id": "AN-001",
                "node_type": "OLT",
                "technology": "PON",
                "name": "OLT Орджоникидзевский-1",
                "address": "ул. Победы, 32",
                "lat": 56.8950,
                "lon": 60.6110,
                "buildings": [
                    {
                        "building_id": "B-001",
                        "address": "ул. Победы, 34",
                        "lat": 56.8960,
                        "lon": 60.6120,
                        "building_type": "MKD",
                        "overhead_line": False,
                        "zone_service_center_id": "SC-01"
                    },
                    {
                        "building_id": "B-002",
                        "address": "ул. Победы, 36",
                        "lat": 56.8970,
                        "lon": 60.6130,
                        "building_type": "MKD",
                        "overhead_line": False,
                        "zone_service_center_id": "SC-01"
                    }
                ]
            },
            {
                "access_node_id": "AN-002",
                "node_type": "SWITCH",
                "technology": "FTTB",
                "name": "SWITCH Чкаловский-1",
                "address": "ул. 8 Марта, 152",
                "lat": 56.8130,
                "lon": 60.6020,
                "buildings": [
                    {
                        "building_id": "B-003",
                        "address": "ул. 8 Марта, 154",
                        "lat": 56.8140,
                        "lon": 60.6030,
                        "building_type": "MKD",
                        "overhead_line": False,
                        "zone_service_center_id": "SC-02"
                    },
                    {
                        "building_id": "B-004",
                        "address": "ул. Авиационная, 10",
                        "lat": 56.8150,
                        "lon": 60.6040,
                        "building_type": "PRIVATE",
                        "overhead_line": True,
                        "zone_service_center_id": "SC-02"
                    }
                ]
            }
        ],
        "work_types": [
            {
                "code": "INST_PON_MKD",
                "name": "Инсталляция ШПД/IPTV, МКД, PON",
                "duration_min": 90,
                "max_start_delay_min": 10,
                "deadline_kind": "WORKING_DAYS",
                "deadline_value": 3,
                "pgp_relevant": False,
                "profiles": ["INSTALL"]
            },
            {
                "code": "INST_FTTB_MKD",
                "name": "Инсталляция ШПД/IPTV, МКД, FTTB",
                "duration_min": 60,
                "max_start_delay_min": 10,
                "deadline_kind": "WORKING_DAYS",
                "deadline_value": 3,
                "pgp_relevant": False,
                "profiles": ["INSTALL"]
            },
            {
                "code": "INST_PRIVATE_VLS",
                "name": "Инсталляция, частный сектор, с ВЛС",
                "duration_min": 180,
                "max_start_delay_min": 10,
                "deadline_kind": "WORKING_DAYS",
                "deadline_value": 5,
                "pgp_relevant": False,
                "profiles": ["INSTALL"]
            },
            {
                "code": "ADD_SERVICE",
                "name": "Доподключение услуги (IPTV, Wi-Fi-роутер)",
                "duration_min": 40,
                "deadline_kind": "SLOT",
                "pgp_relevant": False,
                "profiles": ["INSTALL"]
            },
            {
                "code": "SURVEY_PRIVATE",
                "name": "Обследование (частный сектор)",
                "duration_min": 45,
                "deadline_kind": "WORKING_DAYS",
                "deadline_value": 2,
                "pgp_relevant": False,
                "profiles": ["INSTALL", "LTP3"]
            },
            {
                "code": "REPAIR",
                "name": "Устранение неисправности (обращение абонента)",
                "duration_min": 60,
                "deadline_kind": "HOURS",
                "deadline_value": 24,
                "repeat_deadline_value": 12,
                "pgp_relevant": True,
                "profiles": ["LTP3"]
            },
            {
                "code": "DEGRADATION",
                "name": "Устранение деградации",
                "duration_min": 45,
                "deadline_kind": "HOURS",
                "deadline_value": 48,
                "pgp_relevant": True,
                "profiles": ["LTP3"]
            }
        ]
    }
    code, resp, ms = send("PUT", "/api/v1/reference", ref_payload)
    if code == 200:
        counts = resp.get("counts", {})
        print(f"✅ 2/4 Справочники успешно загружены ({ms} мс):")
        print(f"   • Сервисные центры (депо): {counts.get('service_centers')}")
        print(f"   • Узлы доступа связи: {counts.get('access_nodes')}")
        print(f"   • Обслуживаемые здания: {counts.get('buildings')}")
        print(f"   • Выездные сотрудники: {counts.get('staff')}")
        print(f"   • Нормативы типов работ: {counts.get('work_types')}")
    else:
        print(f"❌ Ошибка загрузки справочников (HTTP {code}): {resp}")
        return

    # 3. Матрица перемещений (Travel Matrix)
    points = ["SC-01", "SC-02", "B-001", "B-002", "B-003", "B-004"]
    durations = [
        [0, 1800, 300, 450, 1900, 2000],
        [1800, 0, 1900, 1950, 300, 400],
        [300, 1900, 0, 200, 1920, 2010],
        [450, 1950, 200, 0, 1980, 2050],
        [1900, 300, 1920, 1980, 0, 250],
        [2000, 400, 2010, 2050, 250, 0]
    ]
    distances = [
        [0, 12000, 1500, 2200, 12500, 13000],
        [12000, 0, 12500, 12800, 1400, 2000],
        [1500, 12500, 0, 800, 12600, 13100],
        [2200, 12800, 800, 0, 12900, 13400],
        [12500, 1400, 12600, 12900, 0, 1100],
        [13000, 2000, 13100, 13400, 1100, 0]
    ]
    matrix_payload = {
        "matrix_id": "ekb-matrix-2026-v1",
        "points": points,
        "durations_sec": durations,
        "distances_m": distances
    }
    code, resp, ms = send("PUT", "/api/v1/reference/travel-matrix", matrix_payload)
    if code == 200:
        print(f"✅ 3/4 Матрица перемещений загружена ({len(points)} точек, {ms} мс)")
    else:
        print(f"❌ Ошибка загрузки матрицы перемещений (HTTP {code}): {resp}")
        return

    # 4. Инициализация рабочего дня и нарядов (Day & Orders)
    target_date = "2026-10-26"
    day_payload = {
        "date": target_date,
        "now": f"{target_date}T08:00:00+05:00",
        "orders": [
            {
                "order_id": "ORD-20261026-0001",
                "building_id": "B-001",
                "work_type": "INST_PON_MKD",
                "registered_at": "2026-10-25T14:30:00+05:00",
                "slot": {
                    "start": f"{target_date}T09:00:00+05:00",
                    "end": f"{target_date}T11:00:00+05:00"
                },
                "required_equipment": {"ONT": 1, "ROUTER": 1, "STB": 0},
                "is_repeat": False
            },
            {
                "order_id": "ORD-20261026-0002",
                "building_id": "B-002",
                "work_type": "INST_PON_MKD",
                "registered_at": "2026-10-25T15:00:00+05:00",
                "slot": {
                    "start": f"{target_date}T11:30:00+05:00",
                    "end": f"{target_date}T13:30:00+05:00"
                },
                "required_equipment": {"ONT": 1, "ROUTER": 1, "STB": 1},
                "is_repeat": False
            },
            {
                "order_id": "ORD-20261026-0003",
                "building_id": "B-001",
                "work_type": "REPAIR",
                "registered_at": "2026-10-26T07:15:00+05:00",
                "slot": {
                    "start": f"{target_date}T10:00:00+05:00",
                    "end": f"{target_date}T12:00:00+05:00"
                },
                "required_equipment": {"ONT": 0, "ROUTER": 1, "STB": 0},
                "is_repeat": True
            }
        ],
        "absent_staff": ["TECH-03"]
    }
    code, resp, ms = send("PUT", f"/api/v1/days/{target_date}", day_payload)
    if code == 200:
        print(f"✅ 4/4 Рабочий день {target_date} успешно создан ({ms} мс):")
        print(f"   • Загружено нарядов: {resp.get('orders_count')}")
        print(f"   • Отсутствующие сотрудники: {resp.get('absent_staff_codes')}")
    else:
        print(f"❌ Ошибка создания дня (HTTP {code}): {resp}")
        return

    # 5. Расчет плана маршрутов солвером
    print("\n⏳ Запуск математической оптимизации маршрутов (VRPTW Solver)...")
    code, plan_resp, ms = send("POST", f"/api/v1/days/{target_date}/plan")
    if code == 200:
        routes = plan_resp.get("routes", [])
        metrics = plan_resp.get("metrics", {})
        print(f"🎉 ПЛАН УСПЕШНО СФОРМИРОВАН ({ms} мс)!")
        print(f"   • Активных маршрутов: {metrics.get('active_routes')}")
        print(f"   • Распределено нарядов: {metrics.get('assigned_orders')}")
        print(f"   • Нераспределенных: {metrics.get('unassigned_orders')}")
        print(f"   • Суммарное время в пути: {metrics.get('total_travel_sec')} сек.")
        for r in routes:
            print(f"     Маршрут [{r.get('staff_code')} - {r.get('staff_name')}]: остановок: {len(r.get('stops', []))}, нарядов: {r.get('total_orders')}")
    else:
        print(f"⚠️ Солвер вернул HTTP {code}: {plan_resp}")

    print("\n==================================================")
    print("✨ База данных полностью заполнена тестовыми данными!")
    print("   Теперь вы можете открыть DBCode и просматривать таблицы в схеме 'app'.")
    print("==================================================")

if __name__ == "__main__":
    seed()
