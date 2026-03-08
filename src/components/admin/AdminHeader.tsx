'use client';

import Link from 'next/link';
import { ArrowLeft, ExternalLink, LogOut } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  showLogout?: boolean;
}

export default function AdminHeader({ title, subtitle, backHref, showLogout }: AdminHeaderProps) {
  return (
    <header className="border-b border-white/5 bg-[#0f0f0f] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {backHref ? (
            <Link href={backHref} className="text-white/30 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </Link>
          ) : (
            <div className="w-10 h-10 bg-[#C9A84C] flex items-center justify-center rounded">
              <span className="text-black font-bold text-sm tracking-wider">RoU</span>
            </div>
          )}
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="text-[11px] text-white/30 tracking-wide uppercase">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-white/30 hover:text-white border border-white/5 hover:border-white/10 rounded transition-all"
          >
            <ExternalLink size={12} /> Live Site
          </a>
          {showLogout && (
            <button className="flex items-center gap-2 px-3 py-1.5 text-xs text-white/30 hover:text-red-400 border border-white/5 hover:border-red-400/20 rounded transition-all">
              <LogOut size={12} /> Sign Out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
