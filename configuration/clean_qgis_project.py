"""
Script de depuración y optimización de capas en QGIS vía qgis-mcp.
Elimina capas saturadas innecesarias y deja las capas clave para Colouring Montería.
"""

import qgis_mcp.server as s

# Capas que sobrecargan la vista y no aportan a la edificación urbana
LAYERS_TO_REMOVE = {
    "TSPubl",   # Tapas de servicio público (miles de puntos)
    "RATens",   # Redes de alta tensión
    "Tuberi",   # Tuberías
    "SVial",    # Señalización vial
    "Muro",     # Muros perimetrales
    "Cerca",    # Cercas
    "LDemar",   # Líneas de demarcación
    "LVia",     # Límites de calzada (redundante con Via)
    "PDistr",   # Puntos de distribución
    "Pozo",     # Pozos
    "Puente_P", # Puentes puntuales
    "Constr_P", # Construcciones puntuales menores
    "BArena",   # Bancos de arena
    "VFerre",   # Vía férrea
    "MDANMu",   # Capa de prueba oculta
    "monteria_buildings" # Capa vieja desactualizada
}

def main():
    print("Conectando con la sesión activa de QGIS...")
    proj_info = s._send_sync("get_project_info")
    print(f"Proyecto abierto: {proj_info.get('filename')}")

    layers_res = s._send_sync("get_layers")
    layers = layers_res.get("layers", [])
    print(f"Total de capas actuales: {len(layers)}")

    removed_count = 0
    kept_layers = []

    for l in layers:
        l_name = l.get("name")
        l_id = l.get("id")
        if l_name in LAYERS_TO_REMOVE:
            print(f" - Eliminando capa innecesaria: {l_name} (ID: {l_id})")
            try:
                s._send_sync("remove_layer", {"layer_id": l_id})
                removed_count += 1
            except Exception as e:
                print(f"   Error al eliminar {l_name}: {e}")
        else:
            kept_layers.append(l_name)

    print(f"\nCapas eliminadas: {removed_count}")
    print(f"Capas conservadas ({len(kept_layers)}):")
    for k in kept_layers:
        print(f"  [OK] {k}")

    # Agregar la capa maestra consolidada y limpia (51.419 huellas)
    consolidada_path = r"C:\Users\Luis\colouring-monteria\configuration\monteria_completa.geojson"
    print(f"\nAgregando capa definitiva: {consolidada_path}...")
    try:
        new_layer = s._send_sync("add_vector_layer", {
            "path": consolidada_path,
            "name": "Colouring Monteria - Edificaciones Consolidadas (51.419)"
        })
        print("[OK] Capa 'Colouring Monteria - Edificaciones Consolidadas (51.419)' agregada con exito!")
    except Exception as e:
        print(f"Error al agregar capa consolidada: {e}")

    # Guardar el proyecto QGIS
    print("\nGuardando cambios en el proyecto QGIS...")
    try:
        s._send_sync("save_project")
        print("[OK] Proyecto QGIS guardado exitosamente!")
    except Exception as e:
        print(f"Error al guardar proyecto: {e}")

if __name__ == "__main__":
    main()
