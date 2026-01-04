import { NextResponse } from 'next/server';
import type {
  GBFSMasterResponse,
  StationInformationResponse,
  StationStatusResponse,
  MergedStation,
  StationsAPIResponse,
} from '@/types/gbfs';

const GBFS_BASE_URL = 'https://gbfs.mex.lyftbikes.com/gbfs/gbfs.json';

export async function GET() {
  try {
    // 1. Fetch the master feed to discover URLs
    const masterResponse = await fetch(GBFS_BASE_URL);
    if (!masterResponse.ok) {
      throw new Error(`Failed to fetch master feed: ${masterResponse.statusText}`);
    }
    const masterData: GBFSMasterResponse = await masterResponse.json();

    // Get the feeds for the default language (typically 'en')
    const feeds = masterData.data.en?.feeds || Object.values(masterData.data)[0]?.feeds;
    if (!feeds) {
      throw new Error('No feeds found in master data');
    }

    // 2. Find the station_information and station_status URLs
    const stationInfoFeed = feeds.find((f) => f.name === 'station_information');
    const stationStatusFeed = feeds.find((f) => f.name === 'station_status');

    if (!stationInfoFeed || !stationStatusFeed) {
      throw new Error('Required feeds not found');
    }

    // 3. Fetch both feeds in parallel
    const [infoResponse, statusResponse] = await Promise.all([
      fetch(stationInfoFeed.url),
      fetch(stationStatusFeed.url),
    ]);

    if (!infoResponse.ok || !statusResponse.ok) {
      throw new Error('Failed to fetch station data');
    }

    const stationInfo: StationInformationResponse = await infoResponse.json();
    const stationStatus: StationStatusResponse = await statusResponse.json();

    // 4. Merge the datasets on station_id
    const statusMap = new Map(
      stationStatus.data.stations.map((s) => [s.station_id, s])
    );

    const mergedStations: MergedStation[] = stationInfo.data.stations
      .map((info) => {
        const status = statusMap.get(info.station_id);
        if (!status) return null;

        // Calculate availability percentage
        const totalCapacity = status.num_bikes_available + status.num_docks_available;
        const availabilityPercentage =
          totalCapacity > 0 ? (status.num_bikes_available / totalCapacity) * 100 : 0;

        return {
          ...info,
          ...status,
          availabilityPercentage,
        };
      })
      .filter((station): station is MergedStation => station !== null);

    const response: StationsAPIResponse = {
      stations: mergedStations,
      lastUpdated: stationStatus.last_updated,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching GBFS data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch station data' },
      { status: 500 }
    );
  }
}
