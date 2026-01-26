/// <reference types="@types/google.maps" />

export interface LocationInfo {
  country: string | null;
  city: string | null;
  formattedAddress: string | null;
}

export async function reverseGeocode(lat: number, lng: number): Promise<LocationInfo> {
  if (!window.google) {
    return { country: null, city: null, formattedAddress: null };
  }

  const geocoder = new google.maps.Geocoder();
  
  return new Promise((resolve) => {
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status !== 'OK' || !results || results.length === 0) {
        resolve({ country: null, city: null, formattedAddress: null });
        return;
      }

      let country: string | null = null;
      let city: string | null = null;
      const formattedAddress = results[0]?.formatted_address || null;

      // Search through all results to find the most specific info
      for (const result of results) {
        for (const component of result.address_components) {
          if (component.types.includes('country') && !country) {
            country = component.long_name;
          }
          if (component.types.includes('locality') && !city) {
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1') && !city) {
            city = component.long_name;
          }
        }
        if (country && city) break;
      }

      resolve({ country, city, formattedAddress });
    });
  });
}
