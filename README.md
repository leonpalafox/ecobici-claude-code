# 🚲 Ecobici Mexico City - Transportation Accessibility Map

A real-time web application that visualizes Ecobici (Mexico City's bike-sharing system) station availability alongside comprehensive public transportation data, featuring an interactive heatmap showing transportation accessibility scores across the city.

![Built with Claude Code](https://img.shields.io/badge/Built%20with-Claude%20Code-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

## ✨ Features

### Real-Time Bike Sharing
- **Live station data** from Lyft's GBFS (General Bikeshare Feed Specification) API
- **Auto-refresh** every 60 seconds to keep data current
- **Color-coded markers** based on bike availability:
  - 🟢 Green: ≥40% bikes available
  - 🟠 Orange: 20-39% bikes available
  - 🔴 Red: <20% bikes available
- **Marker clustering** for optimal performance with hundreds of stations

### Comprehensive Public Transportation Data
- **🚇 Metro**: 195 stations across 12 lines
- **🚌 Metrobus**: 161 stations across 7 lines (including Line 3 expansion to Santa Cruz Atoyac)
- **🚋 Tren Ligero**: 18 stations (Xochimilco Line)
- **🚲 Ecobici**: 500+ bike-sharing stations

### Transportation Accessibility Heatmap
- **Interactive grid-based heatmap** showing transportation scores across Mexico City
- **Jet color scale** visualization (red = poor access, blue = excellent access)
- **Weighted scoring system**:
  - Metro: 3x weight (highest priority - fast, frequent, reliable)
  - Tren Ligero: 2.5x weight (high priority - light rail)
  - Metrobus: 2x weight (high priority - BRT system)
  - Ecobici: 1x weight (bikes, weather-dependent)
- **500-meter radius** analysis for each location
- **~800m grid cells** covering the entire CDMX metropolitan area

### Click-to-Analyze Feature
Click anywhere on the map to see:
- **Overall transportation score** for that location
- **Breakdown by transit type** with individual contributions
- **List of nearby stations** within 500m radius
- **Distance to nearest station** for each transit type
- **Available bikes** at nearby Ecobici stations

### Modern, Responsive UI
- **Gradient header** with real-time station count
- **Pill-shaped legend** showing all transportation layers
- **Animated score panel** with detailed breakdowns
- **Toggle button** to show/hide the heatmap
- **Mobile-responsive** design
- **Dark footer** with attribution and links

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with modern hooks
- **TypeScript 5** - Type-safe development

### Mapping & Visualization
- **Leaflet 1.9** - Interactive map library
- **react-leaflet** - React components for Leaflet
- **react-leaflet-cluster** - Marker clustering
- **OpenStreetMap** - Map tiles

### Data & State Management
- **SWR** - React hooks for data fetching with caching
- **GBFS API** - Real-time bike sharing data
- **CDMX Open Data** - Public transportation coordinates

### Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **CSS Gradients** - Modern gradient designs
- **Custom animations** - Smooth transitions and interactions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/leonpalafox/ecobici-claude-code.git
   cd ecobici-claude-code
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   Navigate to http://localhost:3000
   ```

### Build for Production

```bash
npm run build
npm run start
```

## 📊 Data Sources

### Real-Time Data
- **Ecobici Stations**: [Lyft GBFS API](https://gbfs.mex.lyftbikes.com/gbfs/gbfs.json)
  - Updates every 60 seconds
  - Provides bike and dock availability
  - Station status and location

### Static Transportation Data
- **Metro Stations**: CDMX Open Data Portal & Moovit
  - 195 stations across 12 lines
  - Verified coordinates from multiple sources

- **Metrobus Stations**: CDMX Open Data & MapCarta
  - 161 stations across 7 lines
  - Includes March 2021 Line 3 expansion

- **Tren Ligero Stations**: Moovit Transit Data
  - 18 stations (Tasqueña to Xochimilco)
  - 13.4 km route

## 🎨 Features in Detail

### Transportation Score Calculation

The accessibility score uses an **inverse distance weighting** formula:

```
Score = Σ (weight / (1 + distance/100))
```

Where:
- **weight** = Transit mode priority multiplier
- **distance** = Distance to nearest station in meters
- Closer stations = higher contribution to score
- Multiple transit modes = additive scores

### Heatmap Technology

- **Grid-based rendering** with ~4,200 cells
- **0.008° cell size** (~800m squares)
- **Full CDMX coverage** (19.05°-19.60° N, 99.35°-98.95° W)
- **Jet color scale** with 5-stage gradient
- **Click-through enabled** for underlying features

### Performance Optimizations

1. **Marker Clustering**: Groups nearby stations to reduce DOM elements
2. **60-Second Polling**: Balances freshness with API rate limits
3. **SWR Caching**: Prevents redundant requests
4. **Dynamic Imports**: Map loads client-side only (no SSR)
5. **Parallel Fetching**: GBFS feeds fetched simultaneously
6. **Grid Optimization**: ~800m cells for smooth rendering

## 📁 Project Structure

```
claude-code-website/
├── app/
│   ├── api/
│   │   └── gbfs/
│   │       └── stations/
│   │           └── route.ts          # GBFS API proxy
│   ├── globals.css                   # Global styles + Leaflet CSS
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Main page with header/footer
├── components/
│   └── EcobiciMap.tsx                # Map component with heatmap
├── data/
│   ├── metro-stations.ts             # 195 Metro stations
│   ├── metrobus-stations.ts          # 161 Metrobus stations
│   └── tren-ligero-stations.ts       # 18 Tren Ligero stations
├── lib/
│   └── useStations.ts                # SWR hook for data fetching
├── types/
│   └── gbfs.ts                       # TypeScript interfaces
└── package.json
```

## 🌟 Key Components

### `page.tsx`
- Main application page
- Header with gradient styling
- Legend showing transportation layers
- Footer with attribution
- Dynamic map import

### `EcobiciMap.tsx`
- Leaflet map integration
- Marker clustering
- Heatmap generation and rendering
- Click handler for score calculation
- Transportation score panel
- Toggle button for heatmap

### `useStations.ts`
- Custom SWR hook
- 60-second auto-refresh
- Data caching and deduplication
- Error handling

### `route.ts` (API)
- GBFS API proxy
- Handles CORS restrictions
- Merges station info and status
- Calculates availability percentages

## 🔧 Configuration

### Refresh Interval
Edit `REFRESH_INTERVAL` in `lib/useStations.ts`:
```typescript
const REFRESH_INTERVAL = 60000; // milliseconds
```

### Heatmap Grid Size
Edit `gridSize` in `components/EcobiciMap.tsx`:
```typescript
const gridSize = 0.008; // degrees (~800m cells)
```

### Transportation Weights
Edit `WEIGHTS` in `components/EcobiciMap.tsx`:
```typescript
const WEIGHTS = {
  metro: 3.0,
  metrobus: 2.0,
  trenLigero: 2.5,
  ecobici: 1.0,
};
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import repository in Vercel
3. Deploy automatically

**No environment variables required** - uses public APIs only.

### Other Platforms
Build static export:
```bash
npm run build
```

Deploy the `.next` folder to any static hosting service.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Areas for Contribution
- Add more public transportation data (Cablebús, Trolebús)
- Improve heatmap algorithm
- Add historical data analysis
- Mobile app version
- Accessibility improvements
- Performance optimizations

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Leon Palafox**
- Built with [Claude Code](https://claude.ai/code)
- Data sources: Lyft GBFS API, CDMX Open Data

## 🙏 Acknowledgments

- **Lyft** for providing the GBFS API
- **CDMX Government** for open transportation data
- **OpenStreetMap** contributors for map tiles and coordinate verification
- **Moovit** for transit data validation
- **MapCarta** for station coordinate verification
- **Claude Code** for AI-assisted development

## 📸 Screenshots

### Main Map View
Interactive map showing all transportation layers with Ecobici stations, Metro, Metrobus, and Tren Ligero.

### Heatmap View
Jet color scale visualization showing transportation accessibility across Mexico City (red = poor access, blue = excellent access).

### Transportation Score Panel
Click anywhere to see detailed accessibility scores with breakdowns by transit type and nearby station lists.

---

**Built with ❤️ using Claude Code • © 2026 Leon Palafox**
