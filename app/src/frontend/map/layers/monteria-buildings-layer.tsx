import { GeoJsonObject } from 'geojson';
import React, { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';

import { apiGet } from '../../apiHelpers';

export function MonteriaBuildingsLayer() {
    const [buildingsGeojson, setBuildingsGeojson] = useState<GeoJsonObject>(null);

    useEffect(() => {
        apiGet('/geometries/monteria_centro.geojson')
            .then(data => setBuildingsGeojson(data as GeoJsonObject))
            .catch(err => console.warn('Could not load Monteria buildings:', err));
    }, []);

    const onEachFeature = (feature: any, layer: any) => {
        const props = feature.properties || {};
        const name = props.name || 'Edificación';
        const type = props.building !== 'yes' ? props.building : 'Urbano';
        const levels = props.levels ? `${props.levels} piso(s)` : 'No registrado';
        const id = feature.id || props.osm_id || '';

        layer.bindPopup(`
            <div style="font-family: sans-serif; min-width: 160px; color: #222;">
                <h4 style="margin: 0 0 6px 0; color: #E65100; font-size: 14px; font-weight: bold;">${name}</h4>
                <p style="margin: 2px 0; font-size: 12px;"><b>Uso:</b> ${type}</p>
                <p style="margin: 2px 0; font-size: 12px;"><b>Pisos:</b> ${levels}</p>
                <p style="margin: 4px 0 0 0; font-size: 10px; color: #888;">OSM ID: ${id}</p>
            </div>
        `);

        layer.on({
            mouseover: (e: any) => {
                const target = e.target;
                target.setStyle({
                    weight: 2,
                    color: '#ffffff',
                    fillColor: '#FF9800',
                    fillOpacity: 0.6
                });
            },
            mouseout: (e: any) => {
                const target = e.target;
                target.setStyle({
                    weight: 0.8,
                    color: '#FF6600',
                    fillColor: '#FFA726',
                    fillOpacity: 0.25
                });
            }
        });
    };

    if (!buildingsGeojson) return null;

    return (
        <GeoJSON
            data={buildingsGeojson}
            style={{
                color: '#FF6600',
                weight: 0.8,
                fill: true,
                fillColor: '#FFA726',
                fillOpacity: 0.25
            }}
            onEachFeature={onEachFeature}
        />
    );
}
