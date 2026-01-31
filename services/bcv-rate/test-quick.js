/**
 * 🧪 Prueba Rápida del Servicio de Verificación SACS
 * 
 * Ejecutar: node test-quick.js
 */

const http = require('http');

const SERVICE_URL = 'http://localhost:3001';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(cedula, tipoDocumento = 'V') {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      cedula,
      tipo_documento: tipoDocumento
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/verify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (err) {
          reject(new Error(`Error parsing response: ${err.message}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });
}

async function runTests() {
  log('cyan', '\n🧪 Iniciando Pruebas del Servicio SACS\n');
  log('yellow', '⚠️  Asegúrate de que el servicio esté corriendo en http://localhost:3001\n');

  // Test 1: Health Check
  log('blue', '📋 Test 1: Health Check');
  try {
    const response = await new Promise((resolve, reject) => {
      http.get(`${SERVICE_URL}/health`, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body }));
      }).on('error', reject);
    });

    if (response.status === 200) {
      log('green', '✅ Servicio está corriendo correctamente\n');
    } else {
      log('red', `❌ Servicio respondió con status ${response.status}\n`);
      return;
    }
  } catch (err) {
    log('red', `❌ No se pudo conectar al servicio: ${err.message}`);
    log('yellow', '\n💡 Ejecuta: cd sacs-verification-service && npm start\n');
    return;
  }

  // Test 2: Validación de entrada
  log('blue', '📋 Test 2: Validación de Entrada (sin cédula)');
  try {
    const result = await makeRequest('', 'V');
    if (result.status === 400) {
      log('green', '✅ Validación funciona correctamente');
      log('cyan', `   Mensaje: ${result.data.error}\n`);
    } else {
      log('red', `❌ Esperaba status 400, recibió ${result.status}\n`);
    }
  } catch (err) {
    log('red', `❌ Error: ${err.message}\n`);
  }

  // Test 3: Formato inválido
  log('blue', '📋 Test 3: Formato Inválido (letras en cédula)');
  try {
    const result = await makeRequest('ABC123', 'V');
    if (result.status === 400) {
      log('green', '✅ Validación de formato funciona');
      log('cyan', `   Mensaje: ${result.data.error}\n`);
    } else {
      log('red', `❌ Esperaba status 400, recibió ${result.status}\n`);
    }
  } catch (err) {
    log('red', `❌ Error: ${err.message}\n`);
  }

  // Test 4: Cédula de prueba (probablemente no existe)
  log('blue', '📋 Test 4: Cédula No Encontrada');
  log('yellow', '   (Esto puede tardar ~10 segundos mientras consulta el SACS)');
  try {
    const result = await makeRequest('99999999', 'V');
    log('cyan', `   Status: ${result.status}`);
    log('cyan', `   Verified: ${result.data.verified}`);
    log('cyan', `   Message: ${result.data.message || 'N/A'}\n`);
  } catch (err) {
    log('red', `❌ Error: ${err.message}\n`);
  }

  // Test 5: Cédula real (si tienes una para probar)
  log('blue', '📋 Test 5: Prueba con Cédula Real');
  log('yellow', '   ⚠️  Ingresa una cédula real para probar (o presiona Enter para saltar)');
  
  // En Node.js, para input interactivo necesitamos readline
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('   Cédula (solo números): ', async (cedula) => {
    if (cedula && /^\d{6,10}$/.test(cedula)) {
      log('yellow', '\n   Consultando SACS...');
      try {
        const result = await makeRequest(cedula, 'V');
        
        log('cyan', `\n   📊 Resultado:`);
        log('cyan', `   Status: ${result.status}`);
        log('cyan', `   Success: ${result.data.success}`);
        log('cyan', `   Verified: ${result.data.verified}`);
        
        if (result.data.data) {
          log('cyan', `   Nombre: ${result.data.data.nombre_completo}`);
          log('cyan', `   Profesión: ${result.data.data.profesion_principal}`);
          log('cyan', `   Matrícula: ${result.data.data.matricula_principal}`);
          log('cyan', `   Es Médico Humano: ${result.data.data.es_medico_humano}`);
          log('cyan', `   Es Veterinario: ${result.data.data.es_veterinario}`);
          
          if (result.data.data.postgrados && result.data.data.postgrados.length > 0) {
            log('cyan', `   Postgrados:`);
            result.data.data.postgrados.forEach(p => {
              log('cyan', `     - ${p.postgrado}`);
            });
          }
        }
        
        if (result.data.verified && result.data.data.es_medico_humano) {
          log('green', '\n   ✅ Verificación EXITOSA - Médico válido para Red-Salud');
        } else if (result.data.data && result.data.data.es_veterinario) {
          log('red', '\n   ❌ Médico Veterinario - No válido para Red-Salud');
        } else {
          log('yellow', '\n   ⚠️  No verificado o profesión no válida');
        }
        
      } catch (err) {
        log('red', `   ❌ Error: ${err.message}`);
      }
    } else {
      log('yellow', '   Saltando prueba con cédula real');
    }

    log('cyan', '\n✅ Pruebas completadas!\n');
    rl.close();
  });
}

// Ejecutar pruebas
runTests().catch(err => {
  log('red', `\n❌ Error fatal: ${err.message}\n`);
  process.exit(1);
});
