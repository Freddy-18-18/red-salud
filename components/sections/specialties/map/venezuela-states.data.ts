/**
 * @file venezuela-states.data.ts
 * @description Datos geográficos SVG para el mapa de Venezuela.
 * Paths SVG basados en coordenadas geográficas reales de los 24 estados.
 * 
 * @note Los paths están optimizados para un viewBox de 0 0 800 600
 * donde las coordenadas representan la proyección de Venezuela.
 */

export interface CityData {
    /** Nombre de la ciudad */
    name: string;
    /** Coordenadas [x, y] relativas al centro del estado (0-100) */
    coordinates: [number, number];
}

export interface StateGeoData {
    /** ID único del estado (slug) */
    id: string;
    /** Nombre oficial del estado */
    name: string;
    /** Path SVG (atributo d) */
    path: string;
    /** ViewBox del SVG (por defecto se usa "0 0 800 600") */
    viewBox?: string;
    /** Centro del estado para labels [x, y] */
    center: [number, number];
    /** Ciudades principales del estado */
    cities: CityData[];
}

/**
 * Paths SVG de los estados de Venezuela.
 * Coordenadas basadas en proyección Mercator simplificada.
 * ViewBox recomendado: "0 0 800 600"
 */
export const VENEZUELA_STATES_GEO: StateGeoData[] = [
    {
        id: "zulia",
        name: "Zulia",
        path: "M80,120 L140,80 L170,100 L180,160 L175,220 L160,280 L140,300 L100,280 L70,250 L60,200 L65,150 Z",
        center: [120, 190],
        cities: [
            { name: "Maracaibo", coordinates: [50, 30] },
            { name: "Cabimas", coordinates: [60, 50] },
            { name: "Ciudad Ojeda", coordinates: [55, 60] },
            { name: "San Francisco", coordinates: [45, 40] }
        ]
    },
    {
        id: "falcon",
        name: "Falcón",
        path: "M170,60 L240,40 L320,50 L340,80 L320,130 L280,150 L220,160 L180,160 L170,120 Z",
        center: [255, 100],
        cities: [
            { name: "Coro", coordinates: [40, 60] },
            { name: "Punto Fijo", coordinates: [20, 30] },
            { name: "Carirubana", coordinates: [25, 35] }
        ]
    },
    {
        id: "lara",
        name: "Lara",
        path: "M220,160 L280,150 L310,180 L300,240 L260,260 L220,250 L200,220 L200,180 Z",
        center: [250, 205],
        cities: [
            { name: "Barquisimeto", coordinates: [50, 50] },
            { name: "Cabudare", coordinates: [55, 55] },
            { name: "Carora", coordinates: [30, 70] }
        ]
    },
    {
        id: "yaracuy",
        name: "Yaracuy",
        path: "M300,180 L340,170 L360,200 L350,240 L310,250 L290,230 Z",
        center: [325, 210],
        cities: [
            { name: "San Felipe", coordinates: [50, 40] },
            { name: "Yaritagua", coordinates: [60, 50] }
        ]
    },
    {
        id: "carabobo",
        name: "Carabobo",
        path: "M340,170 L380,150 L410,170 L420,210 L400,240 L360,240 L340,220 Z",
        center: [375, 200],
        cities: [
            { name: "Valencia", coordinates: [50, 50] },
            { name: "Puerto Cabello", coordinates: [40, 20] },
            { name: "Guacara", coordinates: [60, 45] }
        ]
    },
    {
        id: "aragua",
        name: "Aragua",
        path: "M410,170 L450,150 L480,170 L490,210 L470,240 L430,250 L410,230 Z",
        center: [445, 200],
        cities: [
            { name: "Maracay", coordinates: [50, 50] },
            { name: "Turmero", coordinates: [40, 55] },
            { name: "La Victoria", coordinates: [70, 60] }
        ]
    },
    {
        id: "vargas",
        name: "La Guaira",
        path: "M450,130 L520,120 L540,140 L520,160 L460,165 L445,150 Z",
        center: [490, 142],
        cities: [
            { name: "La Guaira", coordinates: [50, 50] },
            { name: "Maiquetía", coordinates: [40, 50] },
            { name: "Catia La Mar", coordinates: [30, 50] }
        ]
    },
    {
        id: "distrito_capital",
        name: "Distrito Capital",
        path: "M500,155 L530,150 L540,170 L530,185 L505,180 Z",
        center: [518, 168],
        cities: [
            { name: "Caracas", coordinates: [50, 50] }
        ]
    },
    {
        id: "miranda",
        name: "Miranda",
        path: "M480,170 L540,170 L580,190 L590,230 L560,260 L510,270 L470,250 L475,210 Z",
        center: [530, 220],
        cities: [
            { name: "Los Teques", coordinates: [20, 30] },
            { name: "Guarenas", coordinates: [50, 20] },
            { name: "Guatire", coordinates: [60, 25] },
            { name: "Petare", coordinates: [40, 35] }
        ]
    },
    {
        id: "nueva_esparta",
        name: "Nueva Esparta",
        path: "M600,100 L650,95 L660,115 L645,135 L605,130 Z",
        center: [625, 115],
        cities: [
            { name: "Porlamar", coordinates: [60, 60] },
            { name: "La Asunción", coordinates: [50, 40] }
        ]
    },
    {
        id: "sucre",
        name: "Sucre",
        path: "M590,150 L700,140 L740,160 L730,200 L680,220 L620,210 L590,190 Z",
        center: [660, 180],
        cities: [
            { name: "Cumaná", coordinates: [30, 50] },
            { name: "Carúpano", coordinates: [70, 40] }
        ]
    },
    {
        id: "anzoategui",
        name: "Anzoátegui",
        path: "M560,230 L620,210 L680,220 L700,270 L680,340 L600,360 L540,330 L530,280 Z",
        center: [610, 290],
        cities: [
            { name: "Barcelona", coordinates: [40, 20] },
            { name: "Puerto La Cruz", coordinates: [45, 15] },
            { name: "El Tigre", coordinates: [50, 60] },
            { name: "Anaco", coordinates: [45, 45] }
        ]
    },
    {
        id: "monagas",
        name: "Monagas",
        path: "M680,220 L740,200 L780,240 L770,320 L720,360 L660,340 L660,280 Z",
        center: [715, 280],
        cities: [
            { name: "Maturín", coordinates: [50, 50] },
            { name: "Punta de Mata", coordinates: [40, 60] }
        ]
    },
    {
        id: "delta_amacuro",
        name: "Delta Amacuro",
        path: "M740,200 L800,180 L820,250 L800,350 L760,380 L720,360 L740,300 L760,250 Z",
        center: [770, 280],
        cities: [
            { name: "Tucupita", coordinates: [50, 50] }
        ]
    },
    {
        id: "trujillo",
        name: "Trujillo",
        path: "M175,220 L220,210 L240,250 L220,290 L180,300 L160,280 Z",
        center: [198, 255],
        cities: [
            { name: "Trujillo", coordinates: [50, 40] },
            { name: "Valera", coordinates: [50, 60] }
        ]
    },
    {
        id: "merida",
        name: "Mérida",
        path: "M140,300 L180,300 L200,350 L180,400 L130,400 L110,360 Z",
        center: [155, 350],
        cities: [
            { name: "Mérida", coordinates: [50, 50] },
            { name: "El Vigía", coordinates: [30, 30] },
            { name: "Tovar", coordinates: [60, 70] }
        ]
    },
    {
        id: "tachira",
        name: "Táchira",
        path: "M80,320 L140,300 L150,360 L130,420 L80,430 L50,390 Z",
        center: [105, 370],
        cities: [
            { name: "San Cristóbal", coordinates: [50, 50] },
            { name: "Táriba", coordinates: [55, 45] },
            { name: "Rubio", coordinates: [40, 60] }
        ]
    },
    {
        id: "barinas",
        name: "Barinas",
        path: "M180,300 L260,280 L320,320 L340,400 L280,450 L200,440 L150,400 Z",
        center: [250, 370],
        cities: [
            { name: "Barinas", coordinates: [50, 40] },
            { name: "Socopó", coordinates: [30, 60] }
        ]
    },
    {
        id: "portuguesa",
        name: "Portuguesa",
        path: "M260,260 L320,260 L360,300 L350,360 L300,380 L260,350 L250,300 Z",
        center: [300, 315],
        cities: [
            { name: "Guanare", coordinates: [40, 60] },
            { name: "Acarigua", coordinates: [60, 30] },
            { name: "Araure", coordinates: [65, 35] }
        ]
    },
    {
        id: "cojedes",
        name: "Cojedes",
        path: "M350,240 L420,250 L440,310 L410,360 L350,370 L320,320 Z",
        center: [380, 305],
        cities: [
            { name: "San Carlos", coordinates: [50, 40] },
            { name: "Tinaco", coordinates: [60, 50] }
        ]
    },
    {
        id: "guarico",
        name: "Guárico",
        path: "M420,260 L530,280 L570,350 L540,420 L450,450 L380,420 L360,360 L380,300 Z",
        center: [465, 365],
        cities: [
            { name: "San Juan de los Morros", coordinates: [30, 20] },
            { name: "Calabozo", coordinates: [50, 50] },
            { name: "Valle de la Pascua", coordinates: [70, 35] }
        ]
    },
    {
        id: "apure",
        name: "Apure",
        path: "M80,430 L200,440 L340,460 L450,480 L480,540 L380,580 L200,560 L80,520 L50,480 Z",
        center: [270, 510],
        cities: [
            { name: "San Fernando de Apure", coordinates: [60, 30] },
            { name: "Guasdualito", coordinates: [20, 50] }
        ]
    },
    {
        id: "bolivar",
        name: "Bolívar",
        path: "M540,350 L680,340 L760,380 L780,480 L720,580 L600,620 L500,600 L450,520 L480,450 L520,400 Z",
        center: [610, 480],
        cities: [
            { name: "Ciudad Bolívar", coordinates: [30, 30] },
            { name: "Ciudad Guayana", coordinates: [60, 25] },
            { name: "Upata", coordinates: [55, 40] },
            { name: "Santa Elena de Uairén", coordinates: [70, 80] }
        ]
    },
    {
        id: "amazonas",
        name: "Amazonas",
        path: "M450,520 L500,600 L520,700 L480,780 L380,800 L300,750 L280,650 L320,580 L380,540 Z",
        center: [420, 670],
        cities: [
            { name: "Puerto Ayacucho", coordinates: [20, 20] },
            { name: "San Fernando de Atabapo", coordinates: [40, 60] }
        ]
    }
];

/**
 * Normaliza nombres de estados para búsqueda.
 * Maneja acentos y variaciones comunes.
 */
export function normalizeStateName(name: string): string {
    const normalizations: Record<string, string> = {
        // Con acentos
        "bolívar": "bolivar",
        "anzoátegui": "anzoategui",
        "mérida": "merida",
        "táchira": "tachira",
        "guárico": "guarico",
        "falcón": "falcon",
        // Variantes de nombres
        "vargas": "vargas",
        "la guaira": "vargas",
        "delta amacuro": "delta_amacuro",
        "distrito capital": "distrito_capital",
        "nueva esparta": "nueva_esparta",
        "d.c.": "distrito_capital",
        "caracas": "distrito_capital"
    };

    const lower = name
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // Quitar acentos

    return normalizations[lower] || lower.replace(/\s+/g, "_");
}

/**
 * Obtiene un estado por su ID o nombre.
 */
export function getStateById(idOrName: string): StateGeoData | undefined {
    const normalized = normalizeStateName(idOrName);
    return VENEZUELA_STATES_GEO.find(
        (s) => s.id === normalized || normalizeStateName(s.name) === normalized
    );
}
