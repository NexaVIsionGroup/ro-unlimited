'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import {
  Video, FileText, ArrowUpRight, CheckCircle2,
  AlertCircle, Pencil, Camera, Clock
} from 'lucide-react';

interface SiteSettings {
  heroVideoUrl?: string;
}

export default function AdminDashboard() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [projectCount, setProjectCount] = useState(0);

  const splashRef = useRef<HTMLDivElement>(null);
  const splashRoRef = useRef<HTMLImageElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLAnchorElement>(null);
  const row3Ref = useRef<HTMLDivElement>(null);
  const activityRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(setSettings).catch(() => {});
    fetch('/api/admin/projects').then(r => r.json()).then(d => setProjectCount(Array.isArray(d) ? d.length : 0)).catch(() => {});
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hide everything at start
      gsap.set([row1Ref.current, row2Ref.current, row3Ref.current], { opacity: 0, y: 20 });
      gsap.set(activityRef.current, { opacity: 0, y: 20 });
      gsap.set([card1Ref.current, card2Ref.current, card3Ref.current], { opacity: 0, x: 50 });
      gsap.set(splashRef.current, { opacity: 1 });
      gsap.set(splashRoRef.current, { opacity: 0, scale: 0.88 });

      // Hide AppShell header
      const headerEl = document.querySelector('[data-admin-header]');
      if (headerEl) gsap.set(headerEl, { opacity: 0, y: -30 });

      const tl = gsap.timeline();

      // PHASE 1: RO fades in on black, breathes
      tl.to(splashRoRef.current, {
        opacity: 0.85, scale: 1,
        duration: 1.1, ease: 'power2.out',
      })
      .to(splashRoRef.current, {
        scale: 1.05, opacity: 0.95,
        duration: 1.3, ease: 'sine.inOut',
        yoyo: true, repeat: 1,
      })

      // PHASE 2: splash dissolves out
      .to(splashRef.current, {
        opacity: 0, duration: 0.7, ease: 'power2.inOut',
        onComplete: () => {
          if (splashRef.current) splashRef.current.style.pointerEvents = 'none';
        },
      }, '+=0.1')

      // Cards slide in from right one by one
      .to(activityRef.current, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, '-=0.3')
      .to(card1Ref.current, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out' }, '-=0.05')
      .to(card2Ref.current, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out' }, '-=0.2')
      .to(card3Ref.current, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out' }, '-=0.2')

      // Quick actions
      .to(row3Ref.current, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, '-=0.15')

      // Checklist CTA
      .to(row2Ref.current, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, '-=0.2')

      // Stats row
      .to(row1Ref.current, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, '-=0.2')

      // Header logo drops in last
      .to(headerEl, { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' }, '-=0.1');
    });

    return () => ctx.revert();
  }, []);

  const hasVideo = !!settings.heroVideoUrl;

  return (
    <>
      {/* SPLASH — fullscreen black with big RO */}
      <div
        ref={splashRef}
        className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center"
        style={{ zIndex: 100 }}
      >
        <img
          ref={splashRoRef}
          src="/ro-icon.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none select-none"
          style={{
            width: '82vw',
            maxWidth: '400px',
            objectFit: 'fill',
            transform: 'scaleY(1.35)',
            transformOrigin: 'center center',
          }}
        />
      </div>

      {/* DASHBOARD */}
      <div className="flex flex-col h-full px-3 py-3 gap-3 relative">

        {/* Persistent dim RO watermark behind content */}
        <img
          src="/ro-icon.svg"
          alt=""
          aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{
            opacity: 0.05,
            width: '80vw',
            left: '10vw',
            top: '50%',
            transform: 'translateY(-50%) scaleY(1.4)',
            transformOrigin: 'center center',
            objectFit: 'fill',
            zIndex: 0,
          }}
        />

        {/* Row 1: Stats */}
        <div ref={row1Ref} className="flex items-center justify-between relative z-10">
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">Dashboard</h2>
            <p className="text-[9px] text-white/25 uppercase tracking-wider">Site overview</p>
          </div>
          <div className="flex gap-1.5">
            <div className="bg-[#141414] border border-white/5 rounded-lg px-2.5 py-1.5 text-center min-w-[60px]">
              <p className="text-[8px] text-white/25 uppercase tracking-wider leading-none">Hero</p>
              <p className={`text-[11px] font-semibold leading-tight mt-0.5 ${hasVideo ? 'text-green-400' : 'text-yellow-400'}`}>
                {hasVideo ? 'Active' : 'None'}
              </p>
            </div>
            <div className="bg-[#141414] border border-white/5 rounded-lg px-2.5 py-1.5 text-center min-w-[60px]">
              <p className="text-[8px] text-white/25 uppercase tracking-wider leading-none">Projects</p>
              <p className="text-[11px] font-semibold text-white/50 leading-tight mt-0.5">{projectCount}</p>
            </div>
            <div className="bg-[#141414] border border-white/5 rounded-lg px-2.5 py-1.5 text-center min-w-[60px]">
              <p className="text-[8px] text-white/25 uppercase tracking-wider leading-none">Pages</p>
              <p className="text-[11px] font-semibold text-white/50 leading-tight mt-0.5">6</p>
            </div>
          </div>
        </div>

        {/* Row 2: Checklist CTA */}
        <Link ref={row2Ref} href="/admin/checklist" className="block bg-gradient-to-r from-[#C9A84C]/10 to-transparent border border-[#C9A84C]/20 rounded-xl px-3 py-2.5 group relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-[#C9A84C] flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">Launch Checklist</h3>
                <p className="text-[10px] text-white/25">Items needed to go live</p>
              </div>
            </div>
            <ArrowUpRight size={16} className="text-[#C9A84C] flex-shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </Link>

        {/* Row 3: Quick Actions */}
        <div ref={row3Ref} className="grid grid-cols-4 gap-2 relative z-10">
          <Link href="/admin/site-editor" className="bg-[#141414] border border-white/5 rounded-xl p-2.5 flex flex-col items-center gap-1.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center">
              <Pencil size={16} className="text-[#C9A84C]" />
            </div>
            <p className="text-[9px] text-white/40 text-center leading-tight">Editor</p>
          </Link>
          <Link href="/admin/projects" className="bg-[#141414] border border-white/5 rounded-xl p-2.5 flex flex-col items-center gap-1.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center">
              <Camera size={16} className="text-[#C9A84C]" />
            </div>
            <p className="text-[9px] text-white/40 text-center leading-tight">Portfolio</p>
          </Link>
          <Link href="/admin/checklist" className="bg-[#141414] border border-white/5 rounded-xl p-2.5 flex flex-col items-center gap-1.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center">
              <FileText size={16} className="text-[#C9A84C]" />
            </div>
            <p className="text-[9px] text-white/40 text-center leading-tight">Pages</p>
          </Link>
          <Link href="/admin/settings" className="bg-[#141414] border border-white/5 rounded-xl p-2.5 flex flex-col items-center gap-1.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center">
              <Video size={16} className="text-[#C9A84C]" />
            </div>
            <p className="text-[9px] text-white/40 text-center leading-tight">Media</p>
          </Link>
        </div>

        {/* Row 4: Activity */}
        <div ref={activityRef} className="flex-1 min-h-0 flex flex-col relative z-10">
          <p className="text-[9px] text-white/20 uppercase tracking-wider mb-2 px-0.5">Recent Activity</p>
          <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 scrollbar-hide">
            <div ref={card1Ref} className="bg-[#141414]/40 border border-white/5 rounded-lg px-3 py-2 flex items-center gap-2.5 backdrop-blur-sm">
              <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={11} className="text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white/60 leading-tight">Hero video uploaded</p>
                <p className="text-[9px] text-white/15">Sequence 01.mp4</p>
              </div>
              <span className="text-[8px] text-white/10 flex-shrink-0">Today</span>
            </div>
            <div ref={card2Ref} className="bg-[#141414]/40 border border-white/5 rounded-lg px-3 py-2 flex items-center gap-2.5 backdrop-blur-sm">
              <div className="w-6 h-6 rounded-full bg-[#C9A84C]/10 flex items-center justify-center flex-shrink-0">
                <Clock size={11} className="text-[#C9A84C]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white/60 leading-tight">Admin portal launched</p>
                <p className="text-[9px] text-white/15">Dashboard, checklist, editor</p>
              </div>
              <span className="text-[8px] text-white/10 flex-shrink-0">Today</span>
            </div>
            <div ref={card3Ref} className="bg-[#141414]/40 border border-white/5 rounded-lg px-3 py-2 flex items-center gap-2.5 backdrop-blur-sm">
              <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <FileText size={11} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white/60 leading-tight">Website deployed</p>
                <p className="text-[9px] text-white/15">rounlimited.nexavisiongroup.com</p>
              </div>
              <span className="text-[8px] text-white/10 flex-shrink-0">Today</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
