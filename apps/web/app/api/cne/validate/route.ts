import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const cedula = searchParams.get('cedula');
    const nacionalidad = searchParams.get('nacionalidad') || 'V';

    if (!cedula) {
        return NextResponse.json({ error: 'Cédula es requerida' }, { status: 400 });
    }

    const appId = process.env.CEDULA_API_APP_ID;
    const token = process.env.CEDULA_API_TOKEN;

    if (!appId || !token) {
        console.error('API credentials not configured');
        return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    try {
        const url = `https://api.cedula.com.ve/api/v1?app_id=${appId}&token=${token}&nacionalidad=${nacionalidad}&cedula=${cedula}`;

        console.log(`Consulting Cedula API: ${url.replace(token, 'REDACTED')}`);

        const response = await fetch(url);
        const result = await response.json();

        if (result.error) {
            if (result.error_str && result.error_str.includes('no encontrado')) {
                return NextResponse.json({ error: 'Cédula no encontrada' }, { status: 404 });
            }
            return NextResponse.json({ error: result.error_str || 'Error al consultar la API' }, { status: 400 });
        }

        const person = result.data;
        if (!person) {
            return NextResponse.json({ error: 'Datos no encontrados' }, { status: 404 });
        }

        const nombre_completo = [
            person.primer_nombre,
            person.segundo_nombre,
            person.primer_apellido,
            person.segundo_apellido
        ].filter(Boolean).map(s => s.trim()).join(' ');

        return NextResponse.json({
            nombre: person.primer_nombre || '',
            apellido: person.primer_apellido || '',
            nombre_completo,
            cedula: person.cedula?.toString() || cedula,
            nacionalidad: person.nacionalidad || nacionalidad,
        });
    } catch (error) {
        console.error('Error fetching from cedula.com.ve:', error);
        return NextResponse.json({ error: 'Error de conexión con el servicio de cédulas' }, { status: 500 });
    }
}
