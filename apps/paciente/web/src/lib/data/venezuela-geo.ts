// Geographic data for Venezuela's 24 states
// Center coordinates are approximate geographic centers of each state

export interface StateGeoData {
  name: string;
  code: string;
  center: { lat: number; lng: number };
}

export const VENEZUELA_STATES: StateGeoData[] = [
  { name: 'Amazonas', code: 'VE-X', center: { lat: 3.4166, lng: -65.8561 } },
  { name: 'Anzoátegui', code: 'VE-B', center: { lat: 8.5913, lng: -64.2317 } },
  { name: 'Apure', code: 'VE-C', center: { lat: 7.0536, lng: -69.2596 } },
  { name: 'Aragua', code: 'VE-D', center: { lat: 10.2310, lng: -67.2811 } },
  { name: 'Barinas', code: 'VE-E', center: { lat: 8.0897, lng: -70.2076 } },
  { name: 'Bolívar', code: 'VE-F', center: { lat: 6.4189, lng: -63.2537 } },
  { name: 'Carabobo', code: 'VE-G', center: { lat: 10.1179, lng: -68.0481 } },
  { name: 'Cojedes', code: 'VE-H', center: { lat: 9.3816, lng: -68.5890 } },
  { name: 'Delta Amacuro', code: 'VE-Y', center: { lat: 8.8500, lng: -61.1400 } },
  { name: 'Distrito Capital', code: 'VE-A', center: { lat: 10.4880, lng: -66.8792 } },
  { name: 'Falcón', code: 'VE-I', center: { lat: 11.1812, lng: -69.8597 } },
  { name: 'Guárico', code: 'VE-J', center: { lat: 8.7489, lng: -66.2361 } },
  { name: 'Lara', code: 'VE-K', center: { lat: 10.0678, lng: -69.8621 } },
  { name: 'Mérida', code: 'VE-L', center: { lat: 8.5897, lng: -71.1561 } },
  { name: 'Miranda', code: 'VE-M', center: { lat: 10.2500, lng: -66.4167 } },
  { name: 'Monagas', code: 'VE-N', center: { lat: 9.3047, lng: -63.0164 } },
  { name: 'Nueva Esparta', code: 'VE-O', center: { lat: 11.0034, lng: -63.9113 } },
  { name: 'Portuguesa', code: 'VE-P', center: { lat: 9.0000, lng: -69.7500 } },
  { name: 'Sucre', code: 'VE-R', center: { lat: 10.4500, lng: -63.2333 } },
  { name: 'Táchira', code: 'VE-S', center: { lat: 7.9137, lng: -72.1416 } },
  { name: 'Trujillo', code: 'VE-T', center: { lat: 9.3700, lng: -70.4300 } },
  { name: 'Vargas', code: 'VE-W', center: { lat: 10.6035, lng: -66.9309 } },
  { name: 'Yaracuy', code: 'VE-U', center: { lat: 10.3390, lng: -68.8103 } },
  { name: 'Zulia', code: 'VE-V', center: { lat: 9.8000, lng: -71.5600 } },
];

