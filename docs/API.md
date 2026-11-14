# BBSK API — Документация REST API

> Сервис оперативного планирования и управления выездными бригадами (Кейс №05 «Ростелеком»).  
> Базовый путь: `/api/v1`, порт по умолчанию: `8080`.  
> Интерактивный просмотр без запуска сервера: откройте файл **[index.html](index.html)** в любом браузере или загрузите **[openapi.yaml](openapi.yaml)** в [Swagger Editor](https://editor.swagger.io).

---

## Содержание

1. [Служебные методы](#1-служебные-методы)
2. [Аутентификация и безопасность](#2-аутентификация-и-безопасность)
3. [Сотрудники и смены (Staff & Shifts)](#3-сотрудники-и-смены-staff--shifts)
4. [Инфраструктура и здания (Buildings, Access Nodes, Service Centers)](#4-инфраструктура-и-здания)
5. [Типы работ (Work Types)](#5-типы-работ-work-types)
6. [Пакетная инициализация справочников (Bulk Reference & Travel Matrix)](#6-пакетная-инициализация-справочников)
7. [Наряды на работы (Orders)](#7-наряды-на-работы-orders)
8. [Рабочие дни (Days)](#8-рабочие-дни-days)
9. [План смены и маршруты (Plan)](#9-план-смены-и-маршруты-plan)
10. [События смены и перепланирование (Events)](#10-события-смены-и-перепланирование-events)
11. [Python Solver (Headless VRPTW)](#11-python-solver-headless-vrptw)

---

## 1. Служебные методы

### `GET /api/v1/health`
Проверка готовности сервиса (опрашивается оркестратором кейса до 120 с после старта).

* **Ответ `200 OK`**:
```json
{
  "status": "ok",
  "team": "BBSK",
  "version": "1.0.0"
}
```

---

## 2. Аутентификация и безопасность

Аутентификация построена на базе JWT токенов (алгоритм HS256). Токен передаётся в защищённой `HttpOnly` cookie с именем `access_token` на 24 часа. UUID пользователя зашит внутри токена и не раскрывается на клиенте.

* **`POST /api/auth/register`** — регистрация пользователя (`username`, `password`, `role`).
* **`POST /api/auth/login`** — вход в систему (возвращает данные пользователя и выставляет cookie `access_token`).
* **`POST /api/auth/logout`** — выход (очистка cookie).
* **`GET /api/auth/me`** — проверка текущей сессии.

---

## 3. Сотрудники и смены (Staff & Shifts)

Эндпоинты управления персоналом выездных инженеров и рабочими сменами (`/api/v1/staff`).

### Эндпоинты сотрудников (`/api/v1/staff`)
* **`GET /api/v1/staff`** — список всех сотрудников с фильтрацией по профилю (`INSTALL`, `LTP3`), технологии, СЦ.
* **`GET /api/v1/staff/{id}`** — сотрудник по UUID.
* **`POST /api/v1/staff`** — создание нового сотрудника (проверка существования СЦ и смены по UUID, уникальность кода).
* **`PUT /api/v1/staff/{id}`** — частичное обновление параметров сотрудника.
* **`DELETE /api/v1/staff/{id}`** — удаление сотрудника.

### Эндпоинты смен (`/api/v1/staff/shifts`)
* **`GET /api/v1/staff/shifts`** — список всех графиков смен.
* **`GET /api/v1/staff/shifts/{id}`** — смене по UUID.
* **`POST /api/v1/staff/shifts`** — создание нового графика смены (`start_time`, `end_time`, `break_window_from`, `break_window_to`, `break_duration_min`).
* **`DELETE /api/v1/staff/shifts/{id}`** — удаление смены (с проверкой: если смена привязана к сотрудникам, возвращается `409 Conflict`).

---

## 4. Инфраструктура и здания

Контроллер объединяет все объекты адресной программы и сетевой топологии (`/api/v1/buildings`).

### Здания (Buildings)
* **`GET /api/v1/buildings`** — список зданий с фильтрами `building_type` (`MKD`/`PRIVATE`), `access_node_id`, `service_center_id`.
* **`GET /api/v1/buildings/{id}`** — здание по UUID.
* **`POST /api/v1/buildings`** — создание здания (привязка к узлу доступа и СЦ зоны).
* **`PUT /api/v1/buildings/{id}`** — обновление здания по UUID.
* **`DELETE /api/v1/buildings/{id}`** — удаление здания по UUID.

### Узлы доступа связи (Access Nodes)
* **`GET /api/v1/buildings/access-nodes`** — список узлов доступа (фильтр по `technology`: `PON`, `FTTB`, `XDSL`, `DOCSIS`).
* **`GET /api/v1/buildings/access-nodes/{id}`** — узел доступа по UUID.
* **`POST /api/v1/buildings/access-nodes`** — создание узла (`OLT`, `SWITCH`, `DSLAM`, `CMTS`).
* **`PUT /api/v1/buildings/access-nodes/{id}`** — обновление параметров узла.
* **`DELETE /api/v1/buildings/access-nodes/{id}`** — удаление узла (с проверкой: если к узлу привязаны здания, возвращается `409 Conflict`).

### Сервисные центры (Service Centers)
* **`GET /api/v1/buildings/service-centers`** — список СЦ (базовых депо).
* **`GET /api/v1/buildings/service-centers/{id}`** — СЦ по UUID.
* **`POST /api/v1/buildings/service-centers`** — создание СЦ (`openTime`, `closeTime`, `restockDurationMin`).
* **`PUT /api/v1/buildings/service-centers/{id}`** — обновление параметров СЦ.
* **`DELETE /api/v1/buildings/service-centers/{id}`** — удаление СЦ (с проверкой: если к СЦ привязаны сотрудники, возвращается `409 Conflict`).

---

## 5. Типы работ (Work Types)

Справочник нормативных работ со сроками выполнения и требуемыми квалификациями (`/api/v1/work-types`). В БД предзаполнены все 8 типов работ миграцией `V2__seed_work_types.sql`.

* **`GET /api/v1/work-types`** — список типов работ со всеми параметрами.
* **`GET /api/v1/work-types/{id}`** — тип работ по UUID.
* **`POST /api/v1/work-types`** — создание нового типа работ.
* **`PUT /api/v1/work-types/{id}`** — обновление типа работ.
* **`DELETE /api/v1/work-types/{id}`** — удаление типа работ.

---

## 6. Пакетная инициализация справочников

Методы для быстрого развёртывания тестовых прогонов и бенчмарков оркестратора (`/api/v1/reference`).

### `PUT /api/v1/reference`
Полная инициализация справочников. Удаляет все предыдущие дни, планы и события, загружает в транзакции:
1. Сервисные центры
2. Узлы доступа
3. Дома (с автоматической дедупликацией)
4. Типы работ
5. Графики смен и сотрудников

* **Ответ `200 OK`**:
```json
{
  "status": "loaded",
  "counts": {
    "service_centers": 5,
    "staff": 40,
    "access_nodes": 142,
    "buildings": 1260,
    "work_types": 8
  }
}
```

### `PUT /api/v1/reference/travel-matrix`
Загрузка матрицы времени в пути (`durations_sec`) и расстояний (`distances_m`) между всеми точками (1265 точек).

* **Ответ `200 OK`**:
```json
{
  "status": "loaded",
  "counts": {
    "points": 1265
  }
}
```

---

## 7. Наряды на работы (Orders)

Базовый путь: `/api/v1/orders`.  
Управление нарядами на выездные работы: создание, фильтрация, детальный просмотр, обновление параметров и статусов, удаление (CRUD).

### `GET /api/v1/orders`
Получение списка нарядов с поддержкой фильтрации.
* **Query-параметры**:
  * `day_id: UUID` (опционально) — фильтр по ID рабочего дня
  * `date: LocalDate` (опционально, `YYYY-MM-DD`) — фильтр по дате дня (например, `2026-10-26`)
  * `status: OrderStatus` (опционально) — `PENDING`, `ASSIGNED`, `COMPLETED`, `CANCELLED`, `UNASSIGNED`
  * `building_id: UUID` (опционально) — фильтр по зданию
  * `work_type_id: UUID` (опционально) — фильтр по типу работ
* **Ответ `200 OK`**: список объектов `WorkOrderResponse`.

### `GET /api/v1/orders/{id}`
Получение детальной информации о наряде по его первичному ключу `id: UUID`.
* **Ответ `200 OK`**: `WorkOrderResponse`.
* **Ответ `404 Not Found`**: если наряд не найден.

### `POST /api/v1/orders`
Создание нового наряда.
* **Тело запроса (`CreateWorkOrderRequest`)**:
```json
{
  "order_id": "ORD-20261026-0001",
  "day_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "work_type_id": "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f",
  "building_id": "4ba85f64-5717-4562-b3fc-2c963f66afa7",
  "registered_at": "2026-10-25T14:30:00+05:00",
  "slot": {
    "start": "2026-10-26T09:00:00+05:00",
    "end": "2026-10-26T11:00:00+05:00"
  },
  "required_equipment": {
    "ONT": 0,
    "ROUTER": 1,
    "STB": 0
  },
  "is_repeat": false
}
```
* **Особенности валидации и авторасчёта**:
  * Если `access_node_id` не передан — наследуется от узла доступа здания.
  * Если `service_center_id` не передан — наследуется от зоны обслуживания здания.
  * Если `latest_start` не передан — автоматически рассчитывается как `min(slot_end, slot_start + workType.max_start_delay)`.
  * Если `deadline` не передан — автоматически вычисляется по нормативу типа работ.
  * Если передан `day_date` вместо `day_id` — день будет найден или автоматически создан.
* **Ответ `201 Created`**: созданный `WorkOrderResponse`.
* **Ответ `409 Conflict`**: если наряд с таким `order_id` уже существует.

### `PUT /api/v1/orders/{id}`
Частичное или полное обновление наряда (статус, адрес/здание, тип работ, слот, оборудование).
* **Ответ `200 OK`**: обновленный `WorkOrderResponse`.

### `DELETE /api/v1/orders/{id}`
Удаление наряда из базы данных.
* **Ответ `204 No Content`**.

---

## 8. Рабочие дни (Days)

Базовый путь: `/api/v1/days`.  
Управление контекстом смены: пакетная инициализация нарядов, отсутствующих сотрудников и получение статуса дня.

### `PUT /api/v1/days/{date}`
Пакетная инициализация или полная перезапись дня. Очищает предыдущие маршруты, алерты и наряды этого дня. Автоматически рассчитывает крайние сроки и слоты, если они не заданы явно.

* **Тело запроса (`DayInputDto`)**:
```json
{
  "date": "2026-10-26",
  "now": "2026-10-26T08:00:00+05:00",
  "orders": [
    {
      "order_id": "ORD-20261026-0001",
      "building_id": "B-00412",
      "work_type": "INST_PON_MKD",
      "registered_at": "2026-10-25T14:30:00+05:00",
      "slot": {
        "start": "2026-10-26T09:00:00+05:00",
        "end": "2026-10-26T11:00:00+05:00"
      },
      "required_equipment": { "ONT": 1, "ROUTER": 1, "STB": 0 },
      "is_repeat": false
    }
  ],
  "absent_staff": ["ST-003", "ST-015"]
}
```
* **Ответ `200 OK` (`DayResponse`)**:
```json
{
  "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "date": "2026-10-26",
  "current_now": "2026-10-26T08:00:00+05:00",
  "plan_version": 1,
  "orders_count": 1,
  "absent_staff_count": 2,
  "absent_staff_codes": ["ST-003", "ST-015"]
}
```

### `GET /api/v1/days/{date}`
Получение информации о текущем состоянии дня.
* **Ответ `200 OK`**: `DayResponse`.
* **Ответ `404 Not Found`**: если день не инициализирован.

---

## 9. План смены и маршруты (Plan)

Базовый путь: `/api/v1/days/{date}/plan`.  
Запуск математической оптимизации распределения нарядов и получение сформированных маршрутов.

### `POST /api/v1/days/{date}/plan`
Запуск построения суточного плана:
1. Автоматический детектор ПГП (H9): поиск $\ge 3$ аварий на узле за $\le 60$ мин $\to$ вынесение в `pgp_groups` и станционный алерт.
2. Фильтрация пула дежурных инженеров (исключение отсутствующих сотрудников `absent_staff`).
3. Вызов Python Solver по контракту Multi-Depot VRPTW.
4. Сохранение маршрутов, точек (`RouteStop`), нераспределенных заказов (`UnassignedOrder`) и алертов (`LATE_RISK`).

* **Ответ `200 OK` (`PlanResponse`)**:
```json
{
  "day_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "date": "2026-10-26",
  "plan_version": 2,
  "routes": [
    {
      "route_id": "550e8400-e29b-41d4-a716-446655440000",
      "staff_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "staff_code": "ST-001",
      "staff_name": "Иванов Иван",
      "service_center_code": "SC-01",
      "status": "ACTIVE",
      "stops": [
        {
          "seq": 1,
          "type": "DEPOT_START",
          "location_code": "B-00001",
          "arrival": "2026-10-26T09:00:00+05:00",
          "start_time": "2026-10-26T09:00:00+05:00",
          "end_time": "2026-10-26T09:00:00+05:00",
          "travel_sec": 0,
          "equipment_after": { "ONT": 3, "ROUTER": 4, "STB": 2 }
        },
        {
          "seq": 2,
          "type": "VISIT",
          "order_code": "ORD-20261026-0001",
          "location_code": "B-00412",
          "arrival": "2026-10-26T09:22:00+05:00",
          "start_time": "2026-10-26T09:22:00+05:00",
          "end_time": "2026-10-26T10:52:00+05:00",
          "travel_sec": 1320,
          "equipment_after": { "ONT": 2, "ROUTER": 3, "STB": 2 }
        },
        {
          "seq": 3,
          "type": "BREAK",
          "location_code": "B-00412",
          "arrival": "2026-10-26T13:00:00+05:00",
          "start_time": "2026-10-26T13:00:00+05:00",
          "end_time": "2026-10-26T14:00:00+05:00",
          "travel_sec": 0,
          "equipment_after": { "ONT": 2, "ROUTER": 3, "STB": 2 }
        },
        {
          "seq": 4,
          "type": "DEPOT_END",
          "location_code": "B-00001",
          "arrival": "2026-10-26T17:40:00+05:00",
          "start_time": "2026-10-26T17:40:00+05:00",
          "end_time": "2026-10-26T17:40:00+05:00",
          "travel_sec": 1150,
          "equipment_after": { "ONT": 2, "ROUTER": 3, "STB": 2 }
        }
      ],
      "total_travel_sec": 2470,
      "total_work_min": 90,
      "total_orders": 1
    }
  ],
  "pgp_groups": [],
  "unassigned_orders": [],
  "alerts": [],
  "metrics": {
    "total_orders": 1,
    "assigned_orders": 1,
    "unassigned_orders": 0,
    "pgp_orders": 0,
    "active_routes": 1,
    "total_travel_sec": 2470,
    "avg_travel_sec_per_route": 2470.0
  }
}
```

### `GET /api/v1/days/{date}/plan`
Получение последнего рассчитанного плана дня без повторного вызова солвера.
* **Ответ `200 OK`**: `PlanResponse`.
* **Ответ `404 Not Found`**: если план еще не был рассчитан.

---

## 10. События смены и перепланирование (Events)

Базовый путь: `/api/v1/days/{date}/events`.  
Регистрация внешних событий в реальном времени с автоматическим реактивным перепланированием (Event-Driven architecture без поллинга).

### `POST /api/v1/days/{date}/events`
* **Поддерживаемые типы событий (`EventType`)**:
  * `ORDER_CANCELLED` — отмена наряда (абонент отказался или не подтвердил визит). Наряд снимается с маршрута, график оптимизируется.
  * `NEW_ORDER` — появление нового срочного наряда. Автоматически встраивается в оптимальное окно ближайшего подходящего инженера.
  * `STAFF_UNAVAILABLE` — сход инженера с линии (поломка авто, болезнь). Маршрут помечается как `UNAVAILABLE`, невыполненные наряды перераспределяются между оставшимися бригадами.
  * `ORDER_TRANSFERRED` — передача наряда в станционное подразделение.
  * `VISIT_DELAYED` — фиксация задержки на объекте сверх норматива.
  * `TIME_TICK` — продвижение модельного времени.
* **Механизм заморозки (`frozen_stops`)**:
  Остановки с временем завершения $\le now$ фиксируются как неизменяемые (`DONE`). Солвер перепланирует только будущий хвост смены.
* **Пример запроса (`EventInputDto`)**:
```json
{
  "type": "ORDER_CANCELLED",
  "timestamp": "2026-10-26T11:15:00+05:00",
  "order_id": "ORD-20261026-0001",
  "reason": "CUSTOMER_REQUEST"
}
```
* **Ответ `200 OK` (`EventResultResponse`)**:
```json
{
  "event_id": "7fa85f64-5717-4562-b3fc-2c963f66afa7",
  "code": "EV-20261026-001",
  "type": "ORDER_CANCELLED",
  "timestamp": "2026-10-26T11:15:00+05:00",
  "processed_at": "2026-10-26T11:15:01+05:00",
  "message": "Наряд 'ORD-20261026-0001' отменен по причине: CUSTOMER_REQUEST.",
  "plan": { ... }
}
```

---

## 11. Python Solver (Headless VRPTW)

Сервис оптимизации маршрутов на FastAPI (порт `8000`).

### `POST /api/v1/solver/optimize`
Принимает полный контекст дня (пул заказов, бригады, СЦ, `frozen_stops`) и выполняет 6-этапный конвейер:
1. Hard Feasibility Filter (H1: профили, технологии, допуск на высоту).
2. Приоритизация (повторные наряды вес x2, SLA REPAIR 12/24ч, слоты).
3. Пространственно-временная кластеризация и последовательная вставка по матрице дорожной сети.
4. Локальный поиск 2-Opt.
5. Движок таймлайна: вставка обеда `BREAK` строго 60 мин в окне смены (H3) и заездов на пополнение `RESTOCK` при дефиците АО (H7).
6. Гарантия уникальности (H9): каждый наряд либо в `VISIT`, либо в `unassigned_orders`.

### `GET /health`
Проверка работоспособности сервиса (`{"status": "ok", "service": "python-solver"}`).
