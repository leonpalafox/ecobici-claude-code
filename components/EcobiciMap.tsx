'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import type { MergedStation } from '@/types/gbfs';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Create colored icons based on availability
const createColoredIcon = (color: string) => {
  const svg = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="${color}"/>
      <circle cx="12.5" cy="12.5" r="6" fill="white"/>
    </svg>
  `;

  return L.divIcon({
    html: svg,
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

interface EcobiciMapProps {
  stations: MergedStation[];
}

// Component to recenter map when stations change
function MapUpdater({ stations }: { stations: MergedStation[] }) {
  const map = useMap();

  useEffect(() => {
    if (stations.length > 0) {
      const bounds = L.latLngBounds(
        stations.map((station) => [station.lat, station.lon])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [stations, map]);

  return null;
}

export default function EcobiciMap({ stations }: EcobiciMapProps) {
  // Mexico City center coordinates
  const center: [number, number] = useMemo(
    () => [19.4326, -99.1332],
    []
  );

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom={true}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater stations={stations} />

      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={60}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
      >
        {stations.map((station) => {
          const markerColor = getMarkerColor(station.availabilityPercentage);
          const markerIcon = createColoredIcon(markerColor);

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
  );
}
