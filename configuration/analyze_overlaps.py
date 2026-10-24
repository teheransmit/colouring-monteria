import json
import sys
from shapely.geometry import shape
from shapely.strtree import STRtree

geojson_path = r'C:\Users\Luis\colouring-monteria\configuration\monteria_completa.geojson'
print('Loading GeoJSON...')
with open(geojson_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

features = data['features']
print(f'Total features: {len(features)}')

geoms = []
valid_indices = []
for i, feat in enumerate(features):
    try:
        s = shape(feat['geometry'])
        if not s.is_valid:
            s = s.buffer(0)
        if s.is_empty or s.area == 0:
            continue
        geoms.append(s)
        valid_indices.append(i)
    except Exception as e:
        continue

print(f'Valid geometries: {len(geoms)}')
tree = STRtree(geoms)

overlaps = []
for i, g in enumerate(geoms):
    candidates = tree.query(g)
    for c_idx in candidates:
        if c_idx <= i:
            continue
        c_geom = geoms[c_idx]
        if g.intersects(c_geom):
            try:
                inter = g.intersection(c_geom)
                if inter.area > 0:
                    area1 = g.area
                    area2 = c_geom.area
                    min_area = min(area1, area2)
                    overlap_ratio = inter.area / min_area
                    if overlap_ratio > 0.05:
                        feat1 = features[valid_indices[i]]
                        feat2 = features[valid_indices[c_idx]]
                        src1 = feat1.get('properties', {}).get('source', 'osm')
                        src2 = feat2.get('properties', {}).get('source', 'osm')
                        id1 = feat1.get('properties', {}).get('osm_id')
                        id2 = feat2.get('properties', {}).get('osm_id')
                        overlaps.append((i, c_idx, overlap_ratio, src1, src2, id1, id2))
            except Exception:
                pass

print(f'Total overlapping pairs (>5% area): {len(overlaps)}')
osm_osm = sum(1 for o in overlaps if o[3] == 'osm' and o[4] == 'osm')
ms_ms = sum(1 for o in overlaps if 'microsoft' in str(o[3]) and 'microsoft' in str(o[4]))
osm_ms = sum(1 for o in overlaps if ('microsoft' in str(o[3]) and o[4] == 'osm') or ('microsoft' in str(o[4]) and o[3] == 'osm'))
print(f'OSM-OSM overlaps: {osm_osm}')
print(f'MS-MS overlaps: {ms_ms}')
print(f'OSM-MS overlaps: {osm_ms}')

for o in overlaps[:10]:
    print(f'Ratio: {o[2]:.2f} | Src1: {o[3]} (ID {o[5]}) vs Src2: {o[4]} (ID {o[6]})')
