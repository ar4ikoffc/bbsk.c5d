# BBSK API (порт 8080) — Отчет о тестировании и наполнении базы данных

> **Дата и время тестирования:** 2026-11-15 11:27:13 UTC+5  

> **Целевой сервер:** `http://localhost:8080` (Spring Boot BBSK Backend)  

> **Статус тестирования:** ⚠️ ПРОЙДЕНО 49 ИЗ 50 (98.0%)


## 1. Сводная статистика

| Метрика | Значение | Описание |
| :--- | :---: | :--- |
| **Всего запросов выполнено** | **50** | Полное сквозное тестирование всех контроллеров и эндпоинтов |
| **Успешно (Passed)** | **49** | Соответствует ожидаемому контракту API и бизнес-логике |
| **Ошибок (Failed)** | **1** | Выявленные несоответствия или исключения |
| **Процент успешных проверок** | **98.0%** | Высокий уровень готовности основной функциональности |
| **Суммарное время выполнения** | **1277.43 мс** | Общее время выполнения всей цепочки запросов |
| **Среднее время на запрос** | **25.55 мс** | Время отклика бэкенда при обработке запросов |


## 2. Результаты тестирования по группам API

### 1. Служебные методы (1/1)

| Сценарий / Тест | Метод и Путь | Ожидаемый HTTP | Фактический HTTP | Время (мс) | Статус |
| :--- | :--- | :---: | :---: | :---: | :---: |
| GET /api/v1/health | `GET /api/v1/health` | `200` | `200` | 39.85 | ✅ PASS |

### 2. Аутентификация (5/5)

| Сценарий / Тест | Метод и Путь | Ожидаемый HTTP | Фактический HTTP | Время (мс) | Статус |
| :--- | :--- | :---: | :---: | :---: | :---: |
| POST /api/auth/register (регистрация) | `POST /api/auth/register` | `201` | `201` | 81.87 | ✅ PASS |
| POST /api/auth/login (вход в систему) | `POST /api/auth/login` | `200` | `200` | 92.89 | ✅ PASS |
| GET /api/auth/me (проверка сессии с cookie) | `GET /api/auth/me` | `200` | `200` | 8.68 | ✅ PASS |
| GET /api/auth/me (без cookie -> 401) | `GET /api/auth/me` | `401` | `401` | 24.75 | ✅ PASS |
| POST /api/auth/logout (выход из системы) | `POST /api/auth/logout` | `200` | `200` | 5.01 | ✅ PASS |

### 3. Справочники (Bulk) (2/2)

| Сценарий / Тест | Метод и Путь | Ожидаемый HTTP | Фактический HTTP | Время (мс) | Статус |
| :--- | :--- | :---: | :---: | :---: | :---: |
| PUT /api/v1/reference (пакетная загрузка) | `PUT /api/v1/reference` | `200` | `200` | 83.69 | ✅ PASS |
| PUT /api/v1/reference/travel-matrix (матрица времени) | `PUT /api/v1/reference/travel-matrix` | `200` | `200` | 24.8 | ✅ PASS |

### 4. Типы работ (5/5)

| Сценарий / Тест | Метод и Путь | Ожидаемый HTTP | Фактический HTTP | Время (мс) | Статус |
| :--- | :--- | :---: | :---: | :---: | :---: |
| GET /api/v1/work-types | `GET /api/v1/work-types` | `200` | `200` | 36.63 | ✅ PASS |
| GET /api/v1/work-types/{id} | `GET /api/v1/work-types/eb307d44-9ad4-4492-8464-62c63adf1cd2` | `200` | `200` | 9.45 | ✅ PASS |
| POST /api/v1/work-types (создание DISMANTLE) | `POST /api/v1/work-types` | `201` | `201` | 10.15 | ✅ PASS |
| PUT /api/v1/work-types/{id} (обновление) | `PUT /api/v1/work-types/6fef9d43-c642-4c93-8838-8235f8721bc7` | `200` | `200` | 11.33 | ✅ PASS |
| DELETE /api/v1/work-types/{id} (удаление) | `DELETE /api/v1/work-types/6fef9d43-c642-4c93-8838-8235f8721bc7` | `204` | `204` | 27.25 | ✅ PASS |

### 5. Инфраструктура (15/15)

