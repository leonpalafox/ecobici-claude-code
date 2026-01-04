'use client';

import { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Rectangle, useMapEvents, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import type { MergedStation } from '@/types/gbfs';
import { metroStations } from '@/data/metro-stations';
import { metrobusStations } from '@/data/metrobus-stations';
import { trenLigeroStations } from '@/data/tren-ligero-stations';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Calculate Haversine distance between two points (in meters)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Create colored icons with bike count badge
const createColoredIcon = (color: string, bikeCount: number) => {
  const svg = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="${color}"/>
      <circle cx="12.5" cy="12.5" r="6" fill="white"/>
    </svg>
  `;

  const badgeColor = bikeCount > 0 ? '#10b981' : '#ef4444';
  const badge = `
    <div style="
      position: absolute;
      top: -8px;
      right: -8px;
      background: ${badgeColor};
      color: white;
      border-radius: 10px;
      min-width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: bold;
      padding: 2px 4px;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">${bikeCount}</div>
  `;

  return L.divIcon({
    html: `<div style="position: relative;">${svg}${badge}</div>`,
    className: 'custom-marker',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

// Get marker color based on bike availability
const getMarkerColor = (availabilityPercentage: number): string => {
  if (availabilityPercentage >= 40) return '#10b981'; // Green
  if (availabilityPercentage >= 20) return '#f59e0b'; // Orange
  return '#ef4444'; // Red
};

// Create Metro station icon
const createMetroIcon = () => {
  return L.divIcon({
    html: `
      <div style="position: relative; width: 24px; height: 24px;">
        <div style="
          width: 24px;
          height: 24px;
          background: #FF6B35;
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          font-size: 14px;
          font-weight: bold;
          color: white;
        ">M</div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// Create Metrobus station icon
const createMetrobusIcon = () => {
  return L.divIcon({
    html: `
      <div style="position: relative; width: 24px; height: 24px;">
        <div style="
          width: 24px;
          height: 24px;
          background: #9B59B6;
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          font-size: 11px;
          font-weight: bold;
          color: white;
        ">MB</div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// Create Tren Ligero station icon
const createTrenLigeroIcon = () => {
  return L.divIcon({
    html: `
      <div style="position: relative; width: 24px; height: 24px;">
        <div style="
          width: 24px;
          height: 24px;
          background: #3B82F6;
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          font-size: 13px;
          font-weight: bold;
          color: white;
        ">TL</div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

interface EcobiciMapProps {
  stations: MergedStation[];
}

interface TransportationScoreData {
  center: [number, number];
  score: number;
  breakdown: {
    metro: { count: number; nearest: number | null; contribution: number };
    metrobus: { count: number; nearest: number | null; contribution: number };
    trenLigero: { count: number; nearest: number | null; contribution: number };
    ecobici: { count: number; nearest: number | null; contribution: number };
  };
  nearbyStations: {
    metro: Array<{ name: string; line: string; distance: number }>;
    metrobus: Array<{ name: string; line: string; distance: number }>;
    trenLigero: Array<{ name: string; distance: number }>;
    ecobici: Array<MergedStation & { distance: number }>;
  };
}

// Component to handle map clicks and calculate transportation score
function MapClickHandler({
  stations,
  onScoreUpdate,
}: {
  stations: MergedStation[];
  onScoreUpdate: (data: TransportationScoreData | null) => void;
}) {
  useMapEvents({
    click(e) {
      const clickLat = e.latlng.lat;
      const clickLon = e.latlng.lng;
      const RADIUS = 500; // 500 meters

      // Transportation score weights (higher = more important)
      const WEIGHTS = {
        metro: 3.0,        // Highest priority - fast, frequent, reliable
        metrobus: 2.0,     // High priority - fast but less coverage
        trenLigero: 2.5,   // High priority - light rail, reliable
        ecobici: 1.0,      // Lowest priority - slower, weather-dependent
      };

      // Find nearby Metro stations
      const nearbyMetro = metroStations
        .map((station) => {
          const distance = calculateDistance(clickLat, clickLon, station.lat, station.lon);
          return { ...station, distance };
        })
        .filter((station) => station.distance <= RADIUS)
        .sort((a, b) => a.distance - b.distance);

      // Find nearby Metrobus stations
      const nearbyMetrobus = metrobusStations
        .map((station) => {
          const distance = calculateDistance(clickLat, clickLon, station.lat, station.lon);
          return { ...station, distance };
        })
        .filter((station) => station.distance <= RADIUS)
        .sort((a, b) => a.distance - b.distance);

      // Find nearby Tren Ligero stations
      const nearbyTrenLigero = trenLigeroStations
        .map((station) => {
          const distance = calculateDistance(clickLat, clickLon, station.lat, station.lon);
          return { ...station, distance };
        })
        .filter((station) => station.distance <= RADIUS)
        .sort((a, b) => a.distance - b.distance);

      // Find nearby Ecobici stations
      const nearbyEcobici = stations
        .map((station) => {
          const distance = calculateDistance(clickLat, clickLon, station.lat, station.lon);
          return { ...station, distance };
        })
        .filter((station) => station.distance <= RADIUS)
        .sort((a, b) => a.distance - b.distance);

      // Calculate score using inverse distance weighting
      // Score = weight / (1 + distance/100) for nearest station of each type
      const metroContribution = nearbyMetro.length > 0
        ? WEIGHTS.metro / (1 + nearbyMetro[0].distance / 100)
        : 0;
      const metrobusContribution = nearbyMetrobus.length > 0
        ? WEIGHTS.metrobus / (1 + nearbyMetrobus[0].distance / 100)
        : 0;
      const trenLigeroContribution = nearbyTrenLigero.length > 0
        ? WEIGHTS.trenLigero / (1 + nearbyTrenLigero[0].distance / 100)
        : 0;
      const ecobiciContribution = nearbyEcobici.length > 0
        ? WEIGHTS.ecobici / (1 + nearbyEcobici[0].distance / 100)
        : 0;

      const totalScore = metroContribution + metrobusContribution + trenLigeroContribution + ecobiciContribution;

      // Always show score panel, even for score 0
      onScoreUpdate({
          center: [clickLat, clickLon],
          score: totalScore,
          breakdown: {
            metro: {
              count: nearbyMetro.length,
              nearest: nearbyMetro.length > 0 ? nearbyMetro[0].distance : null,
              contribution: metroContribution,
            },
            metrobus: {
              count: nearbyMetrobus.length,
              nearest: nearbyMetrobus.length > 0 ? nearbyMetrobus[0].distance : null,
              contribution: metrobusContribution,
            },
            trenLigero: {
              count: nearbyTrenLigero.length,
              nearest: nearbyTrenLigero.length > 0 ? nearbyTrenLigero[0].distance : null,
              contribution: trenLigeroContribution,
            },
            ecobici: {
              count: nearbyEcobici.length,
              nearest: nearbyEcobici.length > 0 ? nearbyEcobici[0].distance : null,
              contribution: ecobiciContribution,
            },
          },
          nearbyStations: {
            metro: nearbyMetro.slice(0, 5).map(s => ({ name: s.name, line: s.line, distance: s.distance })),
            metrobus: nearbyMetrobus.slice(0, 5).map(s => ({ name: s.name, line: s.line, distance: s.distance })),
            trenLigero: nearbyTrenLigero.slice(0, 5).map(s => ({ name: s.name, distance: s.distance })),
            ecobici: nearbyEcobici.slice(0, 5),
          },
        });
    },
  });

  return null;
}

// Heatmap component that displays transportation scores as colored grid cells
function TransportationHeatmap({
  stations,
  visible
}: {
  stations: MergedStation[];
  visible: boolean;
}) {
  const map = useMap();
  const [heatmapData, setHeatmapData] = useState<Array<{ bounds: [[number, number], [number, number]]; score: number }>>([]);

  useEffect(() => {
    if (!visible) {
      setHeatmapData([]);
      return;
    }

    // Fixed bounds covering all of Mexico City
    const gridSize = 0.008; // Approximately 800m cells for smooth visualization with good performance
    const CDMX_BOUNDS = {
      south: 19.05,
      north: 19.60,
      west: -99.35,
      east: -98.95,
    };

    // Transportation score weights
    const WEIGHTS = {
      metro: 3.0,
      metrobus: 2.0,
      trenLigero: 2.5,
      ecobici: 1.0,
    };

    const calculateScoreForPoint = (lat: number, lon: number): number => {
      const RADIUS = 500; // 500 meters

      // Find nearby stations
      const nearbyMetro = metroStations.filter(station =>
        calculateDistance(lat, lon, station.lat, station.lon) <= RADIUS
      );
      const nearbyMetrobus = metrobusStations.filter(station =>
        calculateDistance(lat, lon, station.lat, station.lon) <= RADIUS
      );
      const nearbyTrenLigero = trenLigeroStations.filter(station =>
        calculateDistance(lat, lon, station.lat, station.lon) <= RADIUS
      );
      const nearbyEcobici = stations.filter(station =>
        calculateDistance(lat, lon, station.lat, station.lon) <= RADIUS
      );

      // Calculate contributions
      const metroContribution = nearbyMetro.length > 0
        ? WEIGHTS.metro / (1 + Math.min(...nearbyMetro.map(s => calculateDistance(lat, lon, s.lat, s.lon))) / 100)
        : 0;
      const metrobusContribution = nearbyMetrobus.length > 0
        ? WEIGHTS.metrobus / (1 + Math.min(...nearbyMetrobus.map(s => calculateDistance(lat, lon, s.lat, s.lon))) / 100)
        : 0;
      const trenLigeroContribution = nearbyTrenLigero.length > 0
        ? WEIGHTS.trenLigero / (1 + Math.min(...nearbyTrenLigero.map(s => calculateDistance(lat, lon, s.lat, s.lon))) / 100)
        : 0;
      const ecobiciContribution = nearbyEcobici.length > 0
        ? WEIGHTS.ecobici / (1 + Math.min(...nearbyEcobici.map(s => calculateDistance(lat, lon, s.lat, s.lon))) / 100)
        : 0;

      return metroContribution + metrobusContribution + trenLigeroContribution + ecobiciContribution;
    };

    // Generate grid for entire city
    const gridCells: Array<{ bounds: [[number, number], [number, number]]; score: number }> = [];
    const south = CDMX_BOUNDS.south;
    const north = CDMX_BOUNDS.north;
    const west = CDMX_BOUNDS.west;
    const east = CDMX_BOUNDS.east;

    for (let lat = south; lat < north; lat += gridSize) {
      for (let lon = west; lon < east; lon += gridSize) {
        const centerLat = lat + gridSize / 2;
        const centerLon = lon + gridSize / 2;
        const score = calculateScoreForPoint(centerLat, centerLon);

        // Include all cells, even with score 0, for complete city coverage
        gridCells.push({
          bounds: [[lat, lon], [lat + gridSize, lon + gridSize]],
          score
        });
      }
    }

    setHeatmapData(gridCells);
    console.log(`Heatmap generated: ${gridCells.length} cells covering CDMX`);
  }, [visible, stations]);

  if (!visible || heatmapData.length === 0) return null;

  // Jet color scale: red (low/worst) -> orange -> yellow -> green -> cyan -> blue (high/best)
  const getColor = (score: number): string => {
    // Normalize score to 0-1 range (max expected score around 6)
    const normalized = Math.min(score / 6, 1);

    // Use very transparent red for zero scores (worst)
    if (score === 0) {
      return 'rgba(150, 0, 0, 0.1)'; // Very light red for zero-score areas
    }

    let r: number, g: number, b: number;

    if (normalized < 0.2) {
      // Red to orange (0.0 - 0.2)
      const t = normalized / 0.2;
      r = 255;
      g = Math.floor(t * 128); // From 0 to 128
      b = 0;
    } else if (normalized < 0.4) {
      // Orange to yellow (0.2 - 0.4)
      const t = (normalized - 0.2) / 0.2;
      r = 255;
      g = Math.floor(128 + t * 127); // From 128 to 255
      b = 0;
    } else if (normalized < 0.6) {
      // Yellow to green (0.4 - 0.6)
      const t = (normalized - 0.4) / 0.2;
      r = Math.floor((1 - t) * 255); // From 255 to 0
      g = 255;
      b = 0;
    } else if (normalized < 0.8) {
      // Green to cyan (0.6 - 0.8)
      const t = (normalized - 0.6) / 0.2;
      r = 0;
      g = 255;
      b = Math.floor(t * 255); // From 0 to 255
    } else {
      // Cyan to blue (0.8 - 1.0)
      const t = (normalized - 0.8) / 0.2;
      r = 0;
      g = Math.floor((1 - t) * 255); // From 255 to 0
      b = 255;
    }

    return `rgba(${r}, ${g}, ${b}, 0.45)`;
  };

  return (
    <>
      {heatmapData.map((cell, index) => (
        <Rectangle
          key={`heatmap-${index}`}
          bounds={cell.bounds}
          pathOptions={{
            fillColor: getColor(cell.score),
            fillOpacity: 0.5,
            color: 'transparent',
            weight: 0,
          }}
          eventHandlers={{}}
          interactive={false}
        />
      ))}
    </>
  );
}

export default function EcobiciMap({ stations }: EcobiciMapProps) {
  // Mexico City center coordinates with proper zoom
  const center: [number, number] = useMemo(() => [19.4326, -99.1332], []);
  const [scoreData, setScoreData] = useState<TransportationScoreData | null>(null);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);

  const handleScoreUpdate = (data: TransportationScoreData | null) => {
    setScoreData(data);
  };

  return (
    <>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler stations={stations} onScoreUpdate={handleScoreUpdate} />

        {/* Transportation Score Heatmap */}
        <TransportationHeatmap stations={stations} visible={showHeatmap} />

        {/* Transportation score circle visualization */}
        {scoreData && (
          <>
            <Circle
              center={scoreData.center}
              radius={500}
              pathOptions={{
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                weight: 2,
              }}
            />
            <Marker
              position={scoreData.center}
              icon={L.divIcon({
                html: '<div style="width: 12px; height: 12px; background: #3b82f6; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                className: 'custom-marker',
                iconSize: [12, 12],
                iconAnchor: [6, 6],
              })}
            />
          </>
        )}

        {/* Metro stations */}
        {metroStations.map((station) => (
          <Marker
            key={`metro-${station.id}`}
            position={[station.lat, station.lon]}
            icon={createMetroIcon()}
          >
            <Popup>
              <div className="min-w-[150px]">
                <h3 className="font-bold text-lg mb-1 text-orange-600">Metro</h3>
                <p className="text-sm font-semibold">{station.name}</p>
                <p className="text-xs text-gray-600">Line {station.line}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Metrobus stations */}
        {metrobusStations.map((station) => (
          <Marker
            key={`metrobus-${station.id}`}
            position={[station.lat, station.lon]}
            icon={createMetrobusIcon()}
          >
            <Popup>
              <div className="min-w-[150px]">
                <h3 className="font-bold text-lg mb-1 text-purple-600">Metrobus</h3>
                <p className="text-sm font-semibold">{station.name}</p>
                <p className="text-xs text-gray-600">Line {station.line}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Tren Ligero stations */}
        {trenLigeroStations.map((station) => (
          <Marker
            key={`tren-ligero-${station.id}`}
            position={[station.lat, station.lon]}
            icon={createTrenLigeroIcon()}
          >
            <Popup>
              <div className="min-w-[150px]">
                <h3 className="font-bold text-lg mb-1 text-blue-600">Tren Ligero</h3>
                <p className="text-sm font-semibold">{station.name}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Ecobici stations */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={60}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
        >
          {stations.map((station) => {
            const markerColor = getMarkerColor(station.availabilityPercentage);
            const markerIcon = createColoredIcon(markerColor, station.num_bikes_available);

            return (
              <Marker
                key={station.station_id}
                position={[station.lat, station.lon]}
                icon={markerIcon}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-bold text-lg mb-2">{station.name}</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bikes Available:</span>
                        <span className="font-semibold text-green-600">
                          {station.num_bikes_available}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Docks Available:</span>
                        <span className="font-semibold text-blue-600">
                          {station.num_docks_available}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-semibold">{station.capacity}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`font-semibold ${
                            station.is_renting === 1
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {station.is_renting === 1 ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Heatmap Toggle Button */}
      <button
        onClick={() => setShowHeatmap(!showHeatmap)}
        className="absolute top-4 right-4 z-[1000] bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-lg border border-gray-300 transition-colors"
        title={showHeatmap ? "Hide Transportation Heatmap" : "Show Transportation Heatmap"}
      >
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span className="text-sm">{showHeatmap ? 'Hide' : 'Show'} Heatmap</span>
        </div>
      </button>

      {/* Transportation Score Panel */}
      {scoreData && (
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-md max-h-[600px] overflow-y-auto z-[1000]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-xl">Transportation Score</h3>
            <button
              onClick={() => setScoreData(null)}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Overall Score */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-1">
                {scoreData.score.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Overall Accessibility Score</div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="space-y-2 mb-4">
            <h4 className="font-semibold text-sm text-gray-700">Score Breakdown (500m radius)</h4>

            {/* Metro */}
            <div className="bg-orange-50 border border-orange-200 rounded p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">M</div>
                  <span className="font-medium text-sm">Metro</span>
                </div>
                <span className="font-bold text-orange-600">{scoreData.breakdown.metro.contribution.toFixed(1)}</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {scoreData.breakdown.metro.count} station{scoreData.breakdown.metro.count !== 1 ? 's' : ''}
                {scoreData.breakdown.metro.nearest && ` • Nearest: ${Math.round(scoreData.breakdown.metro.nearest)}m`}
              </div>
            </div>

            {/* Metrobus */}
            <div className="bg-purple-50 border border-purple-200 rounded p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">MB</div>
                  <span className="font-medium text-sm">Metrobus</span>
                </div>
                <span className="font-bold text-purple-600">{scoreData.breakdown.metrobus.contribution.toFixed(1)}</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {scoreData.breakdown.metrobus.count} station{scoreData.breakdown.metrobus.count !== 1 ? 's' : ''}
                {scoreData.breakdown.metrobus.nearest && ` • Nearest: ${Math.round(scoreData.breakdown.metrobus.nearest)}m`}
              </div>
            </div>

            {/* Tren Ligero */}
            <div className="bg-blue-50 border border-blue-200 rounded p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">TL</div>
                  <span className="font-medium text-sm">Tren Ligero</span>
                </div>
                <span className="font-bold text-blue-600">{scoreData.breakdown.trenLigero.contribution.toFixed(1)}</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {scoreData.breakdown.trenLigero.count} station{scoreData.breakdown.trenLigero.count !== 1 ? 's' : ''}
                {scoreData.breakdown.trenLigero.nearest && ` • Nearest: ${Math.round(scoreData.breakdown.trenLigero.nearest)}m`}
              </div>
            </div>

            {/* Ecobici */}
            <div className="bg-green-50 border border-green-200 rounded p-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">🚲</div>
                  <span className="font-medium text-sm">Ecobici</span>
                </div>
                <span className="font-bold text-green-600">{scoreData.breakdown.ecobici.contribution.toFixed(1)}</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {scoreData.breakdown.ecobici.count} station{scoreData.breakdown.ecobici.count !== 1 ? 's' : ''}
                {scoreData.breakdown.ecobici.nearest && ` • Nearest: ${Math.round(scoreData.breakdown.ecobici.nearest)}m`}
              </div>
            </div>
          </div>

          {/* Nearby Stations Lists */}
          <div className="space-y-3">
            {scoreData.nearbyStations.metro.length > 0 && (
              <div>
                <h5 className="font-semibold text-xs text-orange-700 mb-1">Metro Stations</h5>
                <div className="space-y-1">
                  {scoreData.nearbyStations.metro.map((station, idx) => (
                    <div key={idx} className="flex justify-between text-xs bg-orange-50 rounded px-2 py-1">
                      <span>{station.name} <span className="text-gray-500">(L{station.line})</span></span>
                      <span className="text-gray-600">{Math.round(station.distance)}m</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {scoreData.nearbyStations.metrobus.length > 0 && (
              <div>
                <h5 className="font-semibold text-xs text-purple-700 mb-1">Metrobus Stations</h5>
                <div className="space-y-1">
                  {scoreData.nearbyStations.metrobus.map((station, idx) => (
                    <div key={idx} className="flex justify-between text-xs bg-purple-50 rounded px-2 py-1">
                      <span>{station.name} <span className="text-gray-500">(L{station.line})</span></span>
                      <span className="text-gray-600">{Math.round(station.distance)}m</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {scoreData.nearbyStations.trenLigero.length > 0 && (
              <div>
                <h5 className="font-semibold text-xs text-blue-700 mb-1">Tren Ligero Stations</h5>
                <div className="space-y-1">
                  {scoreData.nearbyStations.trenLigero.map((station, idx) => (
                    <div key={idx} className="flex justify-between text-xs bg-blue-50 rounded px-2 py-1">
                      <span>{station.name}</span>
                      <span className="text-gray-600">{Math.round(station.distance)}m</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {scoreData.nearbyStations.ecobici.length > 0 && (
              <div>
                <h5 className="font-semibold text-xs text-green-700 mb-1">Ecobici Stations</h5>
                <div className="space-y-1">
                  {scoreData.nearbyStations.ecobici.map((station, idx) => (
                    <div key={idx} className="flex justify-between text-xs bg-green-50 rounded px-2 py-1">
                      <span className="flex-1">{station.name}</span>
                      <span className="text-green-600 font-semibold mx-2">{station.num_bikes_available} 🚲</span>
                      <span className="text-gray-600">{Math.round(station.distance)}m</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
