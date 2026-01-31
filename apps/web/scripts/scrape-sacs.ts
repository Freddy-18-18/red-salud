#!/usr/bin/env node

/**
 * Script de ejemplo para usar el scraper SACS
 * Uso: npm run scrape-sacs [cedula1] [cedula2] ...
 */

import { SACSScraper } from './sacs-scraper';
import fs from 'fs';
import path from 'path';

async function main() {
  // Obtener cédulas desde argumentos de línea de comandos
  const cedulas = process.argv.slice(2);

  if (cedulas.length === 0) {
    console.log('Uso: npm run scrape-sacs [cedula1] [cedula2] ...');
    console.log('Ejemplo: npm run scrape-sacs 7983901 12345678');
    process.exit(1);
  }

  console.log('🚀 Iniciando scraper SACS...');
  console.log(`📋 Cédulas a procesar: ${cedulas.join(', ')}\n`);

  const scraper = new SACSScraper();

  try {
    // Inicializar navegador
    await scraper.initialize();

    // Manejar certificado SSL
    await scraper.handleSSLCertificate();

    // Procesar todas las cédulas
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

    // Guardar resultados en archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = path.join(process.cwd(), `resultados-sacs-${timestamp}.json`);

    fs.writeFileSync(outputPath, JSON.stringify({
      fecha: new Date().toISOString(),
      cedulas_procesadas: cedulas,
      resultados: results
    }, null, 2), 'utf8');

    console.log(`\n💾 Resultados guardados en: ${outputPath}`);
    console.log('✅ Proceso completado exitosamente!');

  } catch (error) {
    console.error('❌ Error en el proceso:', error);
    process.exit(1);
  } finally {
    await scraper.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main().catch(console.error);
}