'use client';

import { useState, useRef } from 'react';

interface HeroVideoProps {
  videoUrl: string | null;
}

export default function HeroVideo({ videoUrl }: HeroVideoProps) {
  const [loaded, setLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!videoUrl) return null;

  return (
    <div className="absolute inset-0 z-[0] overflow-hidden">
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        onLoadedData={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-1000 ${
          loaded ? 'opacity-35' : 'opacity-0'
        }`}
      />
      {/* Dark gradient overlay to keep text crisp */}
      <div className="absolute inset-0 bg-gradient-to-b from-ro-black/60 via-ro-black/40 to-ro-black/70" />
    </div>
  );
}
