export const DENTAL_PATHS = {
    // Generic simplified paths for 60x100 viewport

    // Upper Molar (3 roots)
    UPPER_MOLAR: {
        root: "M10,40 L10,10 Q10,0 20,5 L30,20 L40,5 Q50,0 50,10 L50,40 Z", // 2 buccal roots visible
        crown: "M5,40 Q5,35 10,35 L50,35 Q55,35 55,40 L55,80 Q55,95 30,95 Q5,95 5,80 Z"
    },

    // Upper Premolar (2 roots)
    UPPER_PREMOLAR: {
        root: "M15,40 L15,10 Q15,0 25,5 L30,10 L35,5 Q45,0 45,10 L45,40 Z",
        crown: "M10,40 Q10,35 15,35 L45,35 Q50,35 50,40 L50,80 Q50,90 30,90 Q10,90 10,80 Z"
    },

    // Upper Anterior (1 root)
    UPPER_ANTERIOR: {
        root: "M20,40 L25,5 Q30,0 35,5 L40,40 Z",
        crown: "M15,40 Q15,35 20,35 L40,35 Q45,35 45,40 L45,85 Q45,95 30,95 Q15,95 15,85 Z"
    },

    // Lower Molar (2 roots)
    LOWER_MOLAR: {
        root: "M10,60 L10,90 Q10,100 20,95 L30,80 L40,95 Q50,100 50,90 L50,60 Z",
        crown: "M5,60 Q5,65 10,65 L50,65 Q55,65 55,60 L55,20 Q55,5 30,5 Q5,5 5,20 Z"
    },

    // Lower Premolar/Anterior (1 root)
    LOWER_SINGLE: {
        root: "M20,60 L25,95 Q30,100 35,95 L40,60 Z",
        crown: "M15,60 Q15,65 20,65 L40,65 Q45,65 45,60 L45,15 Q45,5 30,5 Q15,5 15,15 Z"
    }
};

export function getToothPath(code: number) {
    // ISO 3950 notation
    // 1x, 2x: Upper
    // 3x, 4x: Lower

    const quadrant = Math.floor(code / 10);
    const index = code % 10;
    const isUpper = quadrant === 1 || quadrant === 2;

    // Molar: 6, 7, 8
    // Premolar: 4, 5
    // Anterior: 1, 2, 3

    if (isUpper) {
        if (index >= 6) return DENTAL_PATHS.UPPER_MOLAR;
        if (index >= 4) return DENTAL_PATHS.UPPER_PREMOLAR;
        return DENTAL_PATHS.UPPER_ANTERIOR;
    } else {
        if (index >= 6) return DENTAL_PATHS.LOWER_MOLAR;
        return DENTAL_PATHS.LOWER_SINGLE; // Simplified handling for lower arch
    }
}
