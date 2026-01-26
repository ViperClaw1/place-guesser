/// <reference types="@types/google.maps" />
import { useEffect, useRef, useState } from 'react';
import { MapPin, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GuessMapProps {
  isLoaded: boolean;
  onGuess: (lat: number, lng: number) => void;
  guessLocation: { lat: number; lng: number } | null;
  disabled?: boolean;
}

export function GuessMap({ isLoaded, onGuess, guessLocation, disabled }: GuessMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;

    const map = new google.maps.Map(containerRef.current, {
      center: { lat: 20, lng: 0 },
      zoom: 1.5,
      minZoom: 1,
      maxZoom: 18,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,
      draggableCursor: disabled ? 'default' : 'pointer',
      draggingCursor: 'grabbing',
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

    if (!disabled) {
      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        
        if (markerRef.current) {
          markerRef.current.setPosition({ lat, lng });
        } else {
          markerRef.current = new google.maps.Marker({
            position: { lat, lng },
            map,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#22c55e',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }
          });
        }
        
        onGuess(lat, lng);
      });
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    };
  }, [isLoaded, disabled, onGuess]);

  useEffect(() => {
    if (guessLocation && markerRef.current) {
      markerRef.current.setPosition(guessLocation);
    }
  }, [guessLocation]);

  return (
    <div className={`map-overlay ${isExpanded ? 'map-overlay-expanded' : 'map-overlay-collapsed'}`}>
      <div className="relative w-full h-full">
        <div ref={containerRef} className="w-full h-full rounded-xl" />
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-2 right-2 p-2 bg-card/90 rounded-lg hover:bg-card transition-colors z-10"
        >
          {isExpanded ? (
            <Minimize2 className="w-4 h-4 text-foreground" />
          ) : (
            <Maximize2 className="w-4 h-4 text-foreground" />
          )}
        </button>

        {!guessLocation && !disabled && (
          <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 bg-card/90 px-3 py-2 rounded-lg">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Click to place your guess</span>
          </div>
        )}
      </div>
    </div>
  );
}
