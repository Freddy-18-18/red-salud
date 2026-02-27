// Servicio de integración con ICD-11 API de la OMS
// Documentación: https://icd.who.int/icdapi
// GitHub: https://github.com/ICD-API

interface ICDToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
}

interface ICDEntity {
  "@id": string;
  title: {
    "@language": string;
    "@value": string;
  };
  definition?: {
    "@language": string;
    "@value": string;
  };
  code?: string;
  codingNote?: {
    "@language": string;
    "@value": string;
  };
  parent?: string[];
  child?: string[];
}

interface ICDSearchResult {
  destinationEntities?: Array<{
    id: string;
    title: string;
    theCode?: string;
    chapter?: string;
    score?: number;
    titleIsASearchResult?: boolean;
    titleIsTopScore?: boolean;
    matchingPVs?: Array<{
      label: string;
      score: number;
    }>;
  }>;
  error?: boolean;
  errorMessage?: string;
}

export interface ICD11Code {
  id: string;
  code: string;
  title: string;
  definition?: string | undefined;
  chapter?: string | undefined;
  score?: number | undefined;
}

// Cache del token de autenticación
let tokenCache: ICDToken | null = null;

/**
 * Obtiene un token de acceso OAuth2 de la API de ICD
 */
async function getAccessToken(): Promise<string> {
  // Verificar si hay un token válido en cache
  if (tokenCache && tokenCache.expires_at > Date.now()) {
    return tokenCache.access_token;
  }

  const clientId = process.env.ICD_API_CLIENT_ID;
  const clientSecret = process.env.ICD_API_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("ICD API credentials not configured. Please set ICD_API_CLIENT_ID and ICD_API_CLIENT_SECRET in .env");
  }

  try {
    const response = await fetch("https://icdaccessmanagement.who.int/connect/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: "icdapi_access",
        grant_type: "client_credentials",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get ICD API token: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Guardar en cache con tiempo de expiración
    tokenCache = {
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
      expires_at: Date.now() + (data.expires_in - 60) * 1000, // Restar 60 segundos para renovar antes
    };

    return tokenCache.access_token;
  } catch (error) {
    console.error("Error getting ICD API token:", error);
    throw error;
  }
}

/**
 * Busca códigos ICD-11 por término de búsqueda
 * @param query Término de búsqueda (puede ser en español o inglés)
 * @param useFlexibleSearch Si es true, usa búsqueda flexible (más resultados pero menos precisos)
 */
export async function searchICD11(
  query: string,
  useFlexibleSearch: boolean = true
): Promise<ICD11Code[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const token = await getAccessToken();

    // API endpoint para búsqueda (actualizado a versión 2025-01)
    const url = `https://id.who.int/icd/release/11/2025-01/mms/search?q=${encodeURIComponent(query)}&useFlexisearch=${useFlexibleSearch}&flatResults=true`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Accept-Language": "es",
        "API-Version": "v2",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ICD API search error: ${response.status} - ${errorText}`);
      return [];
    }

    const data: ICDSearchResult = await response.json();

    if (data.error) {
      console.error("ICD API search error:", data.errorMessage);
      return [];
    }

    // Transformar resultados al formato esperado
    const results: ICD11Code[] = data.destinationEntities
      ? data.destinationEntities
          .filter((entity) => entity.theCode) // Solo entidades con código
          .map((entity) => ({
            id: entity.id,
            code: entity.theCode || "",
            title: entity.title.replace(/<[^>]*>/g, ''), // Limpiar tags HTML
            chapter: entity.chapter,
            score: entity.score,
          }))
          .slice(0, 10) // Limitar a 10 resultados
      : [];

    console.log(`ICD API search successful for "${query}": ${results.length} results`);
    return results;
  } catch (error) {
    console.error("Error searching ICD-11:", error);
    return [];
  }
}

/**
 * Obtiene detalles completos de una entidad ICD-11 por su ID
 */
export async function getICD11Entity(entityId: string): Promise<ICDEntity | null> {
  try {
    const token = await getAccessToken();

    const response = await fetch(entityId, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Accept-Language": "es",
        "API-Version": "v2",
      },
    });

    if (!response.ok) {
      console.error(`Failed to get ICD entity: ${response.status}`);
      return null;
    }

    const data: ICDEntity = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting ICD entity:", error);
    return null;
  }
}

/**
 * Busca códigos ICD-11 por código específico
 */
export async function searchICD11ByCode(code: string): Promise<ICD11Code | null> {
  try {
    const results = await searchICD11(code, false);

    // Buscar coincidencia exacta de código
    const exactMatch = results.find(
      (result) => result.code.toLowerCase() === code.toLowerCase()
    );

    return exactMatch || results[0] || null;
  } catch (error) {
    console.error("Error searching ICD-11 by code:", error);
    return null;
  }
}

/**
 * Obtiene sugerencias de códigos ICD-11 basadas en texto libre (diagnóstico)
 * Esta función es útil para autocompletar mientras el médico escribe
 */
export async function getICD11Suggestions(text: string): Promise<ICD11Code[]> {
  if (!text || text.length < 3) {
    return [];
  }

  try {
    // Usar búsqueda flexible para obtener más resultados relevantes
    const results = await searchICD11(text, true);
    return results;
  } catch (error) {
    console.error("Error getting ICD-11 suggestions:", error);
    return [];
  }
}

/**
 * Valida si un código ICD-11 existe
 */
export async function validateICD11Code(code: string): Promise<boolean> {
  try {
    const result = await searchICD11ByCode(code);
    return result !== null;
  } catch (error) {
    console.error("Error validating ICD-11 code:", error);
    return false;
  }
}
