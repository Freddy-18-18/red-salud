// Script para probar el scraping del SACS
// Ejecutar con: node scripts/test-sacs-scraping.js

const https = require('https');
const http = require('http');

const SACS_URL = 'https://sistemas.sacs.gob.ve/consultas/prfsnal_salud';
const TEST_CEDULA = '7983901';

// Función para hacer el request
function makeRequest(cedula) {
  return new Promise((resolve, reject) => {
    const formData = `cedula=${cedula}&tipo=V`;
    
    const options = {
      hostname: 'sistemas.sacs.gob.ve',
      port: 443,
      path: '/consultas/prfsnal_salud',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(formData),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-VE,es;q=0.9,en;q=0.8',
        'Referer': 'https://sistemas.sacs.gob.ve/consultas/prfsnal_salud',
        'Origin': 'https://sistemas.sacs.gob.ve',
      },
      rejectUnauthorized: false // Para certificados SSL auto-firmados
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({ statusCode: res.statusCode, html: data });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(formData);
    req.end();
  });
}

// Función para extraer datos del HTML
function extractData(html) {
  const data = {
    verified: false,
    cedula: TEST_CEDULA,
  };

  // Verificar si hay resultados
  if (html.includes('No se encontraron resultados') || 
      html.includes('no existe') || 
      html.includes('No existe')) {
    return { ...data, error: 'No se encontró registro en SACS' };
  }

  // Función auxiliar para limpiar HTML
  function stripHtml(text) {
    return text.replace(/<[^>]*>/g, '').trim();
  }

  // Extraer nombre
  const nombreMatch = html.match(/(?:Nombre[s]?|NOMBRE[S]?)[\s:]*<\/td>[\s\S]*?<td[^>]*>(.*?)<\/td>/i);
  if (nombreMatch) {
    data.nombre = stripHtml(nombreMatch[1]);
  }

  // Extraer apellido
  const apellidoMatch = html.match(/(?:Apellido[s]?|APELLIDO[S]?)[\s:]*<\/td>[\s\S]*?<td[^>]*>(.*?)<\/td>/i);
  if (apellidoMatch) {
    data.apellido = stripHtml(apellidoMatch[1]);
  }

  // Extraer especialidad
  const especialidadMatch = html.match(/(?:Especialidad|ESPECIALIDAD|Profesión|PROFESIÓN)[\s:]*<\/td>[\s\S]*?<td[^>]*>(.*?)<\/td>/i);
  if (especialidadMatch) {
    data.especialidad = stripHtml(especialidadMatch[1]);
  }

  // Extraer MPPS
  const mppsMatch = html.match(/(?:MPPS|M\.P\.P\.S|Registro|REGISTRO)[\s:]*<\/td>[\s\S]*?<td[^>]*>(.*?)<\/td>/i);
  if (mppsMatch) {
    data.mpps = stripHtml(mppsMatch[1]);
  }

  // Extraer colegio
  const colegioMatch = html.match(/(?:Colegio|COLEGIO)[\s:]*<\/td>[\s\S]*?<td[^>]*>(.*?)<\/td>/i);
  if (colegioMatch) {
    data.colegio = stripHtml(colegioMatch[1]);
  }

  // Extraer estado
  const estadoMatch = html.match(/(?:Estado|ESTADO)[\s:]*<\/td>[\s\S]*?<td[^>]*>(.*?)<\/td>/i);
  if (estadoMatch) {
    data.estado = stripHtml(estadoMatch[1]);
  }

  // Formato alternativo
  if (!data.nombre && !data.apellido) {
    const nombreAltMatch = html.match(/Nombre[s]?[\s:]+([A-ZÁÉÍÓÚÑ\s]+)/i);
    if (nombreAltMatch) {
      data.nombre = nombreAltMatch[1].trim();
    }

    const apellidoAltMatch = html.match(/Apellido[s]?[\s:]+([A-ZÁÉÍÓÚÑ\s]+)/i);
    if (apellidoAltMatch) {
      data.apellido = apellidoAltMatch[1].trim();
    }
  }

  // Nombre completo
  if (!data.nombre || !data.apellido) {
    const nombreCompletoMatch = html.match(/(?:Profesional|PROFESIONAL)[\s:]*<\/td>[\s\S]*?<td[^>]*>(.*?)<\/td>/i);
    if (nombreCompletoMatch) {
      const nombreCompleto = stripHtml(nombreCompletoMatch[1]).split(' ');
      if (nombreCompleto.length >= 2) {
        data.nombre = nombreCompleto[0];
        data.apellido = nombreCompleto.slice(1).join(' ');
      }
    }
  }

  // Validar datos
  if (data.nombre || data.apellido || data.especialidad) {
    data.verified = true;
  }

  return data;
}