// City centers for major cities per state
// Used for doctor location markers when only city/state is known
export const CITY_CENTERS: Record<string, Array<{ name: string; lat: number; lng: number }>> = {
  Amazonas: [
    { name: 'Puerto Ayacucho', lat: 5.6633, lng: -67.6236 },
    { name: 'San Fernando de Atabapo', lat: 4.0500, lng: -67.7000 },
    { name: 'Maroa', lat: 2.7167, lng: -67.5500 },
  ],
  Anzoátegui: [
    { name: 'Barcelona', lat: 10.1300, lng: -64.6900 },
    { name: 'Puerto La Cruz', lat: 10.2186, lng: -64.6322 },
    { name: 'El Tigre', lat: 8.8897, lng: -64.2556 },
    { name: 'Anaco', lat: 9.4367, lng: -64.4728 },
    { name: 'Lechería', lat: 10.1822, lng: -64.6933 },
  ],
  Apure: [
    { name: 'San Fernando de Apure', lat: 7.8833, lng: -67.4667 },
    { name: 'Guasdualito', lat: 7.2500, lng: -70.7333 },
    { name: 'Achaguas', lat: 7.7833, lng: -68.2333 },
  ],
  Aragua: [
    { name: 'Maracay', lat: 10.2469, lng: -67.5958 },
    { name: 'Turmero', lat: 10.2258, lng: -67.4792 },
    { name: 'La Victoria', lat: 10.2297, lng: -67.3356 },
    { name: 'Cagua', lat: 10.1833, lng: -67.4500 },
  ],
  Barinas: [
    { name: 'Barinas', lat: 8.6226, lng: -70.2070 },
    { name: 'Barinitas', lat: 8.7596, lng: -70.3995 },
    { name: 'Socopó', lat: 8.2333, lng: -70.8167 },
  ],
  Bolívar: [
    { name: 'Ciudad Bolívar', lat: 8.1294, lng: -63.5397 },
    { name: 'Ciudad Guayana', lat: 8.3596, lng: -62.6500 },
    { name: 'Upata', lat: 8.0139, lng: -62.3950 },
  ],
  Carabobo: [
    { name: 'Valencia', lat: 10.1620, lng: -68.0077 },
    { name: 'Puerto Cabello', lat: 10.4731, lng: -68.0078 },
    { name: 'Guacara', lat: 10.2259, lng: -67.8772 },
    { name: 'Naguanagua', lat: 10.2667, lng: -68.0167 },
  ],
  Cojedes: [
    { name: 'San Carlos', lat: 9.6616, lng: -68.5851 },
    { name: 'Tinaquillo', lat: 9.9167, lng: -68.3000 },
  ],
  'Delta Amacuro': [
    { name: 'Tucupita', lat: 9.0575, lng: -62.0512 },
    { name: 'Pedernales', lat: 9.9764, lng: -62.2339 },
  ],
  'Distrito Capital': [
    { name: 'Caracas', lat: 10.4880, lng: -66.8792 },
  ],
  Falcón: [
    { name: 'Coro', lat: 11.4045, lng: -69.6675 },
    { name: 'Punto Fijo', lat: 11.6914, lng: -70.2078 },
    { name: 'Tucacas', lat: 10.7925, lng: -68.3269 },
  ],
  Guárico: [
    { name: 'San Juan de los Morros', lat: 9.9015, lng: -67.3543 },
    { name: 'Calabozo', lat: 8.9244, lng: -67.4293 },
    { name: 'Valle de la Pascua', lat: 9.2155, lng: -65.9936 },
  ],
  Lara: [
    { name: 'Barquisimeto', lat: 10.0678, lng: -69.3474 },
    { name: 'Cabudare', lat: 10.0270, lng: -69.2620 },
    { name: 'Carora', lat: 10.1771, lng: -70.0818 },
    { name: 'El Tocuyo', lat: 9.7900, lng: -69.7900 },
  ],
  Mérida: [
    { name: 'Mérida', lat: 8.5897, lng: -71.1561 },
    { name: 'El Vigía', lat: 8.6167, lng: -71.6500 },
    { name: 'Ejido', lat: 8.5500, lng: -71.2333 },
    { name: 'Tovar', lat: 8.3333, lng: -71.7500 },
  ],
  Miranda: [
    { name: 'Los Teques', lat: 10.3433, lng: -67.0417 },
    { name: 'Guarenas', lat: 10.4711, lng: -66.6150 },
    { name: 'Guatire', lat: 10.4738, lng: -66.5407 },
    { name: 'Charallave', lat: 10.2467, lng: -66.8608 },
  ],
  Monagas: [
    { name: 'Maturín', lat: 9.7457, lng: -63.1833 },
    { name: 'Punta de Mata', lat: 9.6950, lng: -63.6217 },
    { name: 'Caripito', lat: 10.1114, lng: -63.1036 },
  ],
  'Nueva Esparta': [
    { name: 'Porlamar', lat: 10.9578, lng: -63.8697 },
    { name: 'La Asunción', lat: 11.0339, lng: -63.8614 },
    { name: 'Juan Griego', lat: 11.0833, lng: -63.9667 },
  ],
  Portuguesa: [
    { name: 'Guanare', lat: 9.0419, lng: -69.7486 },
    { name: 'Acarigua', lat: 9.5597, lng: -69.1967 },
    { name: 'Araure', lat: 9.5622, lng: -69.2044 },
  ],
  Sucre: [
    { name: 'Cumaná', lat: 10.4536, lng: -64.1675 },
    { name: 'Carúpano', lat: 10.6678, lng: -63.2461 },
    { name: 'Güiria', lat: 10.5714, lng: -62.2969 },
  ],
  Táchira: [
    { name: 'San Cristóbal', lat: 7.7669, lng: -72.2250 },
    { name: 'Táriba', lat: 7.8167, lng: -72.2167 },
    { name: 'Rubio', lat: 7.7000, lng: -72.3500 },
  ],
  Trujillo: [
    { name: 'Trujillo', lat: 9.3658, lng: -70.4328 },
    { name: 'Valera', lat: 9.3172, lng: -70.6036 },
    { name: 'Boconó', lat: 9.2667, lng: -70.2500 },
  ],
  Vargas: [
    { name: 'La Guaira', lat: 10.6035, lng: -66.9309 },
    { name: 'Maiquetía', lat: 10.5942, lng: -66.9564 },
    { name: 'Catia La Mar', lat: 10.6058, lng: -67.0292 },
  ],
  Yaracuy: [
    { name: 'San Felipe', lat: 10.3390, lng: -68.7411 },
    { name: 'Yaritagua', lat: 10.0833, lng: -69.1333 },
    { name: 'Chivacoa', lat: 10.1583, lng: -68.8944 },
  ],
  Zulia: [
    { name: 'Maracaibo', lat: 10.6427, lng: -71.6125 },
    { name: 'Cabimas', lat: 10.3972, lng: -71.4525 },
    { name: 'Ciudad Ojeda', lat: 10.2000, lng: -71.3167 },
    { name: 'San Francisco', lat: 10.6167, lng: -71.6333 },
  ],
};

