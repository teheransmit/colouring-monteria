# 💧 Memoria Hidroinformática: Escorrentía Urbana y Mitigación SUDS
## Proyecto Colouring Montería — Fundamentos de Hidrología UPB
**Autor:** Santiago Smit Teherán Mogollón (`teheransmit`)  
**Carrera:** Ingeniería Civil — 6.° Semestre  
**Institución:** Universidad Pontificia Bolivariana — Seccional Montería  
**Fecha:** Octubre 2026  

---

## 1. Justificación y Fundamento Técnico
Montería presenta un relieve predominantemente plano en la llanura aluvial del Río Sinú, con pendientes longitudinales inferiores al 0.5% y una matriz de suelos arcillosos expansivos (Vertisoles / Vertic Endoaquepts). En eventos de precipitación convectiva intensa, la rápida impermeabilización del suelo por cubiertas de edificaciones y pavimentos sobrepasa la capacidad de transporte del alcantarillado pluvial, generando anegamientos severos en barrios como **Cantaclaro, Mogambo, El Alivio, Holanda y La Pradera**.

A través de la base geoespacial consolidada de **Colouring Montería (51.419 edificaciones)**, se calcula la huella física exacta de impermeabilización y se modela el comportamiento hidrológico bajo la aplicación del **Método Racional** ($Q = \frac{C \cdot I \cdot A_{\text{ha}}}{360} = 0.278 \cdot C \cdot I \cdot A_{\text{km}^2}$) y el enfoque de **Sistemas Urbanos de Drenaje Sostenible (SUDS)**.

---

## 2. Inventario Geoespacial de Coberturas Impermeables
A partir de la vectorización continua y la vinculación catastral alfanumérica 1:1.000 (IGAC / Alcaldía de Montería):

* **Total de Edificaciones Censadas:** 51,419 unidades
* **Área Total de Techos/Cubiertas:** 13,126,218.2 m² (**1,312.62 hectáreas**)
* **Área de la Cuenca Urbana Analizada:** 3,192.62 ha (**31.93 km²**)
* **Edificaciones con Validación Catastral Oficial:** 36,964 (71.9%)
* **Edificaciones Periféricas (NPN Provisional):** 14,455 (28.1%)

### Distribución por Uso del Suelo:
| Uso del Suelo | Edificaciones | Proporción (%) | Área de Techo (m²) | Área (ha) |
| :--- | :---: | :---: | :---: | :---: |
| **Residencial** | 51,204 | 99.6% | 12,916,056.7 | 1291.61 |
| **Comercial** | 107 | 0.2% | 129,098.0 | 12.91 |
| **Industrial** | 64 | 0.1% | 10,991.8 | 1.10 |
| **Educativo / Institucional** | 10 | 0.0% | 29,097.3 | 2.91 |
| **Salud** | 19 | 0.0% | 25,169.0 | 2.52 |
| **Religioso / Cultural** | 9 | 0.0% | 10,955.2 | 1.10 |
| **Gubernamental** | 6 | 0.0% | 4,850.2 | 0.49 |
| **TOTAL** | **51,419** | **100.0%** | **13,126,218.2** | **1,312.62** |

---

## 3. Coeficientes de Escorrentía y Balance Ponderado (RAS-2000 Título D)

### Balance de Áreas en la Cuenca Urbana Analizada:
* **Área Total de la Cuenca Urbana Analizada:** 3,192.62 ha (31.93 km²)
* **Cubiertas de Edificaciones:** 1,312.62 ha (41.1%) — $C = 0.90$
* **Vías Pavimentadas y Andenes Duros:** 780.00 ha (24.4%) — $C = 0.85$
* **Patios Interiores Semi-Permeables:** 450.00 ha (14.1%) — $C = 0.35$
* **Zonas Verdes, Parques y Suelo Natural:** 650.00 ha (20.4%) — $C = 0.20$

$$\bar{C}_{\text{actual}} = \frac{\sum (C_i \cdot A_i)}{\sum A_i} = \mathbf{0.668}$$

Con la aplicación integrada de SUDS:
* Techos Verdes / Retención pluvial en 25% de cubiertas ($C = 0.35$).
* Pavimentos permeables en 20% de vías secundarias ($C = 0.40$).
* Biorretención en parques y rondas ($C = 0.12$).

$$\bar{C}_{\text{SUDS}} = \mathbf{0.573} \quad (\Delta C = -14.2\%)$$

---

## 4. Caudales Pico de Escorrentía — Método Racional ($Q = 0.278 \cdot C \cdot I \cdot A$)

Intensidades obtenidas de las Curvas IDF del IDEAM (Estación Los Garzones) para duración $t_c = 40\text{ min}$:

| Período de Retorno ($T_r$) | Intensidad ($I$, mm/h) | $Q_{\text{actual}}$ (m³/s) | $Q_{\text{con SUDS}}$ (m³/s) | $\Delta Q$ Amortiguado (m³/s) | Eficiencia de Mitigación (%) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **5 años** | 82.5 | 488.55 | 419.19 | **69.37** | **14.2%** |
| **10 años** | 98.4 | 582.71 | 499.97 | **82.73** | **14.2%** |
| **25 años** | 118.2 | 699.96 | 600.58 | **99.38** | **14.2%** |

---

## 5. Directrices Técnicas de SUDS Adaptadas a Montería
1. **Infiltración vs. Retención / Cosecha:** Dado que el nivel freático en la margen del Sinú es somero (1.2 a 2.5 m) y los suelos son arcillas expansivas de baja permeabilidad ($K_{sat} < 10^{-6}	ext{ m/s}$), los SUDS recomendados para Montería no son zanjas de infiltración profunda sino **módulos de almacenamiento temporal y retención con drenaje regulado retardado** (Micro-embalses de jardín, tanques de almacenamiento pluvial domiciliario y techos verdes extensivos de bajo peso).
2. **Priorización Espacial en Colouring Montería:**
   * **Margen Izquierda (El Amparo, Holanda):** Zonas de topografía baja sujetas a represamiento fluvial del Sinú; requiere celdas de biorretención en espacios comunales.
   * **Cantaclaro:** Alta densidad de edificaciones de 1 piso (88% del inventario) con cubiertas de zinc; ideal para captación pluvial en origen hacia tanques de reuso no potable.
