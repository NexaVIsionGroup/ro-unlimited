'use client';

import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP, MEDIA_QUERIES } from '@/components/animations/GSAPProvider';

/**
 * MobilePageFlip — 3D page flip between sections on mobile.
 *
 * Direct adaptation of the "Scrubbed Vertical Rolodex" CodePen (GreenSock/QwbrQjy).
 * Each .page-flip-slide child flips via rotationX as you scroll.
 *
 * Desktop: wrapper flows normally, slides are static, no flip effect.
 * Mobile: wrapper is h-screen, GSAP pins it, slides flip via rotationX.
 */
export default function MobilePageFlip({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!wrapperRef.current) return;

    const mm = gsap.matchMedia();

    mm.add(MEDIA_QUERIES.mobile, () => {
      const slides = gsap.utils.toArray<HTMLElement>('.page-flip-slide');
      if (slides.length < 2) return;

      // Pause between slides
      const delay = 0.5;

      const tl = gsap.timeline({
        defaults: {
          ease: 'power1.inOut',
          transformOrigin: 'center center -150px',
        },
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: 'top top',
          end: '+=' + (slides.length - 1) * 50 + '%',
          pin: true,
          scrub: true,
        },
      });

      gsap.set(slides, {
        rotationX: (i: number) => (i ? -90 : 0),
        transformOrigin: 'center center -150px',
      });

      // Track which slides have fired their entrance events
      const played = new Set<number>();
      played.add(0);

      // First slide visible from start — fire entrance after short delay
      const delayedCall = gsap.delayedCall(0.5, () => {
        window.dispatchEvent(new CustomEvent('flipSlideEnter', { detail: { index: 0 } }));
      });

      slides.forEach((slide, i) => {
        const nextSlide = slides[i + 1];
        if (!nextSlide) return;
        tl.to(
          slide,
          {
            rotationX: 90,
            onComplete: () => { gsap.set(slide, { rotationX: -90 }); },
          },
          '+=' + delay
        ).to(
          nextSlide,
          {
            rotationX: 0,
          },
          '<'
        ).call(() => {
          const nextIndex = i + 1;
          if (!played.has(nextIndex) && tl.scrollTrigger?.direction === 1) {
            played.add(nextIndex);
            window.dispatchEvent(new CustomEvent('flipSlideEnter', { detail: { index: nextIndex } }));
          }
        });
      });

      // Keep final slide on the screen
      tl.to({}, { duration: delay });

      return () => { delayedCall.kill(); };
    });
  }, { scope: wrapperRef });

  return (
    <div ref={wrapperRef} className="w-full h-screen overflow-hidden lg:h-auto lg:overflow-visible">
      <div className="relative w-full h-full [perspective:500px] lg:[perspective:none]">
        {children}
      </div>
    </div>
  );
}

/**
 * FlipSlide — wrapper for each section that participates in the 3D flip.
 * On mobile: absolute-positioned, full-screen, backface-hidden.
 * On desktop: static, flows normally in document.
 */
export function FlipSlide({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="page-flip-slide absolute inset-0 w-full h-full overflow-hidden bg-ro-black lg:static lg:inset-auto lg:h-auto lg:overflow-visible lg:bg-transparent"
      style={{ backfaceVisibility: 'hidden' }}
    >
      {children}
    </div>
  );
}
