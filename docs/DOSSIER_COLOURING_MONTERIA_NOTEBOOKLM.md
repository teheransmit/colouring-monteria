# Dossier Maestro: Colouring Montería y el Programa Internacional Colouring Cities

> **Proyecto:** Colouring Montería  
> **Institución Académica Líder:** Universidad Pontificia Bolivariana (UPB), Seccional Montería — Facultad de Ingeniería Civil  
> **Investigador Principal:** Santiago Smit Teherán Mogollón (`teheransmit`)  
> **Marco Internacional:** Colouring Cities Research Programme (CCRP), University of Cambridge & The Alan Turing Institute  
> **Licencia:** Código en GNU GPLv3 | Datos en ODC-ODbL | Manual en MIT License  
> **Repositorio Oficial:** https://github.com/teheransmit/colouring-monteria  
> **Red Internacional:** https://colouringcities.org/  

---

## 1. Misión, Visión y Contexto Global de Colouring Cities

### ¿Qué es el Colouring Cities Research Programme (CCRP)?
El **Colouring Cities Research Programme (CCRP)** es una iniciativa internacional de ciencia abierta fundada y dirigida por la investigadora **Polly Hudson** (`pavh2@cam.ac.uk`). 
* Fue incubada originalmente en el **Centre for Advanced Spatial Analysis (CASA)** de **University College London (UCL)** (2014-2019).
* Se escaló y estandarizó como programa de investigación en **The Alan Turing Institute** (Londres, 2020-2025).
* Actualmente, su sede de investigación global opera en el **Departamento de Ciencias de la Computación y Tecnología de la Universidad de Cambridge** (Reino Unido).

### El Problema de Escala Planetaria
A nivel mundial, los edificios son responsables de aproximadamente el **40% de las emisiones de gases de efecto invernadero relacionadas con la energía** y del **50% de todos los materiales extraídos en la Tierra** (UNFCCC, 2023). A pesar de su impacto crítico en la economía, la salud pública, la habitabilidad y el cambio climático, la información sobre edificaciones en la mayoría de ciudades del mundo está:
1. **Altamente fragmentada:** Dispersa entre notarías, oficinas de catastro, secretarías de planeación, empresas de servicios públicos y aseguradoras.
2. **Privatizada o comercial:** Encerrada tras muros de pago o bases de datos propietarias inaccesibles para la investigación pública.
3. **Incompleta y desactualizada:** Carente de series temporales sobre antigüedad de construcción, materiales estructurales o reformas pasadas.
4. **Agregada:** Disponible solo a nivel de código postal o comuna, impidiendo el análisis espacial detallado edificio por edificio.

### La Solución: La Huella del Edificio como "Archivador en Miniatura" (*Mini Filing Cabinet*)
Colouring Cities resuelve esta desconexión convirtiendo cada polígono georreferenciado de edificación (*building footprint*) en un **contenedor digital abierto**. Al hacer clic sobre cualquier techo en el mapa, se accede a un conjunto estandarizado de **12 categorías de datos maestros** con más de 150 atributos, permitiendo correlacionar edad, materiales, uso del suelo, riesgo de inundación y eficiencia energética.

---

## 2. Las 12 Categorías Maestras de Datos (Core Data Categories)

Todos los nodos del consorcio mundial (Colouring London, Melbourne, Atenas, Dresden, Estocolmo, Montería) operan sobre las mismas 12 dimensiones:

1. **Location & ID (Ubicación e Identificación):**
   * Coordenadas geométricas precisas, identificador único (TOID) y cruce con el **Número Predial Nacional (NPN de 30 dígitos)** de Colombia.
2. **Land Use & Economic Activity (Uso del Suelo y Actividad Económica):**
   * Destino económico: residencial, comercial, industrial, institucional, asistencial, recreativo o mixto.
3. **Building Type & Form (Tipología y Forma Edilicia):**
   * Altura en metros, número de niveles/pisos, morfología (adosada, aislada, bloque en manzana, conjunto cerrado).
4. **Size (Dimensiones y Áreas):**
   * Área de huella en planta ($\text{m}^2$), área total construida, volumen cúbico y factor de ocupación del lote.