| Сценарий / Тест | Метод и Путь | Ожидаемый HTTP | Фактический HTTP | Время (мс) | Статус |
| :--- | :--- | :---: | :---: | :---: | :---: |
| GET /api/v1/buildings/service-centers | `GET /api/v1/buildings/service-centers` | `200` | `200` | 8.82 | ✅ PASS |
| GET /api/v1/buildings/service-centers/{id} | `GET /api/v1/buildings/service-centers/1bc109dc-17ac-40b4-a560-ed1bf0c54319` | `200` | `200` | 7.13 | ✅ PASS |
| POST /api/v1/buildings/service-centers (создание СЦ) | `POST /api/v1/buildings/service-centers` | `201` | `201` | 29.62 | ✅ PASS |
| PUT /api/v1/buildings/service-centers/{id} (обновление СЦ) | `PUT /api/v1/buildings/service-centers/fef6d8a8-d898-4ad7-b1e7-36999a6978f3` | `200` | `200` | 10.77 | ✅ PASS |
| DELETE /api/v1/buildings/service-centers/{id} (удаление СЦ) | `DELETE /api/v1/buildings/service-centers/fef6d8a8-d898-4ad7-b1e7-36999a6978f3` | `204` | `204` | 35.72 | ✅ PASS |
| GET /api/v1/buildings/access-nodes?technology=PON | `GET /api/v1/buildings/access-nodes?technology=PON` | `200` | `200` | 7.49 | ✅ PASS |
| GET /api/v1/buildings/access-nodes/{id} | `GET /api/v1/buildings/access-nodes/b83a128d-9561-4d5c-b1ee-202228882644` | `200` | `200` | 19.45 | ✅ PASS |
| POST /api/v1/buildings/access-nodes (создание узла) | `POST /api/v1/buildings/access-nodes` | `201` | `201` | 32.85 | ✅ PASS |
| PUT /api/v1/buildings/access-nodes/{id} (обновление узла) | `PUT /api/v1/buildings/access-nodes/c0f22df0-d547-4d0f-a34c-0a07edc47bd2` | `200` | `200` | 9.18 | ✅ PASS |
| DELETE /api/v1/buildings/access-nodes/{id} (удаление узла) | `DELETE /api/v1/buildings/access-nodes/c0f22df0-d547-4d0f-a34c-0a07edc47bd2` | `204` | `204` | 21.07 | ✅ PASS |
| GET /api/v1/buildings?building_type=MKD | `GET /api/v1/buildings?building_type=MKD` | `200` | `200` | 29.95 | ✅ PASS |
| GET /api/v1/buildings/{id} | `GET /api/v1/buildings/07e62cf4-68c3-4785-8630-f6109304e102` | `200` | `200` | 10.59 | ✅ PASS |
| POST /api/v1/buildings (создание здания) | `POST /api/v1/buildings` | `201` | `201` | 12.07 | ✅ PASS |
| PUT /api/v1/buildings/{id} (обновление здания) | `PUT /api/v1/buildings/3631f184-e4fb-4d7a-a4bc-24156055f6ea` | `200` | `200` | 25.8 | ✅ PASS |
| DELETE /api/v1/buildings/{id} (удаление здания) | `DELETE /api/v1/buildings/3631f184-e4fb-4d7a-a4bc-24156055f6ea` | `204` | `204` | 11.52 | ✅ PASS |

### 6. Сотрудники и смены (9/9)

| Сценарий / Тест | Метод и Путь | Ожидаемый HTTP | Фактический HTTP | Время (мс) | Статус |
| :--- | :--- | :---: | :---: | :---: | :---: |
| GET /api/v1/staff/shifts | `GET /api/v1/staff/shifts` | `200` | `200` | 8.08 | ✅ PASS |
| GET /api/v1/staff/shifts/{id} | `GET /api/v1/staff/shifts/35ce97ab-d3ec-4196-a0ae-ad35b2cd1b0e` | `200` | `200` | 6.85 | ✅ PASS |
| POST /api/v1/staff/shifts (создание смены) | `POST /api/v1/staff/shifts` | `201` | `201` | 10.71 | ✅ PASS |
| DELETE /api/v1/staff/shifts/{id} (удаление смены) | `DELETE /api/v1/staff/shifts/6933ec98-f50a-4aba-a398-d2fbacf82d48` | `204` | `204` | 20.37 | ✅ PASS |
| GET /api/v1/staff | `GET /api/v1/staff` | `200` | `200` | 11.66 | ✅ PASS |
| GET /api/v1/staff/{id} | `GET /api/v1/staff/f77ccb11-ca1c-4317-9c16-068facf192ae` | `200` | `200` | 35.09 | ✅ PASS |
| POST /api/v1/staff (создание сотрудника) | `POST /api/v1/staff` | `201` | `201` | 14.44 | ✅ PASS |
| PUT /api/v1/staff/{id} (обновление сотрудника) | `PUT /api/v1/staff/cefeba2c-f667-4c2a-bffc-dc8bffd6520e` | `200` | `200` | 14.49 | ✅ PASS |
| DELETE /api/v1/staff/{id} (удаление сотрудника) | `DELETE /api/v1/staff/cefeba2c-f667-4c2a-bffc-dc8bffd6520e` | `204` | `204` | 33.37 | ✅ PASS |

