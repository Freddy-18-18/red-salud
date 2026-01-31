/**
 * Script de prueba local para el servicio SACS
 * 
 * Uso:
 * node test-local.js [cedula] [tipo]
 * 
 * Ejemplos:
 * node test-local.js 30218596 V
 * node test-local.js 12345678
 */

const http = require('http');

const PORT = process.env.PORT || 3001;
const HOST = 'localhost';

// Obtener argumentos
const cedula = process.argv[2] || '30218596';
const tipo_documento = process.argv[3] || 'V';

console.log(`
╔════════════════════════════════════════════════════════════╗
║     Prueba Local del Servicio SACS                         ║
╚════════════════════════════════════════════════════════════╝

Verificando: ${tipo_documento}-${cedula}
Servidor: http://${HOST}:${PORT}

`);

// Datos de la petición
const postData = JSON.stringify({
  cedula,
  tipo_documento
});

// Opciones de la petición
const options = {
  hostname: HOST,
  port: PORT,
  path: '/verify',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

// Hacer la petición
const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status: ${res.statusCode}\n`);
    
    try {
      const result = JSON.parse(data);
      
      if (result.success && result.verified) {
        console.log('✅ VERIFICACIÓN EXITOSA\n');
        console.log('Datos del Médico:');
        console.log('─────────────────────────────────────────────────');
        console.log(`Nombre: ${result.data.nombre_completo}`);
        console.log(`Cédula: ${result.data.tipo_documento}-${result.data.cedula}`);
        console.log(`Profesión: ${result.data.profesion_principal}`);
        console.log(`Matrícula: ${result.data.matricula_principal}`);
        console.log(`Especialidad: ${result.data.especialidad_display}`);
        console.log(`Médico Humano: ${result.data.es_medico_humano ? 'Sí' : 'No'}`);
        console.log(`Veterinario: ${result.data.es_veterinario ? 'Sí' : 'No'}`);
        console.log(`Postgrados: ${result.data.tiene_postgrados ? 'Sí' : 'No'}`);
        
        if (result.data.postgrados && result.data.postgrados.length > 0) {
          console.log('\nPostgrados:');
          result.data.postgrados.forEach((pg, i) => {
            console.log(`  ${i + 1}. ${pg.postgrado} (${pg.fecha_registro})`);
          });
        }
        
        console.log('\n✅ Apto para Red-Salud');
        
      } else if (result.success && !result.verified) {
        console.log('❌ VERIFICACIÓN RECHAZADA\n');
        console.log(`Razón: ${result.razon_rechazo}`);
        console.log(`Mensaje: ${result.message}`);
        
        if (result.data) {
          console.log('\nDatos encontrados:');
          console.log(`Nombre: ${result.data.nombre_completo}`);
          console.log(`Profesión: ${result.data.profesion_principal}`);
        }
        
      } else {
        console.log('❌ ERROR EN LA VERIFICACIÓN\n');
        console.log(`Error: ${result.error || result.message}`);
      }
      
    } catch (err) {
      console.error('Error parseando respuesta:', err.message);
      console.log('Respuesta raw:', data);
    }
    
    console.log('\n');
  });
});

req.on('error', (error) => {
  console.error('❌ Error en la petición:', error.message);
  console.log('\n¿El servidor está corriendo?');
  console.log(`Intenta: npm start\n`);
});

req.write(postData);
req.end();
