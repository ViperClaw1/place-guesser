/// <reference types="@types/google.maps" />
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (window.google) {
        setIsLoaded(true);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('get-maps-key');
        
        if (error || !data?.apiKey) {
          setError('Failed to load Google Maps API key');
          return;
        }

        setApiKey(data.apiKey);

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          setIsLoaded(true);
        };
        
        script.onerror = () => {
          setError('Failed to load Google Maps');
        };

        document.head.appendChild(script);
      } catch (err) {
        setError('Failed to initialize Google Maps');
      }
    };

    loadGoogleMaps();
  }, []);

  return { isLoaded, error, apiKey };
}
