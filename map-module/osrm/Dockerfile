# --- Этап 1: Сборка графа OSRM ---
FROM osrm/osrm-backend:latest AS builder

WORKDIR /data

# Копируем PBF из корня контекста
COPY *.osm.pbf /data/map.osm.pbf

# Извлечение и подготовка графа (MLD алгоритм)
RUN osrm-extract -p /opt/car.lua /data/map.osm.pbf && \
    osrm-partition /data/map.osrm && \
    osrm-customize /data/map.osrm

# --- Этап 2: Финальный образ для запуска ---
FROM osrm/osrm-backend:latest

WORKDIR /data

# Забираем только скомпилированные файлы графа
COPY --from=builder /data/map.osrm* /data/

EXPOSE 5000

CMD ["osrm-routed", "--algorithm", "mld", "/data/map.osrm"]