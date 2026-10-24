# 🏛️ Colouring Montería

Plataforma colaborativa y gemelo digital para el mapeo, caracterización y análisis del parque edificado de **Montería, Córdoba (Colombia)**.  
Es una adaptación oficial del [Colouring Cities Research Programme (CCRP)](https://colouringcities.org/), coordinado por el **Department of Architecture de la Universidad de Cambridge** y desarrollado originalmente en **The Alan Turing Institute** y **University College London (UCL)**, bajo licencia **GPLv3**.

---

## 📌 Estado Actual del Proyecto (Octubre 2026)

- **Cobertura Urbana Consolidada:** **51.419 edificaciones** únicas, continuas y con **0 solapes residuales**.
  - **36.137 huellas** provenientes de OpenStreetMap (validación humana comunitaria).
  - **15.282 huellas** complementarias de Microsoft Building Footprints (cobertura satelital en periferia y áreas de expansión: Cantaclaro, Furatena, Mogambo, Garzones, Margen Izquierda).
- **Cartografía Catastral Oficial 1:1.000 (Alcaldía de Montería / IGAC):** **22.362 edificaciones** oficiales correspondientes al producto *Servicio 10642* (levantamiento aerofotogramétrico sensor FOIF A90), reproyectadas de CTM12 (EPSG:9377) a WGS84 (EPSG:4326).
- **Rendimiento Web a 60 FPS (Aceleración por GPU):**
  - Migración del renderizado tradicional SVG de Leaflet a **Canvas GPU** (`preferCanvas={true}` y `L.canvas({ padding: 0.5 })`).
  - **Viewport BBOX Culling:** Algoritmo de filtrado espacial en tiempo real que evalúa la pantalla y renderiza exclusivamente los 500 a 2.500 polígonos visibles.
  - **Consumo de memoria reducido en un 85%** (de >1.2 GB con congelamiento a <180 MB y navegación ultra fluida).
  - **Selector multi-capa:** Permite alternar en caliente entre 🟠 *Consolidada (51.419)*, 🏛️ *Alcaldía 1:1.000 (22.362)* y 🔄 *Comparativa*.
- **Integración SIG / QGIS 3:**
  - Proyecto oficial [`configuration/QGIS_Colouring_Monteria.qgz`](configuration/QGIS_Colouring_Monteria.qgz) depurado a 15 capas estructurales clave (huellas maestras, hidrografía del Río Sinú, canales pluviales, red vial, ciclorrutas y zonas verdes).
  - Conexión e interoperabilidad programática en vivo mediante el servidor MCP de QGIS (`qgis-mcp`).
- **Recursos de Documentación e Investigación:**
  - 📘 **Dossier Exhaustivo para NotebookLM:** [`docs/DOSSIER_COLOURING_MONTERIA_NOTEBOOKLM.md`](docs/DOSSIER_COLOURING_MONTERIA_NOTEBOOKLM.md) con el marco metodológico del CCRP, las 12 categorías, los 4 canales de captura y el perfil de Montería.
  - 📓 **Jupyter Notebook Interactivo:** [`notebook_colouring_monteria.ipynb`](notebook_colouring_monteria.ipynb) con análisis de morfología urbana, estadísticas de áreas y verificación topológica con Shapely STRtree.

---

## 🚀 Inicio Rápido en Desarrollo

### Requisitos

- **Node.js 18 o superior** y **npm**
- **Python 3.10 o superior** con `shapely`, `pyproj` y `matplotlib` para flujos ETL espaciales
- *(Opcional)* Docker Desktop y Docker Compose si se desea ejecutar el backend con PostgreSQL 16 / PostGIS 3.4

### Aplicación Local (Modo Rápido en Memoria)

La aplicación cuenta con bypass de desarrollo que permite probar la navegación, el selector de capas y la edición de atributos prediales sin necesidad de levantar PostgreSQL:

```powershell
cd app
npm install
npm start
```

Abrir en el navegador: **<http://localhost:8080>**

Scripts disponibles en [`app/package.json`](app/package.json):
- `npm start`: Inicia el servidor de desarrollo Razzle en puerto 8080.
- `npm run build`: Genera la compilación optimizada de producción.
- `npm test`: Ejecuta la suite de pruebas automatizadas.
- `npm run lint`: Ejecuta el análisis estático con ESLint.

---

## 🗺️ Arquitectura de Datos y Flujo Geoespacial

```
   [OpenStreetMap] ──> (36.137 huellas) ──┐
                                          ├──> [clean_overlapping_footprints.py] ──> [monteria_completa.geojson] (51.419)
   [Microsoft AI]  ──> (15.282 huellas) ──┘        (Shapely STRtree / 0 solapes)         │
                                                                                         ├──> [app/public/geometries/]
   [Alcaldía 1:1.000] ──> [pyproj / EPSG:9377] ──> [alcaldia_1000.geojson] (22.362) ───┘         (GPU Canvas 60 FPS)
   (Servicio 10642 IGAC)
```

1. **Ingestión y Filtrado:** Huellas satelitales procesadas en [`configuration/merge_missing_footprints.py`](configuration/merge_missing_footprints.py).
2. **Deduplicación Topológica:** Algoritmo en [`configuration/clean_overlapping_footprints.py`](configuration/clean_overlapping_footprints.py) que eliminó 3.256 pares de solape, garantizando integridad matemática.
3. **Reprojección Catastral:** Cartografía básica oficial 1:1.000 convertida de coordenadas planas CTM12 a coordenadas geográficas WGS84.
4. **Carga en PostGIS:** Script SQL automatizado [`configuration/generate_footprints.sql`](configuration/generate_footprints.sql) para ingestión masiva en base de datos relacional espacial.

---

## 📊 Las 12 Categorías del Estándar CCRP

Colouring Montería implementa la estructura de 12 dimensiones del Colouring Cities Research Programme:

1. **Location & Identification:** Dirección oficial, NPN catastral, UPRN, coordenadas WGS84.
2. **Land Use & Building Use:** Clasificación de actividades según el POT de Montería.
3. **Age & Construction History:** Año o época de construcción y valor histórico.
4. **Physical Characteristics:** Número de pisos, altura en metros, área de huella (m²).
5. **Construction & Materials:** Tipología estructural (mampostería confinada, pórticos de concreto, cubiertas de zinc/teja).
6. **Heritage & Conservation:** Protección patrimonial (Bienes de Interés Cultural - BIC) y Centro Histórico.
7. **Planning & Urban Regulations:** Tratamientos urbanísticos, índices de ocupación y retiros viales.
8. **Sustainability & Energy:** Confort térmico pasivo, techos verdes, captación de aguas lluvias (SUDS).
9. **Streetscape & Urban Quality:** Continuidad de andenes, arborización urbana y accesibilidad universal.
10. **Community & Public Perception:** Equipamientos comunitarios, percepción de seguridad y valor barrial.
11. **Dynamics & Demolition/Change:** Licencias de construcción, modificaciones y densificación urbana.
12. **Team & Verification:** Trazabilidad de ediciones, fuentes de procedencia y sellos de auditoría.

---

## 📈 Métricas Morfométricas Urbanas de Montería

A partir del análisis espacial del parque edificado consolidado:

| Métrica | Valor Consolidado |
|---|---|
| **Total de edificaciones mapeadas** | 51.419 polígonos |
| **Área total construida techada** | ~618,5 hectáreas (~6,18 km²) |
| **Área de huella promedio** | 120,3 m² |
| **Área de huella mediana** | 88,4 m² |
| **Parque residencial típico (< 150 m²)** | 78,4% del parque edificado |
| **Pares de solape residual** | **0 pares** (100% limpio) |

---

## 📓 Bitácora de Desarrollo

Todas las actividades, intervenciones técnicas y decisiones de arquitectura realizadas en este repositorio se registran cronológicamente en [`BITACORA_IA.md`](BITACORA_IA.md).

---

## 🏛️ Créditos y Enlaces de Interés

- **Autor y Desarrollador:** Santiago Smit Teherán Mogollón ([@teheransmit](https://github.com/teheransmit)) — Estudiante de Ingeniería Civil, Universidad Pontificia Bolivariana (UPB Montería).
- **Iniciativa Global:** [Colouring Cities Research Programme (CCRP)](https://colouringcities.org/)
- **Coordinación Académica Internacional:** University of Cambridge (Department of Architecture), The Alan Turing Institute, University College London (CASA).
- **Fuentes de Datos Espaciales:**
  - [OpenStreetMap Contributors](https://www.openstreetmap.org/) (ODbL)
  - [Microsoft Global Building Footprints](https://github.com/microsoft/GlobalMLBuildingFootprints)
  - [Alcaldía Municipal de Montería](https://www.monteria.gov.co/) / [Colombia en Mapas](https://www.colombiaenmapas.gov.co/) (Servicio 10642)
