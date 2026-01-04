# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Real-time web application displaying Ecobici (Mexico City bike sharing) station availability using Next.js 16, React 19, TypeScript, and Leaflet maps. Data is fetched from the Lyft GBFS (General Bikeshare Feed Specification) API with automatic 60-second polling.

## Build & Run Commands

```bash
npm run dev        # Start development server at http://localhost:3000
npm run build      # Create production build
npm run start      # Start production server
npm run lint       # Run ESLint on all files
```

## Data Flow Architecture

```
GBFS API → Next.js API Route → SWR Hook → React Components → Leaflet Map
```

1. **GBFS API**: External Lyft API provides real-time station data
   - Entry point: `https://gbfs.mex.lyftbikes.com/gbfs/gbfs.json`
   - Returns feed URLs for `station_information` (static) and `station_status` (real-time)

2. **API Route** (`/app/api/gbfs/stations/route.ts`):
   - Proxies GBFS data to handle CORS restrictions
   - Fetches both feeds in parallel
   - Merges datasets on `station_id`
   - Calculates `availabilityPercentage` for color coding
   - Returns unified JSON response

3. **Data Fetching** (`/lib/useStations.ts`):
   - Custom SWR hook with 60-second auto-refresh
   - Client-side caching and deduplication
   - Provides `stations`, `isLoading`, `isError` states

4. **Map Component** (`/components/EcobiciMap.tsx`):
   - Leaflet map with marker clustering (performance optimization)
   - Color-coded markers: Green (≥40%), Orange (20-39%), Red (<20%)
   - Interactive popups showing bike/dock availability

5. **Main Page** (`/app/page.tsx`):
   - Client component with dynamic map import (SSR disabled for Leaflet)
   - Header with station count and last updated timestamp
   - Error handling with retry logic
   - Loading states with spinner

## Key Files & Responsibilities

### Type Definitions
- **types/gbfs.ts**: TypeScript interfaces for GBFS API responses
  - `StationInformation`: Static metadata (lat, lon, name, capacity)
  - `StationStatus`: Real-time data (bikes available, docks available)
  - `MergedStation`: Combined station data with availability percentage

### API Layer
- **app/api/gbfs/stations/route.ts**: Server-side API route
  - Prevents CORS issues by proxying external API
  - Data transformation and merging logic
  - Error handling for API failures

### Data Layer
- **lib/useStations.ts**: SWR-powered data fetching hook
  - Automatic revalidation every 60 seconds
  - Optimistic UI updates
  - Prevents duplicate requests

### UI Components
- **components/EcobiciMap.tsx**: Leaflet map component (client-only)
  - Uses `react-leaflet` and `react-leaflet-cluster`
  - Custom SVG markers with dynamic colors
  - Auto-centers map on station bounds
  - Popup UI with Tailwind styling

- **app/page.tsx**: Main application page
  - Dynamic import for map (avoids SSR issues with Leaflet)
  - Error boundary with user-friendly messages
  - Legend showing availability color codes

### Styling
- **app/globals.css**: Global styles + Leaflet CSS imports
  - Tailwind CSS 4 directives
  - Custom Leaflet popup styling
  - Full-screen layout (overflow hidden)

## Performance Optimizations

1. **Marker Clustering**: Groups nearby stations to prevent rendering hundreds of individual markers
2. **60-Second Polling**: Balances real-time updates with API rate limits
3. **SWR Caching**: Prevents redundant API calls, deduplicates requests
4. **Dynamic Import**: Map component loads client-side only (avoids SSR overhead)
5. **Parallel Fetching**: `station_information` and `station_status` fetched simultaneously

## Code Conventions

- **TypeScript**: Strict mode enabled, all types explicitly defined
- **Naming**:
  - Variables/functions: `camelCase`
  - Components: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`
- **React**: Functional components with hooks (no class components)
- **Styling**: Tailwind utility classes (avoid custom CSS where possible)

## Common Development Tasks

### Adding New Station Data Fields

1. Update `types/gbfs.ts` with new fields in `StationInformation` or `StationStatus`
2. Modify `app/api/gbfs/stations/route.ts` if data transformation needed
3. Update `components/EcobiciMap.tsx` popup to display new fields

### Changing Refresh Interval

Edit `REFRESH_INTERVAL` constant in `lib/useStations.ts` (currently 60000ms)

### Customizing Map Appearance

- **Tile Layer**: Change URL in `components/EcobiciMap.tsx` `<TileLayer>` component
- **Marker Colors**: Modify `getMarkerColor()` thresholds or color values
- **Clustering Radius**: Adjust `maxClusterRadius` in `<MarkerClusterGroup>`

### Testing API Endpoint

```bash
# While dev server is running:
curl http://localhost:3000/api/gbfs/stations | jq
```

## Dependencies

### Core
- **next** (16.1.1): React framework with App Router
- **react** (19.2.3): UI library
- **typescript** (5.x): Type safety

### Mapping
- **leaflet** (1.9.x): Interactive maps library
- **react-leaflet**: React wrapper for Leaflet
- **react-leaflet-cluster**: Marker clustering
- **leaflet.markercluster**: Clustering plugin

### Data Fetching
- **swr**: React hooks for data fetching with caching

### Styling
- **tailwindcss** (4.x): Utility-first CSS framework

## Known Issues & Solutions

### CORS Errors
- **Issue**: Direct browser requests to GBFS API may fail due to CORS
- **Solution**: All API calls go through Next.js API route (`/api/gbfs/stations`)

### Map Not Rendering
- **Issue**: Leaflet requires client-side rendering (window object)
- **Solution**: Map component imported dynamically with `ssr: false`

### Marker Icons Missing
- **Issue**: Default Leaflet icons don't load with webpack
- **Solution**: Using custom SVG markers via `L.divIcon` instead

## Deployment

Optimized for Vercel (zero-config):
1. Push to GitHub
2. Import repository in Vercel
3. Deploy automatically

**Environment Variables**: None required (public GBFS API)

**Build Output**:
- Static pages: `/` (fallback)
- Dynamic routes: `/api/gbfs/stations` (on-demand)
