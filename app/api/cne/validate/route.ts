import { NextRequest, NextResponse } from "next/server";

// API real de cedula.com.ve (la misma que usa el dashboard del paciente)
const CEDULA_API_URL = "https://api.cedula.com.ve/api/v1";
const APP_ID = "1461";
const ACCESS_TOKEN = "96bc48c83b180e4529fe91c6700e98d3";

interface CedulaAPIResponse {
  error: boolean;
  error_str: boolean | string;
  data?: {
    nacionalidad: string;
    cedula: number;
    primer_apellido: string;
    segundo_apellido: string;
    primer_nombre: string;
    segundo_nombre: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cedula = searchParams.get("cedula");

    if (!cedula) {
      return NextResponse.json(
        { error: "Cédula es requerida" },
        { status: 400 }
      );
    }

    // Limpiar la cédula (solo dígitos)
    const cleanCedula = cedula.replace(/\D/g, "");
    
    if (cleanCedula.length < 6 || cleanCedula.length > 8) {
      return NextResponse.json(
        { error: "Formato de cédula inválido" },
        { status: 400 }
      );
    }

    // Consultar la API real de cedula.com.ve (siempre V para venezolanos)
    const url = `${CEDULA_API_URL}?app_id=${APP_ID}&token=${ACCESS_TOKEN}&nacionalidad=V&cedula=${cleanCedula}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Error al consultar la API de cédula" },
        { status: response.status }
      );
    }

    const data: CedulaAPIResponse = await response.json();

    if (data.error) {
      return NextResponse.json(
        {
          error: typeof data.error_str === "string" ? data.error_str : "Cédula no encontrada",
        },
        { status: 404 }
      );
    }

    if (!data.data) {
      return NextResponse.json(
        { error: "No se encontraron datos para esta cédula" },
        { status: 404 }
      );
    }

    // Formatear respuesta
    const nombreCompleto = `${data.data.primer_nombre} ${data.data.segundo_nombre || ""} ${data.data.primer_apellido} ${data.data.segundo_apellido || ""}`.trim();

    return NextResponse.json({
      nombre: data.data.primer_nombre,
      apellido: `${data.data.primer_apellido} ${data.data.segundo_apellido || ""}`.trim(),
      nombre_completo: nombreCompleto,
      cedula: cleanCedula,
      nacionalidad: data.data.nacionalidad,
    });
  } catch (error: any) {
    console.error("Error validating cedula:", error);
    
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
