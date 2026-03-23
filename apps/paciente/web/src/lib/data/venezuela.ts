// Venezuelan states and cities for cascading selects

export interface VenezuelaState {
  name: string;
  cities: string[];
}

export const VENEZUELA_STATES: VenezuelaState[] = [
  {
    name: 'Amazonas',
    cities: ['Puerto Ayacucho', 'San Fernando de Atabapo', 'Maroa'],
  },
  {
    name: 'Anzoategui',
    cities: ['Barcelona', 'Puerto La Cruz', 'El Tigre', 'Anaco', 'Lecheria', 'Guanta', 'Cantaura'],
  },
  {
    name: 'Apure',
    cities: ['San Fernando de Apure', 'Guasdualito', 'Achaguas', 'Biruaca'],
  },
  {
    name: 'Aragua',
    cities: ['Maracay', 'Turmero', 'La Victoria', 'Cagua', 'Villa de Cura', 'El Limon', 'Santa Rita'],
  },
  {
    name: 'Barinas',
    cities: ['Barinas', 'Barinitas', 'Socopó', 'Santa Barbara de Barinas', 'Ciudad Bolivia'],
  },
  {
    name: 'Bolivar',
    cities: ['Ciudad Bolivar', 'Ciudad Guayana', 'Upata', 'Caicara del Orinoco', 'Santa Elena de Uairen'],
  },
  {
    name: 'Carabobo',
    cities: ['Valencia', 'Puerto Cabello', 'Guacara', 'San Diego', 'Naguanagua', 'Los Guayos', 'Mariara'],
  },
  {
    name: 'Cojedes',
    cities: ['San Carlos', 'Tinaquillo', 'Tinaco', 'El Pao'],
  },
  {
    name: 'Delta Amacuro',
    cities: ['Tucupita', 'Pedernales', 'Curiapo'],
  },
  {
    name: 'Distrito Capital',
    cities: ['Caracas'],
  },
  {
    name: 'Falcon',
    cities: ['Coro', 'Punto Fijo', 'Tucacas', 'Dabajuro', 'Judibana'],
  },
  {
    name: 'Guarico',
    cities: ['San Juan de los Morros', 'Calabozo', 'Valle de la Pascua', 'Zaraza', 'Altagracia de Orituco'],
  },
  {
    name: 'La Guaira',
    cities: ['La Guaira', 'Maiquetia', 'Catia La Mar', 'Caraballeda', 'Macuto'],
  },
  {
    name: 'Lara',
    cities: ['Barquisimeto', 'Cabudare', 'Carora', 'El Tocuyo', 'Quibor', 'Duaca'],
  },
  {
    name: 'Merida',
    cities: ['Merida', 'El Vigia', 'Ejido', 'Tovar', 'Mucuchies', 'Tabay', 'Lagunillas'],
  },
  {
    name: 'Miranda',
    cities: ['Los Teques', 'Guarenas', 'Guatire', 'Charallave', 'Cua', 'Ocumare del Tuy', 'Santa Teresa del Tuy', 'Higuerote', 'Baruta', 'Chacao', 'Petare'],
  },
  {
    name: 'Monagas',
    cities: ['Maturin', 'Punta de Mata', 'Temblador', 'Caripito', 'Barrancas del Orinoco'],
  },
  {
    name: 'Nueva Esparta',
    cities: ['La Asuncion', 'Porlamar', 'Juan Griego', 'Pampatar', 'El Valle del Espiritu Santo'],
  },
  {
    name: 'Portuguesa',
    cities: ['Guanare', 'Acarigua', 'Araure', 'Biscucuy', 'Ospino'],
  },
  {
    name: 'Sucre',
    cities: ['Cumana', 'Carupano', 'Guiria', 'Cariaco', 'Rio Caribe'],
  },
  {
    name: 'Tachira',
    cities: ['San Cristobal', 'Tariba', 'Rubio', 'La Fria', 'San Antonio del Tachira', 'Capacho'],
  },
  {
    name: 'Trujillo',
    cities: ['Trujillo', 'Valera', 'Bocono', 'Sabana de Mendoza', 'Motatan'],
  },
  {
    name: 'Yaracuy',
    cities: ['San Felipe', 'Yaritagua', 'Chivacoa', 'Nirgua', 'Cocorote'],
  },
  {
    name: 'Zulia',
    cities: ['Maracaibo', 'Cabimas', 'Ciudad Ojeda', 'Santa Barbara del Zulia', 'Machiques', 'San Francisco', 'Los Puertos de Altagracia'],
  },
];

export function getCitiesForState(stateName: string): string[] {
  const state = VENEZUELA_STATES.find(
    (s) => s.name.toLowerCase() === stateName.toLowerCase()
  );
  return state?.cities ?? [];
}
