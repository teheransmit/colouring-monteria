import json
from shapely.geometry import shape
from shapely.strtree import STRtree

with open(r'C:\Users\Luis\colouring-monteria\configuration\monteria_completa.geojson', 'r', encoding='utf-8') as f:
    data = json.load(f)

features = data['features']
osm_feats = [f for f in features if f.get('properties', {}).get('source', 'osm') == 'osm']
geoms = [shape(f['geometry']).buffer(0) for f in osm_feats]
tree = STRtree(geoms)

count = 0
for i, g in enumerate(geoms):
    for c_idx in tree.query(g):
        if c_idx <= i:
            continue
        c_geom = geoms[c_idx]
        if g.intersects(c_geom):
            inter = g.intersection(c_geom)
            if inter.area > 0 and (inter.area / min(g.area, c_geom.area)) > 0.15:
                count += 1
                f1 = osm_feats[i]
                f2 = osm_feats[c_idx]
                n1 = f1['properties'].get('name', 'unnamed')
                n2 = f2['properties'].get('name', 'unnamed')
                id1 = f1['properties'].get('osm_id')
                id2 = f2['properties'].get('osm_id')
                ratio = inter.area / min(g.area, c_geom.area)
                print(f'OSM overlap: {id1} ({n1}) vs {id2} ({n2}), ratio: {ratio:.2f}')
                if count >= 10:
                    break
    if count >= 10:
        break
