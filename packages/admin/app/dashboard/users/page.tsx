'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AdminUser } from '@/lib/types';

export default function UsersPage() {
  const qc = useQueryClient();

  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/api/admin/users'),
    refetchInterval: 60_000,
  });

  const mutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<AdminUser> }) =>
      api.patch(`/api/admin/users/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#232D4B]">Users</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage users and credibility scores</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Name', 'Email', 'Credibility', 'Reports', 'Confirmed', 'Admin', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
            )}
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{user.displayName}</td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full bg-[#E57200] rounded-full"
                        style={{ width: `${Math.min(100, (user.credibilityScore / 3.0) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{user.credibilityScore.toFixed(1)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">{user.totalReports}</td>
                <td className="px-4 py-3 text-center">{user.confirmedReports}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.isAdmin ? 'bg-[#232D4B] text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {user.isAdmin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => mutation.mutate({ id: user.id, body: { isAdmin: !user.isAdmin } })}
                    className="text-xs text-[#232D4B] hover:underline"
                  >
                    {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
