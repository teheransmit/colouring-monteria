# Colouring Montería

Plataforma colaborativa para mapear y analizar edificaciones en Montería,
Colombia. Es una adaptación de [Colouring Cities](https://github.com/colouring-cities)
del [Alan Turing Institute](https://www.turing.ac.uk/), bajo licencia GPLv3.

## Estado actual

- **Cobertura publicada:** 36.206 polígonos de edificaciones procedentes de
  OpenStreetMap.
- **Recurso GeoJSON:** [`app/public/geometries/monteria_centro.geojson`](app/public/geometries/monteria_centro.geojson).
- **Cobertura geográfica aproximada:** longitud `-75.97905..-75.75991` y
  latitud `8.64124..8.87945`.
- **Importante:** los polígonos representan la fuente OSM disponible; no
  equivalen todavía a un catastro oficial completo de todo el municipio.
- **Persistencia:** el GeoJSON se sirve desde la aplicación. La importación a
  PostgreSQL/PostGIS es un paso separado y requiere que la base de datos esté
  disponible.

## Inicio rápido en desarrollo

### Requisitos

- Node.js 16 o superior
- npm
- Python 3.8 o superior para tareas ETL opcionales
- Docker Desktop y Docker Compose si se desea ejecutar PostgreSQL/PostGIS

### Aplicación local sin PostgreSQL

La aplicación tiene un modo de desarrollo con sesión local y almacenamiento
temporal persistente para probar ediciones:

```powershell
cd app
npm install
npm start
```

Abrir <http://localhost:8080>.

Los scripts disponibles están definidos en [`app/package.json`](app/package.json):

```text
npm start       Inicia el servidor de desarrollo
npm run build   Genera la compilación de producción
npm test        Ejecuta las pruebas
npm run lint    Ejecuta ESLint
npm run start:prod  Inicia la compilación de producción
```

### Aplicación con PostgreSQL/PostGIS

Con Docker Desktop instalado:

```powershell
docker compose up --build
```

La aplicación queda disponible en <http://localhost:8080> y PostgreSQL en el
puerto `5432`. Las variables de conexión se configuran en
[`docker-compose.yml`](docker-compose.yml). Para entornos compartidos o
producción, reemplazar las credenciales de ejemplo por secretos gestionados
fuera del repositorio.

## Datos y flujo de polígonos

El flujo de datos se divide en tres partes:

1. **Descarga:** [`configuration/fetch_osm_buildings.py`](configuration/fetch_osm_buildings.py)
   consulta huellas de edificaciones de OpenStreetMap.
2. **Conversión:** [`configuration/generate_footprint_import_sql.py`](configuration/generate_footprint_import_sql.py)
   genera SQL para cargar geometrías en PostGIS.
3. **Visualización:** el frontend carga el GeoJSON público desde
   `/geometries/monteria_centro.geojson`.

La cobertura puede tener vacíos en barrios periféricos o zonas con menor
cartografía OSM. Antes de presentar el resultado como catastro completo, se
debe comparar con el perímetro urbano oficial y deduplicar las fuentes.

## Configuración de Montería

| Parámetro | Valor actual |
|---|---|
| Centro del mapa | 8.7489° N, -75.8814° W |
| Ciudad | Montería, Colombia |
| Puerto web local | 8080 |
| Base de datos | PostgreSQL + PostGIS |

## Bitácora

Las actividades realizadas por asistentes de IA se registran en
[`BITACORA_IA.md`](BITACORA_IA.md), con fecha, hora, cambios, validación y
pendientes.

## Origen y atribución

Este proyecto adapta el código abierto de
[Colouring Cities](https://github.com/colouring-cities/colouring-core) del
Alan Turing Institute. Los datos de edificaciones OSM deben conservar la
atribución y licencia correspondiente.

## Licencia

El código de este proyecto se distribuye bajo
[GNU General Public License v3](https://www.gnu.org/licenses/gpl-3.0/).
