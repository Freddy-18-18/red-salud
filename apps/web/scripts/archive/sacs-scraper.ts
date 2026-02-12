import puppeteer, { Browser, Page, HTTPRequest } from 'puppeteer';
import fs from 'fs';
import path from 'path';

interface FormSelect {
  id: string;
  name: string;
  options: Array<{ value: string; text: string }>;
}

interface FormInput {
  id: string;
  name: string;
  type: string;
  value: string;
}

interface FormButton {
  tag: string;
  id: string;
  className: string;
  text: string;
  type: string;
}

interface ProfessionalData {
  cedula: string;
  nombre?: string;
  apellido?: string;
  profesiones: Array<{
    profesion: string;
    matricula: string;
    fechaRegistro: string;
    tomo: string;
    folio: string;
  }>;
  encontrado: boolean;
  mensaje: string;
}

class SACSScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  constructor() {
    this.browser = null;
    this.page = null;
  }

  async initialize(): Promise<void> {
    try {
      console.log('🚀 Inicializando navegador...');
      this.browser = await puppeteer.launch({
        headless: true, // Cambiar a false solo para debugging
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--ignore-certificate-errors',
          '--ignore-ssl-errors',
          '--ignore-certificate-errors-spki-list',
          '--ignore-ssl-errors-ignore-untrusted',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--disable-blink-features=AutomationControlled',
          '--disable-component-extensions-with-background-pages',
          '--disable-default-apps',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-sync',
          '--metrics-recording-only',
          '--no-default-browser-check',
          '--password-store=basic',
          '--use-mock-keychain',
          '--disable-background-networking',
          '--disable-client-side-phishing-detection',
          '--disable-component-update',
          '--disable-domain-reliability',
          '--disable-print-preview',
          '--disable-hang-monitor',
          '--disable-prompt-on-repost',
          '--force-color-profile=srgb',
          '--enable-features=NetworkService,NetworkServiceInProcess',
          '--disable-features=VizDisplayCompositor,VizHitTestSurfaceLayer'
        ],
        timeout: 60000,
        ignoreDefaultArgs: ['--enable-automation'],
        defaultViewport: {
          width: 1366,
          height: 768
        },
        protocolTimeout: 60000,
        slowMo: 100 // Pequeña pausa para estabilidad
      });

      console.log('📄 Creando nueva página...');
      this.page = await this.browser.newPage();

      // Configurar timeouts más largos
      this.page.setDefaultTimeout(60000);
      this.page.setDefaultNavigationTimeout(60000);

      // Configurar página para evitar detección
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await this.page.setExtraHTTPHeaders({
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      });

      // Desactivar imágenes para mejorar rendimiento
      await this.page.setRequestInterception(true);
      this.page.on('request', (req: HTTPRequest) => {
        if (req.resourceType() === 'image' || req.resourceType() === 'media' || req.resourceType() === 'font') {
          req.abort();
        } else {
          req.continue();
        }
      });

      console.log('✅ Navegador inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando navegador:', error);
      console.log('💡 Sugerencias:');
      console.log('   - Cerrar todas las instancias de Chrome/Chromium');
      console.log('   - Verificar que no hay procesos de puppeteer ejecutándose');
      console.log('   - Intentar: pkill -f puppeteer');
      throw error;
    }
  }

  async handleSSLCertificate(): Promise<void> {
    if (!this.page) {
      throw new Error('Página no inicializada');
    }

    try {
      console.log('🔒 Navegando a la página con certificado SSL...');

      // Navegar a la página (esto debería mostrar el error de certificado)
      await this.page.goto('https://sistemas.sacs.gob.ve/consultas/prfsnal_salud', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Tomar captura de pantalla para debugging
      await this.page.screenshot({ path: 'debug-certificado.png', fullPage: true });
      console.log('📸 Captura de pantalla guardada: debug-certificado.png');

      // Verificar si estamos en la página de error de certificado
      const currentUrl = this.page.url();
      console.log(`📍 URL actual: ${currentUrl}`);

      if (currentUrl.includes('chrome-error://') || currentUrl.includes('chrome-error')) {
        console.log('⚠️  Detectada página de error de certificado SSL');

        // Buscar y hacer clic en "Avanzado"
        try {
          await this.page.waitForSelector('button:has-text("Avanzado")', { timeout: 5000 });
          await this.page.click('button:has-text("Avanzado")');
          console.log('✅ Clic en "Avanzado" realizado');
        } catch {
          console.log('Botón "Avanzado" no encontrado, intentando enlace...');
          try {
            await this.page.click('a:has-text("Avanzado")');
            console.log('✅ Clic en enlace "Avanzado" realizado');
          } catch {
            console.log('Enlace "Avanzado" no encontrado, intentando otros selectores...');
            // Intentar otros selectores comunes
            const selectors = [
              '[text*="Avanzado"]',
              'button',
              'a',
              '#advanced-button',
              '.advanced-button'
            ];

            for (const selector of selectors) {
              try {
                await this.page.waitForSelector(selector, { timeout: 2000 });
                await this.page.click(selector);
                console.log(`✅ Clic en "${selector}" realizado`);
                break;
              } catch {
                continue;
              }
            }
          }
        }

        // Esperar a que aparezca el enlace de acceso no seguro
        await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar un poco

        try {
          await this.page.waitForSelector('a:has-text("Acceder a sistemas.sacs.gob.ve (sitio no seguro)")', {
            timeout: 5000
          });
          await this.page.click('a:has-text("Acceder a sistemas.sacs.gob.ve (sitio no seguro)")');
          console.log('✅ Acceso al sitio no seguro concedido');
        } catch {
          console.log('Enlace específico no encontrado, intentando patrones...');
          // Intentar hacer clic en cualquier enlace que contenga "sistemas.sacs.gob.ve"
          const links = await this.page.$$eval('a', (anchors: HTMLAnchorElement[]) =>
            anchors.map((a: HTMLAnchorElement) => ({ href: a.href, text: a.textContent || '' }))
          );

          console.log('🔗 Enlaces encontrados:', links);

          for (const link of links) {
            if (link.href.includes('sistemas.sacs.gob.ve') || link.text.includes('sitio no seguro')) {
              await this.page.click(`a[href="${link.href}"]`);
              console.log(`✅ Clic en enlace: ${link.text}`);
              break;
            }
          }
        }
      }

      // Esperar a que cargue la página principal
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Tomar otra captura después del manejo del certificado
      await this.page.screenshot({ path: 'debug-despues-certificado.png', fullPage: true });
      console.log('📸 Captura después del certificado: debug-despues-certificado.png');

      // Verificar contenido de la página
      const pageTitle = await this.page.title();
      const pageContent = await this.page.evaluate(() => document.body.innerText.substring(0, 500));
      console.log(`📄 Título de página: ${pageTitle}`);
      console.log(`📄 Contenido inicial: ${pageContent}`);

      // Esperar por cualquier elemento que indique que la página cargó
      try {
        await this.page.waitForSelector('form, input, select, h1, h2, .container, #tipo', {
          timeout: 10000
        });
        console.log('✅ Página cargada correctamente');
      } catch {
        console.log('⚠️  No se encontraron elementos esperados, pero continuando...');
      }

    } catch (error) {
      console.error('❌ Error manejando certificado SSL:', error);
      throw error;
    }
  }

  async searchProfessional(cedula: string): Promise<ProfessionalData> {
    if (!this.page) {
      throw new Error('Página no inicializada');
    }

    try {
      console.log(`🔍 Buscando profesional con cédula: ${cedula}`);

      // Tomar captura antes de interactuar
      await this.page.screenshot({ path: `debug-antes-${cedula}.png`, fullPage: true });

      // Inspeccionar elementos del formulario
      const formElements = await this.page.evaluate(() => {
        const selects: FormSelect[] = Array.from(document.querySelectorAll('select')).map(s => ({
          id: s.id,
          name: s.name,
          options: Array.from(s.options).map(o => ({ value: o.value, text: o.text }))
        }));

        const inputs: FormInput[] = Array.from(document.querySelectorAll('input')).map(i => ({
          id: i.id,
          name: i.name,
          type: i.type,
          value: i.value
        }));

        const buttons: FormButton[] = Array.from(document.querySelectorAll('button, a, input[type="submit"]')).map(b => ({
          tag: b.tagName,
          id: b.id,
          className: b.className,
          text: b.textContent?.trim() || '',
          type: (b as HTMLInputElement).type || ''
        }));

        return { selects, inputs, buttons };
      });

      console.log('📋 Elementos del formulario encontrados:');
      console.log('Selects:', JSON.stringify(formElements.selects, null, 2));
      console.log('Inputs:', JSON.stringify(formElements.inputs, null, 2));
      console.log('Buttons:', JSON.stringify(formElements.buttons, null, 2));

      // Seleccionar "N°. CÉDULA" en el primer select
      if (formElements.selects.length > 0) {
        const tipoSelect = formElements.selects.find((s: FormSelect) => s.id === 'tipo' || s.name === 'tipo');
        if (tipoSelect) {
          await this.page.select(tipoSelect.id, '1'); // 1 = Cédula
          console.log('✅ Tipo de búsqueda seleccionado: Cédula');
        }
      }

      // Esperar a que se carguen las opciones de nacionalidad
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Seleccionar "V" para venezolano
      if (formElements.selects.length > 1) {
        const nacionalidadSelect = formElements.selects.find((s: FormSelect) => s.id === 'datajs' || s.name === 'datajs');
        if (nacionalidadSelect) {
          // Intentar seleccionar V, si no funciona, continuar
          try {
            await this.page.select(nacionalidadSelect.id, 'V');
            console.log('✅ Nacionalidad seleccionada: Venezolano');
          } catch {
            console.log('⚠️  No se pudo seleccionar nacionalidad, continuando...');
          }
        }
      }

      // Ingresar la cédula
      if (formElements.inputs.length > 0) {
        const cedulaInput = formElements.inputs.find((i: FormInput) => i.id === 'cedula_matricula' || i.name === 'cedula_matricula');
        if (cedulaInput) {
          await this.page.type(cedulaInput.id, cedula);
          console.log(`✅ Cédula ingresada: ${cedula}`);
        }
      }

      // Hacer clic en "Consultar"
      let clicked = false;
      for (const button of formElements.buttons) {
        if (button.text?.toLowerCase().includes('consultar')) {
          const selector = button.id ? `#${button.id}` :
                          button.className ? `.${button.className.split(' ').join('.')}` :
                          `${button.tag.toLowerCase()}:contains("${button.text}")`;

          try {
            await this.page.click(selector);
            console.log(`✅ Clic en "${button.text}" realizado con selector: ${selector}`);
            clicked = true;
            break;
          } catch {
            console.log(`❌ Error con selector ${selector}, intentando otros...`);
          }
        }
      }

      if (!clicked) {
        // Intentar selectores genéricos
        const genericSelectors = ['button[type="submit"]', 'input[type="submit"]', 'a[href*="consultar"]', '.btn', 'button'];
        for (const selector of genericSelectors) {
          try {
            await this.page.click(selector);
            console.log(`✅ Clic realizado con selector genérico: ${selector}`);
            clicked = true;
            break;
          } catch {
            continue;
          }
        }
      }

      if (!clicked) {
        throw new Error('No se pudo encontrar el botón de consultar');
      }

      // Esperar a que se complete la búsqueda
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Tomar captura después de la búsqueda
      await this.page.screenshot({ path: `debug-despues-${cedula}.png`, fullPage: true });

      // Extraer los datos
      const result = await this.page.evaluate(() => {
        const data: ProfessionalData = {
          cedula: '',
          profesiones: [],
          encontrado: false,
          mensaje: ''
        };

        // Verificar si hay mensaje de "no hay solicitudes"
        const noDataMessage = document.querySelector('td');
        if (noDataMessage && noDataMessage.textContent?.includes('No hay solicitudes disponibles')) {
          data.encontrado = false;
          data.mensaje = 'Cédula encontrada pero sin registros profesionales activos';
          return data;
        }

        // Extraer cédula (si está disponible)
        const cedulaInput = document.querySelector('#cedula_matricula') as HTMLInputElement;
        if (cedulaInput) {
          data.cedula = cedulaInput.value.replace(/[^\d]/g, '');
        }

        // Extraer filas de la tabla de profesiones
        const tableRows = document.querySelectorAll('table tbody tr');
        tableRows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 5) {
            data.profesiones.push({
              profesion: cells[0]?.textContent?.trim() || '',
              matricula: cells[1]?.textContent?.trim() || '',
              fechaRegistro: cells[2]?.textContent?.trim() || '',
              tomo: cells[3]?.textContent?.trim() || '',
              folio: cells[4]?.textContent?.trim() || ''
            });
          }
        });

        if (data.profesiones.length > 0) {
          data.encontrado = true;
          data.mensaje = `Encontradas ${data.profesiones.length} profesiones`;
        } else {
          data.encontrado = false;
          data.mensaje = 'Cédula encontrada pero sin registros profesionales activos';
        }

        return data;
      });

      console.log(`📊 Resultado: ${result.mensaje}`);
      return result;

    } catch (error) {
      console.error('❌ Error buscando profesional:', error);
      return {
        cedula,
        profesiones: [],
        encontrado: false,
        mensaje: `Error en la búsqueda: ${(error as Error).message}`
      };
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 Navegador cerrado');
    }
  }

  async scrapeMultipleCedulas(cedulas: string[]): Promise<ProfessionalData[]> {
    const results: ProfessionalData[] = [];

    for (const cedula of cedulas) {
      try {
        const result = await this.searchProfessional(cedula);
        results.push(result);

        // Pequeña pausa entre consultas para no sobrecargar el servidor
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Error procesando cédula ${cedula}:`, error);
        results.push({
          cedula,
          profesiones: [],
          encontrado: false,
          mensaje: `Error procesando: ${(error as Error).message}`
        });
      }
    }

    return results;
  }
}

// Función principal para usar el scraper
async function main() {
  const scraper = new SACSScraper();

  try {
    // Inicializar
    await scraper.initialize();

    // Manejar certificado SSL
    await scraper.handleSSLCertificate();

    // Ejemplo de uso con una cédula
    const cedula = '7983901';
    console.log(`\n=== BUSCANDO CÉDULA: ${cedula} ===`);
    const result = await scraper.searchProfessional(cedula);

    console.log('\n📋 RESULTADO:');
    console.log(JSON.stringify(result, null, 2));

    // Ejemplo con múltiples cédulas
    const cedulas = ['7983901', '12345678', '87654321'];
    console.log(`\n=== BUSCANDO MÚLTIPLES CÉDULAS ===`);
    const results = await scraper.scrapeMultipleCedulas(cedulas);

    console.log('\n📋 RESULTADOS MÚLTIPLES:');
    console.log(JSON.stringify(results, null, 2));

    // Guardar resultados en archivo
    const outputPath = path.join(process.cwd(), 'resultados-sacs.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
    console.log(`\n💾 Resultados guardados en: ${outputPath}`);

  } catch (error) {
    console.error('❌ Error en el proceso principal:', error);
  } finally {
    await scraper.close();
  }
}

// Exportar la clase para uso en otros módulos
export { SACSScraper };
export type { ProfessionalData };

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}