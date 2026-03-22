'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post<{ token: string; user: { isAdmin: boolean } }>('/api/auth/login', { email, password });
      if (!res.user.isAdmin) {
        setError('Admin access required');
        return;
      }
      setToken(res.token);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="bg-[#232D4B] text-white text-center py-6 rounded-t-xl">
          <h1 className="text-2xl font-bold">HoosAlert</h1>
          <p className="text-sm text-blue-200 mt-1">Admin Dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-b-xl px-8 py-8 flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded border border-red-200">{error}</div>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#232D4B]"
              placeholder="you@virginia.edu"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#232D4B]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#E57200] text-white py-2 rounded font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
