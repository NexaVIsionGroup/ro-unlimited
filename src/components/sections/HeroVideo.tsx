'use client';

import { useEffect, useState, useRef } from 'react';

export default function HeroVideo() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Fetch hero video URL from settings API
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.heroVideoUrl) {
          setVideoUrl(data.heroVideoUrl);
        }
      })
      .catch(() => {});
  }, []);

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
          loaded ? 'opacity-40' : 'opacity-0'
        }`}
      />
      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-ro-black/70 via-ro-black/50 to-ro-black/80" />
    </div>
  );
}
