'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Report, ReportStatus } from '@/lib/types';

interface Props {
  report: Report | null;
  onClose: () => void;
}

const STATUS_LABELS: Record<ReportStatus, string> = {
  ACTIVE: 'Active',
  ADMIN_VERIFIED: 'Verified',
  RESOLVED: 'Resolved',
  DISMISSED: 'Dismissed',
};

export default function ReportDetailPanel({ report, onClose }: Props) {
  const qc = useQueryClient();
  const [adminNote, setAdminNote] = useState(report?.adminNote ?? '');

  const mutation = useMutation({
    mutationFn: (body: { status?: ReportStatus; adminNote?: string }) =>
      api.patch(`/api/admin/reports/${report!.id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  if (!report) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l flex flex-col z-50">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h2 className="font-semibold text-gray-900 truncate">{report.title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        <div className="flex gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{report.category}</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">{report.severity}</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{STATUS_LABELS[report.status]}</span>
        </div>

        {report.description && <p className="text-sm text-gray-600">{report.description}</p>}

        {report.imageUrl && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Attached Photo</p>
            <img
              src={report.imageUrl}
              alt="Report photo"
              className="w-full rounded-lg border border-gray-200 max-h-64 object-cover"
            />
          </div>
        )}

        <div className="text-xs text-gray-500 flex flex-col gap-1">
          <span>Reporter: {report.reporter?.displayName ?? 'Unknown'} (score: {report.reporter?.credibilityScore?.toFixed(1)})</span>
          <span>Confirmations: {report.confirmationCount}</span>
          <span>Radius: {report.radiusMeters}m</span>
          <span>Created: {new Date(report.createdAt).toLocaleString()}</span>
          <span>Expires: {new Date(report.expiresAt).toLocaleString()}</span>
        </div>

        {report.adminNote && (
          <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-sm text-blue-800">
            {report.adminNote}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Admin Note</label>
          <textarea
            value={adminNote}
            onChange={e => setAdminNote(e.target.value)}
            rows={3}
            className="border border-gray-300 rounded px-2 py-1.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#232D4B]"
            placeholder="Add a note visible to users…"
          />
          <button
            onClick={() => mutation.mutate({ adminNote })}
            disabled={mutation.isPending}
            className="self-end text-xs bg-[#232D4B] text-white px-3 py-1.5 rounded hover:opacity-90 disabled:opacity-50"
          >
            Save Note
          </button>
        </div>
      </div>

      <div className="px-5 py-4 border-t flex flex-col gap-2">
        <button
          onClick={() => mutation.mutate({ status: 'ADMIN_VERIFIED' })}
          disabled={mutation.isPending || report.status === 'ADMIN_VERIFIED'}
          className="w-full py-2 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-40"
        >
          Mark as Verified
        </button>
        <button
          onClick={() => mutation.mutate({ status: 'RESOLVED' })}
          disabled={mutation.isPending || report.status === 'RESOLVED'}
          className="w-full py-2 rounded bg-[#E57200] text-white text-sm font-medium hover:opacity-90 disabled:opacity-40"
        >
          Mark Resolved
        </button>
        <button
          onClick={() => mutation.mutate({ status: 'DISMISSED' })}
          disabled={mutation.isPending || report.status === 'DISMISSED'}
          className="w-full py-2 rounded bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 disabled:opacity-40"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
