# Colouring Montería Platform
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

Adaptación para Montería del proyecto Colouring Cities del Alan Turing Institute

## 📚 Origen y Atribución
Este proyecto es una adaptación oficial del código abierto [Colouring Cities](https://github.com/colouring-cities) desarrollado por [The Alan Turing Institute](https://www.turing.ac.uk/). Mantenemos la misma licencia GPL v3 y filosofía de datos abiertos.

[![Repositorio Original](https://img.shields.io/badge/Fuente-Colouring_Cities-blue)](https://github.com/colouring-cities/colouring-core)

## 🌟 ¿Qué es Colouring Montería?
Plataforma colaborativa para mapear y analizar edificaciones en Montería, Colombia. 

**Objetivos principales**:
- 🏙️ Crear el primer catastro abierto de edificaciones de Montería
- 📊 Generar datos para investigación urbana
- 🌿 Promover desarrollo sostenible
- 👥 Fomentar participación ciudadana

## 🗺️ Datos Principales
| **Área**          | **Cobertura**       |
|-------------------|---------------------|
| Localización      | Montería, Colombia  |
| Coordenadas       | 8.7489° N, 75.8814° W |
| Fuentes oficiales | [Datos Abiertos Montería](https://www.monteria.gov.co/) |

**Variables mapeadas**:
- Edad y tipo de construcciones
- Uso del suelo
- Materiales de construcción
- Eficiencia energética
- Estado de conservación

## 🛠️ Instalación Rápida

```bash
# 1. Clonar repositorio
git clone https://github.com/teheransmit/colouring-monteria.git

# 2. Configurar entorno
cd colouring-monteria/app
cp .env.example .env  # Editar con tus credenciales

# 3. Instalar dependencias
npm install

# 4. Iniciar servidor
npm run dev

## 🧰 Requisitos Técnicos

### Dependencias principales
| Tecnología       | Versión  | Instalación Recomendada |
|------------------|----------|-------------------------|
| Node.js          | 16+      | [Descargar Node.js](https://nodejs.org/) |
| PostgreSQL       | 13+      | `sudo apt install postgresql` |
| PostGIS          | 3+       | `sudo apt install postgis` |

### Dependencias opcionales
| Herramienta      | Uso                     | Instalación              |
|------------------|-------------------------|--------------------------|
| Python 3.8+      | ETL de datos            | `sudo apt install python3` |
| GDAL             | Procesamiento geoespacial | `sudo apt install gdal-bin` |
| Docker           | Entorno contenerizado   | [Instalar Docker](https://docs.docker.com/engine/install/) |

## 📜 Licencia y Atribución
[![GPLv3 License](https://img.shields.io/badge/Licencia-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

Este proyecto utiliza la **GNU General Public License v3**, heredada del proyecto original Colouring Cities. Esta licencia garantiza:

```mermaid
graph LR
    A[Libertad de uso] --> B[Puedes ejecutar el software]
    A --> C[Puedes estudiarlo y modificarlo]
    A --> D[Puedes redistribuir copias]
    A --> E[Puedes mejorar el software]

