/**
 * 🏥 SERVICIO BACKEND: Verificación SACS con Puppeteer
 * 
 * Este servicio hace scraping del sistema SACS de Venezuela
 * para verificar las credenciales de médicos.
 * 
 * Puerto: 3001 (configurable via PORT env var)
 * 
 * Endpoints:
 * - GET  /health - Health check
 * - POST /verify - Verificar cédula de médico
 */

const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de Puppeteer
const PUPPETEER_CONFIG = {
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--ignore-certificate-errors',
    '--disable-dev-shm-usage',
  ],
  ignoreHTTPSErrors: true,
  acceptInsecureCerts: true,
};

// Profesiones médicas válidas (salud humana)
const PROFESIONES_MEDICAS_VALIDAS = [
  'MÉDICO', 'CIRUJANO', 'ODONTÓLOGO', 'BIOANALISTA',
  'ENFERMERO', 'FARMACÉUTICO', 'FISIOTERAPEUTA', 
  'NUTRICIONISTA', 'PSICÓLOGO'
];

/**
 * Valida si una profesión es de salud humana
 */
function esMedicoHumano(profesion) {
  const prof = profesion.toUpperCase();
  if (prof.includes('VETERINARIO')) return false;
  return PROFESIONES_MEDICAS_VALIDAS.some(p => prof.includes(p));
}

/**
 * Determina la especialidad a mostrar
 */
function determinarEspecialidad(profesiones, postgrados) {
  // Si tiene postgrados, usar el más reciente
  if (postgrados && postgrados.length > 0) {
    return postgrados[0].postgrado;
  }
  
  // Si no tiene postgrados, usar la profesión principal
  if (profesiones && profesiones.length > 0) {
    const profesion = profesiones[0].profesion;
    
    // Mapear profesiones a especialidades amigables
    if (profesion.includes('CIRUJANO')) return 'MEDICINA GENERAL';
    if (profesion.includes('ODONTÓLOGO')) return 'ODONTOLOGÍA';
    if (profesion.includes('BIOANALISTA')) return 'BIOANÁLISIS';
    if (profesion.includes('ENFERMERO')) return 'ENFERMERÍA';
    if (profesion.includes('FARMACÉUTICO')) return 'FARMACIA';
    
    return profesion;
  }
  
  return 'NO ESPECIFICADA';
}

/**
 * Función principal de scraping del SACS
 */
