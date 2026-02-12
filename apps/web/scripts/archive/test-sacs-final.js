const puppeteer = require('puppeteer');

(async () => {
  const CIUD = '15229045'; // cédula a buscar
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         TEST FINAL SACS CON PUPPETEER                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`📋 Cédula: V-${CIUD}\n`);
  
  const browser = await puppeteer.launch({ 
    headless: false, // pon true si no quieres ver el navegador
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--ignore-certificate-errors',
    ],
    ignoreHTTPSErrors: true,
  });
  
  const page = await browser.newPage();
  
  console.log('🌐 Navegando al SACS...\n');
  
  await page.goto('https://sistemas.sacs.gob.ve/consultas/prfsnal_salud', {
    waitUntil: 'domcontentloaded'
  });
  
  console.log('✅ Página cargada\n');
  console.log('📝 Llenando formulario...\n');
  
  // Seleccionar tipo de búsqueda = Cédula
  await page.select('#tipo', '1');
  console.log('   ✓ Tipo: Cédula');
  
  // Seleccionar nacionalidad = Venezolano
  await page.waitForSelector('#datajs');
  await page.select('#datajs', 'V');
  console.log('   ✓ Nacionalidad: Venezolano');
  
  // Escribir cédula
  await page.type('#cedula_matricula', CIUD);
  console.log('   ✓ Cédula ingresada');
  
  console.log('\n🔍 Consultando...\n');
  
  // Click en consultar
  await page.click('a.btn.btn-lg.btn-primary');
  
  // Esperar a que aparezca la tabla con datos básicos
  console.log('⏳ Esperando resultados...\n');
  
  await page.waitForSelector('#tableUser table td b', { timeout: 20000 });
  
  console.log('✅ Resultados cargados!\n');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Extraer datos básicos
  const result = await page.evaluate(() => {
    const res = {
      datosBasicos: {},
      profesiones: [],
      postgrados: []
    };
    
    // Datos básicos
    const tableUser = document.querySelector('#tableUser table');
    if (tableUser) {
      tableUser.querySelectorAll('tr').forEach(row => {
        const th = row.querySelector('th');
        const td = row.querySelector('td');
        if (th && td) {
          const key = th.innerText.replace(':', '').trim();
          const value = td.innerText.trim();
          res.datosBasicos[key] = value;
        }
      });
    }
    
    // Datos profesionales
    const tableProf = document.querySelector('#profesional');
    if (tableProf) {
      res.profesiones = [...tableProf.querySelectorAll('tbody tr')].map(row => {
        const cells = [...row.querySelectorAll('td')].map(c => c.innerText.trim());
        return {
          profesion: cells[0] || "",
          matricula: cells[1] || "",
          fecha_registro: cells[2] || "",
          tomo: cells[3] || "",
          folio: cells[4] || "",
          tiene_postgrado: cells[5] ? true : false
        };
      });
    }
    
    return res;
  });
  
  console.log("✅ DATOS BÁSICOS:\n");
  console.log(JSON.stringify(result.datosBasicos, null, 2));
  console.log("\n📚 PROFESIONES:\n");
  console.log(JSON.stringify(result.profesiones, null, 2));
  
  // Verificar si hay postgrados disponibles
  if (result.profesiones.length > 0 && result.profesiones[0].tiene_postgrado) {
    console.log("\n🎓 Buscando postgrados...\n");
    
    // Click en el botón de postgrados de la primera profesión
    await page.click('#profesional tbody tr:first-child button');
    
    // Esperar a que aparezca la tabla de postgrados
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Extraer postgrados
    const postgrados = await page.evaluate(() => {
      const divPostgrados = document.querySelector('#divTablaProfesiones');
      if (!divPostgrados || divPostgrados.style.display === 'none') {
        return [];
      }
      
      const tablePostgrados = divPostgrados.querySelector('table tbody');
      if (!tablePostgrados) return [];
      
      return [...tablePostgrados.querySelectorAll('tr')].map(row => {
        const cells = [...row.querySelectorAll('td')].map(c => c.innerText.trim());
        return {
          postgrado: cells[0] || "",
          matricula: cells[1] || "",
          fecha_registro: cells[2] || "",
          tomo: cells[3] || "",
          folio: cells[4] || ""
        };
      });
    });
    
    result.postgrados = postgrados;
    console.log("✅ POSTGRADOS:\n");
    console.log(JSON.stringify(result.postgrados, null, 2));
  }
  
  console.log('\n═══════════════════════════════════════════════════════════\n');
  console.log("✅ DATOS COMPLETOS:\n");
  console.log(JSON.stringify(result, null, 2));
  console.log('\n═══════════════════════════════════════════════════════════\n');
  
  // Guardar resultado
  const fs = require('fs');
  fs.writeFileSync('scripts/sacs-final-result.json', JSON.stringify(result, null, 2));
  console.log('💾 Resultado guardado en: scripts/sacs-final-result.json\n');
  
  // Screenshot
  await page.screenshot({ path: 'scripts/sacs-final-screenshot.png', fullPage: true });
  console.log('📸 Screenshot guardado: scripts/sacs-final-screenshot.png\n');
  
  console.log('✅ Test completado!\n');
  
  await browser.close();
})();