5. **Construction & Materials (Sistemas Constructivos y Materiales):**
   * Sistema estructural portante (pórticos de concreto armado, mampostería confinada, mampostería no reforzada, madera, perfiles de acero, bahareque) y material de cubierta (teja de barro, lámina de zinc, losa impermeabilizada, fibrocemento).
   * **Relevancia:** Clave para calcular el **carbono embebido (*embodied carbon*)** y la vulnerabilidad sísmica.
6. **Age & History (Antigüedad e Historia):**
   * Año exacto o década de construcción, periodos históricos de expansión de Montería, reformas estructurales mayores y demoliciones registradas en el predio.
7. **Street & Green Context (Contexto Urbano y Cobertura Verde):**
   * Ancho de vía y andén, tipología de servidumbre, arbolado urbano frontal, proximidad a parques y distancia a la ronda de protección del Río Sinú.
8. **Planning & Protection (Planeación y Protección Patrimonial):**
   * Clasificación en el Plan de Ordenamiento Territorial (POT de Montería), zonas de conservación patrimonial (Bienes de Interés Cultural - BIC) y restricciones de edificación.
9. **Energy Performance (Desempeño Energético y Térmico):**
   * Tipología de ventilación (natural vs. climatización artificial / aire acondicionado), envolvente térmica, consumo eléctrico estimado y potencial para energía solar fotovoltaica en techos.
10. **Resilience & Live Disaster Management (Resiliencia y Gestión de Emergencias):**
    * **El núcleo de mayor impacto para Montería:** Cota de amenaza por inundación por desbordamiento del Río Sinú, susceptibilidad ante lluvias torrenciales y encharcamientos pluviales, erosión de márgenes y vulnerabilidad ante olas de calor extremo. Mapeo en vivo de daños estructurales durante desastres.
11. **Community Value (Valor Comunitario y Social):**
    * Percepción barrial de habitabilidad, arraigo cultural de inmuebles históricos y equipamientos comunitarios clave (juntas de acción comunal, comedores, canchas).
12. **Building Team & Ownership (Diseño, Construcción y Propiedad):**
    * Diseñadores, arquitectos, firmas de ingeniería estructural constructoras y tipología jurídica de tenencia (propiedad privada individual, propiedad horizontal, predio fiscal o público).

---

## 3. Estado del Proyecto Colouring Montería (Octubre 2026)

Colouring Montería es el **primer nodo operativo en Colombia y en una cuenca urbana del trópico húmedo latinoamericano**.

### A. Cobertura Espacial Consolidada (Sin Solapes)
* **51.419 Edificaciones Consolidadas:**
  * **36.137 huellas de OpenStreetMap:** Con nombres, pisos, direcciones y equipamientos verificados por comunidad.
  * **15.282 huellas satelitales de Microsoft:** Integradas para cubrir zonas periféricas (Cantaclaro, Furatena, Mogambo, Garzones, La Pradera) y la Margen Izquierda completa.
* **Depuración Topológica 100% Limpia:**
  * Se desarrolló y ejecutó el algoritmo `clean_overlapping_footprints.py` mediante indexación espacial `shapely.strtree.STRtree`.
  * Se eliminaron 1.252 huellas satelitales redundantes y 69 clones internos de OSM.
  * **Pares con solape residual (>5% de área): 0.** Cobertura urbana real superior al **90%**.

### B. Cartografía Básica 1:1.000 Oficial de la Alcaldía de Montería e IGAC
* **Servicio 10642 de Colombia en Mapas (`colombiaenmapas.gov.co`):**
  * Producto oficial: *Base de datos vectorial básica. Cabecera Municipal de Montería. Escala 1:1.000. Año 2023/2024*.
  * Elaborado por la **Alcaldía Municipal de Montería** mediante fotografías aéreas del sensor fotogramétrico **FOIF modelo A90**.
  * **22.362 construcciones poligonales oficiales (`Constr_R.shp`)** en sistema `EPSG:9377` (CTM12), reproyectadas a WGS84 (`EPSG:4326`).
* **Geoservicios Oficiales del IGAC Disponibles:**
  * WMS: `https://mapas2.igac.gov.co/server3/services/carto/carto1000monteria23001000/MapServer/WMSServer?request=GetCapabilities&service=WMS`
  * WFS: `https://mapas2.igac.gov.co/server3/services/carto/carto1000monteria23001000/MapServer/WFSServer?request=GetCapabilities&service=WFS`
  * REST: `https://mapas2.igac.gov.co/server3/rest/services/carto/carto1000monteria23001000/MapServer`

