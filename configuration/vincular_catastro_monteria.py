import json
import os
import time
import shapely.geometry
from shapely.strtree import STRtree

def format_npn_30(cidentif):
    """
    Convierte el codigo catastral municipal (17 digitos) al estandar
    Numero Predial Nacional (NPN) de 30 digitos del IGAC / Catastro Multipropósito:
    - Depto (2): 23
    - Mpio (3): 001
    - Tipo Zona (2): 01 (Urbano)
    - Sector (2): digitos 5-6
    - Comuna (2): digitos 7-8
    - Barrio (2): 00
    - Manzana (4): digitos 9-12
    - Terreno (4): digitos 13-16 o final
    - Condicion (1): 0
    - Edificio/Torre (2): 00
    - Piso (2): 00
    - Unidad (4): 0000
    """
    c_str = str(cidentif).strip()
    if len(c_str) >= 17:
        dpto = c_str[:2]       # 23
        mpio = c_str[2:5]      # 001
        zona = "01"            # Urbano
        sector = c_str[5:7] if len(c_str) >= 7 else "01"
        comuna = c_str[7:9] if len(c_str) >= 9 else "00"
        barrio = "00"
        manzana = c_str[9:13] if len(c_str) >= 13 else "0001"
        predio = c_str[13:17] if len(c_str) >= 17 else "0001"
        resto = "000000000"
        npn = f"{dpto}{mpio}{zona}{sector}{comuna}{barrio}{manzana}{predio}{resto}"
        return npn[:30]
    else:
        # Formato sintetico provisional
        padded = c_str.zfill(23)
        return f"2300101{padded}"[:30]

def clasificar_uso_suelo(props):
    building = str(props.get('building', '')).lower()
    amenity = str(props.get('amenity', '')).lower()
    shop = str(props.get('shop', '')).lower()
    name = str(props.get('name', '')).lower()

    if amenity in ['school', 'kindergarten', 'college', 'university', 'research_institute']:
        return 'Educativo / Institucional'
    if amenity in ['hospital', 'clinic', 'doctors', 'pharmacy']:
        return 'Salud'
    if amenity in ['place_of_worship']:
        return 'Religioso / Cultural'
    if amenity in ['police', 'fire_station', 'townhall', 'courthouse']:
        return 'Gubernamental'
    if shop or amenity in ['restaurant', 'cafe', 'bank', 'fast_food', 'bar'] or building in ['commercial', 'retail']:
        return 'Comercial'
    if 'centro comercial' in name or 'alamedas' in name or 'buenavista' in name or 'supermercado' in name or 'olimpica' in name or 'exito' in name:
        return 'Comercial'
    if 'universidad' in name or 'colegio' in name or 'institucion' in name:
        return 'Educativo / Institucional'
    if 'hospital' in name or 'clinica' in name:
        return 'Salud'
    if 'iglesia' in name or 'catedral' in name:
        return 'Religioso / Cultural'
    if building in ['industrial', 'warehouse']:
        return 'Industrial'
    
    return 'Residencial'

def estimar_niveles(props, area_m2):
    levels = props.get('levels')
    if levels:
        try:
            val = int(levels)
            if val > 0:
                return val
        except (ValueError, TypeError):
            pass

    name = str(props.get('name', '')).lower()
    uso = clasificar_uso_suelo(props)

    # Identificar edificios altos conocidos en Montería
    if 'torre' in name or 'edificio' in name or 'condominio' in name:
        return 5
    if uso == 'Comercial' and area_m2 > 1000:
        return 3
    if uso == 'Educativo / Institucional' and area_m2 > 500:
        return 3
    if area_m2 > 400:
        return 2
    
    return 1

