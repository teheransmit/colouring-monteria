# Colouring Montería

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Location](https://img.shields.io/badge/Location-Monter%C3%ADa%2C%20Colombia-008080.svg)](https://www.monteria.gov.co/)
[![Programme](https://img.shields.io/badge/Programme-Colouring%20Cities-purple.svg)](https://colouringcities.org/)

Plataforma abierta y gemelo digital para el mapeo, caracterización y análisis del parque edificado de **Montería, Colombia**.  
Iniciativa académica de la **Universidad Pontificia Bolivariana (UPB Seccional Montería)** vinculada al [Colouring Cities Research Programme (CCRP)](https://colouringcities.org/), coordinado por el Departamento de Arquitectura de la **Universidad de Cambridge** y desarrollado originalmente en **The Alan Turing Institute** y **University College London (UCL)**.

---

## 🎯 Propósito y Visión

Colouring Montería busca democratizar y centralizar el conocimiento sobre las edificaciones urbanas de la ciudad para:
- **Resiliencia Climática:** Identificar la vulnerabilidad ante inundaciones pluviales en la planicie del Río Sinú y mitigar el fenómeno de isla de calor urbana.
- **Sostenibilidad y Energía:** Evaluar tipologías constructivas, coberturas de techos y potencial de captación solar o drenaje sostenible (SUDS).
- **Patrimonio y Memoria Urbana:** Documentar el valor histórico, arquitectónico y cultural del Centro Histórico y la Ronda del Sinú.
- **Planificación Basada en Datos:** Servir como insumo de libre acceso para la academia, la administración pública y la ciudadanía.

---

## ✨ Características Principales

- 🗺️ **Visor Espacial de Alto Rendimiento:** Navegación interactiva y fluida sobre el parque edificado de la cabecera municipal, con aceleración por hardware (GPU Canvas).
- 🏛️ **Integración Catastral y Abierta:** Armonización de cartografía oficial municipal (1:1.000) y capas globales colaborativas (OpenStreetMap).
- 📊 **Estándar de 12 Dimensiones CCRP:** Modelo de datos estructurado para capturar:
  1. *Ubicación e Identificación Catastral*
  2. *Uso del Suelo y Actividades Económicas*
  3. *Año y Época de Construcción*
  4. *Dimensiones y Morfología (Área, Pisos, Altura)*
  5. *Materiales y Sistema Estructural*
  6. *Protección Patrimonial y Bienes de Interés Cultural*
  7. *Planeación y Tratamientos Urbanísticos (POT)*
  8. *Sostenibilidad y Comportamiento Térmico*
  9. *Espacio Público y Entorno Urbano*
  10. *Comunidad y Valor Barrial*
  11. *Dinámica, Ocupación y Modificaciones*
  12. *Trazabilidad y Calidad del Dato*
- 👥 **Ciencia Ciudadana:** Interfaz orientada a la verificación y edición colaborativa por parte de estudiantes, profesionales y residentes.

---

## 🚀 Inicio Rápido en Desarrollo

### Requisitos

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- npm (incluido con Node.js)
- *(Opcional)* Docker Desktop para despliegue con base de datos PostgreSQL/PostGIS

### Instalación y Ejecución Local

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/teheransmit/colouring-monteria.git
   cd colouring-monteria
   ```

2. Instalar dependencias e iniciar el servidor de desarrollo:
   ```bash
   cd app
   npm install
   npm start
   ```

3. Abrir en el navegador:
   **<http://localhost:8080>**

### Scripts Disponibles

Desde la carpeta `app/`:
- `npm start`: Inicia el servidor de desarrollo con recarga en caliente.
- `npm run build`: Compila la aplicación para producción.
- `npm test`: Ejecuta las pruebas unitarias.
- `npm run lint`: Ejecuta el análisis estático de código.

---

## 🏛️ Créditos y Enlaces Académicos

- **Autor y Coordinador:** Santiago Smit Teherán Mogollón ([@teheransmit](https://github.com/teheransmit)) — Estudiante de Ingeniería Civil, Universidad Pontificia Bolivariana (UPB Seccional Montería).
- **Iniciativa Global:** [Colouring Cities Research Programme (CCRP)](https://colouringcities.org/)
- **Instituciones Promotoras:** University of Cambridge (Department of Architecture), The Alan Turing Institute, University College London (CASA).
- **Fuentes de Datos:**
  - [OpenStreetMap Contributors](https://www.openstreetmap.org/) (ODbL)
  - [Alcaldía Municipal de Montería](https://www.monteria.gov.co/) / [Colombia en Mapas - IGAC](https://www.colombiaenmapas.gov.co/)
  - [Microsoft Global Building Footprints](https://github.com/microsoft/GlobalMLBuildingFootprints)

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **GNU General Public License v3.0 (GPLv3)**. Consulta el archivo `LICENSE` para más detalles.