### 7. Рабочие дни (2/2)

| Сценарий / Тест | Метод и Путь | Ожидаемый HTTP | Фактический HTTP | Время (мс) | Статус |
| :--- | :--- | :---: | :---: | :---: | :---: |
| PUT /api/v1/days/2026-10-26 (инициализация дня) | `PUT /api/v1/days/2026-10-26` | `200` | `200` | 38.68 | ✅ PASS |
| GET /api/v1/days/2026-10-26 (получение состояния дня) | `GET /api/v1/days/2026-10-26` | `200` | `200` | 21.38 | ✅ PASS |

### 8. Наряды на работы (5/5)

| Сценарий / Тест | Метод и Путь | Ожидаемый HTTP | Фактический HTTP | Время (мс) | Статус |
| :--- | :--- | :---: | :---: | :---: | :---: |
| GET /api/v1/orders?date=2026-10-26 | `GET /api/v1/orders?date=2026-10-26` | `200` | `200` | 33.81 | ✅ PASS |
| GET /api/v1/orders/{id} | `GET /api/v1/orders/fee111d9-b285-4d22-afd2-0fe51b9de05c` | `200` | `200` | 18.64 | ✅ PASS |
| POST /api/v1/orders (создание наряда) | `POST /api/v1/orders` | `201` | `201` | 18.84 | ✅ PASS |
| PUT /api/v1/orders/{id} (обновление наряда) | `PUT /api/v1/orders/4982306a-82e2-4c01-831d-73b1469f8e95` | `200` | `200` | 32.77 | ✅ PASS |
| DELETE /api/v1/orders/{id} (удаление наряда) | `DELETE /api/v1/orders/4982306a-82e2-4c01-831d-73b1469f8e95` | `204` | `204` | 14.56 | ✅ PASS |

### 9. План и маршруты (2/2)

| Сценарий / Тест | Метод и Путь | Ожидаемый HTTP | Фактический HTTP | Время (мс) | Статус |
| :--- | :--- | :---: | :---: | :---: | :---: |
| POST /api/v1/days/2026-10-26/plan (построение маршрутов VRPTW) | `POST /api/v1/days/2026-10-26/plan` | `200` | `200` | 89.9 | ✅ PASS |
| GET /api/v1/days/2026-10-26/plan (получение сохраненного плана) | `GET /api/v1/days/2026-10-26/plan` | `200` | `200` | 59.54 | ✅ PASS |

### 10. События смены (0/1)

| Сценарий / Тест | Метод и Путь | Ожидаемый HTTP | Фактический HTTP | Время (мс) | Статус |
| :--- | :--- | :---: | :---: | :---: | :---: |
| POST /api/v1/days/2026-10-26/events (ORDER_CANCELLED) | `POST /api/v1/days/2026-10-26/events` | `200` | `500` | 30.0 | ❌ FAIL |

### 11. Обработка ошибок (3/3)

| Сценарий / Тест | Метод и Путь | Ожидаемый HTTP | Фактический HTTP | Время (мс) | Статус |
| :--- | :--- | :---: | :---: | :---: | :---: |
| GET /api/v1/days/1990-01-01 (несуществующий день -> 404) | `GET /api/v1/days/1990-01-01` | `404` | `404` | 14.78 | ✅ PASS |
| GET /api/v1/buildings/0000... (несуществующее здание -> 404) | `GET /api/v1/buildings/00000000-0000-0000-0000-000000000000` | `404` | `404` | 12.37 | ✅ PASS |
| POST /api/v1/work-types (невалидное тело -> 400) | `POST /api/v1/work-types` | `400` | `400` | 8.72 | ✅ PASS |

## 3. Детализация тестовых данных, внесенных в базу данных

В процессе тестирования база данных сервиса была успешно наполнена согласованными тестовыми данными:

### 3.1. Сервисные центры (Service Centers / Депо)
- `SC-01`: СЦ «Север», г. Екатеринбург, ул. Победы, 30 (`56.8941, 60.6105`), график 08:00–21:00, время пополнения 15 мин.
- `SC-02`: СЦ «Юг», г. Екатеринбург, ул. 8 Марта, 150 (`56.8123, 60.6012`), график 08:00–20:00, время пополнения 15 мин.