// Función principal
async function testScraping() {
  console.log('🔍 Probando scraping del SACS...\n');
  console.log(`📋 Cédula de prueba: ${TEST_CEDULA}\n`);
  console.log('⏳ Haciendo request...\n');

  try {
    const { statusCode, html } = await makeRequest(TEST_CEDULA);
    
    console.log(`✅ Status Code: ${statusCode}\n`);
    console.log(`📄 Tamaño del HTML: ${html.length} caracteres\n`);

    // Guardar HTML para inspección
    const fs = require('fs');
    fs.writeFileSync('scripts/sacs-response.html', html);
    console.log('💾 HTML guardado en: scripts/sacs-response.html\n');

    // Extraer datos
    console.log('🔎 Extrayendo datos...\n');
    const data = extractData(html);

    console.log('📊 RESULTADOS:\n');
    console.log('═══════════════════════════════════════\n');
    console.log(`✓ Verificado: ${data.verified ? 'SÍ' : 'NO'}`);
    console.log(`✓ Cédula: ${data.cedula || 'N/A'}`);
    console.log(`✓ Nombre: ${data.nombre || 'N/A'}`);
    console.log(`✓ Apellido: ${data.apellido || 'N/A'}`);
    console.log(`✓ Especialidad: ${data.especialidad || 'N/A'}`);
    console.log(`✓ MPPS: ${data.mpps || 'N/A'}`);
    console.log(`✓ Colegio: ${data.colegio || 'N/A'}`);
    console.log(`✓ Estado: ${data.estado || 'N/A'}`);
    
    if (data.error) {
      console.log(`\n❌ Error: ${data.error}`);
    }

    console.log('\n═══════════════════════════════════════\n');

    // Buscar tablas en el HTML
    console.log('🔍 Buscando estructura HTML...\n');
    const tableMatches = html.match(/<table[^>]*>([\s\S]*?)<\/table>/gi);
    if (tableMatches) {
      console.log(`📋 Encontradas ${tableMatches.length} tabla(s)\n`);
      
      // Mostrar preview de la primera tabla
      if (tableMatches[0]) {
        const preview = tableMatches[0].substring(0, 500);
        console.log('Preview de la primera tabla:');
        console.log('─────────────────────────────────────');
        console.log(preview + '...');
        console.log('─────────────────────────────────────\n');
      }
    } else {
      console.log('⚠️  No se encontraron tablas en el HTML\n');
    }

    // Buscar campos específicos
    console.log('🔍 Buscando campos en el HTML...\n');
    const fields = ['nombre', 'apellido', 'especialidad', 'mpps', 'colegio', 'estado', 'profesional', 'registro'];
    fields.forEach(field => {
      const regex = new RegExp(field, 'gi');
      const matches = html.match(regex);
      if (matches) {
        console.log(`  ✓ "${field}": encontrado ${matches.length} vez(es)`);
      }
    });

    console.log('\n✅ Prueba completada!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nDetalles:', error);
  }
}

// Ejecutar
testScraping();