### C. Arquitectura Frontend de Alto Rendimiento (60 FPS)
* **Aceleración por GPU (Canvas):** Leaflet configurado con `preferCanvas={true}` y `L.canvas({ padding: 0.5 })` para eliminar el cuello de botella de los 50.000 nodos SVG del DOM.
* **Viewport BBOX Culling:** A partir de $\text{zoom} \ge 14$, el motor espacial filtra en menos de 2 milisegundos únicamente los edificios dentro de la vista actual (`map.getBounds()`), renderizando entre 500 y 2.500 polígonos de forma fluida.
* **Selector Dinámico de Capas:**
  * 🟠 Consolidada (51.419 huellas)
  * 🏛️ Oficial Alcaldía 1:1.000 (22.362 huellas en azul cian con código catastral)
  * 🔄 Modo Comparativo (ambas simultáneas)
* **Persistencia Local:** En modo desarrollo, las ediciones de atributos se guardan automáticamente en `data/local_buildings_store.json` con sesión simulada `dev-santiago` en memoria (sin requerir base de datos PostgreSQL activa).

### D. Proyecto QGIS Optimizado (`QGIS_Colouring_Monteria.qgz`)
* Conectado en tiempo real mediante el plugin y servidor **`qgis-mcp`** en `localhost:9876`.
* Se depuraron 16 capas accesorias pesadas (tapas de alcantarilla, cercas, muros, tuberías).
* Se consolidaron **15 capas estructurales clave:**
  1. `Google Hybrid` (Foto satelital de fondo de alta resolución).
  2. `Colouring Monteria - Edificaciones Consolidadas (51.419)` (Vector maestro).
  3. `Constr_R` (Construcciones oficiales Alcaldía 1:1.000).
  4. `Drenaj_R` y `Drenaj_L` (Río Sinú y canales pluviales urbanos).
  5. `Puente_L` (Puente Metálico, Segundo Centenario).
  6. `Via` (Red vial).
  7. `Ciclor` (Red de ciclorrutas).
  8. `ZVerde` y `ZDura` (Parques, rondas y plazas).
  9. `Bosque` y `DAgua_R` (Coberturas ambientales).
  10. `Embarc` (Pasos de planchones tradicionales).

---

## 4. Enlaces de Interés y Recursos Clave

### Plataformas Internacionales
* **Sitio Web Oficial CCRP:** https://colouringcities.org/
* **Manual de Ciencia Abierta CCRP:** https://github.com/colouring-cities/manual/wiki
* **Repositorio Central CCRP GitHub:** https://github.com/colouring-cities
* **The Alan Turing Institute:** https://www.turing.ac.uk/
* **UCL CASA (Centre for Advanced Spatial Analysis):** https://www.ucl.ac.uk/bartlett/casa/
* **Contacto Global:** Polly Hudson, Cambridge University (`pavh2@cam.ac.uk`)

### Plataformas Nacionales y Locales
* **Colombia en Mapas:** https://www.colombiaenmapas.gov.co/
* **Geoportal IGAC:** https://geoportal.igac.gov.co/
* **Datos Abiertos Colombia:** https://www.datos.gov.co/
* **Alcaldía de Montería:** https://www.monteria.gov.co/
* **Universidad Pontificia Bolivariana (UPB):** https://www.upb.edu.co/es/monteria

---

## 5. Próximos Pasos Técnicos para Santiago
1. **Fusión Alfanumérica con Catastro Multipropósito:** Cruzar las huellas con la base de datos de predios (estratos socioeconómicos, avalúos y destinos económicos) mediante solicitud institucional UPB ante la Secretaría de Planeación de Montería.
2. **Modelado Hidráulico del Río Sinú:** Superponer las cotas de inundación para periodos de retorno de 10, 25, 50 y 100 años (Categoría 10: Resiliencia) para clasificar las edificaciones vulnerables de Montería.
3. **Campaña de Mapeo Universitario (Crowdsourcing):** Talleres con estudiantes de Arquitectura e Ingeniería Civil de la UPB para colorear la edad y materiales del centro histórico y de los barrios de expansión.
