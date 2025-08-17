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
