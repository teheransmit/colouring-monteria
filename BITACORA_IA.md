# Bitácora de trabajo con IA

Este archivo registra las actividades realizadas por asistentes de inteligencia
artificial en el proyecto **Colouring Montería**.

## Instrucciones obligatorias para cualquier IA

Al terminar cada tarea realizada en este repositorio, el asistente debe agregar
una nueva entrada al final de este archivo. La entrada debe incluir:

- **Fecha y hora:** usar el formato `YYYY-MM-DD HH:mm` y la zona horaria
  local del proyecto (`America/Bogota`, UTC-05:00).
- **Asistente:** nombre del asistente o herramienta utilizada, si se conoce.
- **Solicitud:** resumen de lo que pidió el usuario.
- **Trabajo realizado:** cambios, decisiones y archivos afectados.
- **Validación:** pruebas, comandos o verificaciones ejecutadas y sus resultados.
- **Pendientes o incidencias:** asuntos que queden sin resolver; escribir
  `Ninguno` cuando no haya pendientes.

### Reglas de mantenimiento

1. Agregar las entradas en orden cronológico, de la más antigua a la más
   reciente.
2. No borrar ni modificar entradas anteriores, excepto para corregir un error
   factual claramente identificado.
3. No registrar contraseñas, tokens, claves privadas ni otros secretos.
4. Si la tarea no modifica archivos, registrar igualmente la consulta, el
   resultado y la validación realizada.
5. Si el asistente no puede escribir en el repositorio, debe entregar el
   reporte con este mismo formato para que el usuario lo agregue manualmente.
6. Estas instrucciones son una convención del proyecto: cada herramienta de IA
   debe leer este archivo al comenzar una tarea y cumplirlo al finalizarla.

## Entradas

### 2026-10-23 16:39 (America/Bogota, UTC-05:00)

- **Asistente:** Copilot usando Copilot SDK en VS Code.
- **Solicitud:** Crear un archivo Markdown para que cualquier IA deje un
  reporte fechado y con hora, manteniendo una bitácora del trabajo del proyecto.
- **Trabajo realizado:** Se creó `BITACORA_IA.md` con instrucciones obligatorias,
  formato de reporte, reglas de mantenimiento y esta primera entrada.
- **Validación:** Se revisó la documentación Markdown existente del proyecto
  para mantener una convención compatible. No aplica ejecución de pruebas por
  tratarse de un cambio documental.
- **Pendientes o incidencias:** Ninguno.

### 2026-10-23 16:40 (America/Bogota, UTC-05:00)

- **Asistente:** Copilot usando Copilot SDK en VS Code.
- **Solicitud:** Investigar información pública del Centro Comercial Alamedas
  del Sinú y hacer una prueba editando la información de su polígono.
