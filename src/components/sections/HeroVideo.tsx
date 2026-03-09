'use client';

import { useRef, useEffect } from 'react';

interface HeroVideoProps {
  videoUrl: string | null;
  onReady?: () => void; // fires 2s after video starts playing
}

/**
 * Hero background video.
 * - Does NOT autoplay on mount.
 * - Waits for the 'ro:site-ready' event (fired by ROLoader when splash ends).
 * - Plays the video, then fires onReady after 2s so Hero can start its build sequence.
 * - If no video, fires onReady immediately when site-ready fires.
 */
export default function HeroVideo({ videoUrl, onReady }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;

    const startVideo = () => {
      if (firedRef.current) return;

      if (!videoUrl || !videoRef.current) {
        // No video — fire onReady immediately after splash
        firedRef.current = true;
        onReady?.();
        return;
      }

      const video = videoRef.current;

      const beginPlay = () => {
        video.play().catch(() => {});
        // Let the video breathe for 2s, then trigger the text build
        setTimeout(() => {
          if (!firedRef.current) {
            firedRef.current = true;
            onReady?.();
          }
        }, 2000);
      };

      if (video.readyState >= 3) {
        beginPlay();
      } else {
        video.addEventListener('canplay', beginPlay, { once: true });
        video.load(); // preload so canplay fires quickly
      }
    };

    // Already ready (e.g. reduced motion skipped splash immediately)
    if ((window as any).__roSiteReady) {
      startVideo();
      return;
    }

    // Wait for splash to complete
    window.addEventListener('ro:site-ready', startVideo, { once: true });
    return () => window.removeEventListener('ro:site-ready', startVideo);
  }, [videoUrl, onReady]);

  if (!videoUrl) return null;

  return (
    <div className="absolute inset-0 z-[1] overflow-hidden">
      <video
        ref={videoRef}
        src={videoUrl}
        muted
        loop
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
        style={{ opacity: 1 }}
      />
    </div>
  );
}
