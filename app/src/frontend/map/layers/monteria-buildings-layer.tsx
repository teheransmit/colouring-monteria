import { Feature, FeatureCollection, GeoJsonObject } from 'geojson';
import L from 'leaflet';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GeoJSON, useMap, useMapEvents } from 'react-leaflet';
import { useHistory } from 'react-router';

import { apiGet } from '../../apiHelpers';

interface IndexedFeature extends Feature {
    _bbox?: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
}

function computeBBox(feature: Feature): [number, number, number, number] {
    const geom = feature.geometry;
    let minLon = 180, minLat = 90, maxLon = -180, maxLat = -90;

    const processCoord = (pt: number[]) => {
        const [lon, lat] = pt;
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
    };

    if (geom.type === 'Polygon') {
        const rings = geom.coordinates as number[][][];
        for (const ring of rings) {
            for (const pt of ring) processCoord(pt);
        }
    } else if (geom.type === 'MultiPolygon') {
        const polys = geom.coordinates as number[][][][];
        for (const poly of polys) {
            for (const ring of poly) {
                for (const pt of ring) processCoord(pt);
            }
        }
    }

    return [minLon, minLat, maxLon, maxLat];
}

export function MonteriaBuildingsLayer() {
    const map = useMap();
    const history = useHistory();

    const [allConsolidada, setAllConsolidada] = useState<IndexedFeature[]>([]);
    const [allAlcaldia, setAllAlcaldia] = useState<IndexedFeature[]>([]);
    const [visibleConsolidada, setVisibleConsolidada] = useState<FeatureCollection>(null);
    const [visibleAlcaldia, setVisibleAlcaldia] = useState<FeatureCollection>(null);

    const [activeLayer, setActiveLayer] = useState<'consolidada' | 'alcaldia' | 'ambas'>('consolidada');
    const [loadingAlcaldia, setLoadingAlcaldia] = useState<boolean>(false);
    const [zoomLevel, setZoomLevel] = useState<number>(map.getZoom());

    // Canvas GPU Renderer para 60 FPS continuos
    const canvasRenderer = useMemo(() => {
        return L.canvas({ padding: 0.5, tolerance: 10 });
    }, []);

    // Cargar capa consolidada maestra (51.419 huellas)
    useEffect(() => {
        apiGet('/geometries/monteria_centro.geojson')
            .then((data: any) => {
                if (data && data.features) {
                    const indexed: IndexedFeature[] = data.features.map((f: Feature) => {
                        return {
                            ...f,
                            _bbox: computeBBox(f)
                        };
                    });
                    setAllConsolidada(indexed);
                }
            })
            .catch(err => console.warn('Could not load Monteria buildings:', err));
    }, []);

    // Cargar capa oficial Alcaldía 1:1.000 bajo demanda
    const loadAlcaldiaData = useCallback(() => {
        if (allAlcaldia.length === 0 && !loadingAlcaldia) {
            setLoadingAlcaldia(true);
            apiGet('/geometries/alcaldia_monteria_1000.geojson')
                .then((data: any) => {
                    if (data && data.features) {
                        const indexed: IndexedFeature[] = data.features.map((f: Feature) => {
                            return {
                                ...f,
                                _bbox: computeBBox(f)
                            };
                        });
                        setAllAlcaldia(indexed);
                    }
                    setLoadingAlcaldia(false);
                })
                .catch(err => {
                    console.warn('Could not load Alcaldia 1:1.000 buildings:', err);
                    setLoadingAlcaldia(false);
                });
        }
    }, [allAlcaldia, loadingAlcaldia]);

    // Filtrado por Ventana de Visualización (Viewport BBOX Culling) a 60 FPS
    const updateVisibleBBoxes = useCallback(() => {
        if (!map) return;
        const currentZoom = map.getZoom();
        setZoomLevel(currentZoom);

        // Si el zoom es menor a 14 (vista de todo el departamento o ciudad lejana),
        // no saturamos el GPU dibujando 50.000 polígonos microscópicos
        if (currentZoom < 14) {
            setVisibleConsolidada(null);
            setVisibleAlcaldia(null);
            return;
        }

        const b = map.getBounds();
        const west = b.getWest();
        const south = b.getSouth();
        const east = b.getEast();
        const north = b.getNorth();

        // Culling Consolidada
        if (allConsolidada.length > 0) {
            const filtered = allConsolidada.filter(f => {
                const box = f._bbox;
                if (!box) return true;
                return box[2] >= west && box[0] <= east && box[3] >= south && box[1] <= north;
            });
            setVisibleConsolidada({
                type: 'FeatureCollection',
                features: filtered
            });
        }

        // Culling Alcaldía
        if (allAlcaldia.length > 0) {
            const filtered = allAlcaldia.filter(f => {
                const box = f._bbox;
                if (!box) return true;
                return box[2] >= west && box[0] <= east && box[3] >= south && box[1] <= north;
            });
            setVisibleAlcaldia({
                type: 'FeatureCollection',
                features: filtered
            });
        }
    }, [map, allConsolidada, allAlcaldia]);

    // Escuchar eventos de paneo y zoom con actualización inmediata
    useMapEvents({
        moveend: updateVisibleBBoxes,
        zoomend: updateVisibleBBoxes
    });

    useEffect(() => {
        updateVisibleBBoxes();
    }, [allConsolidada, allAlcaldia, activeLayer, updateVisibleBBoxes]);

    // Exponer navegación global para botones de popups
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
    };

    return (
        <>
            {/* Selector Flotante de Capas */}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#334155', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Capas de Montería
                    </span>
                    <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 600 }}>● 60 FPS GPU</span>
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

            {/* Aviso de Zoom si está muy alejado */}
            {zoomLevel < 14 && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    background: 'rgba(15, 23, 42, 0.88)',
                    backdropFilter: 'blur(6px)',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    pointerEvents: 'none'
                }}>
                    <span>🔍 Acércate al mapa (Zoom ≥ 14) para visualizar y editar edificaciones fluidamente</span>
                </div>
            )}

            {/* Capa Consolidada renderizada en Canvas GPU */}
            {(activeLayer === 'consolidada' || activeLayer === 'ambas') && visibleConsolidada && (
                <GeoJSON
                    key={`consolidada-${visibleConsolidada.features.length}`}
                    data={visibleConsolidada}
                    pathOptions={{
                        renderer: canvasRenderer,
                        color: '#ea580c',
                        weight: 1.2,
                        fill: true,
                        fillColor: '#f97316',
                        fillOpacity: 0.35
                    }}
                    onEachFeature={onEachConsolidadaFeature}
                />
            )}

            {/* Capa Oficial Alcaldía de Montería renderizada en Canvas GPU */}
            {(activeLayer === 'alcaldia' || activeLayer === 'ambas') && visibleAlcaldia && (
                <GeoJSON
                    key={`alcaldia-${visibleAlcaldia.features.length}`}
                    data={visibleAlcaldia}
                    pathOptions={{
                        renderer: canvasRenderer,
                        color: '#0284c7',
                        weight: 1.2,
                        fill: true,
                        fillColor: '#38bdf8',
                        fillOpacity: 0.40
                    }}
                    onEachFeature={onEachAlcaldiaFeature}
                />
            )}
        </>
    );
}
