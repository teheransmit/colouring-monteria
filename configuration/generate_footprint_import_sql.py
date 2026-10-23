''' Generate an SQL Script to insert Colouring Cities building footprints from GEOJSON Data '''

import json
import os

INPUT_DIRECTORY = "C:/Users/Luis/colouring-monteria/configuration/"
INPUT_FILENAME = "monteria_completa.geojson"
OUTPUT_FILENAME = "C:/Users/Luis/colouring-monteria/configuration/generate_footprints.sql"

OUTPUT = []

print(f"Generando script SQL en: '{OUTPUT_FILENAME}' ... ")

OUTPUT.append("DROP TABLE IF EXISTS new_geometries;\n")
OUTPUT.append("""CREATE TABLE IF NOT EXISTS new_geometries (
    source_id varchar(30),
    geometry_geom geometry(GEOMETRY, 3857)
);\n""")

IDENTIFIER_COUNTER = 1

def file_location():
    return INPUT_DIRECTORY

def file_location_name():
    return INPUT_FILENAME

def location_code():
    return "mon"

def fake_toid_prefix():
    return 'mon_bld_'

def files_loaded():
    return [
        os.path.join(file_location(), file_location_name())
    ]

def load_into_table(table, geojson_file):
    global IDENTIFIER_COUNTER

    with open(geojson_file, 'r', encoding="utf-8-sig") as content_file:
        content = content_file.read()
        data = json.loads(content)
        insert_prefix = "INSERT INTO " + table + "(source_id, geometry_geom) VALUES"

        OUTPUT.append(insert_prefix)

        values = []

        for entry in data["features"]:
            geometry_type = entry["geometry"]["type"]

            if geometry_type == 'MultiPolygon':
                for ring in entry["geometry"]["coordinates"]:
                    for coord_list in ring:
                        for coord in coord_list:
                            lon, lat = coord[0], coord[1]
                            if not (-180 <= lon <= 180 and -90 <= lat <= 90):
                                raise Exception("out of bounds coordinate")
            elif geometry_type == 'Polygon':
                for coord_list in entry["geometry"]["coordinates"]:
                    for coord in coord_list:
                        lon, lat = coord[0], coord[1]
                        if not (-180 <= lon <= 180 and -90 <= lat <= 90):
                            raise Exception("out of bounds coordinate")

            object_id = fake_toid_prefix() + str(IDENTIFIER_COUNTER)

            if len(object_id) > 30:
                raise Exception(f"Object id too long: {object_id}")

            values.append("('" + object_id + "', ST_Transform(ST_GeomFromGeoJSON('" + json.dumps(entry["geometry"]) + "'), 3857))")

            IDENTIFIER_COUNTER += 1
            grouping = 5_000

            if len(values) >= grouping:
                OUTPUT.append(" " + ", ".join(values) + ";\n")
                values = []
                OUTPUT.append(insert_prefix)

        if len(values) > 0:
            OUTPUT.append(" " + ", ".join(values) + ";\n")
        else:
            if OUTPUT[-1] == insert_prefix:
                OUTPUT.pop()

for file in files_loaded():
    load_into_table("new_geometries", file)

OUTPUT.append("""INSERT INTO geometries ( source_id, geometry_geom )
         SELECT source_id, geometry_geom
         FROM new_geometries;\n""")
OUTPUT.append("""INSERT INTO buildings ( geometry_id, ref_toid )
         SELECT geometry_id, source_id
         FROM geometries AS g
         WHERE EXISTS ( SELECT source_id
                        FROM new_geometries AS ng
                        WHERE g.source_id = ng.source_id);\n""")
OUTPUT.append("DROP TABLE IF EXISTS new_geometries;\n")
OUTPUT.append("REINDEX TABLE geometries;\n")
OUTPUT.append("REINDEX TABLE buildings;\n")

with open(OUTPUT_FILENAME, 'w', newline='', encoding="utf8") as f:
    for row in OUTPUT:
        f.write(row)

print("¡SQL generado exitosamente!")
