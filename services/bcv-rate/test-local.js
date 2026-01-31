/**
 * Script de prueba local para el servicio BCV
 * 
 * Uso:
 * node test-local.js
 */

const http = require('http');

const PORT = 3002;
const HOST = 'localhost';

console.log(`
╔════════════════════════════════════════════════════════════╗
║     Prueba Local del Servicio BCV                          ║
╚════════════════════════════════════════════════════════════╝

Consultando tasas...
Servidor: http://${HOST}:${PORT}/rates

`);

const options = {
  hostname: HOST,
  port: PORT,
  path: '/rates',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status: ${res.statusCode}\n`);

    try {
      const result = JSON.parse(data);
      console.log('Resultado:', JSON.stringify(result, null, 2));

      if (result.success) {
        console.log('\n✅ Tasas obtenidas con éxito');
      } else {
        console.log('\n❌ Fallo al obtener tasas');
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
  console.log('\n¿El servidor BCV está corriendo?');
  console.log(`Intenta: cd bcv-rate-service && npm start\n`);
});

req.end();
