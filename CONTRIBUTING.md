## Convención para Nombres de Ramas
Los nombres de ramas deben indicar el tipo de trabajo siguiendo este formato:

- `fix/123-descripcion-corta` - Para correcciones de errores (incluir número de issue)
- `feature/descripcion` - Para nuevas funcionalidades
- `feature/123-descripcion-corta` - Para funcionalidades relacionadas con issues
- `docs/actualizar-readme` - Para cambios en documentación
- `data/agregar-edificios-monteria` - Para actualizaciones de datos

Ejemplos:
* `fix/45-tipos-edificios-faltantes` - Corrige el issue #45 sobre tipos de edificios
* `feature/agregar-eficiencia-energetica` - Añade nueva funcionalidad de eficiencia energética
* `data/actualizar-limites-monteria` - Actualiza datos de límites de Montería

## Mensajes de Commit
- Comenzar con mayúscula
- Usar tiempo presente ("Agrega" en lugar de "Agregó")
- Ser conciso pero descriptivo

Correcto: "Actualiza configuración del mapa base de Montería"
Evitar: "actualicé configuración del mapa"

## Adaptación de la Plataforma para Montería
Al adaptar la plataforma Colouring Cities Core para Montería:

1. Reemplaza referencias específicas de Britain/Londres con:
   - "Montería" para la implementación local
   - "Colouring Cities" para la plataforma global

2. Reporta elementos específicos de ubicación:
   - Abriendo un issue con la etiqueta "localización"
   - Enviando un pull request con las correcciones

3. Para nuevas funcionalidades:
   - Usa variables configurables en `cc-config.json`
   - Evita codificar valores específicos de Montería
   - Documenta nuevas opciones de configuración

Archivos clave para personalizar:
- `app/src/cc-config.json` - Configuración principal
- `app/src/locales/en.json` - Textos de la interfaz
- `app/map_styles/` - Estilos visuales del mapa

## Guía para Contribuciones
1. **Reporte de problemas**:
   - Usa issues para reportar bugs o sugerir mejoras
   - Incluye capturas de pantalla cuando sea relevante

2. **Envío de cambios**:
   - Haz fork del repositorio y crea una rama nueva
   - Envía pull requests describiendo los cambios

3. **Estándares de código**:
   - Sigue la estructura existente del proyecto
   - Comenta tu código cuando sea necesario
   - Mantén consistencia en el estilo
