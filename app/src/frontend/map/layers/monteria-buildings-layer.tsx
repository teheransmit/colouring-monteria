import { GeoJsonObject } from 'geojson';
import React, { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import { useHistory } from 'react-router';

import { apiGet } from '../../apiHelpers';

export function MonteriaBuildingsLayer() {
    const [consolidadaGeojson, setConsolidadaGeojson] = useState<GeoJsonObject>(null);
    const [alcaldiaGeojson, setAlcaldiaGeojson] = useState<GeoJsonObject>(null);
    const [activeLayer, setActiveLayer] = useState<'consolidada' | 'alcaldia' | 'ambas'>('consolidada');
    const [loadingAlcaldia, setLoadingAlcaldia] = useState<boolean>(false);
    const history = useHistory();

    useEffect(() => {
        apiGet('/geometries/monteria_centro.geojson')
            .then(data => setConsolidadaGeojson(data as GeoJsonObject))
            .catch(err => console.warn('Could not load Monteria buildings:', err));
    }, []);

    const loadAlcaldiaData = () => {
        if (!alcaldiaGeojson && !loadingAlcaldia) {
            setLoadingAlcaldia(true);
            apiGet('/geometries/alcaldia_monteria_1000.geojson')
                .then(data => {
                    setAlcaldiaGeojson(data as GeoJsonObject);
                    setLoadingAlcaldia(false);
                })
                .catch(err => {
                    console.warn('Could not load Alcaldia 1:1.000 buildings:', err);
                    setLoadingAlcaldia(false);
                });
        }
    };

    // Exponer función global para que los botones de los popups puedan disparar la navegación
    useEffect(() => {
        (window as any).selectMonteriaBuilding = (buildingId: number) => {
            if (history) {
                history.push(`/view/location/${buildingId}`);
            }
        };
    }, [history]);

    const onEachConsolidadaFeature = (feature: any, layer: any) => {
        const props = feature.properties || {};
        const name = props.name || 'Edificación';
        const type = props.building !== 'yes' ? props.building : (props.amenity || 'Residencial / Urbano');
        const levels = props.levels ? `${props.levels} piso(s)` : '1 piso (estimado)';
        const id = feature.id || props.osm_id || Math.floor(Math.random() * 100000);
        const source = props.source === 'microsoft/ai' ? 'Microsoft AI Satellite' : 'OpenStreetMap Verificado';

        layer.bindPopup(`
            <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 210px; color: #1e293b; padding: 4px;">
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #ea580c; padding-bottom: 4px; margin-bottom: 8px;">
                    <span style="font-weight: 700; color: #ea580c; font-size: 13px;">${name}</span>
                    <span style="background: #fed7aa; color: #9a3412; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px;">ID: ${id}</span>
                </div>
                <div style="font-size: 11px; margin-bottom: 4px;">
                    <strong style="color: #475569;">Fuente:</strong> <span style="color: #0369a1; font-weight: 600;">${source}</span>
                </div>
                <div style="font-size: 11px; margin-bottom: 4px;">
                    <strong style="color: #475569;">Uso del suelo:</strong> ${type}
                </div>
                <div style="font-size: 11px; margin-bottom: 8px;">
                    <strong style="color: #475569;">Altura / Niveles:</strong> ${levels}
                </div>
                <button 
                    onclick="window.selectMonteriaBuilding(${id})"
                    style="width: 100%; background: #ea580c; color: #ffffff; border: none; padding: 6px 10px; font-size: 11px; font-weight: 600; border-radius: 6px; cursor: pointer; transition: background 0.2s;"
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
                    fillOpacity: 0.70
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

    const onEachAlcaldiaFeature = (feature: any, layer: any) => {
        const props = feature.properties || {};
        const codigo = props.CIdentif || 'Sin código';
        const area = props.SHAPE_Area ? `${Number(props.SHAPE_Area).toFixed(1)} m²` : 'N/D';
        const perimetro = props.SHAPE_Leng ? `${Number(props.SHAPE_Leng).toFixed(1)} m` : 'N/D';
        const descrip = props.CDescrip || 'Construcción Convencional';

        layer.bindPopup(`
            <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 220px; color: #0f172a; padding: 4px;">
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 4px; margin-bottom: 8px;">
                    <span style="font-weight: 700; color: #0284c7; font-size: 13px;">🏛️ Alcaldía de Montería</span>
                    <span style="background: #e0f2fe; color: #0369a1; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">1:1.000</span>
                </div>
                <div style="font-size: 11px; margin-bottom: 3px;">
                    <strong style="color: #475569;">Código Catastral:</strong> <span style="font-family: monospace; font-size: 11px;">${codigo}</span>
                </div>
                <div style="font-size: 11px; margin-bottom: 3px;">
                    <strong style="color: #475569;">Tipo:</strong> ${descrip}
                </div>
                <div style="font-size: 11px; margin-bottom: 3px;">
                    <strong style="color: #475569;">Área Oficial:</strong> ${area}
                </div>
                <div style="font-size: 11px; margin-bottom: 8px;">
                    <strong style="color: #475569;">Perímetro:</strong> ${perimetro}
                </div>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 6px; font-size: 10px; color: #64748b; text-align: center;">
                    Fotogrametría Aérea Sensor FOIF A90 (Vigencia 2024)
                </div>
            </div>
        `);

        layer.on({
            mouseover: (e: any) => {
                const target = e.target;
                target.setStyle({
                    weight: 2.5,
                    color: '#ffffff',
                    fillColor: '#0284c7',
                    fillOpacity: 0.80
                });
            },
            mouseout: (e: any) => {
                const target = e.target;
                target.setStyle({
                    weight: 0.9,
                    color: '#0284c7',
                    fillColor: '#38bdf8',
                    fillOpacity: 0.35
                });
            }
        });
    };

    return (
        <>
            {/* Selector Flotante de Capas en Pantalla */}
            <div style={{
                position: 'fixed',
                top: '80px',
                right: '20px',
                zIndex: 1000,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                padding: '6px 10px',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '12px',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{ fontWeight: 700, color: '#334155', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Capas de Montería
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                        onClick={() => setActiveLayer('consolidada')}
                        style={{
                            background: activeLayer === 'consolidada' ? '#ea580c' : '#f1f5f9',
                            color: activeLayer === 'consolidada' ? '#ffffff' : '#334155',
                            border: 'none',
                            padding: '5px 9px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '11px',
                            transition: 'all 0.15s ease'
                        }}
                    >
                        🟠 Consolidada (51k)
                    </button>
                    <button
                        onClick={() => {
                            loadAlcaldiaData();
                            setActiveLayer('alcaldia');
                        }}
                        style={{
                            background: activeLayer === 'alcaldia' ? '#0284c7' : '#f1f5f9',
                            color: activeLayer === 'alcaldia' ? '#ffffff' : '#334155',
                            border: 'none',
                            padding: '5px 9px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '11px',
                            transition: 'all 0.15s ease'
                        }}
                    >
                        {loadingAlcaldia ? 'Cargando...' : '🏛️ Alcaldía 1:1.000 (22k)'}
                    </button>
                    <button
                        onClick={() => {
                            loadAlcaldiaData();
                            setActiveLayer('ambas');
                        }}
                        style={{
                            background: activeLayer === 'ambas' ? '#10b981' : '#f1f5f9',
                            color: activeLayer === 'ambas' ? '#ffffff' : '#334155',
                            border: 'none',
                            padding: '5px 9px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '11px',
                            transition: 'all 0.15s ease'
                        }}
                    >
                        🔄 Ambas
                    </button>
                </div>
            </div>

            {/* Capa Consolidada (OpenStreetMap + Microsoft) */}
            {(activeLayer === 'consolidada' || activeLayer === 'ambas') && consolidadaGeojson && (
                <GeoJSON
                    key="consolidada-layer"
                    data={consolidadaGeojson}
                    style={{
                        color: '#FF6600',
                        weight: 0.8,
                        fill: true,
                        fillColor: '#FFA726',
                        fillOpacity: 0.25
                    }}
                    onEachFeature={onEachConsolidadaFeature}
                />
            )}

            {/* Capa Oficial Alcaldía de Montería 1:1.000 */}
            {(activeLayer === 'alcaldia' || activeLayer === 'ambas') && alcaldiaGeojson && (
                <GeoJSON
                    key="alcaldia-layer"
                    data={alcaldiaGeojson}
                    style={{
                        color: '#0284c7',
                        weight: 0.9,
                        fill: true,
                        fillColor: '#38bdf8',
                        fillOpacity: 0.35
                    }}
                    onEachFeature={onEachAlcaldiaFeature}
                />
            )}
        </>
    );
}