- **Trabajo realizado:** Se identificó el polígono OSM `39256532` en el
  GeoJSON de Montería. Con información del sitio oficial
  [alamedascc.com](https://alamedascc.com/) y su página de [horarios](https://alamedascc.com/horarios/)
  se guardaron en el almacenamiento local de desarrollo el nombre, el enlace
  oficial, la dirección `Calle 44 # 10-91`, la ciudad `Montería` y el código
  postal `230002`. El cambio quedó en `data/local_buildings_store.json` como
  prueba de edición del polígono.
- **Validación:** La API local `POST /api/buildings/39256532.json` respondió
  `200`, y `GET /api/buildings/39256532.json` devolvió los valores editados con
  tildes correctas. Se abrió
  `http://localhost:8080/view/location/39256532` para revisar la vista del
  polígono. Los horarios oficiales consultados son: locales comerciales de
  lunes a sábado de 10:00 a.m. a 8:00 p.m.; domingos y festivos de 11:00 a.m.
  a 7:00 p.m.; plazoleta y restaurantes según el día.
- **Pendientes o incidencias:** La edición se realizó en el almacenamiento
  local de desarrollo, no en una base de datos de producción. Los horarios se
  documentaron en la bitácora, pero no se guardaron como atributo porque el
  modelo actual no expone un campo específico para horarios.

### 2026-10-23 16:45 (America/Bogota, UTC-05:00)

- **Asistente:** Copilot usando Copilot SDK en VS Code.
- **Solicitud:** Obtener todos los polígonos de Montería y subirlos a
  Colouring Montería.
- **Trabajo realizado:** Se verificó que
  `app/public/geometries/monteria_centro.geojson` ya contiene y sirve 36.206
  polígonos OSM de tipo `Polygon`. La cobertura publicada tiene una extensión
  aproximada de longitud `-75.97905..-75.75991` y latitud
  `8.64124..8.87945`. También se revisó el flujo de importación SQL de
  geometrías para distinguir el archivo público del contenido de la base de
  datos.
- **Validación:** El endpoint local
  `/geometries/monteria_centro.geojson` respondió HTTP 200 y se confirmaron
  36.206 features. La aplicación local sigue disponible en
  `http://localhost:8080`.
- **Pendientes o incidencias:** Docker y PostgreSQL no están disponibles en el
  equipo actual, por lo que no se pudo importar este conjunto a la base de
  datos ni publicarlo en un servidor remoto. “Todos” debe entenderse por ahora
  como todos los polígonos OSM del conjunto descargado, no como un catastro
  oficial completo de todo el municipio. El script de descarga existente aún
  usa una caja geográfica más pequeña y requiere una consulta de cobertura
  municipal validada antes de sustituirlo.

### 2026-10-23 16:48 (America/Bogota, UTC-05:00)

- **Asistente:** Copilot usando Copilot SDK en VS Code.
- **Solicitud:** Estimar cuánto falta para terminar los polígonos de la ciudad
  de Montería, porque la vista muestra zonas sin polígonos.
- **Trabajo realizado:** Se analizó la cobertura espacial del conjunto actual
  de 36.206 polígonos y la imagen compartida del mapa. Dentro de la caja
  aproximada del casco urbano (`-75.910..-75.860`, `8.720..8.780`) hay
  23.655 polígonos, equivalentes al 65,3% del conjunto total; el 34,7%
  restante está fuera de esa caja. También se compararon celdas espaciales de
  aproximadamente 200 m con el archivo de huellas Microsoft disponible
  localmente: 447 de 609 celdas coinciden, aproximadamente 73,4%.
- **Validación:** La estimación combinada indica un avance aproximado de
  **60–75%**, con una cifra central cercana al **70%** de cobertura espacial
  de edificaciones urbanas. El endpoint local continúa respondiendo con
  36.206 features. La cifra no representa un porcentaje catastral oficial,
  porque no existe todavía un inventario completo y validado de referencia.
- **Pendientes o incidencias:** Faltan polígonos principalmente en zonas
  periféricas y sectores donde las fuentes no coinciden. Para calcular un
  porcentaje oficial se necesita obtener el perímetro urbano de IGAC/POT,
  elegir una fuente de huellas de referencia y medir cobertura por
  intersección, además de importar y deduplicar los polígonos en PostgreSQL.

### 2026-10-23 16:56 (America/Bogota, UTC-05:00)

- **Asistente:** Copilot usando Copilot SDK en VS Code.
- **Solicitud:** Confirmar si los polígonos actuales están guardados en la base
  de datos y en el repositorio de GitHub, y revisar si el repositorio necesita
  actualización.
- **Trabajo realizado:** Se comparó el repositorio local con
  `teheransmit/colouring-monteria`, cuya rama principal es
  `development-workshop`. GitHub contiene el GeoJSON anterior de
  `app/public/geometries/monteria_centro.geojson`, de 1.139.199 bytes y
  aproximadamente 3.289 polígonos. El archivo ampliado local contiene 36.206
  polígonos y mide 11.515.155 bytes, pero está sin seguimiento de Git. También
  se confirmó que la edición de Alamedas vive en el almacenamiento local de
  desarrollo, no en PostgreSQL.
- **Validación:** La rama local está 4 commits detrás de
  `origin/development-workshop` y no tiene commits propios pendientes de
  publicar. GitHub no contiene `configuration/generate_footprints.sql` ni una
  importación de los 36.206 polígonos. El endpoint local sí sirve los 36.206
  polígonos.
- **Pendientes o incidencias:** Sí se debe actualizar el proyecto: primero
  sincronizar los 4 commits remotos, después revisar y publicar el GeoJSON
  ampliado, y finalmente importar los polígonos a PostgreSQL/PostGIS. No se
  hizo push ni se alteró GitHub en esta revisión; Docker/PostgreSQL siguen sin
  estar disponibles localmente.

### 2026-10-23 16:57 (America/Bogota, UTC-05:00)

- **Asistente:** Copilot usando Copilot SDK en VS Code.
- **Solicitud:** Autorizar a Copilot para hacer los cambios directamente en
  GitHub.
- **Trabajo realizado:** Se sincronizaron los 4 commits pendientes de
  `origin/development-workshop` y se recuperó el GeoJSON ampliado de 36.206
  polígonos desde el trabajo local preservado. Se preparó también esta
  bitácora para publicarla junto con el dataset.
- **Validación:** La rama local quedó alineada con GitHub antes de preparar
  los cambios. El GeoJSON recuperado se validó como `FeatureCollection` con
  36.206 features de tipo `Polygon`. Se excluyeron del commit los archivos
  temporales, imágenes de análisis, archivos comprimidos y artefactos locales
  no necesarios.
- **Pendientes o incidencias:** La base de datos PostgreSQL todavía requiere
  una importación separada cuando el servicio esté disponible.

### 2026-10-23 16:58 (America/Bogota, UTC-05:00)

- **Asistente:** Copilot usando Copilot SDK en VS Code.
- **Solicitud:** Publicar los cambios autorizados directamente en el repositorio
  de GitHub.
- **Trabajo realizado:** Se publicó el commit `403105ab`
  (`feat: publish expanded Monteria building coverage`) en la rama
  `development-workshop` de
  `teheransmit/colouring-monteria`. El commit contiene el GeoJSON ampliado y
  esta bitácora.
- **Validación:** GitHub confirmó el archivo remoto con 11.515.159 bytes y la
  rama local y remota quedaron alineadas. Los archivos temporales, datos
  auxiliares y cambios locales no relacionados permanecen fuera del commit.
- **Pendientes o incidencias:** Los 36.206 polígonos ya están publicados en el
  repositorio, pero todavía falta importarlos a PostgreSQL/PostGIS para que
  formen parte de la base de datos de la aplicación.

### 2026-10-23 17:03 (America/Bogota, UTC-05:00)

- **Asistente:** Copilot usando Copilot SDK en VS Code.
- **Solicitud:** Revisar si el README de GitHub está correcto y actualizarlo
  cuando sea necesario.
- **Trabajo realizado:** Se actualizó `README.md` para corregir el comando de
  inicio (`npm start`), cerrar correctamente los bloques de código, documentar
  los scripts disponibles, agregar el uso opcional de Docker/PostgreSQL,
  describir el flujo ETL y registrar la cobertura publicada de 36.206
  polígonos OSM junto con sus limitaciones.
- **Validación:** Se comparó la documentación con `app/package.json`,
  `docker-compose.yml` y el GeoJSON publicado. Se conservaron fuera del cambio
  los archivos temporales y modificaciones locales no relacionadas.
- **Pendientes o incidencias:** La importación de polígonos a PostgreSQL/PostGIS
  sigue siendo un paso separado y requiere que el servicio esté disponible.
