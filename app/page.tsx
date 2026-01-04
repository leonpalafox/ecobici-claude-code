'use client';

import dynamic from 'next/dynamic';
import { useStations } from '@/lib/useStations';

// Dynamically import the map component to avoid SSR issues with Leaflet
const EcobiciMap = dynamic(() => import('@/components/EcobiciMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const { stations, lastUpdated, isLoading, isError } = useStations();

  // Format last updated time
  const formatLastUpdated = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md z-10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Ecobici Mexico City
            </h1>
            <p className="text-sm text-gray-600">
              Real-time bike sharing availability
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              Stations: <span className="font-semibold text-gray-800">{stations.length}</span>
            </div>
            <div className="text-xs text-gray-500">
              Last updated: {formatLastUpdated(lastUpdated)}
            </div>
          </div>
        </div>
      </header>

      {/* Error State */}
      {isError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 z-10">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Failed to load station data. The map will retry automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-2 z-10">
        <div className="flex items-center gap-6 text-sm">
          <span className="text-gray-600 font-medium">Legend:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-gray-700">High (≥40%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span className="text-gray-700">Medium (20-39%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-gray-700">Low (&lt;20%)</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {isLoading && stations.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading station data...</p>
              <p className="text-gray-500 text-sm mt-2">
                Fetching real-time availability from GBFS API
              </p>
            </div>
          </div>
        ) : (
          <EcobiciMap stations={stations} />
        )}
      </div>
    </div>
  );
}
