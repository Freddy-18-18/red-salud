/**
 * Script de verificación para el Workspace Médico
 * 
 * Verifica que todas las configuraciones necesarias estén presentes
 * para usar el nuevo workspace médico con IA.
 * 
 * Uso:
 *   npx tsx scripts/verify-workspace-setup.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface CheckResult {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  action?: string;
}

const results: CheckResult[] = [];

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    results.push({
      name: 'Archivo .env.local',
      status: 'error',
      message: 'No existe el archivo .env.local',
      action: 'Copia .env.example a .env.local y configura las variables',
    });
    return;
  }

  results.push({
    name: 'Archivo .env.local',
    status: 'success',
    message: 'Archivo encontrado',
  });

  // Leer el contenido
  const envContent = fs.readFileSync(envPath, 'utf-8');

  // Verificar GEMINI_API_KEY
  const geminiKeyMatch = envContent.match(/GEMINI_API_KEY=(.+)/);
  if (!geminiKeyMatch || !geminiKeyMatch[1] || geminiKeyMatch[1].trim() === '') {
    results.push({
      name: 'GEMINI_API_KEY',
      status: 'error',
      message: 'No está configurada',
      action: 'Obtén tu API key en: https://aistudio.google.com/app/apikey',
    });
  } else {
    results.push({
      name: 'GEMINI_API_KEY',
      status: 'success',
      message: 'Configurada correctamente',
    });
  }

  // Verificar ICD_API_CLIENT_ID (opcional)
  const icdClientIdMatch = envContent.match(/ICD_API_CLIENT_ID=(.+)/);
  if (!icdClientIdMatch || !icdClientIdMatch[1] || icdClientIdMatch[1].trim() === '') {
    results.push({
      name: 'ICD_API_CLIENT_ID',
      status: 'warning',
      message: 'No está configurada (opcional)',
      action: 'Para búsqueda ICD-11, obtén credenciales en: https://icd.who.int/icdapi',
    });
  } else {
    results.push({
      name: 'ICD_API_CLIENT_ID',
      status: 'success',
      message: 'Configurada correctamente',
    });
  }

  // Verificar ICD_API_CLIENT_SECRET (opcional)
  const icdClientSecretMatch = envContent.match(/ICD_API_CLIENT_SECRET=(.+)/);
  if (!icdClientSecretMatch || !icdClientSecretMatch[1] || icdClientSecretMatch[1].trim() === '') {
    results.push({
      name: 'ICD_API_CLIENT_SECRET',
      status: 'warning',
      message: 'No está configurada (opcional)',
      action: 'Para búsqueda ICD-11, obtén credenciales en: https://icd.who.int/icdapi',
    });
  } else {
    results.push({
      name: 'ICD_API_CLIENT_SECRET',
      status: 'success',
      message: 'Configurada correctamente',
    });
  }
}

function checkComponents() {
  const componentsToCheck = [
    'components/dashboard/medico/medical-workspace.tsx',
    'app/dashboard/medico/pacientes/nuevo/page.tsx',
    'app/api/gemini/improve-note/route.ts',
    'app/api/gemini/generate-note/route.ts',
  ];

  for (const component of componentsToCheck) {
    const componentPath = path.join(process.cwd(), component);
    if (fs.existsSync(componentPath)) {
      results.push({
        name: `Componente: ${component}`,
        status: 'success',
        message: 'Encontrado',
      });
    } else {
      results.push({
        name: `Componente: ${component}`,
        status: 'error',
        message: 'No encontrado',
        action: 'Verifica que todos los archivos se hayan creado correctamente',
      });
    }
  }
}

function checkDocumentation() {
  const docsToCheck = [
    'CONFIGURACION_GEMINI_AI.md',
    'WORKSPACE_MEDICO_NUEVO.md',
    'INICIO_RAPIDO_WORKSPACE.md',
    'RESUMEN_WORKSPACE_MEDICO.md',
  ];

  for (const doc of docsToCheck) {
    const docPath = path.join(process.cwd(), doc);
    if (fs.existsSync(docPath)) {
      results.push({
        name: `Documentación: ${doc}`,
        status: 'success',
        message: 'Encontrada',
      });
    } else {
      results.push({
        name: `Documentación: ${doc}`,
        status: 'warning',
        message: 'No encontrada',
        action: 'La documentación es opcional pero recomendada',
      });
    }
  }
}

function printResults() {
  log('\n' + '='.repeat(80), colors.bold);
  log('  VERIFICACIÓN DEL WORKSPACE MÉDICO', colors.bold + colors.blue);
  log('='.repeat(80) + '\n', colors.bold);

  let hasErrors = false;
  let hasWarnings = false;

  for (const result of results) {
    let icon = '';
    let color = colors.reset;

    switch (result.status) {
      case 'success':
        icon = '✅';
        color = colors.green;
        break;
      case 'warning':
        icon = '⚠️';
        color = colors.yellow;
        hasWarnings = true;
        break;
      case 'error':
        icon = '❌';
        color = colors.red;
        hasErrors = true;
        break;
    }

    log(`${icon} ${result.name}`, color);
    log(`   ${result.message}`, color);
    if (result.action) {
      log(`   → ${result.action}`, colors.blue);
    }
    log('');
  }

  log('='.repeat(80), colors.bold);

  if (hasErrors) {
    log('\n❌ HAY ERRORES QUE DEBEN SER CORREGIDOS', colors.red + colors.bold);
    log('\nEl workspace médico NO funcionará correctamente hasta que se corrijan.', colors.red);
    log('\nSigue las acciones sugeridas arriba para resolver los problemas.\n', colors.blue);
    process.exit(1);
  } else if (hasWarnings) {
    log('\n⚠️  HAY ADVERTENCIAS', colors.yellow + colors.bold);
    log('\nEl workspace médico funcionará, pero algunas características opcionales no estarán disponibles.', colors.yellow);
    log('\nPuedes ignorar las advertencias o seguir las acciones sugeridas para habilitar todas las características.\n', colors.blue);
  } else {
    log('\n✅ TODO ESTÁ CONFIGURADO CORRECTAMENTE', colors.green + colors.bold);
    log('\nEl workspace médico está listo para usar.', colors.green);
    log('\nAccede a: http://localhost:3000/dashboard/medico/pacientes/nuevo\n', colors.blue);
  }

  log('📚 Documentación:', colors.bold);
  log('   • Inicio Rápido: INICIO_RAPIDO_WORKSPACE.md', colors.blue);
  log('   • Configuración Gemini: CONFIGURACION_GEMINI_AI.md', colors.blue);
  log('   • Documentación Completa: WORKSPACE_MEDICO_NUEVO.md\n', colors.blue);
}

// Ejecutar verificaciones
log('\n🔍 Verificando configuración del Workspace Médico...\n', colors.blue);

checkEnvFile();
checkComponents();
checkDocumentation();

printResults();
