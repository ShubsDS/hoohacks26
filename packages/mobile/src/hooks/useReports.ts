import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Report, useReportsStore } from '../stores/reports.store';

export function useReports(
  lat: number,
  lng: number,
  radius: number = 2000,
) {
  const { reports, setReports } = useReportsStore();

  const query = useQuery<Report[]>({
    queryKey: ['reports', lat, lng, radius],
    queryFn: async () => {
      const { data } = await api.get('/reports/nearby', {
        params: { lat, lng, radius },
      });
      return data;
    },
    refetchInterval: 30000,
    enabled: lat !== 0 && lng !== 0,
  });

  useEffect(() => {
    if (query.data) {
      setReports(query.data);
    }
  }, [query.data]);

  return {
    reports,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
