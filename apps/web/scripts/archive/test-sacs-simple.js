// Test simple del SACS
const https = require('https');

const cedula = '7983901';
const formData = `cedula=${cedula}&tipo=V`;

console.log('🔍 Probando SACS con cédula:', cedula);
console.log('⏳ Haciendo request...\n');

const options = {
  hostname: 'sistemas.sacs.gob.ve',
  port: 443,
  path: '/consultas/prfsnal_salud',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(formData),
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  timeout: 10000,
  rejectUnauthorized: false
};

const req = https.request(options, (res) => {
  console.log('✅ Status:', res.statusCode);
  console.log('📋 Headers:', JSON.stringify(res.headers, null, 2));
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📄 Tamaño respuesta:', data.length, 'caracteres');
    
    // Guardar HTML
    const fs = require('fs');
    fs.writeFileSync('scripts/sacs-response.html', data);
    console.log('💾 HTML guardado en: scripts/sacs-response.html');
    
    // Buscar palabras clave
    console.log('\n🔍 Buscando en el HTML:');
    const keywords = ['nombre', 'apellido', 'especialidad', 'mpps', 'colegio', 'profesional', 'tabla', 'table'];
    keywords.forEach(word => {
      const count = (data.match(new RegExp(word, 'gi')) || []).length;
      if (count > 0) {
        console.log(`  ✓ "${word}": ${count} vez(es)`);
      }
    });
    
    // Mostrar preview
    console.log('\n📝 Preview (primeros 500 caracteres):');
    console.log('─────────────────────────────────────');
    console.log(data.substring(0, 500));
    console.log('─────────────────────────────────────');
    
    console.log('\n✅ Test completado!');
  });
});

req.on('error', (error) => {
  console.error('\n❌ Error:', error.message);
});

req.on('timeout', () => {
  console.error('\n⏱️  Timeout - El servidor no respondió a tiempo');
  req.destroy();
});

req.write(formData);
req.end();
