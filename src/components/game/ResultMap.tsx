/// <reference types="@types/google.maps" />
import { useEffect, useRef } from 'react';

interface ResultMapProps {
  isLoaded: boolean;
  actualLocation: { lat: number; lng: number };
  guessLocation: { lat: number; lng: number };
}

export function ResultMap({ isLoaded, actualLocation, guessLocation }: ResultMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;

    // Calculate bounds to fit both markers
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(actualLocation);
    bounds.extend(guessLocation);

    const map = new google.maps.Map(containerRef.current, {
      center: bounds.getCenter(),
      zoom: 2,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      zoomControl: true,
      styles: [
        {
          elementType: 'geometry',
          stylers: [{ color: '#1a1a2e' }]
        },
        {
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#1a1a2e' }]
        },
        {
          elementType: 'labels.text.fill',
          stylers: [{ color: '#6b7280' }]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#0f172a' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#374151' }]
        },
      ]
    });

    mapRef.current = map;

    // Fit the map to show both markers
    map.fitBounds(bounds, 50);

    // Actual location marker (gold/yellow pin)
    new google.maps.Marker({
      position: actualLocation,
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#f59e0b',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
      title: 'Actual Location',
      zIndex: 2,
    });

    // Guess location marker (green pin)
    new google.maps.Marker({
      position: guessLocation,
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#22c55e',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      title: 'Your Guess',
      zIndex: 1,
    });

    // Draw a line between the two points
    new google.maps.Polyline({
      path: [guessLocation, actualLocation],
      map,
      strokeColor: '#ef4444',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      geodesic: true,
    });

  }, [isLoaded, actualLocation, guessLocation]);

  return (
    <div className="w-full h-48 rounded-xl overflow-hidden border border-border">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
