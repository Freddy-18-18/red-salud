// Script para inspeccionar la estructura del SACS
const puppeteer = require('puppeteer');
const fs = require('fs');

const SACS_URL = 'https://sistemas.sacs.gob.ve/consultas/prfsnal_salud';

console.log('🔍 Inspeccionando estructura del SACS...\n');

async function inspect() {
  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--ignore-certificate-errors',
      ],
      ignoreHTTPSErrors: true,
      acceptInsecureCerts: true,
    });

    const page = await browser.newPage();
    await page.setBypassCSP(true);
    
    console.log('📥 Cargando página...\n');
    
    await page.goto(SACS_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('✅ Página cargada\n');
    
    // Guardar HTML
    const html = await page.content();
    fs.writeFileSync('scripts/sacs-inspect.html', html);
    console.log('💾 HTML guardado\n');
    
    // Screenshot
    await page.screenshot({ path: 'scripts/sacs-inspect.png', fullPage: true });
    console.log('📸 Screenshot guardado\n');
    
    // Buscar todos los inputs
    const inputs = await page.evaluate(() => {
      const allInputs = Array.from(document.querySelectorAll('input, select, textarea, button'));
      return allInputs.map(el => ({
        tag: el.tagName,
        type: el.type,
        name: el.name,
        id: el.id,
        class: el.className,
        placeholder: el.placeholder,
        value: el.value,
      }));
    });
    
    console.log('📋 INPUTS ENCONTRADOS:\n');
    inputs.forEach((input, i) => {
      console.log(`${i + 1}. <${input.tag.toLowerCase()}>`);
      if (input.type) console.log(`   type="${input.type}"`);
      if (input.name) console.log(`   name="${input.name}"`);
      if (input.id) console.log(`   id="${input.id}"`);
      if (input.class) console.log(`   class="${input.class}"`);
      if (input.placeholder) console.log(`   placeholder="${input.placeholder}"`);
      console.log('');
    });
    
    // Buscar divs importantes
    const divs = await page.evaluate(() => {
      const importantDivs = Array.from(document.querySelectorAll('[id]'));
      return importantDivs.map(el => ({
        id: el.id,
        tag: el.tagName,
        text: el.innerText.substring(0, 100),
      }));
    });
    
    console.log('\n📦 DIVS CON ID:\n');
    divs.forEach(div => {
      console.log(`• #${div.id} (${div.tag})`);
      if (div.text) console.log(`  "${div.text}..."`);
    });
    
    console.log('\n✅ Inspección completada!\n');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

inspect();
