'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Stats {
  activeCount: number;
  criticalCount: number;
  lastHourCount: number;
  todayConfirmations: number;
  totalUsers: number;
  emergencyCount: number;
  usersInDangerZone: number;
  resolvedToday: number;
}

export default function StatsCards() {
  const { data, isLoading } = useQuery<Stats>({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/api/admin/stats'),
    refetchInterval: 30_000,
  });

  const cards = [
    { label: 'Active Reports', value: data?.activeCount, accent: false },
    { label: 'Active Emergencies', value: data?.emergencyCount, accent: (data?.emergencyCount ?? 0) > 0 },
    { label: 'Users in Danger Zone', value: data?.usersInDangerZone, accent: (data?.usersInDangerZone ?? 0) > 0 },
    { label: 'Total Users', value: data?.totalUsers, accent: false },
    { label: 'Reports Last Hour', value: data?.lastHourCount, accent: false },
    { label: 'Confirmations Today', value: data?.todayConfirmations, accent: false },
    { label: 'Resolved Today', value: data?.resolvedToday, accent: false },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map(({ label, value, accent }) => (
        <div
          key={label}
          className={`bg-white rounded-xl shadow-sm border px-5 py-4 ${
            accent ? 'border-red-400' : 'border-gray-100'
          }`}
        >
          <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${accent ? 'text-red-600' : 'text-[#232D4B]'}`}>
            {isLoading ? '…' : (value ?? 0)}
          </p>
        </div>
      ))}
    </div>
  );
}