### 3.2. Топология сети и здания (Access Nodes & Buildings)
- `AN-001` (`OLT`, `PON`): узел доступа Орджоникидзевский-1 (ул. Победы, 32).
  - Дом `B-001` (МКД): ул. Победы, 34, привязан к зоне `SC-01`.
  - Дом `B-002` (МКД): ул. Победы, 36, привязан к зоне `SC-01`.
- `AN-002` (`SWITCH`, `FTTB`): узел доступа Чкаловский-1 (ул. 8 Марта, 152).
  - Дом `B-003` (МКД): ул. 8 Марта, 154, привязан к зоне `SC-02`.
  - Дом `B-004` (Частный сектор, ВЛС): ул. Авиационная, 10, привязан к зоне `SC-02`.

### 3.3. Персонал выездных инженеров и графики смен (Staff & Shifts)
- `TECH-01`: Иванов Иван, депо `SC-01`, профиль `INSTALL`, технологии `PON, FTTB`, смена 08:00–20:00 (обед 12:00–15:00). Старт. оборудование: `ONT: 4, ROUTER: 2, STB: 2`.
- `TECH-02`: Петров Петр, депо `SC-01`, профиль `LTP3`, технологии `PON`, допуск на высоту: `true`, смена 09:00–18:00 (обед 13:00–15:00). Старт. оборудование: `ONT: 2, ROUTER: 2, STB: 1`.
- `TECH-03`: Сидоров Алексей, депо `SC-02`, профили `INSTALL, LTP3`, технологии `FTTB`, смена 08:00–20:00 (зафиксирован как отсутствующий на смену 2026-10-26).

### 3.4. Матрица перемещений (Travel Matrix)
Загружена и сохранена матрица 6×6 (`SC-01`, `SC-02`, `B-001`, `B-002`, `B-003`, `B-004`) с временами в пути (секунды) и дорожными расстояниями (метры), используемая солвером для оптимизации переездов бригад.

### 3.5. Смена на 2026-10-26 и наряды (Orders & Working Day)
- `ORD-20261026-0001`: Инсталляция PON в `B-001`, слот 09:00–11:00.
- `ORD-20261026-0002`: Инсталляция PON в `B-002`, слот 11:30–13:30.
- `ORD-20261026-0003`: Повторный аварийный ремонт REPAIR в `B-001`, слот 10:00–12:00 (приоритет x2).
- `absent_staff`: `TECH-03`.

## 4. Оценка поведения API: ожидаемое vs фактическое

В ходе комплексной проверки сопоставлено фактическое поведение API со спецификацией OpenApi / Кейса:

1. **Служебные методы и Health:**
   - `GET /api/v1/health` возвращает `200 OK` с данными команды и версии. Поведение **ожидаемое**.
2. **Аутентификация и безопасность:**
   - `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` работают строго по контракту.
   - JWT токен передается в `HttpOnly` cookie.
   - При отсутствии cookie `GET /api/auth/me` возвращает `401 Unauthorized`. Поведение **ожидаемое**.
3. **Пакетная загрузка справочников (Bulk API):**
   - `PUT /api/v1/reference` атомарно загружает все сущности в транзакции, очищая старый контекст с кодом `200 OK`.
   - `PUT /api/v1/reference/travel-matrix` валидирует размерности N×N и сохраняет матрицу в общий том. Поведение **ожидаемое**.
4. **CRUD-операции справочников и инфраструктуры:**
   - Методы `GET`, `POST`, `PUT`, `DELETE` для сервисных центров, узлов доступа, зданий, смен, сотрудников и типов работ отрабатывают с кодами `200`, `201`, `204`. Поведение **ожидаемое**.
5. **Пакетная инициализация дня и заказы (Orders):**
   - `PUT /api/v1/days/{date}` создает контекст смены, наряды и список отсутствующих.
   - `GET /api/v1/days/{date}` возвращает состояние дня.
   - CRUD для нарядов (`/api/v1/orders`) работает штатно. Поведение **ожидаемое**.
6. **Построение суточного плана и оптимизация маршрутов (VRPTW Solver):**
   - `POST /api/v1/days/{date}/plan` успешно вызывает Python-солвер, строит маршруты с учетом квалификаций сотрудников, окон смен, перерывов `BREAK` и возврата в депо `DEPOT_END`.
   - `GET /api/v1/days/{date}/plan` отдает закешированный план с метриками суммарного пробега и количества визитов. Поведение **ожидаемое**.
