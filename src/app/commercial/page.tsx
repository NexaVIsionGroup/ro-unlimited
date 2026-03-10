'use client';

import Link from 'next/link';
import { DIVISIONS, COMPANY } from '@/lib/constants';
import { ArrowRight, Phone, Building2, Shield, Layers, MapPin, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/components/animations/GSAPProvider';
import { usePrefersReducedMotion } from '@/components/animations/GSAPProvider';
import CountUp from '@/components/animations/CountUp';

const division = DIVISIONS.find(d => d.id === 'commercial')!;

/* ═══════════════════════════════════════════════
   COMMERCIAL-SPECIFIC DATA
   The Alpina B7 of contractor pages.
═══════════════════════════════════════════════ */

const PROOF_STATS = [
  { value: 25, suffix: '+', label: 'Years in Business' },
  { value: 500, suffix: '+', label: 'Projects Delivered' },
  { value: 100, suffix: '%', label: 'Completion Rate' },
  { value: 3, suffix: '', label: 'State Service Area' },
];

const PROCESS_STEPS = [
  { num: '01', title: 'Consultation', desc: 'Scope, budget, and timeline — defined before a shovel hits dirt.' },
  { num: '02', title: 'Site Evaluation', desc: 'Terrain, access, utilities, and permitting — no surprises.' },
  { num: '03', title: 'Design-Build Coordination', desc: 'Engineering, architecture, and construction under one roof.' },
  { num: '04', title: 'Ground-Up Construction', desc: 'Steel, concrete, mixed-material — built to commercial spec.' },
  { num: '05', title: 'Final Delivery', desc: 'Punch list complete. Keys in hand. On time.' },
];

const DIFFERENTIATORS = [
  { icon: Shield, title: 'Single Point of Accountability', desc: 'One company from land grading through final walkthrough. No finger-pointing between subs.' },
  { icon: Layers, title: 'Ground-Up Capability', desc: 'We grade the dirt, pour the foundation, raise the steel, and finish the interior. All in-house.' },
  { icon: Clock, title: '25+ Years of Problem Solving', desc: 'Complex sites, tight timelines, impossible specs — we\'ve built through all of it.' },
  { icon: MapPin, title: 'Tri-State Knowledge', desc: 'Georgia, South Carolina, North Carolina — soil conditions, permitting, inspectors, and suppliers across all three states.' },
];

const CROSS_DIVISIONS = [
  { id: 'residential', label: 'Residential Division', desc: 'Custom homes & luxury builds', href: '/residential', icon: '◆' },
  { id: 'grading', label: 'Land Grading & Site Prep', desc: 'Excavation & foundation work', href: '/grading', icon: '◆' },
  { id: 'process', label: 'The Build Process', desc: 'See how we deliver — phase by phase', href: '/process', icon: '◆' },
];

export default function CommercialPage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const scopeRef = useRef<HTMLElement>(null);
  const proofRef = useRef<HTMLElement>(null);
  const processRef = useRef<HTMLElement>(null);
  const diffRef = useRef<HTMLElement>(null);
  const trustRef = useRef<HTMLElement>(null);
  const crossRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Fetch commercial video from Sanity
  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => { if (data?.commercialVideoUrl) setVideoUrl(data.commercialVideoUrl); })
      .catch(() => {});
  }, []);

  // ═══ GSAP MASTER TIMELINE ═══
  useEffect(() => {
    if (!mounted || !containerRef.current || reducedMotion) return;

    const ctx = gsap.context(() => {

      // ── HERO entrance ──
      if (heroRef.current) {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        const badge = heroRef.current.querySelector('.hero-badge');
        const h1 = heroRef.current.querySelector('h1');
        const line = heroRef.current.querySelector('.hero-gold-line');
        const desc = heroRef.current.querySelector('.hero-desc');
        const btns = heroRef.current.querySelector('.hero-btns');
        const stats = heroRef.current.querySelector('.hero-stats');

        if (badge) tl.fromTo(badge, { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7 }, 0.2);
        if (h1) tl.fromTo(h1, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 0.3);
        if (line) tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.8, transformOrigin: 'left' }, 0.7);
        if (desc) tl.fromTo(desc, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.9);
        if (btns) tl.fromTo(btns, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 1.1);
        if (stats) tl.fromTo(stats, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 1.3);
      }

      // ── SCOPE section — panels slide in alternating L/R ──
      if (scopeRef.current) {
        const panels = scopeRef.current.querySelectorAll('.scope-panel');
        panels.forEach((panel, i) => {
          const fromX = i % 2 === 0 ? -120 : 120;
          gsap.fromTo(panel,
            { x: fromX, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
              scrollTrigger: { trigger: panel, start: 'top 88%', toggleActions: 'play none none reverse' }
            }
          );
        });
        // Section header
        const scopeHead = scopeRef.current.querySelector('.section-head');
        if (scopeHead) {
          gsap.fromTo(scopeHead, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8,
            scrollTrigger: { trigger: scopeHead, start: 'top 88%' }
          });
        }
      }

      // ── PROOF section — counters handled by CountUp component, animate the container ──
      if (proofRef.current) {
        const proofItems = proofRef.current.querySelectorAll('.proof-item');
        gsap.fromTo(proofItems,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.15, duration: 0.7, ease: 'power2.out',
            scrollTrigger: { trigger: proofRef.current, start: 'top 80%', toggleActions: 'play none none reverse' }
          }
        );
        // Gold accent line in proof
        const proofLine = proofRef.current.querySelector('.proof-line');
        if (proofLine) {
          gsap.fromTo(proofLine, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'power2.inOut',
            scrollTrigger: { trigger: proofLine, start: 'top 85%' }
          });
        }
      }

      // ── PROCESS section — steps stagger in with gold connecting line ──
      if (processRef.current) {
        const steps = processRef.current.querySelectorAll('.process-step');
        steps.forEach((step, i) => {
          gsap.fromTo(step,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, delay: i * 0.12, ease: 'power2.out',
              scrollTrigger: { trigger: step, start: 'top 88%', toggleActions: 'play none none reverse' }
            }
          );
        });
        // The connecting gold line grows downward
        const processLine = processRef.current.querySelector('.process-connector');
        if (processLine) {
          gsap.fromTo(processLine,
            { scaleY: 0 },
            { scaleY: 1, duration: 1.5, ease: 'power2.inOut', transformOrigin: 'top',
              scrollTrigger: { trigger: processRef.current, start: 'top 70%', end: 'bottom 50%', scrub: 1 }
            }
          );
        }
      }

      // ── DIFFERENTIATOR section — props fade in with gold accent ──
      if (diffRef.current) {
        const diffHead = diffRef.current.querySelector('.section-head');
        if (diffHead) gsap.fromTo(diffHead, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8,
          scrollTrigger: { trigger: diffHead, start: 'top 88%' }
        });
        const props = diffRef.current.querySelectorAll('.diff-prop');
        props.forEach((prop, i) => {
          gsap.fromTo(prop,
            { x: i % 2 === 0 ? -60 : 60, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.7, ease: 'power2.out',
              scrollTrigger: { trigger: prop, start: 'top 88%', toggleActions: 'play none none reverse' }
            }
          );
        });
      }

      // ── TRUST QUOTE section ──
      if (trustRef.current) {
        gsap.fromTo(trustRef.current.querySelector('.trust-content'),
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: trustRef.current, start: 'top 80%' }
          }
        );
      }

      // ── CROSS-DIVISION cards ──
      if (crossRef.current) {
        const crossCards = crossRef.current.querySelectorAll('.cross-card');
        gsap.fromTo(crossCards,
          { y: 40, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, stagger: 0.12, duration: 0.7, ease: 'power2.out',
            scrollTrigger: { trigger: crossRef.current, start: 'top 80%', toggleActions: 'play none none reverse' }
          }
        );
      }

      // ── FINAL CTA ──
      if (ctaRef.current) {
        const ctaContent = ctaRef.current.querySelector('.cta-inner');
        if (ctaContent) {
          gsap.fromTo(ctaContent,
            { y: 60, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: 'power3.out',
              scrollTrigger: { trigger: ctaRef.current, start: 'top 75%' }
            }
          );
        }
        // Gold lines on CTA
        const ctaLines = ctaRef.current.querySelectorAll('.cta-gold-line');
        ctaLines.forEach((line) => {
          gsap.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'power2.inOut',
            scrollTrigger: { trigger: line, start: 'top 85%' }
          });
        });
      }

    }, containerRef);

    return () => ctx.revert();
  }, [mounted, reducedMotion]);

  if (!mounted) return <div className="min-h-screen bg-ro-black" />;

  return (
    <div ref={containerRef}>

      {/* ════════════════════════════════════════════
          SECTION 1 — HERO
          The first 3 seconds. Pass the vet or lose the deal.
      ════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-[100vh] flex flex-col justify-center overflow-hidden">
        {/* Video background */}
        {videoUrl ? (
          <>
            <video
              key={videoUrl}
              src={videoUrl}
              autoPlay loop muted playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{ zIndex: 0 }}
            />
            {/* Cinematic overlays — layered for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-ro-black/80 via-ro-black/50 to-ro-black" style={{ zIndex: 1 }} />
            <div className="absolute inset-0 bg-gradient-to-r from-ro-black/70 via-transparent to-transparent" style={{ zIndex: 1 }} />
            {/* Subtle blueprint grid over video */}
            <div className="absolute inset-0 blueprint-overlay opacity-20" style={{ zIndex: 1 }} />
          </>
        ) : (
          <>
            <div className="absolute inset-0 blueprint-overlay" />
            <div className="absolute inset-0 bg-gradient-to-b from-ro-black via-ro-black/95 to-ro-black" />
          </>
        )}

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-8">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="hero-badge inline-flex items-center gap-2 px-5 py-2 border border-ro-gold/30 bg-ro-gold/5 backdrop-blur-sm mb-8">
              <Building2 size={14} className="text-ro-gold" />
              <span className="text-ro-gold text-xs font-mono tracking-[0.25em] uppercase">Commercial Division</span>
            </div>

            {/* Headline — the statement that says "we play at this level" */}
            <h1 className="text-ro-white font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight uppercase leading-[0.85] mb-8">
              Commercial<br />
              <span className="gradient-text-gold">Grade.</span><br />
              <span className="text-ro-white/90">Unlimited</span><br />
              <span className="gradient-text-gold">Scale.</span>
            </h1>

            {/* Gold line */}
            <div className="hero-gold-line w-32 h-[2px] bg-gradient-to-r from-ro-gold via-ro-gold-light to-transparent mb-8" />

            {/* Description */}
            <p className="hero-desc text-ro-gray-300 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl">
              Steel builds, retail storefronts, mixed-material construction, and full commercial development.
              One company — ground up.
            </p>

            {/* CTA Buttons */}
            <div className="hero-btns flex flex-wrap gap-4">
              <Link href="/contact"
                className="group flex items-center gap-3 px-8 py-4 bg-ro-gold text-ro-black font-heading text-sm tracking-[0.15em] uppercase hover:bg-ro-gold-light transition-all duration-300">
                Discuss Your Project
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href={`tel:${COMPANY.phone.replace(/[^0-9]/g, '')}`}
                className="flex items-center gap-3 px-8 py-4 border border-ro-gold/40 text-ro-gold font-heading text-sm tracking-[0.15em] uppercase hover:bg-ro-gold/5 hover:border-ro-gold/60 transition-all duration-300 backdrop-blur-sm">
                <Phone size={14} /> {COMPANY.phone}
              </a>
            </div>
          </div>
        </div>

        {/* ── HERO STAT BAR — trust at a glance ── */}
        <div className="hero-stats relative z-10 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-ro-gold/10">
              {PROOF_STATS.map((stat, i) => (
                <div key={i} className="bg-ro-black/80 backdrop-blur-sm px-6 py-5 text-center">
                  <div className="font-heading text-2xl sm:text-3xl text-ro-gold tracking-tight">
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="text-ro-gray-500 text-xs font-mono tracking-wider uppercase mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 2 — THE SCOPE
          Each capability presented as a heavyweight panel.
          Alternating slide-in from L/R like blueprints pulled from a drawer.
      ════════════════════════════════════════════ */}
      <section ref={scopeRef} className="py-28 sm:py-36 relative overflow-hidden">
        <div className="absolute inset-0 blueprint-overlay opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-ro-black via-ro-black/98 to-ro-black" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="section-head mb-20">
            <span className="text-ro-gold text-xs font-mono tracking-[0.4em] uppercase block mb-4">Capabilities</span>
            <h2 className="text-ro-white font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tight uppercase leading-[0.9]">
              Full Commercial<br /><span className="gradient-text-gold">Service Scope</span>
            </h2>
            <div className="w-20 h-[2px] bg-gradient-to-r from-ro-gold to-transparent mt-6" />
          </div>

          {/* Service Panels */}
          <div className="space-y-4 sm:space-y-6">
            {division.services.map((service, i) => (
              <div key={service}
                className="scope-panel group relative flex items-center gap-6 sm:gap-10 p-6 sm:p-8 border border-ro-gray-800/60 hover:border-ro-gold/30 bg-ro-black/40 backdrop-blur-sm transition-all duration-500 hover:bg-ro-gold/[0.02]">
                {/* Number */}
                <div className="flex-shrink-0 w-16 sm:w-20">
                  <span className="font-heading text-4xl sm:text-5xl text-ro-gold/20 group-hover:text-ro-gold/40 transition-colors duration-500 tracking-tighter">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                {/* Vertical gold accent */}
                <div className="flex-shrink-0 w-[2px] h-12 bg-gradient-to-b from-ro-gold/60 via-ro-gold/20 to-transparent" />
                {/* Service name */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-ro-white font-heading text-lg sm:text-xl lg:text-2xl tracking-wider uppercase group-hover:text-ro-gold-light transition-colors duration-500">
                    {service}
                  </h3>
                </div>
                {/* Arrow indicator */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ChevronRight size={20} className="text-ro-gold" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 3 — THE PROOF
          Raw numbers. No fluff. Odometer counters.
      ════════════════════════════════════════════ */}
      <section ref={proofRef} className="py-28 sm:py-36 relative overflow-hidden">
        {/* Steel texture background */}
        <div className="absolute inset-0 steel-texture" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ro-black/30 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top gold line */}
          <div className="proof-line w-full h-[1px] bg-gradient-to-r from-transparent via-ro-gold/50 to-transparent mb-20" style={{ transformOrigin: 'center' }} />

          <div className="text-center mb-16">
            <span className="text-ro-gold text-xs font-mono tracking-[0.4em] uppercase block mb-4">Track Record</span>
            <h2 className="text-ro-white font-heading text-4xl sm:text-5xl tracking-tight uppercase">
              Built to <span className="gradient-text-gold">Prove It</span>
            </h2>
          </div>

          {/* Counter grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
            {PROOF_STATS.map((stat, i) => (
              <div key={i} className="proof-item text-center group">
                <div className="relative inline-block mb-4">
                  <CountUp
                    end={stat.value}
                    suffix={stat.suffix}
                    duration={2.5}
                    className="font-heading text-5xl sm:text-6xl lg:text-7xl text-ro-gold tracking-tighter text-shadow-gold"
                  />
                  {/* Subtle glow behind number */}
                  <div className="absolute inset-0 bg-ro-gold/5 blur-2xl rounded-full -z-10 group-hover:bg-ro-gold/10 transition-all duration-700" />
                </div>
                <div className="text-ro-gray-400 text-xs font-mono tracking-[0.2em] uppercase">{stat.label}</div>
                <div className="w-8 h-[1px] bg-ro-gold/30 mx-auto mt-3" />
              </div>
            ))}
          </div>

          {/* Bottom gold line */}
          <div className="proof-line w-full h-[1px] bg-gradient-to-r from-transparent via-ro-gold/50 to-transparent mt-20" style={{ transformOrigin: 'center' }} />
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 4 — THE PROCESS
          Vertical timeline with gold connector.
          Shows this isn't a truck-and-handshake operation.
      ════════════════════════════════════════════ */}
      <section ref={processRef} className="py-28 sm:py-36 relative overflow-hidden">
        <div className="absolute inset-0 blueprint-overlay opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-ro-black to-ro-black/98" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-ro-gold text-xs font-mono tracking-[0.4em] uppercase block mb-4">How We Deliver</span>
            <h2 className="text-ro-white font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tight uppercase leading-[0.9]">
              The Commercial<br /><span className="gradient-text-gold">Build Process</span>
            </h2>
            <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-ro-gold to-transparent mx-auto mt-6" />
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Gold connector line (grows on scroll) */}
            <div className="process-connector absolute left-8 sm:left-12 top-0 bottom-0 w-[2px] bg-gradient-to-b from-ro-gold via-ro-gold/60 to-ro-gold/20" />

            <div className="space-y-8 sm:space-y-12">
              {PROCESS_STEPS.map((step, i) => (
                <div key={step.num} className="process-step relative flex gap-8 sm:gap-12 items-start">
                  {/* Step number node */}
                  <div className="flex-shrink-0 relative z-10 w-16 sm:w-24 flex items-center justify-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-ro-gold/60 bg-ro-black flex items-center justify-center">
                      <span className="font-mono text-ro-gold text-xs sm:text-sm font-bold">{step.num}</span>
                    </div>
                  </div>
                  {/* Step content */}
                  <div className="flex-1 pb-4 pt-1">
                    <h3 className="text-ro-white font-heading text-xl sm:text-2xl tracking-wider uppercase mb-2">
                      {step.title}
                    </h3>
                    <p className="text-ro-gray-400 text-sm sm:text-base leading-relaxed max-w-lg">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 5 — THE DIFFERENTIATOR
          Why RO for commercial. 4 value props that answer
          every question a GC or developer has before they call.
      ════════════════════════════════════════════ */}
      <section ref={diffRef} className="py-28 sm:py-36 relative overflow-hidden">
        <div className="absolute inset-0 steel-texture" />
        <div className="absolute inset-0 bg-gradient-to-br from-ro-black via-ro-black/95 to-ro-black" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-head mb-20">
            <span className="text-ro-gold text-xs font-mono tracking-[0.4em] uppercase block mb-4">The Difference</span>
            <h2 className="text-ro-white font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tight uppercase leading-[0.9] max-w-2xl">
              One Company.<br />
              <span className="gradient-text-gold">Total Capability.</span>
            </h2>
            <div className="w-20 h-[2px] bg-gradient-to-r from-ro-gold to-transparent mt-6" />
          </div>

          {/* Value props grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {DIFFERENTIATORS.map((diff, i) => {
              const Icon = diff.icon;
              return (
                <div key={i} className="diff-prop group relative p-8 sm:p-10 border border-ro-gray-800/50 bg-ro-black/30 backdrop-blur-sm hover:border-ro-gold/20 transition-all duration-500">
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-ro-gold/30 group-hover:border-ro-gold/60 transition-colors duration-500" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-ro-gold/30 group-hover:border-ro-gold/60 transition-colors duration-500" />

                  {/* Icon */}
                  <div className="w-12 h-12 flex items-center justify-center border border-ro-gold/20 bg-ro-gold/5 mb-6 group-hover:border-ro-gold/40 group-hover:bg-ro-gold/10 transition-all duration-500">
                    <Icon size={22} className="text-ro-gold" />
                  </div>

                  <h3 className="text-ro-white font-heading text-lg sm:text-xl tracking-wider uppercase mb-3 group-hover:text-ro-gold-light transition-colors duration-500">
                    {diff.title}
                  </h3>
                  <p className="text-ro-gray-400 text-sm sm:text-base leading-relaxed">{diff.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 6 — THE TRUST
          Social proof. Even a placeholder is better than nothing.
      ════════════════════════════════════════════ */}
      <section ref={trustRef} className="py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-ro-black via-ro-black/98 to-ro-black" />
        <div className="absolute inset-0 blueprint-overlay opacity-10" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="trust-content">
            {/* Large quote mark */}
            <div className="text-ro-gold/15 font-heading text-[120px] sm:text-[160px] leading-none select-none mb-[-40px] sm:mb-[-60px]">&ldquo;</div>
            <blockquote className="text-ro-white font-heading text-2xl sm:text-3xl lg:text-4xl tracking-tight uppercase leading-[1.1] mb-8">
              Ask anyone in <span className="gradient-text-gold">Georgia, the Carolinas,</span><br />or anywhere we&apos;ve built.
            </blockquote>
            <p className="text-ro-gray-500 text-sm font-mono tracking-[0.3em] uppercase mb-6">
              25+ years building across three states
            </p>
            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-ro-gold/40 to-transparent mx-auto" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 7 — CROSS-DIVISION
          Show the full scope of the company.
          "We don't sub out what we can do ourselves."
      ════════════════════════════════════════════ */}
      <section ref={crossRef} className="py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 steel-texture" />
        <div className="absolute inset-0 bg-ro-black/90" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-ro-gold text-xs font-mono tracking-[0.4em] uppercase block mb-4">Full-Service</span>
            <h2 className="text-ro-white font-heading text-3xl sm:text-4xl tracking-tight uppercase">
              More Than <span className="gradient-text-gold">Commercial</span>
            </h2>
            <p className="text-ro-gray-500 text-sm sm:text-base mt-4 max-w-md mx-auto">
              We don&apos;t sub out what we can do ourselves.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {CROSS_DIVISIONS.map((div) => (
              <Link key={div.id} href={div.href}
                className="cross-card group relative p-8 border border-ro-gray-800/50 bg-ro-black/40 backdrop-blur-sm hover:border-ro-gold/30 hover:bg-ro-gold/[0.02] transition-all duration-500 text-center">
                <div className="text-ro-gold/30 text-2xl mb-4 group-hover:text-ro-gold/60 transition-colors">{div.icon}</div>
                <h3 className="text-ro-white font-heading text-base sm:text-lg tracking-wider uppercase mb-2 group-hover:text-ro-gold-light transition-colors duration-500">
                  {div.label}
                </h3>
                <p className="text-ro-gray-500 text-xs sm:text-sm">{div.desc}</p>
                <div className="mt-4 flex items-center justify-center gap-1 text-ro-gold text-xs font-mono tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Explore <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 8 — THE CLOSE
          Full-screen CTA. One purpose: make them call.
          No distractions. Phone number massive.
      ════════════════════════════════════════════ */}
      <section ref={ctaRef} className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-ro-black via-[#111] to-ro-black" />
        <div className="absolute inset-0 blueprint-overlay opacity-10" />

        {/* Subtle radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ro-gold/[0.03] rounded-full blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="cta-inner">
            {/* Top line */}
            <div className="cta-gold-line w-24 h-[2px] bg-gradient-to-r from-transparent via-ro-gold to-transparent mx-auto mb-12" style={{ transformOrigin: 'center' }} />

            <span className="text-ro-gold text-xs font-mono tracking-[0.4em] uppercase block mb-6">Let&apos;s Build</span>

            <h2 className="text-ro-white font-heading text-5xl sm:text-6xl lg:text-7xl tracking-tight uppercase leading-[0.85] mb-8">
              Ready to<br /><span className="gradient-text-gold">Build?</span>
            </h2>

            <p className="text-ro-gray-400 text-base sm:text-lg leading-relaxed mb-12 max-w-md mx-auto">
              Send us your project details. Scope calls are direct, fast, and free.
            </p>

            {/* Phone — massive, clickable */}
            <a href={`tel:${COMPANY.phone.replace(/[^0-9]/g, '')}`}
              className="inline-flex items-center gap-4 text-ro-gold font-heading text-3xl sm:text-4xl lg:text-5xl tracking-tight hover:text-ro-gold-light transition-colors duration-300 mb-10">
              <Phone size={32} className="flex-shrink-0" />
              {COMPANY.phone}
            </a>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/contact"
                className="group flex items-center gap-3 px-10 py-4 bg-ro-gold text-ro-black font-heading text-sm tracking-[0.15em] uppercase hover:bg-ro-gold-light transition-all duration-300">
                Discuss Your Project
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href={`mailto:${COMPANY.email}`}
                className="flex items-center gap-2 px-8 py-4 border border-ro-gold/30 text-ro-gold font-heading text-sm tracking-[0.15em] uppercase hover:bg-ro-gold/5 hover:border-ro-gold/50 transition-all duration-300">
                {COMPANY.email}
              </a>
            </div>

            {/* Bottom line */}
            <div className="cta-gold-line w-24 h-[2px] bg-gradient-to-r from-transparent via-ro-gold to-transparent mx-auto" style={{ transformOrigin: 'center' }} />
          </div>
        </div>
      </section>

    </div>
  );
}