def main():
    t0 = time.time()
    print("Iniciando Vinculacion Catastral Alfanumerica (Fase 1)...")

    path_alcaldia = "configuration/alcaldia_monteria_construcciones_1000.geojson"
    path_completa = "configuration/monteria_completa.geojson"
    path_public = "app/public/geometries/monteria_centro.geojson"

    print("Cargando cartografia oficial 1:1.000...")
    with open(path_alcaldia, 'r', encoding='utf-8') as f:
        alcaldia_data = json.load(f)
    alcaldia_features = alcaldia_data['features']
    print(f"Cargadas {len(alcaldia_features):,} construcciones oficiales.")

    print("Construyendo indice espacial STRtree de la Alcaldia...")
    alcaldia_geoms = []
    valid_alcaldia_indices = []
    for i, feat in enumerate(alcaldia_features):
        try:
            g = shapely.geometry.shape(feat['geometry'])
            if g.is_valid and not g.is_empty:
                alcaldia_geoms.append(g)
                valid_alcaldia_indices.append(i)
        except Exception:
            pass

    tree = STRtree(alcaldia_geoms)
    print(f"Indice espacial creado con {len(alcaldia_geoms):,} geometrias.")

    print("Cargando dataset consolidado de Monteria...")
    with open(path_completa, 'r', encoding='utf-8') as f:
        completa_data = json.load(f)
    completa_features = completa_data['features']
    print(f"Cargadas {len(completa_features):,} huellas consolidadas.")

    vinculados_oficial = 0
    provisionales = 0

    print("Procesando cruce espacial de identificacion catastral...")
    for feat in completa_features:
        props = feat.setdefault('properties', {})
        geom = shapely.geometry.shape(feat['geometry'])
        
        # Calcular area aproximada en m2
        area_m2 = props.get('area_m2')
        if not area_m2:
            # Lat ~8.75 N: Shoelace plana
            coords = feat['geometry']['coordinates'][0]
            LAT_SCALE = 110574.0
            LON_SCALE = 110057.0
            x = [c[0] * LON_SCALE for c in coords]
            y = [c[1] * LAT_SCALE for c in coords]
            n = len(x)
            shoelace = 0.5 * abs(sum(x[i]*y[(i+1)%n] - x[(i+1)%n]*y[i] for i in range(n)))
            area_m2 = round(shoelace, 1)
            props['area_m2'] = area_m2

        # Clasificar uso del suelo y niveles
        props['land_use'] = clasificar_uso_suelo(props)
        props['levels'] = estimar_niveles(props, area_m2)

        # Buscar coincidencia espacial con catastro oficial
        candidatos = tree.query(geom)
        mejor_match = None
        max_inter_area = 0

        for c_idx in candidatos:
            alc_g = alcaldia_geoms[c_idx]
            if geom.intersects(alc_g):
                try:
                    inter = geom.intersection(alc_g)
                    if inter.area > max_inter_area:
                        max_inter_area = inter.area
                        mejor_match = valid_alcaldia_indices[c_idx]
                except Exception:
                    pass

        # Si el solape con la huella oficial supera el 15% del area
        if mejor_match is not None and geom.area > 0 and (max_inter_area / geom.area) > 0.15:
            alc_props = alcaldia_features[mejor_match]['properties']
            cidentif = alc_props.get('CIdentif', '')
            props['codigo_catastral'] = str(cidentif)
            props['npn'] = format_npn_30(cidentif)
            props['area_catastral_m2'] = round(float(alc_props.get('SHAPE_Area', area_m2)), 1)
            props['tipo_catastro'] = alc_props.get('CDescrip') or 'Construccion Urbana Convencional'
            props['fuente_catastral'] = 'Alcaldia de Monteria (Servicio 10642 IGAC 1:1.000)'
            props['estado_catastro'] = 'Oficial Vinculado'
            props['verificado'] = True
            vinculados_oficial += 1
        else:
            osm_id = props.get('osm_id', 90000000)
            cidentif_prov = f"230010199{str(osm_id)[-8:].zfill(8)}"
            props['codigo_catastral'] = cidentif_prov
            props['npn'] = format_npn_30(cidentif_prov)
            props['area_catastral_m2'] = area_m2
            props['tipo_catastro'] = 'Levantamiento Abierto'
            props['fuente_catastral'] = 'OpenStreetMap / Microsoft AI'
            props['estado_catastro'] = 'Pendiente Validacion Predial'
            props['verificado'] = False
            provisionales += 1

    print("\n--- RESULTADOS DE LA VINCULACION CATASTRAL ---")
    print(f"Total edificaciones consolidadas:        {len(completa_features):,}")
    print(f"Vinculadas a Catastro Oficial 1:1.000:   {vinculados_oficial:,} ({vinculados_oficial/len(completa_features)*100:.1f}%)")
    print(f"Con NPN Provisional (Periferia/OSM):     {provisionales:,} ({provisionales/len(completa_features)*100:.1f}%)")

    print("\nGuardando configuration/monteria_completa.geojson...")
    with open(path_completa, 'w', encoding='utf-8') as f:
        json.dump(completa_data, f, ensure_ascii=False)

    print("Guardando app/public/geometries/monteria_centro.geojson...")
    with open(path_public, 'w', encoding='utf-8') as f:
        json.dump(completa_data, f, ensure_ascii=False)

    print(f"Proceso finalizado en {time.time() - t0:.2f} segundos.")

if __name__ == '__main__':
    main()
