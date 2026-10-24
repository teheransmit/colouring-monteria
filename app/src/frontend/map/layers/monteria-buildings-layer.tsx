import { Feature, FeatureCollection } from 'geojson';
import L from 'leaflet';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GeoJSON, useMap, useMapEvents } from 'react-leaflet';
import { useHistory } from 'react-router';

import { apiGet } from '../../apiHelpers';

export type ThematicMode = 'catastro' | 'niveles' | 'uso' | 'fuente';
export type MonteriaActiveLayer = 'consolidada' | 'alcaldia' | 'ambas';

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

interface LayerProps {
    activeLayer?: MonteriaActiveLayer;
    thematicMode?: ThematicMode;
}

export function MonteriaBuildingsLayer({ activeLayer = 'consolidada', thematicMode = 'catastro' }: LayerProps = {}) {
    const map = useMap();
    const history = useHistory();

    const [allConsolidada, setAllConsolidada] = useState<IndexedFeature[]>([]);
    const [allAlcaldia, setAllAlcaldia] = useState<IndexedFeature[]>([]);
    const [visibleConsolidada, setVisibleConsolidada] = useState<FeatureCollection>(null);
    const [visibleAlcaldia, setVisibleAlcaldia] = useState<FeatureCollection>(null);

    // Canvas GPU Renderer para 60 FPS continuos
    const canvasRenderer = useMemo(() => {
        return L.canvas({ padding: 0.5, tolerance: 10 });
    }, []);

    // Cargar capa consolidada maestra (51.419 huellas con NPN y atributos)
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

    // Cargar capa oficial Alcaldía 1:1.000 si está activa
    useEffect(() => {
        if ((activeLayer === 'alcaldia' || activeLayer === 'ambas') && allAlcaldia.length === 0) {
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
                })
                .catch(err => console.warn('Could not load Alcaldia buildings:', err));
        }
    }, [activeLayer, allAlcaldia]);

    // Filtrado por Ventana de Visualización (Viewport BBOX Culling) a 60 FPS
    const updateVisibleBBoxes = useCallback(() => {
        if (!map) return;
        const currentZoom = map.getZoom();

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

    useMapEvents({
        moveend: updateVisibleBBoxes,
        zoomend: updateVisibleBBoxes
    });

    useEffect(() => {
        updateVisibleBBoxes();
    }, [allConsolidada, allAlcaldia, activeLayer, updateVisibleBBoxes]);

    useEffect(() => {
        (window as any).selectMonteriaBuilding = (buildingId: number) => {
            if (history) {
                history.push(`/view/location/${buildingId}`);
            }
        };
    }, [history]);

    // Estilizado temático por atributo
    const getBuildingStyle = useCallback((feature: any) => {
        const props = feature?.properties || {};
        let fillColor = '#ea580c';
        let strokeColor = '#9a3412';

        if (thematicMode === 'catastro') {
            if (props.estado_catastro === 'Oficial Vinculado') {
                fillColor = '#10b981'; // Verde esmeralda oficial
                strokeColor = '#047857';
            } else {
                fillColor = '#f59e0b'; // Ámbar provisional
                strokeColor = '#b45309';
            }
        } else if (thematicMode === 'niveles') {
            const levels = Number(props.levels) || 1;
            if (levels >= 8) {
                fillColor = '#8b5cf6'; // Púrpura alta torre
                strokeColor = '#6d28d9';
            } else if (levels >= 4) {
                fillColor = '#ef4444'; // Rojo mediano
                strokeColor = '#b91c1c';
            } else if (levels >= 2) {
                fillColor = '#f97316'; // Naranja 2-3 pisos
                strokeColor = '#c2410c';
            } else {
                fillColor = '#facc15'; // Amarillo 1 piso
                strokeColor = '#ca8a04';
            }
        } else if (thematicMode === 'uso') {
            const uso = props.land_use || 'Residencial';
            if (uso === 'Comercial') {
                fillColor = '#ea580c';
                strokeColor = '#9a3412';
            } else if (uso.includes('Educativo') || uso.includes('Institucional')) {
                fillColor = '#0284c7';
                strokeColor = '#0369a1';
            } else if (uso === 'Salud') {
                fillColor = '#dc2626';
                strokeColor = '#991b1b';
            } else if (uso.includes('Religioso')) {
                fillColor = '#a855f7';
                strokeColor = '#7e22ce';
            } else if (uso === 'Industrial') {
                fillColor = '#64748b';
                strokeColor = '#334155';
            } else {
                fillColor = '#eab308'; // Residencial
                strokeColor = '#a16207';
            }
        } else if (thematicMode === 'fuente') {
            if (props.source === 'microsoft/ai') {
                fillColor = '#06b6d4'; // Turquesa satelital
                strokeColor = '#0e7490';
            } else {
                fillColor = '#ea580c'; // Naranja OSM
                strokeColor = '#9a3412';
            }
        }

        return {
            renderer: canvasRenderer,
            color: strokeColor,
            weight: 1.2,
            fill: true,
            fillColor: fillColor,
            fillOpacity: 0.55
        };
    }, [thematicMode, canvasRenderer]);

    const onEachConsolidadaFeature = (feature: any, layer: any) => {
        const props = feature.properties || {};
        const name = props.name || 'Edificación';
        const uso = props.land_use || 'Residencial';
        const levels = props.levels ? `${props.levels} piso(s)` : '1 piso';
        const id = feature.id || props.osm_id || Math.floor(Math.random() * 100000);
        const source = props.source === 'microsoft/ai' ? 'Microsoft AI Satellite' : 'OpenStreetMap';
        const npn = props.npn || 'Sin NPN asignado';
        const cidentif = props.codigo_catastral || 'N/A';
        const area = props.area_catastral_m2 || props.area_m2 || 'N/D';
        const esOficial = props.estado_catastro === 'Oficial Vinculado';

        layer.bindPopup(`
            <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 250px; color: #1e293b; padding: 4px;">
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid ${esOficial ? '#10b981' : '#ea580c'}; padding-bottom: 4px; margin-bottom: 8px;">
                    <span style="font-weight: 700; color: #0f172a; font-size: 13px;">${name}</span>
                    <span style="background: ${esOficial ? '#d1fae5' : '#fed7aa'}; color: ${esOficial ? '#065f46' : '#9a3412'}; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
                        ${esOficial ? '🏛️ Catastro 1:1.000' : 'Satelital / OSM'}
                    </span>
                </div>
                <div style="font-size: 11px; margin-bottom: 4px; background: #f8fafc; padding: 4px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
                    <strong style="color: #475569; display: block; font-size: 10px; text-transform: uppercase;">NPN (Catastro Multipropósito):</strong>
                    <span style="font-family: monospace; font-size: 10px; color: #0f172a; font-weight: 600; word-break: break-all;">${npn}</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; margin-bottom: 6px;">
                    <div><strong style="color: #64748b;">Código:</strong> <span style="font-family: monospace;">${cidentif}</span></div>
                    <div><strong style="color: #64748b;">Área:</strong> ${area} m²</div>
                    <div><strong style="color: #64748b;">Uso:</strong> ${uso}</div>
                    <div><strong style="color: #64748b;">Niveles:</strong> ${levels}</div>
                </div>
                <div style="font-size: 10px; color: #64748b; margin-bottom: 8px;">
                    <strong>Fuente:</strong> ${source}
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
            <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 230px; color: #0f172a; padding: 4px;">
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
                    Cartografía Básica Oficial — Servicio 10642 IGAC
                </div>
            </div>
        `);
    };

    return (
        <>
            {/* Capa Consolidada renderizada en Canvas GPU con Estilo Temático Dinámico */}
            {(activeLayer === 'consolidada' || activeLayer === 'ambas') && visibleConsolidada && (
                <GeoJSON
                    key={`consolidada-${thematicMode}-${visibleConsolidada.features.length}`}
                    data={visibleConsolidada}
                    style={getBuildingStyle}
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

interface ControlPanelProps {
    activeLayer: MonteriaActiveLayer;
    setActiveLayer: (layer: MonteriaActiveLayer) => void;
    thematicMode: ThematicMode;
    setThematicMode: (mode: ThematicMode) => void;
}

export function MonteriaControlPanel({
    activeLayer,
    setActiveLayer,
    thematicMode,
    setThematicMode
}: ControlPanelProps) {
    return (
        <div style={{
            position: 'absolute',
            top: '70px',
            right: '16px',
            zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            padding: '12px 14px',
            borderRadius: '14px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '12px',
            border: '1px solid #cbd5e1',
            width: '280px',
            pointerEvents: 'auto'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                    🏙️ COLOURING MONTERÍA
                </span>
                <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, background: '#d1fae5', padding: '2px 6px', borderRadius: '4px' }}>
                    ● 60 FPS GPU
                </span>
            </div>

            {/* Selección de Capas Base */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Capa Base</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                        onClick={() => setActiveLayer('consolidada')}
                        style={{
                            flex: 1,
                            background: activeLayer === 'consolidada' ? '#ea580c' : '#f8fafc',
                            color: activeLayer === 'consolidada' ? '#ffffff' : '#475569',
                            border: '1px solid #e2e8f0',
                            padding: '6px 4px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '10px'
                        }}
                    >
                        🟠 Total (51k)
                    </button>
                    <button
                        onClick={() => setActiveLayer('alcaldia')}
                        style={{
                            flex: 1,
                            background: activeLayer === 'alcaldia' ? '#0284c7' : '#f8fafc',
                            color: activeLayer === 'alcaldia' ? '#ffffff' : '#475569',
                            border: '1px solid #e2e8f0',
                            padding: '6px 4px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '10px'
                        }}
                    >
                        🏛️ Alcaldía (22k)
                    </button>
                    <button
                        onClick={() => setActiveLayer('ambas')}
                        style={{
                            flex: 1,
                            background: activeLayer === 'ambas' ? '#0f766e' : '#f8fafc',
                            color: activeLayer === 'ambas' ? '#ffffff' : '#475569',
                            border: '1px solid #e2e8f0',
                            padding: '6px 4px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '10px'
                        }}
                    >
                        🔄 Ambas
                    </button>
                </div>
            </div>

            {/* Modos Temáticos (Pintar la Ciudad) */}
            {activeLayer !== 'alcaldia' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Pintar Mapa Por</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                        <button
                            onClick={() => setThematicMode('catastro')}
                            style={{
                                background: thematicMode === 'catastro' ? '#10b981' : '#f8fafc',
                                color: thematicMode === 'catastro' ? '#ffffff' : '#334155',
                                border: '1px solid #cbd5e1',
                                padding: '6px 4px',
                                borderRadius: '6px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: '10px'
                            }}
                        >
                            🏛️ Catastro (NPN)
                        </button>
                        <button
                            onClick={() => setThematicMode('niveles')}
                            style={{
                                background: thematicMode === 'niveles' ? '#ea580c' : '#f8fafc',
                                color: thematicMode === 'niveles' ? '#ffffff' : '#334155',
                                border: '1px solid #cbd5e1',
                                padding: '6px 4px',
                                borderRadius: '6px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: '10px'
                            }}
                        >
                            🏢 Pisos / Altura
                        </button>
                        <button
                            onClick={() => setThematicMode('uso')}
                            style={{
                                background: thematicMode === 'uso' ? '#6366f1' : '#f8fafc',
                                color: thematicMode === 'uso' ? '#ffffff' : '#334155',
                                border: '1px solid #cbd5e1',
                                padding: '6px 4px',
                                borderRadius: '6px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: '10px'
                            }}
                        >
                            🏷️ Uso del Suelo
                        </button>
                        <button
                            onClick={() => setThematicMode('fuente')}
                            style={{
                                background: thematicMode === 'fuente' ? '#0284c7' : '#f8fafc',
                                color: thematicMode === 'fuente' ? '#ffffff' : '#334155',
                                border: '1px solid #cbd5e1',
                                padding: '6px 4px',
                                borderRadius: '6px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: '10px'
                            }}
                        >
                            🛰️ Fuente (OSM/AI)
                        </button>
                    </div>

                    {/* Leyenda Dinámica */}
                    <div style={{ marginTop: '4px', background: '#f8fafc', padding: '6px 8px', borderRadius: '6px', fontSize: '10px', border: '1px solid #e2e8f0' }}>
                        {thematicMode === 'catastro' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '2px', display: 'inline-block' }}></span>
                                    <span><strong>Oficial Vinculado:</strong> 37.000 (72%)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '10px', height: '10px', background: '#f59e0b', borderRadius: '2px', display: 'inline-block' }}></span>
                                    <span><strong>Provisional Periferia:</strong> 14.400 (28%)</span>
                                </div>
                            </div>
                        )}
                        {thematicMode === 'niveles' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '10px', height: '10px', background: '#facc15', borderRadius: '2px', display: 'inline-block' }}></span>
                                    <span>1 Piso</span>
                                    <span style={{ width: '10px', height: '10px', background: '#f97316', borderRadius: '2px', display: 'inline-block', marginLeft: '6px' }}></span>
                                    <span>2-3 Pisos</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '2px', display: 'inline-block' }}></span>
                                    <span>4-7 Pisos</span>
                                    <span style={{ width: '10px', height: '10px', background: '#8b5cf6', borderRadius: '2px', display: 'inline-block', marginLeft: '6px' }}></span>
                                    <span>8+ Pisos</span>
                                </div>
                            </div>
                        )}
                        {thematicMode === 'uso' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '10px', height: '10px', background: '#eab308', borderRadius: '2px', display: 'inline-block' }}></span>
                                    <span>Residencial</span>
                                    <span style={{ width: '10px', height: '10px', background: '#ea580c', borderRadius: '2px', display: 'inline-block', marginLeft: '6px' }}></span>
                                    <span>Comercial</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '10px', height: '10px', background: '#0284c7', borderRadius: '2px', display: 'inline-block' }}></span>
                                    <span>Educación / Inst.</span>
                                    <span style={{ width: '10px', height: '10px', background: '#dc2626', borderRadius: '2px', display: 'inline-block', marginLeft: '6px' }}></span>
                                    <span>Salud</span>
                                </div>
                            </div>
                        )}
                        {thematicMode === 'fuente' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '10px', height: '10px', background: '#ea580c', borderRadius: '2px', display: 'inline-block' }}></span>
                                    <span>OpenStreetMap (36k)</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '10px', height: '10px', background: '#06b6d4', borderRadius: '2px', display: 'inline-block' }}></span>
                                    <span>Microsoft AI (15k)</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
