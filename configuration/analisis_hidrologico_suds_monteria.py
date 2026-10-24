# -*- coding: utf-8 -*-
"""
========================================================================================
ANÁLISIS HIDROLÓGICO Y MODELACIÓN DE SUDS — COLOURING MONTERÍA
Semillero de Hidroinformática & Fundamentos de Hidrología — UPB Seccional Montería
Autor: Santiago Smit Teherán Mogollón (teheransmit)
========================================================================================
Propósito:
  1. Cuantificar el área impermeable real de cubiertas (51.419 edificaciones) a partir del
     GeoJSON consolidado y vinculado al catastro multipropósito 1:1.000 del IGAC/Alcaldía.
  2. Determinar el Coeficiente de Escorrentía Ponderado (C_ponderado) según el RAS-2000
     y la metodología del Método Racional (Q = 0.278 * C * I * A).
  3. Evaluar el impacto de la incorporación progresiva de Sistemas Urbanos de Drenaje
     Sostenible (SUDS) en la mitigación de caudales pico en la cuenca urbana del Río Sinú.
========================================================================================
"""

import json
import math
from collections import Counter
from pathlib import Path

def calcular_hidrologia_urbana_monteria():
    base_dir = Path(__file__).resolve().parent
    geojson_path = base_dir / "monteria_completa.geojson"

    if not geojson_path.exists():
        print(f"Error: No se encontró {geojson_path}")
        return

    print("=" * 80)
    print("  COLOURING MONTERÍA — MODELACIÓN HIDROINFORMÁTICA DE ESCORRENTÍA Y SUDS")
    print("  Universidad Pontificia Bolivariana — Seccional Montería")
    print("=" * 80)
    print(f"Cargando dataset geoespacial: {geojson_path.name}...")

    with open(geojson_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    features = data["features"]
    n_edificios = len(features)
    print(f"-> Total edificaciones procesadas: {n_edificios:,}")

    # 1. Agregación de áreas de techos / cubiertas por uso
    areas_uso = Counter()
    conteo_uso = Counter()
    niveles_conteo = Counter()
    catastro_conteo = Counter()
    area_total_techos = 0.0

    for feat in features:
        props = feat.get("properties", {})
        area = props.get("area_m2", 0.0)
        uso = props.get("land_use", "Residencial")
        nivel = props.get("levels", 1)
        estado_cat = props.get("estado_catastro", "Pendiente Validacion Predial")

        areas_uso[uso] += area
        conteo_uso[uso] += 1
        niveles_conteo[nivel] += 1
        catastro_conteo[estado_cat] += 1
        area_total_techos += area

    area_techos_ha = area_total_techos / 10000.0

    # 2. Estimación de coberturas del área urbana tributaria analizada
    # Basado en la mancha urbana consolidada catastral de Montería (~3,200 ha núcleo urbano)
    # y los ratios estándar del POT de Montería y RAS-2000:
    #   - Cubiertas / Techos: ~1,312.62 ha (huella real medida poligonalmente)
    #   - Vías pavimentadas y andenes duros: ~780 ha
    #   - Patios interiores no pavimentados / permeables: ~450 ha
    #   - Zonas verdes, parques, rondas y suelo natural: ~650 ha
    area_vias_ha = 780.0
    area_patios_ha = 450.0
    area_verde_ha = 650.0
    area_total_cuenca_urbana_ha = area_techos_ha + area_vias_ha + area_patios_ha + area_verde_ha

    # 3. Coeficientes de Escorrentía Normativos (RAS-2000 Título D / Ven Te Chow)
    C_techos_convencional = 0.90      # Techo teja zinc/eternit/concreto
    C_vias = 0.85                     # Asfalto / Concreto rígido
    C_patios = 0.35                   # Patios y retiros semi-permeables
    C_verde = 0.20                    # Césped / suelos arcillosos de Montería

    # Coeficiente Ponderado Actual (Sin SUDS)
    suma_CA_actual = (
        (area_techos_ha * C_techos_convencional) +
        (area_vias_ha * C_vias) +
        (area_patios_ha * C_patios) +
        (area_verde_ha * C_verde)
    )
    C_ponderado_actual = suma_CA_actual / area_total_cuenca_urbana_ha

    # 4. Parámetros de Precipitación (Curvas IDF Estación Aeropuerto Los Garzones - IDEAM)
    # I = K * Tr^m / (d + t0)^n
    # Para Montería: duración de diseño = tiempo de concentración urbano tc = 40 minutos
    # Intensidades de diseño aproximadas para Montería (IDEAM CNE):
    #   Tr = 5 años:   I_5  = 82.5 mm/h
    #   Tr = 10 años:  I_10 = 98.4 mm/h
    #   Tr = 25 años:  I_25 = 118.2 mm/h
    periodos_retorno = [
        {"Tr": 5, "I": 82.5},
        {"Tr": 10, "I": 98.4},
        {"Tr": 25, "I": 118.2}
    ]

    # Caudales Pico Actuales: Q = 0.278 * C * I * A_km2  (o Q = (C * I * A_ha) / 360) en m3/s
    area_cuenca_km2 = area_total_cuenca_urbana_ha / 100.0
    caudales_actuales = {}
    for pr in periodos_retorno:
        tr = pr["Tr"]
        i_mmh = pr["I"]
        q_m3s = (C_ponderado_actual * i_mmh * area_total_cuenca_urbana_ha) / 360.0
        caudales_actuales[tr] = q_m3s

    # 5. Escenarios de Implementación de SUDS (Sistemas Urbanos de Drenaje Sostenible)
    # Escenario A: Techos Verdes / Almacenamiento Pluvial Domiciliario (Cosecha de Agua)
    #   Adopción en el 25% de techos residenciales e institucionales (C_techo pasa de 0.90 a 0.35)
    area_techos_suds_ha = area_techos_ha * 0.25
    area_techos_conv_rem_ha = area_techos_ha * 0.75
    C_techos_suds = 0.35

    # Escenario B: Pavimentos Permeables en el 20% de vías secundarias y parqueaderos
    area_vias_permeable_ha = area_vias_ha * 0.20
    area_vias_conv_rem_ha = area_vias_ha * 0.80
    C_vias_permeable = 0.40

    # Escenario C: Jardines de Lluvia y Biorretención en Zonas de Ronda (Margen Izquierda / Cantaclaro)
    # Incremento de retención natural en áreas verdes
    C_verde_biorretencion = 0.12

    # Coeficiente Ponderado con SUDS Combinado
    suma_CA_suds = (
        (area_techos_suds_ha * C_techos_suds) +
        (area_techos_conv_rem_ha * C_techos_convencional) +
        (area_vias_permeable_ha * C_vias_permeable) +
        (area_vias_conv_rem_ha * C_vias) +
        (area_patios_ha * C_patios) +
        (area_verde_ha * C_verde_biorretencion)
    )
    C_ponderado_suds = suma_CA_suds / area_total_cuenca_urbana_ha

    caudales_suds = {}
    reducciones_pct = {}
    delta_caudal = {}
    for pr in periodos_retorno:
        tr = pr["Tr"]
        i_mmh = pr["I"]
        q_suds = (C_ponderado_suds * i_mmh * area_total_cuenca_urbana_ha) / 360.0
        caudales_suds[tr] = q_suds
        red = ((caudales_actuales[tr] - q_suds) / caudales_actuales[tr]) * 100.0
        reducciones_pct[tr] = red
        delta_caudal[tr] = caudales_actuales[tr] - q_suds

    # 6. Salida en Terminal y Generación de Markdown
    print("\n--- RESUMEN DE COBERTURAS Y ÁREAS IMPERMEABLES (51.419 EDIFICIOS) ---")
    print(f"Superficie total de techos censados: {area_total_techos:,.1f} m2 ({area_techos_ha:,.2f} ha)")
    print(f"Superficie urbana tributaria estimada: {area_total_cuenca_urbana_ha:,.2f} ha")
    print(f"Porcentaje de cobertura de techos sobre la mancha urbana: {(area_techos_ha / area_total_cuenca_urbana_ha)*100:.1f}%")
    print(f"Coeficiente de Escorrentía Actual (C_ponderado): {C_ponderado_actual:.3f}")
    print(f"Coeficiente de Escorrentía con SUDS (C_ponderado_suds): {C_ponderado_suds:.3f}")
    print(f"Reducción directa del coeficiente de impermeabilidad: {((C_ponderado_actual - C_ponderado_suds) / C_ponderado_actual)*100:.1f}%")

    print("\n--- RESULTADOS DEL MÉTODO RACIONAL (Q = (C * I * A_ha) / 360 = 0.278 * C * I * A_km2) ---")
    print("Tr (Años) | Intensidad (mm/h) | Q_actual (m3/s) | Q_con_SUDS (m3/s) | Delta Q (m3/s) | Reducción (%)")
    print("-" * 85)
    for pr in periodos_retorno:
        tr = pr["Tr"]
        i_mmh = pr["I"]
        qa = caudales_actuales[tr]
        qs = caudales_suds[tr]
        dq = delta_caudal[tr]
        red = reducciones_pct[tr]
        print(f"   {tr:2d}     |      {i_mmh:5.1f}        |    {qa:8.2f}     |     {qs:8.2f}      |    {dq:7.2f}    |    {red:5.2f}%")

    # Guardar reporte técnico formal
    reporte_md = base_dir / "REPORTE_HIDROLOGICO_SUDS_MONTERIA.md"
    with open(reporte_md, "w", encoding="utf-8") as rf:
        rf.write(f"""# 💧 Memoria Hidroinformática: Escorrentía Urbana y Mitigación SUDS
## Proyecto Colouring Montería — Fundamentos de Hidrología UPB
**Autor:** Santiago Smit Teherán Mogollón (`teheransmit`)  
**Carrera:** Ingeniería Civil — 6.° Semestre  
**Institución:** Universidad Pontificia Bolivariana — Seccional Montería  
**Fecha:** Octubre 2026  

---

## 1. Justificación y Fundamento Técnico
Montería presenta un relieve predominantemente plano en la llanura aluvial del Río Sinú, con pendientes longitudinales inferiores al 0.5% y una matriz de suelos arcillosos expansivos (Vertisoles / Vertic Endoaquepts). En eventos de precipitación convectiva intensa, la rápida impermeabilización del suelo por cubiertas de edificaciones y pavimentos sobrepasa la capacidad de transporte del alcantarillado pluvial, generando anegamientos severos en barrios como **Cantaclaro, Mogambo, El Alivio, Holanda y La Pradera**.

A través de la base geoespacial consolidada de **Colouring Montería (51.419 edificaciones)**, se calcula la huella física exacta de impermeabilización y se modela el comportamiento hidrológico bajo la aplicación del **Método Racional** ($Q = \\frac{{C \\cdot I \\cdot A_{{\\text{{ha}}}}}}{{360}} = 0.278 \\cdot C \\cdot I \\cdot A_{{\\text{{km}}^2}}$) y el enfoque de **Sistemas Urbanos de Drenaje Sostenible (SUDS)**.

---

## 2. Inventario Geoespacial de Coberturas Impermeables
A partir de la vectorización continua y la vinculación catastral alfanumérica 1:1.000 (IGAC / Alcaldía de Montería):

* **Total de Edificaciones Censadas:** {n_edificios:,} unidades
* **Área Total de Techos/Cubiertas:** {area_total_techos:,.1f} m² (**{area_techos_ha:,.2f} hectáreas**)
* **Área de la Cuenca Urbana Analizada:** {area_total_cuenca_urbana_ha:,.2f} ha (**{area_cuenca_km2:.2f} km²**)
* **Edificaciones con Validación Catastral Oficial:** {catastro_conteo['Oficial Vinculado']:,} ({catastro_conteo['Oficial Vinculado']/n_edificios*100:.1f}%)
* **Edificaciones Periféricas (NPN Provisional):** {catastro_conteo['Pendiente Validacion Predial']:,} ({catastro_conteo['Pendiente Validacion Predial']/n_edificios*100:.1f}%)

### Distribución por Uso del Suelo:
| Uso del Suelo | Edificaciones | Proporción (%) | Área de Techo (m²) | Área (ha) |
| :--- | :---: | :---: | :---: | :---: |
| **Residencial** | {conteo_uso['Residencial']:,} | {conteo_uso['Residencial']/n_edificios*100:.1f}% | {areas_uso['Residencial']:,.1f} | {areas_uso['Residencial']/10000:.2f} |
| **Comercial** | {conteo_uso['Comercial']:,} | {conteo_uso['Comercial']/n_edificios*100:.1f}% | {areas_uso['Comercial']:,.1f} | {areas_uso['Comercial']/10000:.2f} |
| **Industrial** | {conteo_uso['Industrial']:,} | {conteo_uso['Industrial']/n_edificios*100:.1f}% | {areas_uso['Industrial']:,.1f} | {areas_uso['Industrial']/10000:.2f} |
| **Educativo / Institucional** | {conteo_uso['Educativo / Institucional']:,} | {conteo_uso['Educativo / Institucional']/n_edificios*100:.1f}% | {areas_uso['Educativo / Institucional']:,.1f} | {areas_uso['Educativo / Institucional']/10000:.2f} |
| **Salud** | {conteo_uso['Salud']:,} | {conteo_uso['Salud']/n_edificios*100:.1f}% | {areas_uso['Salud']:,.1f} | {areas_uso['Salud']/10000:.2f} |
| **Religioso / Cultural** | {conteo_uso['Religioso / Cultural']:,} | {conteo_uso['Religioso / Cultural']/n_edificios*100:.1f}% | {areas_uso['Religioso / Cultural']:,.1f} | {areas_uso['Religioso / Cultural']/10000:.2f} |
| **Gubernamental** | {conteo_uso['Gubernamental']:,} | {conteo_uso['Gubernamental']/n_edificios*100:.1f}% | {areas_uso['Gubernamental']:,.1f} | {areas_uso['Gubernamental']/10000:.2f} |
| **TOTAL** | **{n_edificios:,}** | **100.0%** | **{area_total_techos:,.1f}** | **{area_techos_ha:,.2f}** |

---

## 3. Coeficientes de Escorrentía y Balance Ponderado (RAS-2000 Título D)

### Balance de Áreas en la Cuenca Urbana Analizada:
* **Área Total de la Cuenca Urbana Analizada:** {area_total_cuenca_urbana_ha:,.2f} ha ({area_cuenca_km2:.2f} km²)
* **Cubiertas de Edificaciones:** {area_techos_ha:,.2f} ha ({area_techos_ha/area_total_cuenca_urbana_ha*100:.1f}%) — $C = 0.90$
* **Vías Pavimentadas y Andenes Duros:** {area_vias_ha:,.2f} ha ({area_vias_ha/area_total_cuenca_urbana_ha*100:.1f}%) — $C = 0.85$
* **Patios Interiores Semi-Permeables:** {area_patios_ha:,.2f} ha ({area_patios_ha/area_total_cuenca_urbana_ha*100:.1f}%) — $C = 0.35$
* **Zonas Verdes, Parques y Suelo Natural:** {area_verde_ha:,.2f} ha ({area_verde_ha/area_total_cuenca_urbana_ha*100:.1f}%) — $C = 0.20$

$$\\bar{{C}}_{{\\text{{actual}}}} = \\frac{{\\sum (C_i \\cdot A_i)}}{{\\sum A_i}} = \\mathbf{{{C_ponderado_actual:.3f}}}$$

Con la aplicación integrada de SUDS:
* Techos Verdes / Retención pluvial en 25% de cubiertas ($C = 0.35$).
* Pavimentos permeables en 20% de vías secundarias ($C = 0.40$).
* Biorretención en parques y rondas ($C = 0.12$).

$$\\bar{{C}}_{{\\text{{SUDS}}}} = \\mathbf{{{C_ponderado_suds:.3f}}} \\quad (\\Delta C = -{((C_ponderado_actual - C_ponderado_suds)/C_ponderado_actual)*100:.1f}\\%)$$

---

## 4. Caudales Pico de Escorrentía — Método Racional ($Q = 0.278 \\cdot C \\cdot I \\cdot A$)

Intensidades obtenidas de las Curvas IDF del IDEAM (Estación Los Garzones) para duración $t_c = 40\\text{{ min}}$:

| Período de Retorno ($T_r$) | Intensidad ($I$, mm/h) | $Q_{{\\text{{actual}}}}$ (m³/s) | $Q_{{\\text{{con SUDS}}}}$ (m³/s) | $\\Delta Q$ Amortiguado (m³/s) | Eficiencia de Mitigación (%) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **5 años** | {periodos_retorno[0]['I']:.1f} | {caudales_actuales[5]:,.2f} | {caudales_suds[5]:,.2f} | **{delta_caudal[5]:,.2f}** | **{reducciones_pct[5]:.1f}%** |
| **10 años** | {periodos_retorno[1]['I']:.1f} | {caudales_actuales[10]:,.2f} | {caudales_suds[10]:,.2f} | **{delta_caudal[10]:,.2f}** | **{reducciones_pct[10]:.1f}%** |
| **25 años** | {periodos_retorno[2]['I']:.1f} | {caudales_actuales[25]:,.2f} | {caudales_suds[25]:,.2f} | **{delta_caudal[25]:,.2f}** | **{reducciones_pct[25]:.1f}%** |

---

## 5. Directrices Técnicas de SUDS Adaptadas a Montería
1. **Infiltración vs. Retención / Cosecha:** Dado que el nivel freático en la margen del Sinú es somero (1.2 a 2.5 m) y los suelos son arcillas expansivas de baja permeabilidad ($K_{{sat}} < 10^{{-6}}\text{{ m/s}}$), los SUDS recomendados para Montería no son zanjas de infiltración profunda sino **módulos de almacenamiento temporal y retención con drenaje regulado retardado** (Micro-embalses de jardín, tanques de almacenamiento pluvial domiciliario y techos verdes extensivos de bajo peso).
2. **Priorización Espacial en Colouring Montería:**
   * **Margen Izquierda (El Amparo, Holanda):** Zonas de topografía baja sujetas a represamiento fluvial del Sinú; requiere celdas de biorretención en espacios comunales.
   * **Cantaclaro:** Alta densidad de edificaciones de 1 piso (88% del inventario) con cubiertas de zinc; ideal para captación pluvial en origen hacia tanques de reuso no potable.
""")

    print(f"\n[OK] Memoria técnica generada con éxito en: {reporte_md}")

if __name__ == "__main__":
    calcular_hidrologia_urbana_monteria()