/**
 * Look up city center coordinates for a given state and city name.
 * Falls back to the state center if the city is not found.
 */
export function getCityCoordinates(
  state: string | null,
  city: string | null,
): { lat: number; lng: number } | null {
  if (!state) return null;

  // Try exact match on state name in CITY_CENTERS
  const stateCities = CITY_CENTERS[state];
  if (stateCities && city) {
    const match = stateCities.find(
      (c) => c.name.toLowerCase() === city.toLowerCase(),
    );
    if (match) return { lat: match.lat, lng: match.lng };
  }

  // Fallback: try to find the state center from VENEZUELA_STATES
  // Match by checking if state name is contained (handles accent variations)
  const stateData = VENEZUELA_STATES.find(
    (s) =>
      s.name.toLowerCase() === state.toLowerCase() ||
      s.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase() ===
        state
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase(),
  );

  if (stateData) return stateData.center;

  // Fallback: try matching CITY_CENTERS with accent-insensitive comparison
  const normalizedState = state
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  for (const [key, cities] of Object.entries(CITY_CENTERS)) {
    const normalizedKey = key
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    if (normalizedKey === normalizedState) {
      if (city) {
        const normalizedCity = city
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase();
        const match = cities.find(
          (c) =>
            c.name
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase() === normalizedCity,
        );
        if (match) return { lat: match.lat, lng: match.lng };
      }
      // Return first city as fallback for the state
      if (cities.length > 0) return { lat: cities[0].lat, lng: cities[0].lng };
    }
  }

  return null;
}
