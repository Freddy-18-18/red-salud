/**
 * 🏥 VERIFICADOR SACS - UNA CÉDULA POR EJECUCIÓN
 * 
 * INSTRUCCIONES:
 * 1. Cambia la CEDULA_A_VERIFICAR abajo
 * 2. Ejecuta: node scripts/verificar-cedula-sacs.js
 * 3. Espera el resultado
 * 4. Repite para cada cédula
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

// ============================================
// 🔧 CONFIGURACIÓN - CAMBIA AQUÍ LA CÉDULA
// ============================================
const CEDULA_A_VERIFICAR = '17497542'; // ⬅️ CAMBIA ESTE NÚMERO

// ============================================
// NO MODIFICAR ABAJO DE ESTA LÍNEA
// ============================================

const PROFESIONES_MEDICAS_VALIDAS = [
  'MÉDICO', 'CIRUJANO', 'ODONTÓLOGO', 'BIOANALISTA',
  'ENFERMERO', 'FARMACÉUTICO', 'FISIOTERAPEUTA', 
  'NUTRICIONISTA', 'PSICÓLOGO'
];

function esMedicoHumano(profesion) {
  const prof = profesion.toUpperCase();
  if (prof.includes('VETERINARIO')) return false;
  return PROFESIONES_MEDICAS_VALIDAS.some(p => prof.includes(p));
}

async function verificarCedula(cedula) {
  let browser;
  
  try {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log(`║     VERIFICACIÓN SACS - V-${cedula}                    ║`);
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('🚀 Iniciando navegador...');
    
    browser = await puppeteer.launch({
      headless: false, // Cambiar a true para modo headless
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--ignore-certificate-errors',
        '--disable-dev-shm-usage'
      ],
      ignoreHTTPSErrors: true,
      acceptInsecureCerts: true
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    console.log('🌐 Navegando al SACS...');
    
    await page.goto('https://sistemas.sacs.gob.ve/consultas/prfsnal_salud', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    console.log('✅ Página cargada');

    // Esperar que cargue el formulario
    await page.waitForSelector('#tipo', { timeout: 10000 });
    
    console.log('📝 Llenando formulario...');

    // Paso 1: Seleccionar "N°. CÉDULA"
    await page.select('#tipo', '1');
    console.log('   ✓ Tipo: N°. CÉDULA');
    
    // Esperar a que aparezca el select de nacionalidad
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.waitForSelector('#datajs', { timeout: 5000 });

    // Paso 2: Seleccionar "V" (Venezolano)
    await page.select('#datajs', 'V');
    console.log('   ✓ Nacionalidad: V (Venezolano)');
    
    await new Promise(resolve => setTimeout(resolve, 500));

    // Paso 3: Escribir la cédula (simulando escritura humana)
    await page.waitForSelector('#cedula_matricula', { timeout: 5000 });
    await page.click('#cedula_matricula'); // Hacer clic en el campo
    
    // Limpiar el campo primero
    await page.evaluate(() => {
      document.getElementById('cedula_matricula').value = '';
    });
    
    // Escribir la cédula carácter por carácter (simula escritura humana)
    await page.type('#cedula_matricula', cedula, { delay: 100 });
    console.log(`   ✓ Cédula ingresada: ${cedula}`);

    console.log('\n🔍 Haciendo clic en Consultar...');

    // Paso 4: Hacer clic en el botón "Consultar"
    await page.click('a.btn.btn-lg.btn-primary');
    console.log('   ✓ Clic realizado');

    // Esperar a que carguen los resultados
    console.log('\n⏳ Esperando resultados del SACS...');
    
    try {
      await page.waitForSelector('#tableUser table', { timeout: 20000 });
      console.log('✅ Tabla de datos básicos cargada');
      
      // Esperar adicional para que cargue la tabla de profesiones (el servidor es lento)
      console.log('⏳ Esperando tabla de profesiones...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Intentar esperar la tabla de profesiones
      try {
        await page.waitForSelector('#profesional tbody tr', { timeout: 5000 });
        console.log('✅ Tabla de profesiones cargada\n');
      } catch (err) {
        console.log('⚠️  Tabla de profesiones no encontrada (puede que no sea profesional de salud)\n');
      }
      
    } catch (err) {
      console.log('❌ No se encontraron resultados o timeout\n');
      
      await page.screenshot({ 
        path: `scripts/sacs-error-${cedula}.png`,
        fullPage: true 
      });
      
      await browser.close();
      
      return {
        cedula,
        encontrado: false,
        error: 'No se encontraron datos en el SACS o timeout',
        timestamp: new Date().toISOString()
      };
    }

    console.log('📊 Extrayendo datos...\n');

    // Extraer datos básicos y profesiones
    const datosExtraidos = await page.evaluate(() => {
      const datos = {
        datosBasicos: {},
        profesiones: []
      };

      // Datos básicos
      const tableUser = document.querySelector('#tableUser table tbody');
      if (tableUser) {
        tableUser.querySelectorAll('tr').forEach(row => {
          const th = row.querySelector('th');
          const td = row.querySelector('td b');
          if (th && td) {
            const key = th.innerText.replace(':', '').trim();
            const value = td.innerText.trim();
            datos.datosBasicos[key] = value;
          }
        });
      }

      // Profesiones - Buscar en la tabla con DataTables
      const tableProfesional = document.querySelector('#profesional tbody');
      if (tableProfesional) {
        const rows = tableProfesional.querySelectorAll('tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          // Verificar que tenga al menos 5 celdas y que no sea una fila vacía
          if (cells.length >= 5 && cells[0].innerText.trim() !== '') {
            const profesion = cells[0].innerText.trim();
            const matricula = cells[1].innerText.trim();
            
            // Solo agregar si tiene datos válidos
            if (profesion && matricula) {
              datos.profesiones.push({
                profesion: profesion,
                matricula: matricula,
                fecha_registro: cells[2].innerText.trim(),
                tomo: cells[3].innerText.trim(),
                folio: cells[4].innerText.trim(),
                tiene_postgrado_btn: cells.length > 5 && !!cells[5].querySelector('button')
              });
            }
          }
        });
      }

      return datos;
    });

    // Verificar si hay postgrados y extraerlos
    let postgrados = [];
    if (datosExtraidos.profesiones.length > 0 && datosExtraidos.profesiones[0].tiene_postgrado_btn) {
      try {
        console.log('🎓 Detectado botón de postgrados, haciendo clic...');
        
        await page.click('#profesional tbody tr:first-child button');
        // Esperar más tiempo para que carguen los postgrados (servidor lento)
        await new Promise(resolve => setTimeout(resolve, 4000));

        postgrados = await page.evaluate(() => {
          const divPostgrados = document.querySelector('#divTablaProfesiones');
          if (!divPostgrados || divPostgrados.style.display === 'none') {
            return [];
          }

          const tablePostgrados = divPostgrados.querySelector('#grd_prof tbody');
          if (!tablePostgrados) return [];

          return [...tablePostgrados.querySelectorAll('tr')].map(row => {
            const cells = [...row.querySelectorAll('td')].map(c => c.innerText.trim());
            return {
              postgrado: cells[0] || '',
              fecha_registro: cells[1] || '',
              tomo: cells[2] || '',
              folio: cells[3] || ''
            };
          });
        });

        console.log(`   ✓ ${postgrados.length} postgrado(s) encontrado(s)\n`);
      } catch (err) {
        console.log('   ⚠️  No se pudieron extraer postgrados\n');
      }
    }

    // Esperar un poco más antes de tomar screenshot y cerrar (asegurar que todo cargó)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Tomar screenshot
    const screenshotPath = `scripts/sacs-resultado-${cedula}.png`;
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    console.log(`📸 Screenshot guardado: ${screenshotPath}\n`);

    // Esperar un poco antes de cerrar el navegador
    await new Promise(resolve => setTimeout(resolve, 500));
    await browser.close();

    // Construir resultado
    const resultado = {
      cedula: datosExtraidos.datosBasicos['NÚMERO DE CÉDULA'] || cedula,
      nombre_completo: datosExtraidos.datosBasicos['NOMBRE Y APELLIDO'] || null,
      profesiones: datosExtraidos.profesiones,
      postgrados: postgrados,
      encontrado: false,
      es_medico_humano: false,
      es_veterinario: false,
      apto_red_salud: false,
      mensaje: '',
      razon_rechazo: null,
      timestamp: new Date().toISOString()
    };

    // CASO 1: No se encontró nombre (cédula no existe o no es profesional de salud)
    if (!resultado.nombre_completo || resultado.profesiones.length === 0) {
      resultado.encontrado = false;
      resultado.apto_red_salud = false;
      resultado.mensaje = 'Esta cédula no está registrada en el SACS como profesional de la salud';
      resultado.razon_rechazo = 'NO_REGISTRADO_SACS';
      
      await browser.close();
      
      console.log('═'.repeat(60));
      console.log('RESULTADO FINAL');
      console.log('═'.repeat(60));
      console.log(`\n📋 Cédula: V-${cedula}`);
      console.log(`❌ NO ENCONTRADO EN SACS\n`);
      console.log(`🔍 VALIDACIÓN:`);
      console.log(`   ❌ NO APTO - ${resultado.mensaje}`);
      console.log('\n' + '═'.repeat(60));
      
      const outputPath = `resultado-sacs-${cedula}.json`;
      fs.writeFileSync(outputPath, JSON.stringify(resultado, null, 2));
      console.log(`\n💾 Resultado guardado: ${outputPath}`);
      console.log('\n✅ VERIFICACIÓN COMPLETADA!\n');
      
      return resultado;
    }

    // CASO 2: Cédula encontrada, validar tipo de profesional
    resultado.encontrado = true;
    const profesionPrincipal = resultado.profesiones[0].profesion.toUpperCase();
    
    // CASO 2A: Es veterinario
    if (profesionPrincipal.includes('VETERINARIO')) {
      resultado.es_veterinario = true;
      resultado.es_medico_humano = false;
      resultado.apto_red_salud = false;
      resultado.mensaje = 'Esta cédula corresponde a un médico veterinario. Red-Salud es exclusivamente para profesionales de salud humana.';
      resultado.razon_rechazo = 'MEDICO_VETERINARIO';
    }
    // CASO 2B: Es médico de salud humana
    else if (esMedicoHumano(profesionPrincipal)) {
      resultado.es_medico_humano = true;
      resultado.es_veterinario = false;
      resultado.apto_red_salud = true;
      resultado.mensaje = 'Verificación exitosa. Profesional de salud humana registrado en el SACS.';
      resultado.razon_rechazo = null;
    }
    // CASO 2C: Otra profesión no habilitada
    else {
      resultado.es_medico_humano = false;
      resultado.es_veterinario = false;
      resultado.apto_red_salud = false;
      resultado.mensaje = `La profesión "${resultado.profesiones[0].profesion}" no está habilitada en Red-Salud. Solo se permiten profesionales de salud humana.`;
      resultado.razon_rechazo = 'PROFESION_NO_HABILITADA';
    }

    // Mostrar resultado en consola
    console.log('═'.repeat(60));
    console.log('RESULTADO FINAL');
    console.log('═'.repeat(60));
    console.log(`\n📋 Cédula: V-${resultado.cedula}`);
    console.log(`👤 Nombre: ${resultado.nombre_completo}`);
    console.log(`\n👨‍⚕️ PROFESIONES (${resultado.profesiones.length}):`);
    
    resultado.profesiones.forEach((prof, i) => {
      console.log(`\n   ${i + 1}. ${prof.profesion}`);
      console.log(`      Matrícula: ${prof.matricula}`);
      console.log(`      Fecha: ${prof.fecha_registro}`);
      console.log(`      Tomo: ${prof.tomo}, Folio: ${prof.folio}`);
    });

    if (resultado.postgrados.length > 0) {
      console.log(`\n🎓 POSTGRADOS (${resultado.postgrados.length}):`);
      resultado.postgrados.forEach((post, i) => {
        console.log(`\n   ${i + 1}. ${post.postgrado}`);
        console.log(`      Fecha: ${post.fecha_registro}`);
        console.log(`      Tomo: ${post.tomo}, Folio: ${post.folio}`);
      });
    } else if (resultado.apto_red_salud) {
      console.log(`\n🎓 POSTGRADOS: Ninguno registrado (Medicina General)`);
    }

    console.log(`\n🔍 VALIDACIÓN PARA RED-SALUD:`);
    if (resultado.apto_red_salud) {
      console.log(`   ✅ APTO - ${resultado.mensaje}`);
    } else if (resultado.es_veterinario) {
      console.log(`   ❌ NO APTO - ${resultado.mensaje}`);
    } else {
      console.log(`   ❌ NO APTO - ${resultado.mensaje}`);
    }

    console.log(`\n📝 Razón: ${resultado.razon_rechazo || 'APROBADO'}`);
    console.log('\n' + '═'.repeat(60));

    // Guardar resultado en JSON
    const outputPath = `resultado-sacs-${cedula}.json`;
    fs.writeFileSync(outputPath, JSON.stringify(resultado, null, 2));
    console.log(`\n💾 Resultado guardado: ${outputPath}`);

    console.log('\n✅ VERIFICACIÓN COMPLETADA!\n');

    return resultado;

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);

    if (browser) {
      await browser.close();
    }

    return {
      cedula,
      encontrado: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Ejecutar
console.log('\n🏥 INICIANDO VERIFICACIÓN SACS\n');
console.log(`📋 Cédula a verificar: V-${CEDULA_A_VERIFICAR}\n`);

verificarCedula(CEDULA_A_VERIFICAR)
  .then(resultado => {
    console.log('\n🎯 Proceso finalizado');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
