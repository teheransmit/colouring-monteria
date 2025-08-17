# Colouring Montería Platform
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

Plataforma de mapeo colaborativo para el análisis de edificaciones en Montería, Colombia.

## 📍 Acerca del Proyecto
¿Cuántos edificios existen en Montería? ¿Qué características tienen? ¿Cómo funcionan para sus usuarios y comunidades locales? 

Colouring Montería es un **recurso público gratuito** que provee datos espaciales abiertos sobre las edificaciones de la ciudad. Desarrollado como adaptación del programa de investigación [Colouring Cities](http://colouringcities.org/), esta iniciativa busca:

- Mapear y caracterizar todas las edificaciones de Montería
- Promover el desarrollo urbano sostenible
- Generar datos abiertos para investigadores y tomadores de decisiones
- Fomentar la participación ciudadana en el conocimiento urbano

## 🗺️ Datos del Proyecto
- **Área de cobertura**: Área metropolitana de Montería
- **Fuentes principales**: 
  - OpenStreetMap
  - Planes de ordenamiento territorial
  - Datos abiertos municipales
- **Variables mapeadas**:
  - Edad y tipología de construcciones
  - Uso del suelo
  - Estado de conservación
  - Infraestructura verde

## 🛠️ Configuración Técnica

### Requisitos
- Node.js 16+
- PostgreSQL 13+
- PostGIS 3+

### Instalación
```bash
# Clonar repositorio
git clone https://github.com/teheransmit/colouring-monteria.git
cd colouring-monteria/app

# Instalar dependencias
npm install

# Configurar variables de entorno (crear archivo .env)
cp .env.example .env
