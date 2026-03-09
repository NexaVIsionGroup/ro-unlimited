'use client';

import { useState, useRef, useEffect } from 'react';

interface HeroVideoProps {
  videoUrl: string | null;
  onReady?: () => void; // fires after 2s of play, triggering build sequence
}

export default function HeroVideo({ videoUrl, onReady }: HeroVideoProps) {
  const [loaded, setLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) {
      // No video — fire immediately so build doesn't wait forever
      onReady?.();
      return;
    }

    const startTimer = () => {
      if (firedRef.current) return;
      setLoaded(true);
      // Let the video breathe for 2 seconds, then start the build
      setTimeout(() => {
        firedRef.current = true;
        onReady?.();
      }, 2000);
    };

    if (video.readyState >= 3) {
      startTimer();
      return;
    }

    video.addEventListener('canplay', startTimer, { once: true });
    video.addEventListener('loadeddata', startTimer, { once: true });

    return () => {
      video.removeEventListener('canplay', startTimer);
      video.removeEventListener('loadeddata', startTimer);
    };
  }, [videoUrl, onReady]);

  // No video — signal immediately on mount
  useEffect(() => {
    if (!videoUrl) {
      onReady?.();
    }
  }, [videoUrl, onReady]);

  if (!videoUrl) return null;

  return (
    <div className="absolute inset-0 z-[1] overflow-hidden">
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-1000 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
