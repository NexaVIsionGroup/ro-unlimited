'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { Video, Image, FileText, ChevronRight, ArrowUpRight, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface SiteSettings {
  heroVideoUrl?: string;
}

export default function AdminDashboard() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [projectCount, setProjectCount] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(setSettings).catch(() => {});
    fetch('/api/admin/projects').then(r => r.json()).then(d => setProjectCount(Array.isArray(d) ? d.length : 0)).catch(() => {});
  }, []);

  // Entrance animation
  useEffect(() => {
    if (!contentRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(contentRef.current!.children,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power3.out', delay: 0.1 }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div ref={contentRef} className="px-4 py-5 space-y-4">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-bold text-white">Dashboard</h2>
        <p className="text-xs text-white/30 mt-0.5">RO Unlimited site overview</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#141414] border border-white/5 rounded-xl p-3">
          <Video size={14} className="text-[#C9A84C] mb-2" />
          <p className="text-[10px] text-white/30 uppercase tracking-wider">Hero</p>
          <p className={`text-sm font-semibold ${settings.heroVideoUrl ? 'text-green-400' : 'text-yellow-400'}`}>
            {settings.heroVideoUrl ? 'Active' : 'No Video'}
          </p>
        </div>
        <div className="bg-[#141414] border border-white/5 rounded-xl p-3">
          <Image size={14} className="text-[#C9A84C] mb-2" />
          <p className="text-[10px] text-white/30 uppercase tracking-wider">Projects</p>
          <p className="text-sm font-semibold text-white/60">{projectCount}</p>
        </div>
        <div className="bg-[#141414] border border-white/5 rounded-xl p-3">
          <FileText size={14} className="text-[#C9A84C] mb-2" />
          <p className="text-[10px] text-white/30 uppercase tracking-wider">Pages</p>
          <p className="text-sm font-semibold text-white/60">6 live</p>
        </div>
      </div>

      {/* Launch Checklist CTA */}
      <Link href="/admin/checklist" className="block bg-gradient-to-r from-[#C9A84C]/10 to-[#C9A84C]/5 border border-[#C9A84C]/20 rounded-xl p-4 group">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={14} className="text-[#C9A84C]" />
              <span className="text-[10px] text-[#C9A84C] font-semibold uppercase tracking-wider">Action Needed</span>
            </div>
            <h3 className="text-base font-bold text-white">Launch Checklist</h3>
            <p className="text-xs text-white/30 mt-0.5">Complete items to get your site live</p>
          </div>
          <ArrowUpRight size={20} className="text-[#C9A84C] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </Link>

      {/* Recent Activity */}
      <div>
        <h3 className="text-xs text-white/30 uppercase tracking-wider mb-3">Recent Activity</h3>
        <div className="space-y-2">
          <div className="bg-[#141414] border border-white/5 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={14} className="text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/70">Hero video uploaded</p>
              <p className="text-[10px] text-white/20">Sequence 01.mp4</p>
            </div>
            <span className="text-[9px] text-white/15 flex-shrink-0">Today</span>
          </div>
          <div className="bg-[#141414] border border-white/5 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 flex items-center justify-center flex-shrink-0">
              <Clock size={14} className="text-[#C9A84C]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/70">Admin portal launched</p>
              <p className="text-[10px] text-white/20">Dashboard, checklist, and site editor ready</p>
            </div>
            <span className="text-[9px] text-white/15 flex-shrink-0">Today</span>
          </div>
          <div className="bg-[#141414] border border-white/5 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <FileText size={14} className="text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/70">Website deployed</p>
              <p className="text-[10px] text-white/20">rounlimited.nexavisiongroup.com</p>
            </div>
            <span className="text-[9px] text-white/15 flex-shrink-0">Today</span>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="text-xs text-white/30 uppercase tracking-wider mb-3">Quick Links</h3>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/admin/site-editor" className="bg-[#141414] border border-white/5 rounded-xl p-3 group">
            <Pencil size={16} className="text-white/20 group-hover:text-[#C9A84C] mb-2 transition-colors" />
            <p className="text-xs font-medium text-white/60 group-hover:text-white transition-colors">Site Editor</p>
          </Link>
          <Link href="/admin/projects" className="bg-[#141414] border border-white/5 rounded-xl p-3 group">
            <Camera size={16} className="text-white/20 group-hover:text-[#C9A84C] mb-2 transition-colors" />
            <p className="text-xs font-medium text-white/60 group-hover:text-white transition-colors">Portfolio</p>
          </Link>
        </div>
      </div>

      {/* Bottom spacer for tab bar */}
      <div className="h-4" />
    </div>
  );
}
