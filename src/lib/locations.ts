interface Location {
  lat: number;
  lng: number;
}

// Extensive list of worldwide Street View locations
const WORLD_LOCATIONS: Location[] = [
  // Europe
  { lat: 48.8584, lng: 2.2945 }, // Eiffel Tower, Paris
  { lat: 51.5007, lng: -0.1246 }, // Big Ben, London
  { lat: 41.9029, lng: 12.4534 }, // Vatican City
  { lat: 52.3676, lng: 4.9041 }, // Amsterdam
  { lat: 59.3293, lng: 18.0686 }, // Stockholm
  { lat: 41.3851, lng: 2.1734 }, // Barcelona
  { lat: 50.0755, lng: 14.4378 }, // Prague
  { lat: 45.4408, lng: 12.3155 }, // Venice
  { lat: 47.5162, lng: 19.0552 }, // Budapest
  { lat: 38.7223, lng: -9.1393 }, // Lisbon
  { lat: 43.7696, lng: 11.2558 }, // Florence
  { lat: 53.3498, lng: -6.2603 }, // Dublin
  { lat: 48.2082, lng: 16.3738 }, // Vienna
  { lat: 55.7539, lng: 37.6208 }, // Moscow
  { lat: 52.5200, lng: 13.4050 }, // Berlin
  { lat: 60.1699, lng: 24.9384 }, // Helsinki
  { lat: 59.9139, lng: 10.7522 }, // Oslo
  { lat: 55.6761, lng: 12.5683 }, // Copenhagen
  { lat: 46.2044, lng: 6.1432 }, // Geneva
  { lat: 45.4642, lng: 9.1900 }, // Milan
  { lat: 40.4168, lng: -3.7038 }, // Madrid
  { lat: 37.9838, lng: 23.7275 }, // Athens
  { lat: 44.4268, lng: 26.1025 }, // Bucharest
  { lat: 50.8503, lng: 4.3517 }, // Brussels
  { lat: 51.2194, lng: 4.4025 }, // Antwerp

  // North America
  { lat: 40.7580, lng: -73.9855 }, // Times Square, NYC
  { lat: 37.8199, lng: -122.4783 }, // Golden Gate Bridge
  { lat: 34.0522, lng: -118.2437 }, // Los Angeles
  { lat: 41.8781, lng: -87.6298 }, // Chicago
  { lat: 29.7604, lng: -95.3698 }, // Houston
  { lat: 33.4484, lng: -112.0740 }, // Phoenix
  { lat: 39.7392, lng: -104.9903 }, // Denver
  { lat: 47.6062, lng: -122.3321 }, // Seattle
  { lat: 25.7617, lng: -80.1918 }, // Miami
  { lat: 42.3601, lng: -71.0589 }, // Boston
  { lat: 38.9072, lng: -77.0369 }, // Washington DC
  { lat: 36.1699, lng: -115.1398 }, // Las Vegas
  { lat: 32.7157, lng: -117.1611 }, // San Diego
  { lat: 45.5017, lng: -73.5673 }, // Montreal
  { lat: 43.6532, lng: -79.3832 }, // Toronto
  { lat: 49.2827, lng: -123.1207 }, // Vancouver
  { lat: 19.4326, lng: -99.1332 }, // Mexico City
  { lat: 20.6534, lng: -105.2253 }, // Puerto Vallarta

  // South America
  { lat: -22.9519, lng: -43.2105 }, // Rio de Janeiro
  { lat: -34.6037, lng: -58.3816 }, // Buenos Aires
  { lat: -33.4489, lng: -70.6693 }, // Santiago
  { lat: -12.0464, lng: -77.0428 }, // Lima
  { lat: 4.7110, lng: -74.0721 }, // Bogota
  { lat: -23.5505, lng: -46.6333 }, // São Paulo
  { lat: -25.2637, lng: -57.5759 }, // Asunción
  { lat: -0.1807, lng: -78.4678 }, // Quito

  // Asia
  { lat: 35.6762, lng: 139.6503 }, // Tokyo
  { lat: 37.5665, lng: 126.9780 }, // Seoul
  { lat: 22.3193, lng: 114.1694 }, // Hong Kong
  { lat: 1.3521, lng: 103.8198 }, // Singapore
  { lat: 13.7563, lng: 100.5018 }, // Bangkok
  { lat: 25.1972, lng: 55.2744 }, // Dubai
  { lat: 31.2304, lng: 121.4737 }, // Shanghai
  { lat: 39.9042, lng: 116.4074 }, // Beijing
  { lat: 19.0760, lng: 72.8777 }, // Mumbai
  { lat: 28.6139, lng: 77.2090 }, // New Delhi
  { lat: 34.6937, lng: 135.5023 }, // Osaka
  { lat: 35.0116, lng: 135.7681 }, // Kyoto
  { lat: 25.0330, lng: 121.5654 }, // Taipei
  { lat: 14.5995, lng: 120.9842 }, // Manila
  { lat: 3.1390, lng: 101.6869 }, // Kuala Lumpur
  { lat: -6.2088, lng: 106.8456 }, // Jakarta
  { lat: 10.8231, lng: 106.6297 }, // Ho Chi Minh City
  { lat: 21.0278, lng: 105.8342 }, // Hanoi
  { lat: 31.7683, lng: 35.2137 }, // Jerusalem
  { lat: 32.0853, lng: 34.7818 }, // Tel Aviv
  { lat: 41.0082, lng: 28.9784 }, // Istanbul

  // Oceania
  { lat: -33.8568, lng: 151.2153 }, // Sydney Opera House
  { lat: -37.8136, lng: 144.9631 }, // Melbourne
  { lat: -27.4698, lng: 153.0251 }, // Brisbane
  { lat: -31.9505, lng: 115.8605 }, // Perth
  { lat: -36.8485, lng: 174.7633 }, // Auckland
  { lat: -41.2865, lng: 174.7762 }, // Wellington

  // Africa
  { lat: -33.9249, lng: 18.4241 }, // Cape Town
  { lat: 30.0444, lng: 31.2357 }, // Cairo
  { lat: 33.9716, lng: -6.8498 }, // Rabat
  { lat: -1.2921, lng: 36.8219 }, // Nairobi
  { lat: 6.5244, lng: 3.3792 }, // Lagos
  { lat: -26.2041, lng: 28.0473 }, // Johannesburg
];

// Keep track of used locations to avoid repetition within a session
let usedIndices: Set<number> = new Set();

export function getRandomLocation(): Location {
  // Reset if we've used all locations
  if (usedIndices.size >= WORLD_LOCATIONS.length) {
    usedIndices = new Set();
  }

  // Find an unused location
  let randomIndex: number;
  do {
    randomIndex = Math.floor(Math.random() * WORLD_LOCATIONS.length);
  } while (usedIndices.has(randomIndex));

  usedIndices.add(randomIndex);
  return WORLD_LOCATIONS[randomIndex];
}

export function resetUsedLocations(): void {
  usedIndices = new Set();
}

export function getTotalLocations(): number {
  return WORLD_LOCATIONS.length;
}
