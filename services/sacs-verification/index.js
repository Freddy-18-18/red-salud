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
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

const MAX_CONCURRENT_SCRAPES = Number.parseInt(process.env.MAX_CONCURRENT_SCRAPES || '1', 10);
const MAX_QUEUE_SIZE = Number.parseInt(process.env.MAX_QUEUE_SIZE || '25', 10);
const HARD_TIMEOUT_MS = Number.parseInt(process.env.HARD_TIMEOUT_MS || '150000', 10); // 2m30s
const CACHE_TTL_MS = Number.parseInt(process.env.SACS_CACHE_TTL_MS || String(6 * 60 * 60 * 1000), 10); // 6h

function nowMs() {
  return Date.now();
}

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de Puppeteer
function getPuppeteerConfig() {
  const config = {
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

  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    config.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  } else {
    const linuxChromePaths = [
      '/usr/bin/google-chrome-stable',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
    ];

    for (const candidatePath of linuxChromePaths) {
      try {
        if (fs.existsSync(candidatePath)) {
          config.executablePath = candidatePath;
          break;
        }
      } catch {
        // noop
      }
    }
  }

  return config;
}

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

function normalizarTexto(valor = '') {
  return String(valor)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ===========================================================
// Concurrency control (simple FIFO queue)
// ===========================================================

let activeScrapes = 0;
/** @type {{ resolve: Function, reject: Function, enqueuedAt: number }[]} */
const waitQueue = [];

function getQueueState() {
  return {
    active: activeScrapes,
    queued: waitQueue.length,
    maxConcurrent: MAX_CONCURRENT_SCRAPES,
    maxQueue: MAX_QUEUE_SIZE,
  };
}

async function acquireSlot() {
  if (activeScrapes < MAX_CONCURRENT_SCRAPES) {
    activeScrapes += 1;
    return;
  }

  if (waitQueue.length >= MAX_QUEUE_SIZE) {
    const err = new Error('QUEUE_FULL');
    err.code = 'QUEUE_FULL';
    throw err;
  }

  await new Promise((resolve, reject) => {
    waitQueue.push({ resolve, reject, enqueuedAt: nowMs() });
  });
  activeScrapes += 1;
}

function releaseSlot() {
  activeScrapes = Math.max(0, activeScrapes - 1);
  const next = waitQueue.shift();
  if (next) {
    next.resolve();
  }
}

// ===========================================================
// Simple in-memory cache (TTL)
// ===========================================================

/** @type {Map<string, { expiresAt: number, value: any }>} */
const verifyCache = new Map();

function cacheKey(cedula, tipoDocumento) {
  return `${tipoDocumento}-${String(cedula)}`;
}

function getCached(cedula, tipoDocumento) {
  const key = cacheKey(cedula, tipoDocumento);
  const entry = verifyCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= nowMs()) {
    verifyCache.delete(key);
    return null;
  }
  return entry.value;
}

function setCached(cedula, tipoDocumento, value) {
  const key = cacheKey(cedula, tipoDocumento);
  verifyCache.set(key, { expiresAt: nowMs() + CACHE_TTL_MS, value });
}

// ===========================================================
// Browser lifecycle (reuse a single browser per container)
// ===========================================================

let sharedBrowser = null;
let sharedBrowserPromise = null;

function isBrowserConnected(browser) {
  if (!browser) return false;
  if (typeof browser.isConnected === 'function') return browser.isConnected();
  if (typeof browser.connected === 'function') return browser.connected();
  if (typeof browser.connected === 'boolean') return browser.connected;
  return true;
}

