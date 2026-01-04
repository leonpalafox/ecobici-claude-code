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
      <header className="bg-gradient-to-r from-green-600 to-emerald-700 shadow-lg z-10 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-1">
              🚲 Ecobici Mexico City
            </h1>
            <p className="text-sm text-green-100">
              Real-time bike sharing & public transportation accessibility map
            </p>
            <p className="text-xs text-green-200 mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Click anywhere on the map to see your Transportation Score (Metro, Metrobus, Tren Ligero, Ecobici within 500m)
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-white font-semibold">
              {stations.length} <span className="text-green-200 font-normal">Stations</span>
            </div>
            <div className="text-xs text-green-200 mt-1">
              Updated: {formatLastUpdated(lastUpdated)}
            </div>
            <div className="text-xs text-green-300 mt-2 flex items-center justify-end gap-1">
              <span>Created by</span>
              <span className="font-semibold">Leon Palafox</span>
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
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-300 px-6 py-3 z-10 shadow-sm">
        <div className="flex items-center gap-6 text-sm flex-wrap">
          <span className="text-gray-700 font-semibold">🚇 Transportation Layers:</span>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm">
            <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 border-white shadow-sm">M</div>
            <span className="text-gray-700 font-medium">Metro</span>
            <span className="text-xs text-gray-500">(3x)</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm">
            <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold border-2 border-white shadow-sm">MB</div>
            <span className="text-gray-700 font-medium">Metrobus</span>
            <span className="text-xs text-gray-500">(2x)</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold border-2 border-white shadow-sm">TL</div>
            <span className="text-gray-700 font-medium">Tren Ligero</span>
            <span className="text-xs text-gray-500">(2.5x)</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm">
            <div className="w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            <span className="text-gray-700 font-medium">Ecobici</span>
            <span className="text-xs text-gray-500">(1x)</span>
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

      {/* Footer with Attribution */}
      <footer className="bg-gray-800 text-white px-6 py-3 z-10 shadow-inner">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Data source: Lyft GBFS API</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-400">Public transportation: CDMX Open Data</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Built with</span>
            <a
              href="https://claude.ai/code"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
              Claude Code
            </a>
            <span className="text-gray-600">•</span>
            <span className="text-gray-400">© 2026 Leon Palafox</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