async function scrapeSACS(cedula, tipoDocumento = 'V') {
  let browser;
  
  try {
    console.log(`[SACS] Iniciando verificación: ${tipoDocumento}-${cedula}`);
    
    browser = await puppeteer.launch(PUPPETEER_CONFIG);
    const page = await browser.newPage();
    
    // Configurar timeout y user agent
    page.setDefaultTimeout(30000);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    // Navegar al SACS
    console.log('[SACS] Navegando a la página...');
    await page.goto('https://sistemas.sacs.gob.ve/consultas/prfsnal_salud', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    // Esperar que cargue el formulario
    await page.waitForSelector('#tipo', { timeout: 10000 });
    
    console.log('[SACS] Llenando formulario...');
    
    // Seleccionar tipo de búsqueda (Cédula)
    await page.select('#tipo', '1');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Seleccionar nacionalidad
    await page.waitForSelector('#datajs', { timeout: 5000 });
    await page.select('#datajs', tipoDocumento);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Ingresar cédula
    await page.click('#cedula_matricula');
    await page.evaluate(() => {
      document.getElementById('cedula_matricula').value = '';
    });
    await page.type('#cedula_matricula', cedula, { delay: 100 });
    
    console.log('[SACS] Consultando...');
    
    // Click en consultar
    await page.click('a.btn.btn-lg.btn-primary');
    
    // Esperar resultados
    try {
      await page.waitForSelector('#tableUser table', { timeout: 20000 });
      console.log('[SACS] Tabla de datos básicos cargada');
      
      // Esperar adicional para tabla de profesiones (servidor lento)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      try {
        await page.waitForSelector('#profesional tbody tr', { timeout: 5000 });
        console.log('[SACS] Tabla de profesiones cargada');
      } catch (err) {
        console.log('[SACS] Tabla de profesiones no encontrada');
      }
    } catch (err) {
      console.log('[SACS] No se encontraron resultados');
      await browser.close();
      
      return {
        success: false,
        verified: false,
        error: 'No se encontraron datos en el SACS',
        message: 'Esta cédula no está registrada en el SACS como profesional de la salud'
      };
    }
    
    console.log('[SACS] Extrayendo datos...');
    
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

      // Profesiones
      const tableProfesional = document.querySelector('#profesional tbody');
      if (tableProfesional) {
        const rows = tableProfesional.querySelectorAll('tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 5 && cells[0].innerText.trim() !== '') {
            const profesion = cells[0].innerText.trim();
            const matricula = cells[1].innerText.trim();
            
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
    
    // Extraer postgrados si existen
    let postgrados = [];
    if (datosExtraidos.profesiones.length > 0 && datosExtraidos.profesiones[0].tiene_postgrado_btn) {
      try {
        console.log('[SACS] Extrayendo postgrados...');
        
        await page.click('#profesional tbody tr:first-child button');
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
        
        console.log(`[SACS] ${postgrados.length} postgrado(s) encontrado(s)`);
      } catch (err) {
        console.log('[SACS] No se pudieron extraer postgrados:', err.message);
      }
    }
    
    await browser.close();
    
    // Construir resultado
    const nombreCompleto = datosExtraidos.datosBasicos['NOMBRE Y APELLIDO'] || null;
    
    // CASO 1: No se encontró nombre o profesiones
    if (!nombreCompleto || datosExtraidos.profesiones.length === 0) {
      return {
        success: false,
        verified: false,
        message: 'Esta cédula no está registrada en el SACS como profesional de la salud',
        razon_rechazo: 'NO_REGISTRADO_SACS'
      };
    }
    
    // CASO 2: Validar tipo de profesional
    const profesionPrincipal = datosExtraidos.profesiones[0].profesion;
    const matriculaPrincipal = datosExtraidos.profesiones[0].matricula;
    const profesionUpper = profesionPrincipal.toUpperCase();
    
    let esVeterinario = profesionUpper.includes('VETERINARIO');
    let esMedico = esMedicoHumano(profesionPrincipal);
    let aptoRedSalud = esMedico && !esVeterinario;
    let mensaje = '';
    let razonRechazo = null;
    
    if (esVeterinario) {
      mensaje = 'Esta cédula corresponde a un médico veterinario. Red-Salud es exclusivamente para profesionales de salud humana.';
      razonRechazo = 'MEDICO_VETERINARIO';
    } else if (esMedico) {
      mensaje = 'Verificación exitosa. Profesional de salud humana registrado en el SACS.';
    } else {
      mensaje = `La profesión "${profesionPrincipal}" no está habilitada en Red-Salud. Solo se permiten profesionales de salud humana.`;
      razonRechazo = 'PROFESION_NO_HABILITADA';
    }
    
    // Determinar especialidad
    const especialidad = determinarEspecialidad(datosExtraidos.profesiones, postgrados);
    
    const resultado = {
      success: true,
      verified: aptoRedSalud,
      data: {
        cedula,
        tipo_documento: tipoDocumento,
        nombre_completo: nombreCompleto,
        profesiones: datosExtraidos.profesiones,
        postgrados,
        profesion_principal: profesionPrincipal,
        matricula_principal: matriculaPrincipal,
        especialidad_display: especialidad,
        es_medico_humano: esMedico,
        es_veterinario: esVeterinario,
        tiene_postgrados: postgrados.length > 0,
        datos_completos_sacs: {
          datosBasicos: datosExtraidos.datosBasicos,
          profesiones: datosExtraidos.profesiones,
          postgrados,
          fecha_consulta: new Date().toISOString()
        }
      },
      message: mensaje,
      razon_rechazo: razonRechazo
    };
    
    console.log(`[SACS] Verificación completada: ${aptoRedSalud ? 'APROBADO' : 'RECHAZADO'}`);
    
    return resultado;
    
  } catch (error) {
    console.error('[SACS] Error:', error.message);
    
    if (browser) {
      await browser.close();
    }
    
    return {
      success: false,
      verified: false,
      error: error.message,
      message: 'Error al consultar el SACS. Por favor intenta nuevamente.'
    };
  }
}

// ============================================
// ENDPOINTS
// ============================================

/**
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'SACS Verification Service',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

/**
 * Verificar médico
 * POST /verify
 * Body: { cedula: string, tipo_documento?: 'V' | 'E' }
 */
app.post('/verify', async (req, res) => {
  try {
    const { cedula, tipo_documento = 'V' } = req.body;
    
    // Validaciones
    if (!cedula) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Cédula requerida'
      });
    }
    
    if (!/^\d{6,10}$/.test(cedula)) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Formato de cédula inválido (solo números, 6-10 dígitos)'
      });
    }
    
    if (!['V', 'E'].includes(tipo_documento)) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Tipo de documento debe ser V o E'
      });
    }
    
    // Realizar scraping
    const resultado = await scrapeSACS(cedula, tipo_documento);
    
    res.json(resultado);
    
  } catch (error) {
    console.error('[API] Error:', error);
    res.status(500).json({
      success: false,
      verified: false,
      error: 'Error interno del servidor'
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║     SACS Verification Service v2.0                         ║
║     Puerto: ${PORT}                                           ║
║     Estado: ACTIVO ✅                                       ║
╚════════════════════════════════════════════════════════════╝
  `);
});
