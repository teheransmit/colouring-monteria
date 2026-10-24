import zipfile
import xml.etree.ElementTree as ET
import os

qgz_path = r"C:\Users\Luis\colouring-monteria\configuration\QGIS_Colouring_Monteria.qgz"
if not os.path.exists(qgz_path):
    qgz_path = r"G:\Mi unidad\colouring-monteria\configuration\QGIS_Colouring_Monteria.qgz"

print(f"Inspeccionando {qgz_path}...")
with zipfile.ZipFile(qgz_path, "r") as z:
    for filename in z.namelist():
        if filename.endswith(".qgs"):
            print(f"Encontrado archivo de proyecto: {filename}")
            content = z.read(filename)
            root = ET.fromstring(content)
            
            # Map layers
            layers = root.findall(".//maplayer")
            print(f"\nTotal de capas en el proyecto: {len(layers)}\n")
            for i, l in enumerate(layers):
                name = l.find("layername")
                l_type = l.get("type")
                datasource = l.find("datasource")
                crs = l.find(".//crs/authid")
                name_str = name.text if name is not None else "Sin nombre"
                ds_str = datasource.text if datasource is not None else "Sin origen"
                crs_str = crs.text if crs is not None else "N/D"
                print(f"[{i+1}] \"{name_str}\" | Tipo: {l_type} | CRS: {crs_str}")
                print(f"     Datasource: {ds_str}")
