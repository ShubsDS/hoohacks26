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

export default function DashboardPage() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const { data: reports = [], refetch } = useQuery<Report[]>({
    queryKey: ['admin-reports-active'],
    queryFn: () => api.get('/api/admin/reports?status=ACTIVE'),
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
      <StatsCards />
      <div className="flex-1 min-h-80 rounded-xl overflow-hidden shadow-sm border border-gray-100">
        <LiveMap reports={reports} onSelectReport={setSelectedReport} />
      </div>
      <ReportDetailPanel report={selectedReport} onClose={() => setSelectedReport(null)} />
    </div>
  );
}
