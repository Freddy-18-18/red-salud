// Test del SACS usando Puppeteer (navegador headless)
const puppeteer = require('puppeteer');
const fs = require('fs');

const SACS_URL = 'https://sistemas.sacs.gob.ve/consultas/prfsnal_salud';
const TEST_CEDULA = '7983901';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║    TEST SACS CON PUPPETEER - NAVEGADOR HEADLESS           ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');
console.log(`📋 Cédula de prueba: V-${TEST_CEDULA}\n`);

async function testSACS() {
  let browser;
  
  try {
    console.log('🚀 Iniciando navegador headless...\n');
    
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-spki-list',
      ],
      ignoreHTTPSErrors: true,
      acceptInsecureCerts: true,
    });

    const page = await browser.newPage();
    
    // Configurar viewport y user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('📥 Navegando a la página del SACS...\n');
    
    // Configurar para ignorar errores de certificado
    await page.setBypassCSP(true);
    
    // Navegar a la página
    await page.goto(SACS_URL, {
      waitUntil: 'networkidle2',
      timeout: 30000
    }).catch(async (error) => {
      console.log('⚠️  Error de navegación, intentando con domLoaded...\n');
      await page.goto(SACS_URL, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
    });
    
    console.log('✅ Página cargada\n');
    
    // Tomar screenshot inicial
    await page.screenshot({ path: 'scripts/sacs-screenshot-1-inicial.png' });
    console.log('📸 Screenshot inicial guardado\n');
    
    // Esperar a que el formulario esté disponible
    console.log('⏳ Esperando formulario...\n');
    await page.waitForSelector('#cedula_matricula', { timeout: 10000 });
    
    console.log('📝 Llenando formulario...\n');
    
    // Seleccionar tipo de búsqueda (N°. CÉDULA)
    await page.select('#tipo', '1'); // 1 = N°. CÉDULA
    console.log('   ✓ Tipo de búsqueda: N°. CÉDULA\n');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Seleccionar VENEZOLANO(A)
    await page.select('#datajs', 'V');
    console.log('   ✓ Tipo: V (Venezolano)\n');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Llenar el campo de cédula
    await page.type('#cedula_matricula', TEST_CEDULA);
    console.log('   ✓ Cédula ingresada\n');
    
    // Tomar screenshot antes de enviar
    await page.screenshot({ path: 'scripts/sacs-screenshot-2-formulario.png' });
    console.log('📸 Screenshot del formulario guardado\n');
    
    console.log('🔍 Enviando búsqueda...\n');
    
    // Buscar el botón de búsqueda
    const submitButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button, input[type="submit"]'));
      return buttons.find(btn => 
        btn.textContent.includes('Consultar') || 
        btn.textContent.includes('Buscar') ||
        btn.type === 'submit'
      );
    });
    
    if (submitButton && submitButton.asElement()) {
      await submitButton.asElement().click();
      console.log('   ✓ Botón clickeado\n');
    } else {
      // Intentar llamar a la función AJAX directamente
      await page.evaluate(() => {
        if (typeof xajax_getPrfsnalByCed === 'function') {
          const cedula = document.getElementById('cedula_matricula').value;
          const tipo = document.getElementById('datajs').value;
          xajax_getPrfsnalByCed(cedula, tipo);
        }
      });
      console.log('   ✓ Función AJAX llamada\n');
    }
    
    // Esperar a que se carguen los resultados
    console.log('⏳ Esperando resultados...\n');
    
    try {
      // Esperar por alguno de estos selectores que indiquen resultados
      await Promise.race([
        page.waitForSelector('#tableUser', { timeout: 10000 }),
        page.waitForSelector('#divTabla', { timeout: 10000 }),
        page.waitForSelector('table', { timeout: 10000 }),
        page.waitForFunction(() => {
          const tableUser = document.getElementById('tableUser');
          const divTabla = document.getElementById('divTabla');
          return (tableUser && tableUser.innerHTML.trim() !== '') || 
                 (divTabla && divTabla.innerHTML.trim() !== '');
        }, { timeout: 10000 })
      ]);
      
      console.log('✅ Resultados cargados\n');
      
    } catch (e) {
      console.log('⚠️  Timeout esperando resultados, continuando...\n');
    }
    
    // Esperar un poco más para asegurar que AJAX termine
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Tomar screenshot de resultados
    await page.screenshot({ path: 'scripts/sacs-screenshot-3-resultados.png', fullPage: true });
    console.log('📸 Screenshot de resultados guardado\n');
    
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('🔍 EXTRAYENDO DATOS...\n');
    
    // Extraer el HTML completo
    const html = await page.content();
    fs.writeFileSync('scripts/sacs-puppeteer-response.html', html);
    console.log('💾 HTML completo guardado\n');
    
    // Extraer datos de la página
    const data = await page.evaluate(() => {
      const result = {
        verified: false,
        cedula: null,
        nombre: null,
        apellido: null,
        especialidad: null,
        mpps: null,
        colegio: null,
        estado: null,
        rawData: {}
      };
      
      // Función auxiliar para limpiar texto
      function cleanText(text) {
        return text ? text.replace(/\s+/g, ' ').trim() : '';
      }
      
      // Buscar en divs específicos
      const tableUser = document.getElementById('tableUser');
      const divTabla = document.getElementById('divTabla');
      
      if (tableUser) {
        result.rawData.tableUser = cleanText(tableUser.innerText);
      }
      
      if (divTabla) {
        result.rawData.divTabla = cleanText(divTabla.innerText);
      }
      
      // Buscar en todas las tablas
      const tables = document.querySelectorAll('table');
      tables.forEach((table, index) => {
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('td, th');
          if (cells.length >= 2) {
            const label = cleanText(cells[0].innerText).toLowerCase();
            const value = cleanText(cells[1].innerText);
            
            if (label.includes('nombre') && !label.includes('apellido')) {
              result.nombre = value;
            } else if (label.includes('apellido')) {
              result.apellido = value;
            } else if (label.includes('especialidad') || label.includes('profesión')) {
              result.especialidad = value;
            } else if (label.includes('mpps') || label.includes('registro')) {
              result.mpps = value;
            } else if (label.includes('colegio')) {
              result.colegio = value;
            } else if (label.includes('estado')) {
              result.estado = value;
            } else if (label.includes('cédula') || label.includes('cedula')) {
              result.cedula = value;
            }
          }
        });
      });
      
      // Verificar si encontramos datos
      if (result.nombre || result.apellido || result.especialidad || result.mpps) {
        result.verified = true;
      }
      
      // Buscar mensajes de error
      const bodyText = document.body.innerText.toLowerCase();
      if (bodyText.includes('no se encontr') || bodyText.includes('no existe')) {
        result.error = 'No se encontró registro en SACS';
      }
      
      return result;
    });
    
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('📊 RESULTADOS EXTRAÍDOS:\n');
    console.log('───────────────────────────────────────────────────────────\n');
    console.log(`✓ Verificado: ${data.verified ? 'SÍ ✅' : 'NO ❌'}`);
    console.log(`✓ Cédula: ${data.cedula || TEST_CEDULA}`);
    console.log(`✓ Nombre: ${data.nombre || 'N/A'}`);
    console.log(`✓ Apellido: ${data.apellido || 'N/A'}`);
    console.log(`✓ Especialidad: ${data.especialidad || 'N/A'}`);
    console.log(`✓ MPPS: ${data.mpps || 'N/A'}`);
    console.log(`✓ Colegio: ${data.colegio || 'N/A'}`);
    console.log(`✓ Estado: ${data.estado || 'N/A'}`);
    
    if (data.error) {
      console.log(`\n❌ Error: ${data.error}`);
    }
    
    console.log('\n───────────────────────────────────────────────────────────\n');
    
    if (data.rawData.tableUser || data.rawData.divTabla) {
      console.log('📋 DATOS CRUDOS ENCONTRADOS:\n');
      if (data.rawData.tableUser) {
        console.log('tableUser:');
        console.log(data.rawData.tableUser.substring(0, 500));
        console.log('...\n');
      }
      if (data.rawData.divTabla) {
        console.log('divTabla:');
        console.log(data.rawData.divTabla.substring(0, 500));
        console.log('...\n');
      }
    }
    
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('📁 ARCHIVOS GENERADOS:\n');
    console.log('   • scripts/sacs-screenshot-1-inicial.png');
    console.log('   • scripts/sacs-screenshot-2-formulario.png');
    console.log('   • scripts/sacs-screenshot-3-resultados.png');
    console.log('   • scripts/sacs-puppeteer-response.html\n');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Guardar resultado en JSON
    fs.writeFileSync('scripts/sacs-result.json', JSON.stringify(data, null, 2));
    console.log('💾 Resultado guardado en: scripts/sacs-result.json\n');
    
    console.log('✅ Test completado exitosamente!\n');
    
    return data;
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nStack:', error.stack);
    
    // Intentar tomar screenshot del error
    if (browser) {
      try {
        const pages = await browser.pages();
        if (pages[0]) {
          await pages[0].screenshot({ path: 'scripts/sacs-screenshot-error.png' });
          console.log('\n📸 Screenshot del error guardado\n');
        }
      } catch (e) {
        // Ignorar errores al tomar screenshot
      }
    }
    
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Navegador cerrado\n');
    }
  }
}

// Ejecutar
testSACS();