async function getSharedBrowser() {
  if (isBrowserConnected(sharedBrowser)) {
    return sharedBrowser;
  }

  if (sharedBrowserPromise) {
    return sharedBrowserPromise;
  }

  sharedBrowserPromise = (async () => {
    const maxIntentos = 3;
    let ultimoError;
    for (let intento = 1; intento <= maxIntentos; intento++) {
      try {
        console.log(`[SACS] Lanzando browser compartido (intento ${intento}/${maxIntentos})...`);
        const browser = await puppeteer.launch(getPuppeteerConfig());
        browser.on('disconnected', () => {
          console.log('[SACS] Browser desconectado; se reiniciará en el próximo request');
          sharedBrowser = null;
        });
        sharedBrowser = browser;
        return browser;
      } catch (error) {
        ultimoError = error;
        console.log(`[SACS] Error lanzando browser compartido: ${error.message}`);
        await sleep(1200 * intento);
      }
    }
    throw ultimoError;
  })();

  try {
    return await sharedBrowserPromise;
  } finally {
    sharedBrowserPromise = null;
  }
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
  let page;

  try {
    console.log(`[SACS] Iniciando verificación: ${tipoDocumento}-${cedula}`);

    const browser = await getSharedBrowser();
    page = await browser.newPage();

    // Configurar timeout y user agent - AUMENTAR TIMEOUT por lentitud del SACS
    page.setDefaultTimeout(90000);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const type = request.resourceType();
      if (type === 'image' || type === 'media' || type === 'font') {
        request.abort();
        return;
      }
      request.continue();
    });

    // Navegar al SACS
    console.log('[SACS] Navegando a la página...');
    const navegarConReintento = async () => {
      const maxIntentos = 3;
      let ultimoError;

      for (let intento = 1; intento <= maxIntentos; intento++) {
        try {
          await page.goto('https://sistemas.sacs.gob.ve/consultas/prfsnal_salud', {
            waitUntil: 'domcontentloaded',
            timeout: 50000,
          });

          await page.waitForSelector('#tipo', { timeout: 20000 });
          await page.waitForSelector('#datajs', { timeout: 20000 });
          return;
        } catch (error) {
          ultimoError = error;
          console.log(`[SACS] Error navegando al formulario (intento ${intento}/${maxIntentos}): ${error.message}`);
          if (intento < maxIntentos) {
            await sleep(1500 * intento);
          }
        }
      }

      throw ultimoError;
    };

    await navegarConReintento();

    console.log('[SACS] Llenando formulario...');

    // Seleccionar tipo de búsqueda (Cédula)
    await page.select('#tipo', '1');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Seleccionar nacionalidad
    await page.waitForSelector('#datajs', { timeout: 5000 });
    await page.select('#datajs', tipoDocumento);

    // El xajax del SACS a veces tarda en actualizar el formulario después de cambiar la nacionalidad
    await new Promise(resolve => setTimeout(resolve, 1000));

    const cedulaLimpia = String(cedula).replace(/\D/g, '').replace(/^0+/, '') || String(cedula);
    const cedulasCandidatas = Array.from(new Set([
      cedulaLimpia,
      String(cedula),
      String(cedula).padStart(8, '0'),
      String(cedula).padStart(9, '0'),
      String(cedula).padStart(10, '0'),
    ])).filter((c) => /^\d{6,10}$/.test(c));

    const consultasCandidatas = cedulasCandidatas.map((cedulaBase) => ({
      input: cedulaBase,
      api: `${tipoDocumento}-${cedulaBase.replace(/^0+/, '') || cedulaBase}`,
    }));

    console.log('[SACS] Formatos de cédula a probar:', consultasCandidatas);

    const leerEstadoResultado = async (cedulaConsultada) => {
      return page.evaluate((cedulaEsperada) => {
        const filtrarTexto = (v) => (v || '').replace(/\s+/g, ' ').trim();
        const normalizar = (v) => filtrarTexto(v)
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toUpperCase();
        const compactarCedula = (v) => filtrarTexto(v).replace(/\D/g, '').replace(/^0+/, '');

        const rows = Array.from(document.querySelectorAll('#tableUser table tbody tr'));
        const cedulaEsperadaCompacta = compactarCedula(cedulaEsperada);

        const hayCedula = rows.some((row) => {
          const th = normalizar(row.querySelector('th')?.textContent);
          const td = filtrarTexto(row.querySelector('td b')?.textContent || row.querySelector('td')?.textContent);
          return th.includes('CEDULA') && compactarCedula(td) === cedulaEsperadaCompacta;
        });

        const hayNombre = rows.some((row) => {
          const th = normalizar(row.querySelector('th')?.textContent);
          const td = filtrarTexto(row.querySelector('td b')?.textContent || row.querySelector('td')?.textContent);
          return th.includes('NOMBRE') && td.length > 0;
        });

        const textoPagina = normalizar(document.body?.innerText || '');
        const filaProfesion = filtrarTexto(document.querySelector('#profesional tbody tr td')?.textContent);
        const tablaVaciaSacs =
          rows.length >= 2 &&
          !hayCedula &&
          !hayNombre &&
          normalizar(filaProfesion).includes('NO HAY SOLICITUDES DISPONIBLES EN LA TABLA');

        const sinResultado =
          textoPagina.includes('NO SE ENCONTRARON RESULTADOS') ||
          textoPagina.includes('NO ENCONTRADO') ||
          textoPagina.includes('SIN RESULTADOS') ||
          tablaVaciaSacs;

        if (hayCedula && hayNombre) {
          return { estado: 'COMPLETO' };
        }

        if (sinResultado) {
          return { estado: 'SIN_RESULTADO' };
        }

        return { estado: 'PENDIENTE' };
      }, cedulaConsultada);
    };

    const esperarResultadoRobusto = async (cedulaConsultada, timeoutMs) => {
      const inicio = Date.now();
      while (Date.now() - inicio < timeoutMs) {
        const estado = await leerEstadoResultado(cedulaConsultada);
        if (estado.estado === 'COMPLETO' || estado.estado === 'SIN_RESULTADO') {
          return estado;
        }
        await sleep(1200);
      }
      return { estado: 'TIMEOUT' };
    };

    let resultadoDetectado = false;
    let huboRespuestaSinResultado = false;

    for (const consulta of consultasCandidatas) {
      const cedulaConsulta = consulta.input;
      const cedulaApi = consulta.api;
      console.log(`[SACS] Consultando con cédula: input=${cedulaConsulta}, api=${cedulaApi}`);

      let estadoFinalCedula = 'TIMEOUT';

      for (let intento = 1; intento <= 2; intento++) {
        console.log(`[SACS] Intento ${intento}/2 para cédula ${cedulaConsulta}`);

        await page.click('#cedula_matricula', { clickCount: 3 });
        await page.keyboard.press('Backspace');
        await page.type('#cedula_matricula', cedulaConsulta, { delay: 50 });

        await page.evaluate((cedInput, cedApi) => {
          const input = document.getElementById('cedula_matricula');
          if (input) {
            input.value = cedInput;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }

          if (typeof xajax_getPrfsnalByCed === 'function') {
            xajax_getPrfsnalByCed(cedApi);
            return;
          }

          if (typeof nroRegistro === 'function') {
            nroRegistro(cedInput);
            nroRegistro();
          }

          if (window.js && typeof window.js.nroRegistro === 'function') {
            window.js.nroRegistro(cedInput);
            window.js.nroRegistro();
          }

          const boton = document.querySelector('a.btn.btn-lg.btn-primary');
          if (boton) boton.click();
        }, cedulaConsulta, cedulaApi);

        const estado = await esperarResultadoRobusto(cedulaConsulta, 45000 + (intento * 5000));
        estadoFinalCedula = estado.estado;

        if (estado.estado === 'COMPLETO') {
          console.log(`[SACS] Resultado completo detectado para formato: ${cedulaConsulta}`);
          resultadoDetectado = true;
          await sleep(2200);
          break;
        }

        if (estado.estado === 'SIN_RESULTADO') {
          huboRespuestaSinResultado = true;
          console.log(`[SACS] El SACS respondió sin resultado para formato: ${cedulaConsulta}`);
          break;
        }

        console.log(`[SACS] Timeout parcial para formato ${cedulaConsulta} (intento ${intento})`);
        await sleep(1000);
      }

      if (resultadoDetectado) {
        break;
      }

      if (estadoFinalCedula === 'SIN_RESULTADO') {
        continue;
      }
    }

    if (!resultadoDetectado) {
      await browser.close();

      if (huboRespuestaSinResultado) {
        return {
          success: true,
          verified: false,
          message: 'Esta cédula no está registrada en el SACS como profesional de la salud',
          razon_rechazo: 'NO_REGISTRADO_SACS'
        };
      }

      return {
        success: false,
        verified: false,
        error: 'Timeout esperando resultado del SACS',
        message: 'El SACS no devolvió datos completos para esta consulta. Intenta nuevamente en unos segundos.'
      };
    }

    console.log('[SACS] Extrayendo datos...');

    // DEBUG: Guardar HTML de la página para debugging
    const pageHTML = await page.content();
    console.log('[SACS] HTML length:', pageHTML.length, 'caracteres');
    
    // Buscar indicadores de error o no encontrado
    if (pageHTML.includes('No se encontraron resultados') || 
        pageHTML.includes('no encontrado') ||
        pageHTML.includes('sin resultados')) {
      console.log('[SACS] ⚠️ Página indica que NO se encontraron resultados');
    }

    // Extraer datos básicos y profesiones
    const datosExtraidos = await page.evaluate(() => {
      const datos = {
        datosBasicos: {},
        profesiones: []
      };

      const limpiar = (valor) => (valor || '').replace(/\s+/g, ' ').trim();

      // Datos básicos
      const tableUser = document.querySelector('#tableUser table tbody');
      if (tableUser) {
        tableUser.querySelectorAll('tr').forEach(row => {
          const th = row.querySelector('th');
          const td = row.querySelector('td b') || row.querySelector('td');
          if (th && td) {
            const key = limpiar(th.textContent).replace(/:$/, '');
            const value = limpiar(td.textContent);
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
          if (cells.length >= 5 && limpiar(cells[0].textContent) !== '') {
            const profesion = limpiar(cells[0].textContent);
            const matricula = limpiar(cells[1].textContent);

            if (profesion && matricula) {
              datos.profesiones.push({
                profesion: profesion,
                matricula: matricula,
                fecha_registro: limpiar(cells[2].textContent),
                tomo: limpiar(cells[3].textContent),
                folio: limpiar(cells[4].textContent),
                tiene_postgrado_btn: cells.length > 5 && !!cells[5].querySelector('button')
              });
            }
          }
        });
      }

      // Fallback: tablas similares si #profesional no entregó filas
      if (datos.profesiones.length === 0) {
        const posiblesTablas = Array.from(document.querySelectorAll('#divTabla table tbody, .dataTables_scrollBody table tbody'));
        posiblesTablas.forEach((tbody) => {
          tbody.querySelectorAll('tr').forEach((row) => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 2) {
              const profesion = limpiar(cells[0].textContent);
              const matricula = limpiar(cells[1].textContent);
              if (profesion && matricula && !datos.profesiones.some(p => p.profesion === profesion && p.matricula === matricula)) {
                datos.profesiones.push({
                  profesion,
                  matricula,
                  fecha_registro: limpiar(cells[2]?.textContent),
                  tomo: limpiar(cells[3]?.textContent),
                  folio: limpiar(cells[4]?.textContent),
                  tiene_postgrado_btn: !!cells[5]?.querySelector('button')
                });
              }
            }
          });
        });
      }

      return datos;
    });

    console.log('[SACS] Datos extraídos - keys en datosBasicos:', Object.keys(datosExtraidos.datosBasicos));
    console.log('[SACS] Datos extraídos - profesiones encontradas:', datosExtraidos.profesiones.length);

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

    await page.close();

    // DEBUG: Ver qué datos se extrajeron
    console.log('[SACS] Datos extraídos del SACS:');
    console.log('[SACS] - Datos básicos:', JSON.stringify(datosExtraidos.datosBasicos));
    console.log('[SACS] - Profesiones encontradas:', datosExtraidos.profesiones.length);

    // Construir resultado - detectar nombre de forma tolerante a acentos/espacios/variantes
    let nombreCompleto = null;
    const entradaNombre = Object.entries(datosExtraidos.datosBasicos).find(([key, value]) => {
      const keyNorm = normalizarTexto(key);
      const valueNorm = String(value || '').trim();
      return keyNorm.includes('NOMBRE') && valueNorm.length > 0;
    });
    if (entradaNombre) {
      nombreCompleto = entradaNombre[1];
      console.log(`[SACS] Nombre encontrado con key: "${entradaNombre[0]}"`);
    }

    // CASO 1: No se encontró nombre o profesiones
    if (!nombreCompleto || datosExtraidos.profesiones.length === 0) {
      console.log('[SACS] ERROR: No se encontró nombre o profesiones');
      console.log('[SACS] - nombreCompleto:', nombreCompleto);
      console.log('[SACS] - profesiones.length:', datosExtraidos.profesiones.length);
      console.log('[SACS] - Keys disponibles:', Object.keys(datosExtraidos.datosBasicos));
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
        apto_red_salud: aptoRedSalud,  // ✅ FIX: Agregar campo que faltaba
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

    try {
      if (page) {
        await page.close();
      }
    } catch {
      // noop
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
    timestamp: new Date().toISOString(),
    queue: getQueueState(),
    cache: {
      ttlMs: CACHE_TTL_MS,
      entries: verifyCache.size,
    },
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

    const requestStart = nowMs();

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

    // Cache (fast path)
    const cached = getCached(cedula, tipo_documento);
    if (cached) {
      return res.json({
        ...cached,
        meta: {
          cached: true,
          ms: nowMs() - requestStart,
          queue: getQueueState(),
        },
      });
    }

    // Concurrency guard
    try {
      await acquireSlot();
    } catch (err) {
      if (err && err.code === 'QUEUE_FULL') {
        return res.status(503).json({
          success: false,
          verified: false,
          error: 'Servicio ocupado (cola llena). Intenta nuevamente en unos segundos.',
          queue: getQueueState(),
        });
      }
      throw err;
    }

    try {
      // Timeout duro (evita requests colgadas)
      const resultado = await Promise.race([
        scrapeSACS(cedula, tipo_documento),
        (async () => {
          await sleep(HARD_TIMEOUT_MS);
          return {
            success: false,
            verified: false,
            error: 'HARD_TIMEOUT',
            message: 'Timeout consultando SACS. Intenta nuevamente en unos segundos.',
          };
        })(),
      ]);

      const responsePayload = {
        ...resultado,
        meta: {
          cached: false,
          ms: nowMs() - requestStart,
          queue: getQueueState(),
        },
      };

      // Cache solo respuestas determinísticas (no timeouts/errores transitorios)
      if (resultado && resultado.success === true) {
        setCached(cedula, tipo_documento, responsePayload);
      }

      res.json(responsePayload);
    } finally {
      releaseSlot();
    }

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
