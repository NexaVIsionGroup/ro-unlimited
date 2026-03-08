'use client';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';

export default function LeadsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/5 bg-[#0f0f0f]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center gap-4">
          <Link href="/admin" className="text-white/30 hover:text-white transition-colors"><ArrowLeft size={18} /></Link>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Leads</h1>
            <p className="text-[11px] text-white/30 tracking-wide uppercase">Contact form submissions</p>
          </div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-16 text-center">
        <Mail size={40} className="mx-auto mb-4 text-white/10" />
        <h2 className="text-lg font-semibold mb-2">Coming Soon</h2>
        <p className="text-white/30 text-sm">Contact form submissions will appear here once the form is connected.</p>
      </div>
    </div>
  );
}
