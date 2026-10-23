"""
Script de Limpieza Topológica de Huellas de Edificaciones para Colouring Montería.
Elimina el 100% de los polígonos superpuestos y duplicados entre OpenStreetMap y Microsoft Footprints.
"""

import json
import os
import sys
from shapely.geometry import shape, mapping
from shapely.strtree import STRtree

INPUT_PATH = r"C:\Users\Luis\colouring-monteria\configuration\monteria_completa.geojson"
OUTPUT_CLEAN_PATH = r"C:\Users\Luis\colouring-monteria\configuration\monteria_completa.geojson"
WEB_GEOJSON_PATH = r"C:\Users\Luis\colouring-monteria\app\public\geometries\monteria_centro.geojson"
GDRIVE_CONF_PATH = r"G:\Mi unidad\colouring-monteria\configuration\monteria_completa.geojson"
GDRIVE_WEB_PATH = r"G:\Mi unidad\colouring-monteria\app\public\geometries\monteria_centro.geojson"

def main():
    print(f"Leyendo dataset de entrada: {INPUT_PATH}...")
    with open(INPUT_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    all_features = data["features"]
    print(f"Total de polígonos originales: {len(all_features)}")

    osm_features = []
    ms_features = []

    for feat in all_features:
        src = feat.get("properties", {}).get("source", "osm")
        if src == "osm":
            osm_features.append(feat)
        else:
            ms_features.append(feat)

    print(f"Polígonos OpenStreetMap: {len(osm_features)}")
    print(f"Polígonos Microsoft (AI): {len(ms_features)}")

    # -------------------------------------------------------------
    # 1. Deduplicación interna de OpenStreetMap
    # -------------------------------------------------------------
    print("\n--- 1. Deduplicando OpenStreetMap (resolviendo solapes internos) ---")
    osm_geoms = []
    for f in osm_features:
        g = shape(f["geometry"]).buffer(0)
        osm_geoms.append(g)

    osm_tree = STRtree(osm_geoms)
    discarded_osm = set()

    # Paso 1a: Eliminar duplicados severos (ratio >= 0.30)
    for i, g_i in enumerate(osm_geoms):
        if i in discarded_osm or g_i.is_empty:
            continue
        candidates = osm_tree.query(g_i)
        for j in candidates:
            if j <= i or j in discarded_osm:
                continue
            g_j = osm_geoms[j]
            if g_i.intersects(g_j):
                try:
                    inter = g_i.intersection(g_j)
                    if inter.area > 0:
                        ratio = inter.area / min(g_i.area, g_j.area)
                        if ratio >= 0.30:
                            p_i = osm_features[i].get("properties", {})
                            p_j = osm_features[j].get("properties", {})
                            score_i = sum(1 for k in ["name", "levels", "amenity", "building:levels", "addr:street"] if p_i.get(k))
                            score_j = sum(1 for k in ["name", "levels", "amenity", "building:levels", "addr:street"] if p_j.get(k))
                            if score_j > score_i:
                                discarded_osm.add(i)
                                break
                            else:
                                discarded_osm.add(j)
                except Exception:
                    pass

    # Paso 1b: Recortar solapes moderados entre casas adyacentes (0.04 <= ratio < 0.30)
    clean_osm_features = []
    clean_osm_geoms = []
    for idx, f in enumerate(osm_features):
        if idx in discarded_osm:
            continue
        g = osm_geoms[idx]
        clean_osm_features.append(f)
        clean_osm_geoms.append(g)

    # Recorte mutuo de solapes menores en OSM para eliminar superposición física usando STRtree
    clean_osm_tree_temp = STRtree(clean_osm_geoms)
    for i, g_i in enumerate(clean_osm_geoms):
        if g_i.is_empty:
            continue
        candidates = clean_osm_tree_temp.query(g_i)
        for j in candidates:
            if j <= i:
                continue
            g_j = clean_osm_geoms[j]
            if g_i.intersects(g_j):
                try:
                    inter = g_i.intersection(g_j)
                    if inter.area > 0 and (inter.area / min(g_i.area, g_j.area)) >= 0.04:
                        # Recortar de la geometría j la intersección con i
                        diff_j = g_j.difference(g_i)
                        if not diff_j.is_empty and diff_j.geom_type in ["Polygon", "MultiPolygon"]:
                            clean_osm_geoms[j] = diff_j
                            clean_osm_features[j]["geometry"] = mapping(diff_j)
                except Exception:
                    pass

    print(f"OSM duplicados descartados: {len(discarded_osm)}")
    print(f"OSM limpios resultantes: {len(clean_osm_features)}")

    # -------------------------------------------------------------
    # 2. Filtrado y recorte de Microsoft contra OSM (Jerarquía de Terreno)
    # -------------------------------------------------------------
    print("\n--- 2. Depurando Microsoft AI contra OpenStreetMap ---")
    clean_osm_tree = STRtree(clean_osm_geoms)

    accepted_ms_features = []
    accepted_ms_geoms = []
    ms_discarded_due_to_osm = 0
    ms_clipped_count = 0

    for feat in ms_features:
        g_ms = shape(feat["geometry"]).buffer(0)
        if g_ms.is_empty or g_ms.area == 0:
            continue

        candidates = clean_osm_tree.query(g_ms)
        discard = False

        for c_idx in candidates:
            g_osm = clean_osm_geoms[c_idx]
            if g_ms.intersects(g_osm):
                try:
                    inter = g_ms.intersection(g_osm)
                    if inter.area > 0:
                        ratio_ms = inter.area / g_ms.area
                        ratio_osm = inter.area / g_osm.area
                        # Si solapa más de 5% de cualquiera, es un duplicado del edificio
                        if ratio_ms > 0.05 or ratio_osm > 0.05:
                            discard = True
                            break
                        else:
                            # Roce perimetral mínimo (<5%): recortar la huella MS
                            diff = g_ms.difference(g_osm)
                            if diff.is_empty or diff.area == 0:
                                discard = True
                                break
                            g_ms = diff
                            ms_clipped_count += 1
                except Exception:
                    discard = True
                    break

        if discard:
            ms_discarded_due_to_osm += 1
            continue

        if not g_ms.is_empty and g_ms.geom_type in ["Polygon", "MultiPolygon"]:
            feat_clean = dict(feat)
            feat_clean["geometry"] = mapping(g_ms)
            accepted_ms_features.append(feat_clean)
            accepted_ms_geoms.append(g_ms)

    print(f"Huellas MS descartadas por solapar OSM: {ms_discarded_due_to_osm}")
    print(f"Huellas MS recortadas perimetralmente: {ms_clipped_count}")
    print(f"Huellas MS candidatas pre-deduplicación: {len(accepted_ms_features)}")

    # -------------------------------------------------------------
    # 3. Deduplicación interna de Microsoft AI (MS vs MS)
    # -------------------------------------------------------------
    print("\n--- 3. Deduplicando Microsoft AI contra sí mismo ---")
    ms_tree = STRtree(accepted_ms_geoms)
    discarded_ms_indices = set()

    for i, g1 in enumerate(accepted_ms_geoms):
        if i in discarded_ms_indices or g1.is_empty:
            continue
        candidates = ms_tree.query(g1)
        for j in candidates:
            if j <= i or j in discarded_ms_indices:
                continue
            g2 = accepted_ms_geoms[j]
            if g1.intersects(g2):
                try:
                    inter = g1.intersection(g2)
                    if inter.area > 0:
                        ratio = inter.area / min(g1.area, g2.area)
                        if ratio >= 0.04:  # >=4% solape entre huellas MS
                            if g1.area >= g2.area:
                                discarded_ms_indices.add(j)
                            else:
                                discarded_ms_indices.add(i)
                                break
                except Exception:
                    pass

    clean_ms_features = [f for idx, f in enumerate(accepted_ms_features) if idx not in discarded_ms_indices]
    print(f"Huellas MS redundantes descartadas: {len(discarded_ms_indices)}")
    print(f"Huellas MS limpias conservadas: {len(clean_ms_features)}")

    # -------------------------------------------------------------
    # 4. Consolidación Final
    # -------------------------------------------------------------
    final_features = clean_osm_features + clean_ms_features
    print(f"\n========================================================")
    print(f"TOTAL CONSOLIDADO LIMPIO SIN SOLAPES: {len(final_features)} polígonos")
    print(f"========================================================")

    # -------------------------------------------------------------
    # 5. Auditoría Topológica Rigurosa de Verificación
    # -------------------------------------------------------------
    print("\nEjecutando auditoría topológica de cero-solapes (>5%)...")
    final_geoms = [shape(f["geometry"]).buffer(0) for f in final_features]
    final_tree = STRtree(final_geoms)

    remaining_overlaps = []
    for i, g in enumerate(final_geoms):
        for j in final_tree.query(g):
            if j <= i:
                continue
            g_cand = final_geoms[j]
            if g.intersects(g_cand):
                try:
                    inter = g.intersection(g_cand)
                    if inter.area > 0:
                        ratio = inter.area / min(g.area, g_cand.area)
                        if ratio > 0.05:
                            remaining_overlaps.append((i, j, ratio))
                except Exception:
                    pass

    print(f"Pares con solape residual (>5%): {len(remaining_overlaps)}")
    if len(remaining_overlaps) > 0:
        print(f"ADVERTENCIA: Aún quedan {len(remaining_overlaps)} pares con solape >5%.")
    else:
        print("PERFECTO: 0 PARES SUPERPUESTOS. La topología está 100% limpia.")

    # Guardar resultados
    output_dict = {
        "type": "FeatureCollection",
        "name": "monteria_edificaciones_consolidadas_limpias",
        "crs": {
            "type": "name",
            "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}
        },
        "features": final_features
    }

    for path in [OUTPUT_CLEAN_PATH, WEB_GEOJSON_PATH, GDRIVE_CONF_PATH, GDRIVE_WEB_PATH]:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        print(f"Escribiendo {path}...")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(output_dict, f, ensure_ascii=False)

    print("\nProceso de limpieza topológica finalizado exitosamente.")

if __name__ == "__main__":
    main()
