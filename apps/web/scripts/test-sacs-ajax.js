// Test completo del SACS con simulación de AJAX
const https = require('https');
const fs = require('fs');

const cedula = '7983901';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║         TEST DE SCRAPING SACS - VENEZUELA                  ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');
console.log(`📋 Cédula de prueba: V-${cedula}\n`);

// Paso 1: Obtener la página inicial
function getInitialPage() {
  return new Promise((resolve, reject) => {
    console.log('📥 PASO 1: Obteniendo página inicial...');
    
    const options = {
      hostname: 'sistemas.sacs.gob.ve',
      port: 443,
      path: '/consultas/prfsnal_salud',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 15000,
      rejectUnauthorized: false
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`   ✓ Status: ${res.statusCode}`);
        console.log(`   ✓ Tamaño: ${data.length} caracteres\n`);
        resolve({ cookies: res.headers['set-cookie'], html: data });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    req.end();
  });
}

// Paso 2: Hacer búsqueda con POST
function searchByCedula(cookies) {
  return new Promise((resolve, reject) => {
    console.log('🔍 PASO 2: Buscando por cédula...');
    
    const formData = `cedula=${cedula}&tipo=V`;
    
    const options = {
      hostname: 'sistemas.sacs.gob.ve',
      port: 443,
      path: '/consultas/prfsnal_salud',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(formData),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Referer': 'https://sistemas.sacs.gob.ve/consultas/prfsnal_salud',
        'Origin': 'https://sistemas.sacs.gob.ve',
        'Cookie': cookies ? cookies.join('; ') : '',
      },
      timeout: 15000,
      rejectUnauthorized: false
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`   ✓ Status: ${res.statusCode}`);
        console.log(`   ✓ Tamaño: ${data.length} caracteres\n`);
        resolve(data);
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.write(formData);
    req.end();
  });
}

