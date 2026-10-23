import { GeoJsonObject } from 'geojson';
import React, { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import { useHistory } from 'react-router';

import { apiGet } from '../../apiHelpers';

export function MonteriaBuildingsLayer() {
    const [buildingsGeojson, setBuildingsGeojson] = useState<GeoJsonObject>(null);
    const history = useHistory();

    useEffect(() => {
        apiGet('/geometries/monteria_centro.geojson')
            .then(data => setBuildingsGeojson(data as GeoJsonObject))
            .catch(err => console.warn('Could not load Monteria buildings:', err));
    }, []);

    // Exponer función global para que los botones de los popups puedan disparar la navegación
    useEffect(() => {
        (window as any).selectMonteriaBuilding = (buildingId: number) => {
            if (history) {
                history.push(`/view/location/${buildingId}`);
            }
        };
    }, [history]);

    const onEachFeature = (feature: any, layer: any) => {
        const props = feature.properties || {};
        const name = props.name || 'Edificación';
        const type = props.building !== 'yes' ? props.building : 'Residencial / Urbano';
        const levels = props.levels ? `${props.levels} piso(s)` : '1 piso (estimado)';
        const id = feature.id || props.osm_id || Math.floor(Math.random() * 100000);

        layer.bindPopup(`
            <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 200px; color: #1e293b; padding: 4px;">
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #ea580c; padding-bottom: 4px; margin-bottom: 8px;">
                    <span style="font-weight: 700; color: #ea580c; font-size: 13px;">${name}</span>
                    <span style="background: #fed7aa; color: #9a3412; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px;">ID: ${id}</span>
                </div>
                <div style="font-size: 12px; margin-bottom: 4px;">
                    <strong style="color: #475569;">Uso del suelo:</strong> ${type}
                </div>
                <div style="font-size: 12px; margin-bottom: 8px;">
                    <strong style="color: #475569;">Altura / Niveles:</strong> ${levels}
                </div>
                <button 
                    onclick="window.selectMonteriaBuilding(${id})"
                    style="width: 100%; background: #ea580c; color: #ffffff; border: none; padding: 6px 10px; font-size: 12px; font-weight: 600; border-radius: 6px; cursor: pointer; transition: background 0.2s;"
                    onmouseover="this.style.background='#c2410c'"
                    onmouseout="this.style.background='#ea580c'"
                >
                    ✏️ Abrir y Editar en Barra Lateral
                </button>
            </div>
        `);

        layer.on({
            mouseover: (e: any) => {
                const target = e.target;
                target.setStyle({
                    weight: 2.5,
                    color: '#ffffff',
                    fillColor: '#FF6600',
                    fillOpacity: 0.65
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
            },
            click: () => {
                if (history) {
                    history.push(`/view/location/${id}`);
                }
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
