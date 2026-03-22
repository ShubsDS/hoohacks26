'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Severity } from '@/lib/types';

export default function BroadcastForm() {
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<Severity>('HIGH');
  const [sent, setSent] = useState(false);

  const mutation = useMutation({
    mutationFn: () => api.post('/api/admin/broadcast', { message, severity }),
    onSuccess: () => {
      setSent(true);
      setMessage('');
      setTimeout(() => setSent(false), 4000);
    },
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-lg">
      <h2 className="font-semibold text-gray-900 mb-4">Send Alert to All Users</h2>

      {sent && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2 rounded">
          Alert sent successfully.
        </div>
      )}
      {mutation.error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">
          {mutation.error.message}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Message</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            maxLength={300}
            className="border border-gray-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#232D4B]"
            placeholder="Alert message to send to all UVA users…"
          />
          <span className="text-xs text-gray-400 self-end">{message.length}/300</span>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Severity</label>
          <select
            value={severity}
            onChange={e => setSeverity(e.target.value as Severity)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#232D4B]"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <button
          onClick={() => mutation.mutate()}
          disabled={!message.trim() || mutation.isPending}
          className="bg-[#E57200] text-white py-2.5 rounded font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {mutation.isPending ? 'Sending…' : 'Send Alert to All Users'}
        </button>
      </div>
    </div>
  );
}
