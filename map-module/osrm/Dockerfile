# --- Этап 1: Сборка карты ---
FROM osrm/osrm-backend:v5.27.1 AS builder

WORKDIR /data

# Копируем ваш PBF (имя файла может быть любым)
COPY osrm/*.osm.pbf /data/map.osm.pbf

# Выполняем сборку, используя универсальное имя map.osm.pbf
RUN osrm-extract -p /opt/profiles/car.lua /data/map.osm.pbf && \
    osrm-partition /data/map.osrm && \
    osrm-customize /data/map.osrm

# --- Этап 2: Финальный образ ---
FROM osrm/osrm-backend:v5.27.1

WORKDIR /data

# Копируем ВСЕ файлы из папки builder без привязки к имени
COPY --from=builder /data/ /data/

EXPOSE 5000

CMD ["osrm-routed", "--algorithm", "mld", "/data/map.osrm"]