/// <reference types="@types/google.maps" />
import { useEffect, useRef } from 'react';

interface StreetViewProps {
  lat: number;
  lng: number;
  isLoaded: boolean;
}

export function StreetView({ lat, lng, isLoaded }: StreetViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);

  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;

    const panorama = new google.maps.StreetViewPanorama(containerRef.current, {
      position: { lat, lng },
      pov: { heading: Math.random() * 360, pitch: 0 },
      zoom: 0,
      addressControl: false,
      showRoadLabels: false,
      linksControl: true,
      panControl: true,
      enableCloseButton: false,
      fullscreenControl: false,
      motionTracking: false,
      motionTrackingControl: false,
      source: google.maps.StreetViewSource.OUTDOOR,
    } as google.maps.StreetViewPanoramaOptions);

    panoramaRef.current = panorama;

    return () => {
      panoramaRef.current = null;
    };
  }, [lat, lng, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="street-view-container flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Street View...</p>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className="street-view-container" />;
}