7. **Обработка ошибок:**
   - Запрос отсутствующих сущностей возвращает `404 Not Found`.
   - Невалидные тела запросов возвращают `400 Bad Request`. Поведение **ожидаемое**.
8. **Обнаруженное отклонение в реактивных событиях смены (POST /api/v1/days/{date}/events):**
   - ⚠️ **Фактическое поведение:** Запрос `POST /api/v1/days/{date}/events` возвращает HTTP `500 Internal Server Error` с сообщением:
     > `Java 8 date/time type java.time.OffsetDateTime not supported by default: add Module "com.fasterxml.jackson.datatype:jackson-datatype-jsr310"`
   - **Причина:** В файле `EventService.kt` поле `objectMapper` инициализировано вручную как `private val objectMapper = ObjectMapper()` без регистрации модуля `JavaTimeModule` (или без внедрения Spring-бина `ObjectMapper`, в котором этот модуль уже зарегистрирован). При сериализации `EventInputDto.timestamp` в JSON для сохранения сущности `Event` Jackson выбрасывает исключение.
   - **Рекомендация по исправлению:** Внедрить `ObjectMapper` через конструктор `EventService` либо вызывать `.registerModule(JavaTimeModule())`.

## 5. Примеры ответов API

### Пример ответа: `GET /api/v1/health` (HTTP 200)
```json
{
  "status": "ok",
  "team": "Бубышки",
  "version": "1.0.0"
}
```

### Пример ответа: `PUT /api/v1/reference (пакетная загрузка)` (HTTP 200)
```json
{
  "status": "loaded",
  "counts": {
    "service_centers": 2,
    "staff": 3,
    "access_nodes": 2,
    "buildings": 4,
    "work_types": 7
  }
}
```

### Пример ответа: `PUT /api/v1/reference/travel-matrix (матрица времени)` (HTTP 200)
```json
{
  "status": "loaded",
  "counts": {
    "points": 6
  }
}
```

### Пример ответа: `PUT /api/v1/days/2026-10-26 (инициализация дня)` (HTTP 200)
```json
{
  "id": "ccaa1a88-bdb0-49e2-9a2c-b9c6dce491a6",
  "date": "2026-10-26",
  "current_now": "2026-10-26T03:00:00Z",
  "plan_version": 1,
  "based_on_event_id": null,
  "orders_count": 3,
  "absent_staff_count": 1,
  "absent_staff_codes": [
    "TECH-03"
  ]
}
```

### Пример ответа: `POST /api/v1/days/2026-10-26/plan (построение маршрутов VRPTW)` (HTTP 200)
```json
{
  "day_id": "ccaa1a88-bdb0-49e2-9a2c-b9c6dce491a6",
  "date": "2026-10-26",
  "plan_version": 2,
  "routes": [
    {
      "route_id": "2c8b7007-7a98-4fc3-84c8-d84cb1f175a4",
      "staff_id": "f77ccb11-ca1c-4317-9c16-068facf192ae",
      "staff_code": "TECH-01",
      "staff_name": "Иванов Иван",
      "service_center_code": "SC-01",
      "status": "ACTIVE",
      "stops": [
        {
          "id": "494d89eb-5593-43b4-a1b3-438eb0735f51",
          "seq": 1,
          "type": "DEPOT_START",
          "order_id": null,
          "order_code": null,
          "location_code": "ул. Победы, 30",
          "arrival": "2026-10-26T08:00:00Z",
          "start_time": "2026-10-26T08:00:00Z",
          "end_time": "2026-10-26T08:00:00Z",
          "travel_sec": 0,
          "status": "PLANNED",
          "equipment_after": {
            "ONT": 4,
            "ROUTER": 2,
            "STB": 2
          }
        },
        {
          "id": "fc264afc-a91d-4e9c-aae8-a692dded5072",
          "seq": 2,
          "type": "VISIT",
          "order_id": "5340c432-cc82-4795-83db-4ee2cf78a27c",
          "order_code": "ORD-20261026-0002",
          "location_code": "B-002",
          "arrival": "2026-10-26T08:15:00Z",
          "start_time": "2026-10-26T08:15:00Z",
          "end_time": "2026-10-26T09:45:00Z",
          "travel_sec": 900,
          "status": "PLANNED",
          "equipment_after": {
            "ONT": 3,
            "ROUTER": 1,
            "STB": 1
          }
        },
        {
          "id": "8dbd3c98-426d-4500-9201-f577d0ae2ae2",
          "seq": 3,
          "typ
  ... [содержимое сокращено] ...
}
```
