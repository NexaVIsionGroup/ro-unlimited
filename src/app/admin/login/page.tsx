'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Invalid email or password');
      setLoading(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#C9A84C] rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold text-xl tracking-wider">RoU</span>
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Admin Portal</h1>
          <p className="text-xs text-white/30 mt-1">RO Unlimited Site Manager</p>
        </div>

        {/* Form */}
        <div className="bg-[#111] border border-white/5 rounded-xl p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:border-[#C9A84C]/50 focus:outline-none transition-colors"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:border-[#C9A84C]/50 focus:outline-none transition-colors"
                autoComplete="current-password"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading || !email || !password}
              className="w-full py-3 bg-[#C9A84C] text-black font-semibold text-sm rounded-lg hover:bg-[#d4b55a] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </div>

        <p className="text-center text-white/10 text-[10px] mt-6">
          Managed by NexaVision Group
        </p>
      </div>
    </div>
  );
}
