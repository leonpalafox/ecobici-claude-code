// GBFS API Type Definitions

export interface GBFSFeed {
  name: string;
  url: string;
}

export interface GBFSMasterResponse {
  last_updated: number;
  ttl: number;
  version: string;
  data: {
    [language: string]: {
      feeds: GBFSFeed[];
    };
  };
}

export interface StationInformation {
  station_id: string;
  name: string;
  short_name: string;
  lat: number;
  lon: number;
  capacity: number;
  address?: string;
}

export interface StationInformationResponse {
  last_updated: number;
  ttl: number;
  version: string;
  data: {
    stations: StationInformation[];
  };
}

export interface StationStatus {
  station_id: string;
  num_bikes_available: number;
  num_docks_available: number;
  is_installed: number;
  is_renting: number;
  is_returning: number;
  last_reported: number;
}

export interface StationStatusResponse {
  last_updated: number;
  ttl: number;
  version: string;
  data: {
    stations: StationStatus[];
  };
}

// Merged station data for display on map
export interface MergedStation extends StationInformation, StationStatus {
  availabilityPercentage: number;
}

// API Response types for our Next.js API routes
export interface StationsAPIResponse {
  stations: MergedStation[];
  lastUpdated: number;
}
