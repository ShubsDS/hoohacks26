'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Report, ReportStatus, ReportCategory, Severity } from '@/lib/types';
import ReportDetailPanel from './ReportDetailPanel';

const SEVERITY_COLORS: Record<Severity, string> = {
  CRITICAL: 'bg-red-100 text-red-800',
  HIGH: 'bg-orange-100 text-orange-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-green-100 text-green-800',
};

const STATUS_COLORS: Record<ReportStatus, string> = {
  ACTIVE: 'bg-blue-100 text-blue-800',
  ADMIN_VERIFIED: 'bg-green-100 text-green-800',
  RESOLVED: 'bg-gray-100 text-gray-600',
  DISMISSED: 'bg-gray-100 text-gray-400',
};

export default function ReportsTable() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selected, setSelected] = useState<Report | null>(null);

  const { data: reports = [], isLoading } = useQuery<Report[]>({
    queryKey: ['admin-reports', statusFilter, categoryFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      return api.get(`/api/admin/reports?${params}`);
    },
    refetchInterval: 15_000,
  });

  return (
    <>
      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#232D4B]"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="ADMIN_VERIFIED">Verified</option>
          <option value="RESOLVED">Resolved</option>
          <option value="DISMISSED">Dismissed</option>
        </select>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#232D4B]"
        >
          <option value="">All Categories</option>
          {(['EMERGENCY','CRIME','INFRASTRUCTURE','WEATHER','PROTEST','OTHER'] as ReportCategory[]).map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Created', 'Category', 'Severity', 'Title', 'Reporter', 'Score', 'Confirms', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
            )}
            {!isLoading && reports.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No reports found</td></tr>
            )}
            {reports.map(report => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {new Date(report.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">{report.category}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS[report.severity]}`}>
                    {report.severity}
                  </span>
                </td>
                <td className="px-4 py-3 max-w-48 truncate font-medium text-gray-900">
                  {report.title}
                  {report.imageUrl && <span className="ml-1 text-gray-400" title="Has photo">📷</span>}
                </td>
                <td className="px-4 py-3 text-gray-600">{report.reporter?.displayName ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{report.reporter?.credibilityScore?.toFixed(1) ?? '—'}</td>
                <td className="px-4 py-3 text-center">{report.confirmationCount}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[report.status]}`}>
                    {report.status}
                  </span>
                </td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <button
                    onClick={() => setSelected(report)}
                    className="text-[#232D4B] hover:underline text-xs font-medium"
                  >
                    View
                  </button>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await api.delete(`/api/admin/reports/${report.id}`);
                        qc.invalidateQueries({ queryKey: ['admin-reports'] });
                      } catch (err) {
                        console.error('Failed to delete report:', err);
                      }
                    }}
                    className="text-red-500 hover:text-red-700 text-base font-bold leading-none"
                    title="Delete report"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ReportDetailPanel
        report={selected}
        onClose={() => {
          setSelected(null);
          qc.invalidateQueries({ queryKey: ['admin-reports'] });
        }}
      />
    </>
  );
}