// Función para analizar el HTML
function analyzeHTML(html) {
  console.log('🔬 PASO 3: Analizando HTML...\n');
  
  // Guardar HTML completo
  fs.writeFileSync('scripts/sacs-full-response.html', html);
  console.log('   💾 HTML completo guardado en: scripts/sacs-full-response.html\n');
  
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('📊 ANÁLISIS DE CONTENIDO:\n');
  
  // Buscar palabras clave
  const keywords = {
    'nombre': 0,
    'apellido': 0,
    'especialidad': 0,
    'profesión': 0,
    'mpps': 0,
    'colegio': 0,
    'estado': 0,
    'registro': 0,
    'table': 0,
    'tbody': 0,
    'div id': 0,
  };
  
  Object.keys(keywords).forEach(word => {
    const regex = new RegExp(word, 'gi');
    const matches = html.match(regex);
    keywords[word] = matches ? matches.length : 0;
  });
  
  console.log('🔍 Palabras clave encontradas:');
  Object.entries(keywords).forEach(([word, count]) => {
    if (count > 0) {
      console.log(`   ${count > 0 ? '✓' : '✗'} "${word}": ${count} vez(es)`);
    }
  });
  
  console.log('\n───────────────────────────────────────────────────────────\n');
  
  // Buscar divs importantes
  console.log('📦 DIVs importantes:\n');
  const divMatches = html.match(/<div[^>]*id=["']([^"']+)["'][^>]*>/gi);
  if (divMatches) {
    const uniqueDivs = [...new Set(divMatches.map(m => {
      const match = m.match(/id=["']([^"']+)["']/);
      return match ? match[1] : null;
    }).filter(Boolean))];
    
    uniqueDivs.forEach(id => {
      console.log(`   • <div id="${id}">`);
    });
  }
  
  console.log('\n───────────────────────────────────────────────────────────\n');
  
  // Buscar tablas
  console.log('📋 Tablas encontradas:\n');
  const tableMatches = html.match(/<table[^>]*>([\s\S]*?)<\/table>/gi);
  if (tableMatches) {
    console.log(`   ✓ Total: ${tableMatches.length} tabla(s)\n`);
    
    tableMatches.forEach((table, index) => {
      console.log(`   📊 Tabla ${index + 1}:`);
      const rows = table.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
      if (rows) {
        console.log(`      • Filas: ${rows.length}`);
        
        // Mostrar primera fila como ejemplo
        if (rows[0]) {
          const cells = rows[0].match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi);
          if (cells) {
            console.log(`      • Columnas: ${cells.length}`);
            console.log(`      • Preview: ${rows[0].substring(0, 100)}...`);
          }
        }
      }
      console.log('');
    });
  } else {
    console.log('   ✗ No se encontraron tablas\n');
  }
  
  console.log('───────────────────────────────────────────────────────────\n');
  
  // Buscar scripts AJAX
  console.log('⚡ Scripts AJAX detectados:\n');
  const ajaxFunctions = html.match(/function xajax_\w+/gi);
  if (ajaxFunctions) {
    const uniqueFunctions = [...new Set(ajaxFunctions)];
    uniqueFunctions.forEach(func => {
      console.log(`   • ${func}`);
    });
  }
  
  console.log('\n───────────────────────────────────────────────────────────\n');
  
  // Intentar extraer datos
  console.log('🎯 INTENTANDO EXTRAER DATOS:\n');
  
  const data = {
    verified: false,
    cedula: cedula,
  };
  
  // Patrón 1: Buscar en tablas
  const nombreMatch = html.match(/(?:Nombre[s]?|NOMBRE[S]?)[\s:]*<\/t[dh]>[\s\S]*?<t[dh][^>]*>(.*?)<\/t[dh]>/i);
  if (nombreMatch) {
    data.nombre = nombreMatch[1].replace(/<[^>]*>/g, '').trim();
    console.log(`   ✓ Nombre: ${data.nombre}`);
  }
  
  const apellidoMatch = html.match(/(?:Apellido[s]?|APELLIDO[S]?)[\s:]*<\/t[dh]>[\s\S]*?<t[dh][^>]*>(.*?)<\/t[dh]>/i);
  if (apellidoMatch) {
    data.apellido = apellidoMatch[1].replace(/<[^>]*>/g, '').trim();
    console.log(`   ✓ Apellido: ${data.apellido}`);
  }
  
  const especialidadMatch = html.match(/(?:Especialidad|ESPECIALIDAD|Profesión|PROFESIÓN)[\s:]*<\/t[dh]>[\s\S]*?<t[dh][^>]*>(.*?)<\/t[dh]>/i);
  if (especialidadMatch) {
    data.especialidad = especialidadMatch[1].replace(/<[^>]*>/g, '').trim();
    console.log(`   ✓ Especialidad: ${data.especialidad}`);
  }
  
  const mppsMatch = html.match(/(?:MPPS|M\.P\.P\.S|Registro|REGISTRO)[\s:]*<\/t[dh]>[\s\S]*?<t[dh][^>]*>(.*?)<\/t[dh]>/i);
  if (mppsMatch) {
    data.mpps = mppsMatch[1].replace(/<[^>]*>/g, '').trim();
    console.log(`   ✓ MPPS: ${data.mpps}`);
  }
  
  if (!data.nombre && !data.apellido && !data.especialidad) {
    console.log('   ⚠️  No se pudieron extraer datos con los patrones actuales');
    console.log('   ℹ️  Esto puede significar que:');
    console.log('      • Los datos se cargan dinámicamente con AJAX');
    console.log('      • La estructura HTML es diferente');
    console.log('      • Se requiere JavaScript para ver los resultados');
  } else {
    data.verified = true;
  }
  
  console.log('\n═══════════════════════════════════════════════════════════\n');
  
  // Mostrar preview del HTML
  console.log('📝 PREVIEW DEL HTML (primeros 1000 caracteres):\n');
  console.log('┌───────────────────────────────────────────────────────────┐');
  console.log(html.substring(0, 1000).split('\n').map(line => `│ ${line}`).join('\n'));
  console.log('└───────────────────────────────────────────────────────────┘\n');
  
  return data;
}

// Ejecutar test completo
async function runTest() {
  try {
    const { cookies, html: initialHtml } = await getInitialPage();
    const searchHtml = await searchByCedula(cookies);
    const data = analyzeHTML(searchHtml);
    
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('✅ RESULTADO FINAL:\n');
    console.log(JSON.stringify(data, null, 2));
    console.log('\n═══════════════════════════════════════════════════════════\n');
    console.log('💡 RECOMENDACIONES:\n');
    
    if (!data.verified) {
      console.log('   1. El SACS usa carga dinámica con AJAX (xajax)');
      console.log('   2. Necesitamos simular las llamadas AJAX o usar un navegador headless');
      console.log('   3. Alternativa: Usar Puppeteer o Playwright para scraping completo');
      console.log('   4. O implementar llamadas directas a los endpoints AJAX del SACS\n');
    } else {
      console.log('   ✓ Scraping exitoso con HTTP simple');
      console.log('   ✓ Los patrones de extracción funcionan correctamente\n');
    }
    
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('✅ Test completado!\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nDetalles:', error);
  }
}

// Ejecutar
runTest();
