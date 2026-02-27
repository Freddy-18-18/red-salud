#!/usr/bin/env node

/**
 * Scraper SACS simplificado usando fetch y análisis manual
 * Alternativa al scraper basado en Puppeteer
 */

import https from 'https';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

interface ProfessionalData {
  cedula: string;
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

class SACSSimpleScraper {
  private agent: https.Agent;

  constructor() {
    // Crear agente HTTPS que ignore certificados inválidos
    this.agent = new https.Agent({
      rejectUnauthorized: false, // IGNORAR CERTIFICADOS INVÁLIDOS
      keepAlive: true
    });
  }

  private async makeRequest(url: string, data?: URLSearchParams): Promise<string> {
    return new Promise((resolve, reject) => {
      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      };

      if (data) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        headers['Content-Length'] = Buffer.byteLength(data.toString()).toString();
      }

      const options: https.RequestOptions = {
        method: data ? 'POST' : 'GET',
        agent: this.agent,
        headers
      };

      const req = https.request(url, options, (res) => {
        let body = '';

        // Manejar redirecciones
        if (res.statusCode === 302 || res.statusCode === 301) {
          const redirectUrl = res.headers.location;
          if (redirectUrl) {
            console.log(`🔄 Redirigiendo a: ${redirectUrl}`);
            return this.makeRequest(redirectUrl.startsWith('http') ? redirectUrl : `https://sistemas.sacs.gob.ve${redirectUrl}`)
              .then(resolve)
              .catch(reject);
          }
        }

        res.on('data', (chunk) => {
          body += chunk;
        });

        res.on('end', () => {
          resolve(body);
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(data.toString());
      }

      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Timeout en la petición'));
      });

      req.end();
    });
  }

  async searchProfessional(cedula: string): Promise<ProfessionalData> {
    try {
      console.log(`🔍 Consultando cédula: ${cedula}`);

      // Paso 1: Obtener la página inicial
      console.log('📄 Obteniendo página inicial...');
      const initialPage = await this.makeRequest('https://sistemas.sacs.gob.ve/consultas/prfsnal_salud');

      // Verificar que obtuvimos la página correcta
      if (!initialPage.includes('INFORMACIÓN DEL PROFESIONAL CONSULTADO')) {
        throw new Error('No se pudo acceder a la página correcta');
      }

      console.log('✅ Página inicial obtenida');

      // Paso 2: Preparar datos del formulario
      const formData = new URLSearchParams();
      formData.append('tipo', '1'); // 1 = Cédula
      formData.append('datajs', 'V'); // V = Venezolano
      formData.append('cedula_matricula', cedula);

      console.log('📤 Enviando formulario...');

      // Paso 3: Enviar formulario y obtener respuesta
      const response = await this.makeRequest(
        'https://sistemas.sacs.gob.ve/consultas/prfsnal_salud',
        formData
      );

      console.log('📥 Respuesta recibida, analizando...');

      // Paso 4: Analizar respuesta HTML
      const dom = new JSDOM(response);
      const document = dom.window.document;

      const result: ProfessionalData = {
        cedula,
        profesiones: [],
        encontrado: false,
        mensaje: ''
      };

      // Verificar si hay mensaje de "no hay solicitudes"
      const noDataMessage = document.querySelector('td');
      if (noDataMessage && noDataMessage.textContent?.includes('No hay solicitudes disponibles')) {
        result.encontrado = false;
        result.mensaje = 'Cédula encontrada pero sin registros profesionales activos';
        console.log('📊 Resultado: Cédula sin registros activos');
        return result;
      }

      // Buscar filas de la tabla de profesiones
      const tableRows = document.querySelectorAll('table tbody tr');

      if (tableRows.length > 0) {
        tableRows.forEach((row: Element) => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 5) {
            const profesion = cells[0]?.textContent?.trim();
            const matricula = cells[1]?.textContent?.trim();
            const fechaRegistro = cells[2]?.textContent?.trim();
            const tomo = cells[3]?.textContent?.trim();
            const folio = cells[4]?.textContent?.trim();

            if (profesion && matricula) {
              result.profesiones.push({
                profesion: profesion || '',
                matricula: matricula || '',
                fechaRegistro: fechaRegistro || '',
                tomo: tomo || '',
                folio: folio || ''
              });
            }
          }
        });
      }

      if (result.profesiones.length > 0) {
        result.encontrado = true;
        result.mensaje = `Encontradas ${result.profesiones.length} profesiones`;
        console.log(`📊 Resultado: ${result.mensaje}`);
      } else {
        result.encontrado = false;
        result.mensaje = 'Cédula encontrada pero sin registros profesionales activos';
        console.log('📊 Resultado: Cédula sin registros activos');
      }

      return result;

    } catch (error) {
      console.error('❌ Error consultando profesional:', error);
      return {
        cedula,
        profesiones: [],
        encontrado: false,
        mensaje: `Error en la consulta: ${(error as Error).message}`
      };
    }
  }

  async scrapeMultipleCedulas(cedulas: string[]): Promise<ProfessionalData[]> {
    const results: ProfessionalData[] = [];

    for (const cedula of cedulas) {
      try {
        const result = await this.searchProfessional(cedula);
        results.push(result);

        // Pequeña pausa entre consultas para no sobrecargar el servidor
        await new Promise(resolve => setTimeout(resolve, 2000));
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

// Función principal
async function main() {
  const cedulas = process.argv.slice(2);

  if (cedulas.length === 0) {
    console.log('Uso: npm run scrape-sacs-simple [cedula1] [cedula2] ...');
    console.log('Ejemplo: npm run scrape-sacs-simple 7983901 12345678');
    process.exit(1);
  }

  console.log('🚀 Iniciando scraper SACS simplificado...');
  console.log(`📋 Cédulas a procesar: ${cedulas.join(', ')}\n`);

  const scraper = new SACSSimpleScraper();
  const results = await scraper.scrapeMultipleCedulas(cedulas);

  // Mostrar resultados
  console.log('\n📊 RESULTADOS:');
  console.log('='.repeat(50));

  results.forEach((result, index) => {
    console.log(`\n${index + 1}. CÉDULA: ${result.cedula}`);
    console.log(`   Estado: ${result.encontrado ? '✅ ENCONTRADO' : '❌ NO ENCONTRADO'}`);
    console.log(`   Mensaje: ${result.mensaje}`);

    if (result.profesiones.length > 0) {
      console.log('   👨‍⚕️ PROFESIONES:');
      result.profesiones.forEach((prof, i) => {
        console.log(`      ${i + 1}. ${prof.profesion}`);
        console.log(`         📄 Matrícula: ${prof.matricula}`);
        console.log(`         📅 Registro: ${prof.fechaRegistro}`);
        console.log(`         📚 Tomo: ${prof.tomo}, Folio: ${prof.folio}`);
      });
    }
    console.log('-'.repeat(30));
  });

  // Guardar resultados
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = path.join(process.cwd(), `resultados-sacs-simple-${timestamp}.json`);

  fs.writeFileSync(outputPath, JSON.stringify({
    fecha: new Date().toISOString(),
    cedulas_procesadas: cedulas,
    resultados: results
  }, null, 2), 'utf8');

  console.log(`\n💾 Resultados guardados en: ${outputPath}`);
  console.log('✅ Proceso completado exitosamente!');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}