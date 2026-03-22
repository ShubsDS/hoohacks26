'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import StatsCards from '@/components/StatsCards';
import ReportDetailPanel from '@/components/ReportDetailPanel';
import { api } from '@/lib/api';
import { connectSocket, getSocket } from '@/lib/socket';
import type { Report } from '@/lib/types';

const LiveMap = dynamic(() => import('@/components/LiveMap'), { ssr: false });

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

export default function DashboardPage() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const { data: reports = [], refetch } = useQuery<Report[]>({
    queryKey: ['admin-reports-active'],
    queryFn: () => api.get('/api/admin/reports?status=ACTIVE'),
    refetchInterval: 30_000,
  });

  const { data: stats } = useQuery<Stats>({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/api/admin/stats'),
    refetchInterval: 30_000,
  });

  useEffect(() => {
    connectSocket();
    const socket = getSocket();
    socket.on('report:new', () => refetch());
    socket.on('report:updated', () => refetch());
    socket.on('report:resolved', () => refetch());
    return () => {
      socket.off('report:new');
      socket.off('report:updated');
      socket.off('report:resolved');
    };
  }, [refetch]);

  return (
    <div className="p-6 flex flex-col gap-6 h-full">
      <div>
        <h1 className="text-xl font-bold text-[#232D4B]">Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Live campus safety status</p>
      </div>

      {(stats?.emergencyCount ?? 0) > 0 && (
        <div className="bg-red-600 text-white rounded-xl px-5 py-4 shadow-sm flex items-center gap-3">
          <svg className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-bold text-sm">
              {stats!.emergencyCount} Active Emergency{stats!.emergencyCount !== 1 ? ' Reports' : ' Report'}
            </p>
            <p className="text-sm text-red-100 mt-0.5">
              Users in danger zone: {stats!.usersInDangerZone}
            </p>
          </div>
        </div>
      )}

      <StatsCards />
      <div className="flex-1 min-h-80 rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <LiveMap reports={reports} onSelectReport={setSelectedReport} />
      </div>
      <ReportDetailPanel report={selectedReport} onClose={() => setSelectedReport(null)} />
    </div>
  );
}
