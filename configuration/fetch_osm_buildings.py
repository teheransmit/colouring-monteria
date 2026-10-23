"""
Descarga huellas de edificaciones (building footprints) de Montería desde OpenStreetMap vía Overpass API
y las convierte a formato GeoJSON para Colouring Montería.
"""
import json
import urllib.request
import urllib.parse
import sys

# Bounding box del casco urbano central de Montería: [min_lat, min_lon, max_lat, max_lon]
# Centrado en el Centro, Hospital San Jerónimo, La Ceiba, Sucre, Chuchurrutá
BBOX = "8.720,-75.910,8.780,-75.860"

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

query = f"""
[out:json][timeout:60];
(
  way["building"]({BBOX});
  relation["building"]({BBOX});
);
out geom;
"""

print(f"Consultando edificios en Montería con BBOX={BBOX}...")
req = urllib.request.Request(
    OVERPASS_URL,
    data=query.encode("utf-8"),
    headers={"User-Agent": "ColouringMonteria-Importer/1.0"}
)

try:
    with urllib.request.urlopen(req, timeout=60) as resp:
        osm_data = json.loads(resp.read().decode("utf-8"))
except Exception as e:
    print(f"Error consultando Overpass API: {e}")
    sys.exit(1)

elements = osm_data.get("elements", [])
print(f"Total elementos OSM recibidos: {len(elements)}")

features = []
for el in elements:
    osm_id = el.get("id")
    tags = el.get("tags", {})
    geometry = el.get("geometry", [])
    
    # Solo procesamos elementos de tipo 'way' con geometría válida cerrada (polígonos)
    if el.get("type") == "way" and len(geometry) >= 4:
        coords = [[pt["lon"], pt["lat"]] for pt in geometry]
        # Asegurar polígono cerrado
        if coords[0] != coords[-1]:
            coords.append(coords[0])
            
        feature = {
            "type": "Feature",
            "id": osm_id,
            "properties": {
                "osm_id": osm_id,
                "building": tags.get("building", "yes"),
                "name": tags.get("name", ""),
                "levels": tags.get("building:levels", ""),
                "amenity": tags.get("amenity", "")
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [coords]
            }
        }
        features.append(feature)

geojson = {
    "type": "FeatureCollection",
    "features": features
}

output_path = "C:/Users/Luis/colouring-monteria/configuration/monteria_buildings.geojson"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(geojson, f, indent=2)

print(f"¡Éxito! Se generaron {len(features)} polígonos de edificios en: {output_path}")
