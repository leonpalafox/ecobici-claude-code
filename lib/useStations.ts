'use client';

import useSWR from 'swr';
import type { StationsAPIResponse } from '@/types/gbfs';

const REFRESH_INTERVAL = 60000; // 60 seconds as per requirements

const fetcher = async (url: string): Promise<StationsAPIResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch stations');
  }
  return response.json();
};

export function useStations() {
  const { data, error, isLoading, mutate } = useSWR<StationsAPIResponse>(
    '/api/gbfs/stations',
    fetcher,
    {
      refreshInterval: REFRESH_INTERVAL,
      revalidateOnFocus: false,
      dedupingInterval: 10000, // Prevent duplicate requests within 10 seconds
    }
  );

  return {
    stations: data?.stations ?? [],
    lastUpdated: data?.lastUpdated,
    isLoading,
    isError: error,
    mutate, // Allow manual refresh
  };
}
