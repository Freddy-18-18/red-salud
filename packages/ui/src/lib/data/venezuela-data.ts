/**
 * @file venezuela-data.ts
 * @description Data completa de estados y ciudades de Venezuela para selectores.
 * @module Lib/Data
 */

/** Interfaz para un estado de Venezuela */
export interface Estado {
    code: string;
    name: string;
    ciudades: string[];
}

/**
 * Data completa de estados y ciudades de Venezuela
 * Ordenados alfabéticamente por nombre de estado
 */
export const VENEZUELA_ESTADOS: Estado[] = [
    {
        code: "AM",
        name: "Amazonas",
        ciudades: ["Puerto Ayacucho", "San Fernando de Atabapo", "Maroa", "San Carlos de Río Negro"]
    },
    {
        code: "AN",
        name: "Anzoátegui",
        ciudades: [
            "Barcelona", "Puerto La Cruz", "El Tigre", "Anaco", "Cantaura",
            "Clarines", "Guanta", "Lechería", "Pariaguán", "San Mateo"
        ]
    },
    {
        code: "AP",
        name: "Apure",
        ciudades: ["San Fernando de Apure", "Biruaca", "Achaguas", "Guasdualito", "Elorza"]
    },
    {
        code: "AR",
        name: "Aragua",
        ciudades: [
            "Maracay", "Turmero", "Cagua", "La Victoria", "Villa de Cura",
            "San Mateo", "El Consejo", "Santa Rita", "Palo Negro", "Las Tejerías"
        ]
    },
    {
        code: "BA",
        name: "Barinas",
        ciudades: ["Barinas", "Barinitas", "Santa Bárbara", "Socopó", "Ciudad Bolivia"]
    },
    {
        code: "BO",
        name: "Bolívar",
        ciudades: [
            "Ciudad Bolívar", "Puerto Ordaz", "San Félix", "Upata", "Caicara del Orinoco",
            "El Callao", "Tumeremo", "Guasipati", "Santa Elena de Uairén"
        ]
    },
    {
        code: "CA",
        name: "Carabobo",
        ciudades: [
            "Valencia", "Puerto Cabello", "Guacara", "Mariara", "Los Guayos",
            "San Diego", "Naguanagua", "Tocuyito", "Morón", "Bejuma"
        ]
    },
    {
        code: "CO",
        name: "Cojedes",
        ciudades: ["San Carlos", "Tinaquillo", "El Baúl", "Las Vegas", "Libertad"]
    },
    {
        code: "DA",
        name: "Delta Amacuro",
        ciudades: ["Tucupita", "Pedernales", "Curiapo"]
    },
    {
        code: "DC",
        name: "Distrito Capital",
        ciudades: ["Caracas"]
    },
    {
        code: "FA",
        name: "Falcón",
        ciudades: [
            "Coro", "Punto Fijo", "Tucacas", "Chichiriviche", "Dabajuro",
            "Cabure", "Mirimire", "Pueblo Nuevo", "Churuguara"
        ]
    },
    {
        code: "GU",
        name: "Guárico",
        ciudades: [
            "San Juan de los Morros", "Calabozo", "Valle de la Pascua", "Zaraza",
            "Altagracia de Orituco", "Santa María de Ipire", "El Socorro", "Tucupido"
        ]
    },
    {
        code: "LA",
        name: "Lara",
        ciudades: [
            "Barquisimeto", "Carora", "Quíbor", "Duaca", "El Tocuyo",
            "Cabudare", "Sarare", "Sanare", "Siquisique"
        ]
    },
    {
        code: "ME",
        name: "Mérida",
        ciudades: [
            "Mérida", "El Vigía", "Ejido", "Tovar", "Santa Cruz de Mora",
            "Timotes", "Mucuchíes", "Lagunillas", "Santo Domingo"
        ]
    },
    {
        code: "MI",
        name: "Miranda",
        ciudades: [
            "Los Teques", "Guarenas", "Guatire", "Charallave", "Santa Teresa del Tuy",
            "Ocumare del Tuy", "Cúa", "San Antonio de Los Altos", "Carrizal",
            "Caucagüita", "Petare", "Baruta", "Chacao", "El Hatillo", "Filas de Mariches"
        ]
    },
    {
        code: "MO",
        name: "Monagas",
        ciudades: [
            "Maturín", "Caripe", "Punta de Mata", "Temblador", "Caripito",
            "Barrancas", "Aguasay", "Santa Bárbara"
        ]
    },
    {
        code: "NE",
        name: "Nueva Esparta",
        ciudades: [
            "La Asunción", "Porlamar", "Pampatar", "Juan Griego", "El Valle del Espíritu Santo",
            "San Juan Bautista", "Villa Rosa", "Boca de Río"
        ]
    },
    {
        code: "PO",
        name: "Portuguesa",
        ciudades: [
            "Guanare", "Acarigua", "Araure", "Biscucuy", "Boconoíto",
            "Ospino", "Turén", "Villa Bruzual", "Papelón"
        ]
    },
    {
        code: "SU",
        name: "Sucre",
        ciudades: [
            "Cumaná", "Carúpano", "Güiria", "Araya", "Casanay",
            "Tunapuy", "Cariaco", "Irapa", "Cumanacoa"
        ]
    },
    {
        code: "TA",
        name: "Táchira",
        ciudades: [
            "San Cristóbal", "San Antonio del Táchira", "Táriba", "Rubio", "La Grita",
            "Ureña", "Capacho", "Colón", "Michelena", "Palmira"
        ]
    },
    {
        code: "TR",
        name: "Trujillo",
        ciudades: [
            "Trujillo", "Valera", "Boconó", "Sabana de Mendoza", "Motatán",
            "Escuque", "Santa Ana", "Betijoque", "Carache"
        ]
    },
    {
        code: "VA",
        name: "Vargas",
        ciudades: [
            "La Guaira", "Macuto", "Maiquetía", "Catia La Mar", "Naiguatá",
            "Caraballeda", "Carayaca"
        ]
    },
    {
        code: "YA",
        name: "Yaracuy",
        ciudades: [
            "San Felipe", "Yaritagua", "Nirgua", "Chivacoa", "Cocorote",
            "Urachiche", "Sabana de Parra", "Aroa"
        ]
    },
    {
        code: "ZU",
        name: "Zulia",
        ciudades: [
            "Maracaibo", "Cabimas", "Ciudad Ojeda", "Machiques", "Santa Bárbara del Zulia",
            "San Carlos del Zulia", "La Villa del Rosario", "Lagunillas", "Bachaquero",
            "Santa Rita", "Encontrados", "Bobures", "Mara"
        ]
    }
];

/**
 * Obtiene lista de ciudades para un estado específico
 */
export const getCiudadesByEstado = (estadoCode: string): string[] => {
    const estado = VENEZUELA_ESTADOS.find(e => e.code === estadoCode);
    return estado?.ciudades || [];
};

/**
 * Obtiene nombre del estado por código
 */
export const getEstadoName = (estadoCode: string): string => {
    const estado = VENEZUELA_ESTADOS.find(e => e.code === estadoCode);
    return estado?.name || "";
};
