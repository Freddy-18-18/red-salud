// Script de prueba del servicio
const http = require('http');

const cedulasPrueba = [
  { cedula: '15229045', tipo: 'V', descripcion: 'Médico con postgrados' },
  { cedula: '17497542', tipo: 'V', descripcion: 'Médico sin postgrados' },
  { cedula: '7983901', tipo: 'V', descripcion: 'Veterinario (debe rechazar)' },
];

async function testVerification(cedula, tipo, descripcion) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ cedula, tipo_documento: tipo });
    
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
    
    console.log(`\n🧪 Probando: ${descripcion} (${tipo}-${cedula})`);
    console.log('─'.repeat(60));
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          console.log(`Status: ${res.statusCode}`);
          console.log(`Verificado: ${result.verified ? '✅ SÍ' : '❌ NO'}`);
          console.log(`Mensaje: ${result.message}`);
          
          if (result.data) {
            console.log(`Nombre: ${result.data.nombre_completo}`);
            console.log(`Profesión: ${result.data.profesion_principal}`);
            console.log(`Especialidad: ${result.data.especialidad_display}`);
            console.log(`Es Médico Humano: ${result.data.es_medico_humano ? 'Sí' : 'No'}`);
            console.log(`Postgrados: ${result.data.postgrados?.length || 0}`);
          }
          
          resolve(result);
        } catch (err) {
          console.error('Error parseando respuesta:', err.message);
          reject(err);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Error de conexión:', error.message);
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         TEST DEL SERVICIO DE VERIFICACIÓN SACS             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  // Verificar que el servicio esté corriendo
  console.log('\n🔍 Verificando que el servicio esté activo...');
  
  try {
    await new Promise((resolve, reject) => {
      http.get('http://localhost:3001/health', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log('✅ Servicio activo\n');
          resolve();
        });
      }).on('error', reject);
    });
  } catch (err) {
    console.error('❌ El servicio no está corriendo');
    console.error('   Ejecuta: npm start\n');
    process.exit(1);
  }
  
  // Ejecutar pruebas
  for (const prueba of cedulasPrueba) {
    try {
      await testVerification(prueba.cedula, prueba.tipo, prueba.descripcion);
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
      console.error(`❌ Error en prueba: ${err.message}`);
    }
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('✅ Tests completados!\n');
}

runTests();
