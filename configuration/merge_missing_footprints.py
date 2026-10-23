"""
Algoritmo de fusión y deduplicación espacial de edificaciones de Montería.
Combina las 36.206 huellas comunitarias de OpenStreetMap con las huellas
satelitales de Microsoft Building Footprints, incorporando únicamente
las edificaciones faltantes en sectores sin cobertura.
"""
import gzip
import json
import math
import os
import sys

ROOT = r"C:\Users\Luis\colouring-monteria"
OSM_PATH = os.path.join(ROOT, "app", "public", "geometries", "monteria_centro.geojson")
MS_GZ_PATH = os.path.join(ROOT, "ms_032230122.csv.gz")
OUT_COMPLETE = os.path.join(ROOT, "configuration", "monteria_completa.geojson")
OUT_PUBLIC = os.path.join(ROOT, "app", "public", "geometries", "monteria_centro.geojson")

# Bounding box del área urbana y metropolitana de Montería
BBOX = (8.680, -75.950, 8.840, -75.820)
M_LAT = 111320.0
CELL_SIZE = 0.0003  # ~33 metros para indexación rápida

def centroid(coords_ring):
    n = len(coords_ring)
    if n == 0:
        return 0, 0
    return sum(p[1] for p in coords_ring) / n, sum(p[0] for p in coords_ring) / n

def ring_area(ring):
    if len(ring) < 3:
        return 0.0
    lat0 = sum(p[1] for p in ring) / len(ring)
    mlon = M_LAT * math.cos(math.radians(lat0))
    a = 0.0
    for i in range(len(ring) - 1):
        x1, y1 = ring[i][0] * mlon, ring[i][1] * M_LAT
        x2, y2 = ring[i + 1][0] * mlon, ring[i + 1][1] * M_LAT
        a += x1 * y2 - x2 * y1
    return abs(a) / 2.0

print("1. Cargando polígonos existentes de OpenStreetMap...")
with open(OSM_PATH, "r", encoding="utf-8-sig") as f:
    osm_data = json.load(f)

osm_features = osm_data.get("features", [])
print(f"   Total huellas OSM cargadas: {len(osm_features)}")

# Construir índice espacial en cuadrícula para los centroides de OSM
print("2. Construyendo índice espacial de deduplicación...")
grid_index = {}
for i, feat in enumerate(osm_features):
    geom = feat.get("geometry", {})
    if geom.get("type") == "Polygon":
        rings = geom.get("coordinates", [])
        if rings and len(rings[0]) >= 3:
            c_lat, c_lon = centroid(rings[0])
            gx = math.floor(c_lon / CELL_SIZE)
            gy = math.floor(c_lat / CELL_SIZE)
            grid_index.setdefault((gx, gy), []).append((c_lat, c_lon))

print(f"   Celdas activas en la cuadrícula: {len(grid_index)}")

def is_duplicate(c_lat, c_lon, threshold_meters=10.0):
    gx = math.floor(c_lon / CELL_SIZE)
    gy = math.floor(c_lat / CELL_SIZE)
    mlon = M_LAT * math.cos(math.radians(c_lat))
    thresh_sq = threshold_meters * threshold_meters

    # Revisar celda actual y las 8 celdas vecinas
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            pts = grid_index.get((gx + dx, gy + dy))
            if pts:
                for o_lat, o_lon in pts:
                    dy_m = (c_lat - o_lat) * M_LAT
                    dx_m = (c_lon - o_lon) * mlon
                    if (dx_m * dx_m + dy_m * dy_m) < thresh_sq:
                        return True
    return False

print("3. Analizando huellas de Microsoft Building Footprints...")
ms_added = []
total_ms_monteria = 0
duplicates_count = 0
filtered_small = 0

counter = 1
with gzip.open(MS_GZ_PATH, "rt", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        try:
            feat = json.loads(line)
            geom = feat.get("geometry", {})
            coords = geom.get("coordinates", [])
            if not coords or len(coords[0]) < 3:
                continue

            ring = coords[0]
            c_lat, c_lon = centroid(ring)

            # Verificar si cae dentro de Montería
            if not (BBOX[0] <= c_lat <= BBOX[2] and BBOX[1] <= c_lon <= BBOX[3]):
                continue

            total_ms_monteria += 1

            # Filtrar artefactos muy pequeños (< 18 m2)
            area_m2 = ring_area(ring)
            if area_m2 < 18.0:
                filtered_small += 1
                continue

            # Verificar si ya existe en OSM
            if is_duplicate(c_lat, c_lon, threshold_meters=10.0):
                duplicates_count += 1
                continue

            # Si no existe, es un polígono faltante legítimo
            # Asegurar polígono cerrado
            if ring[0] != ring[-1]:
                ring.append(ring[0])

            new_id = 90000000 + counter
            new_feat = {
                "type": "Feature",
                "id": new_id,
                "properties": {
                    "osm_id": new_id,
                    "building": "yes",
                    "source": "microsoft/ai",
                    "area_m2": round(area_m2, 1)
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [ring]
                }
            }
            ms_added.append(new_feat)
            counter += 1

            # Registrar en el índice para no duplicar entre huellas MS cercanas
            gx = math.floor(c_lon / CELL_SIZE)
            gy = math.floor(c_lat / CELL_SIZE)
            grid_index.setdefault((gx, gy), []).append((c_lat, c_lon))

        except Exception:
            continue

print(f"   Huellas Microsoft en Montería: {total_ms_monteria}")
print(f"   Coincidentes con OSM (descartadas): {duplicates_count}")
print(f"   Filtradas por tamaño mínimo (<18m²): {filtered_small}")
print(f"   Nuevas huellas faltantes incorporadas: {len(ms_added)}")

# Consolidar dataset maestro
merged_features = osm_features + ms_added
print(f"\n4. Dataset maestro consolidado: {len(merged_features)} edificaciones totales.")

master_data = {
    "type": "FeatureCollection",
    "features": merged_features
}

print(f"5. Guardando archivo maestro en: {OUT_COMPLETE} ...")
with open(OUT_COMPLETE, "w", encoding="utf-8") as f:
    json.dump(master_data, f)

print(f"6. Actualizando archivo público de la aplicación web en: {OUT_PUBLIC} ...")
with open(OUT_PUBLIC, "w", encoding="utf-8") as f:
    json.dump(master_data, f)

print("¡Proceso de fusión completado con éxito!")
