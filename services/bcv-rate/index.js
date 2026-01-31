/**
 * 💰 SERVICIO BACKEND: Tasa BCV con Puppeteer
 * 
 * Este servicio hace scraping del Banco Central de Venezuela
 * para obtener las tasas oficiales de USD y EUR.
 * 
 * Puerto: 3002
 * 
 * Endpoints:
 * - GET  /health - Health check
 * - GET  /rates  - Obtener tasas actuales (Scraping en tiempo real o Cache)
 */

const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de Puppeteer
const PUPPETEER_CONFIG = {
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--ignore-certificate-errors',
    '--disable-dev-shm-usage',
  ],
  ignoreHTTPSErrors: true,
  acceptInsecureCerts: true,
};

async function scrapeBCV() {
  let browser;
  try {
    console.log('[BCV] Iniciando scraping...');
    browser = await puppeteer.launch(PUPPETEER_CONFIG);
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Timeout generoso
    await page.goto('https://www.bcv.org.ve/', { waitUntil: 'domcontentloaded', timeout: 60000 });

    console.log('[BCV] Página cargada. Extrayendo datos...');

    const results = await page.evaluate(() => {
      const rates = [];
      const strongs = Array.from(document.querySelectorAll('strong'));

      for (const strong of strongs) {
        const text = strong.innerText.trim();
        if (/^\d{1,4}[,.]\d+/.test(text)) {
          const parent = strong.closest('div.row') || strong.parentElement;
          if (parent) {
            const content = parent.innerText;
            if (content.includes('USD') || content.includes('Dolar')) {
              rates.push({ rate: text, currency: 'USD' });
            } else if (content.includes('EUR') || content.includes('Euro')) {
              rates.push({ rate: text, currency: 'EUR' });
            }
          }
        }
      }
      return rates;
    });

    const cleanRates = results.map(r => ({
      currency: r.currency,
      rate: parseFloat(r.rate.replace(',', '.')),
      date: new Date().toISOString()
    }));

    console.log('[BCV] Tasas encontradas:', cleanRates);
    return cleanRates;

  } catch (error) {
    console.error('[BCV] Error de scraping:', error.message);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

// Endpoints

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'BCV Rate Service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/rates', async (req, res) => {
  try {
    const rates = await scrapeBCV();
    if (rates && rates.length > 0) {
      res.json({
        success: true,
        rates: rates
      });
    } else {
      res.status(503).json({
        success: false,
        error: 'No se pudieron obtener las tasas'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║     BCV Rate Service v1.0                                  ║
║     Puerto: ${PORT}                                           ║
║     Estado: ACTIVO ✅                                       ║
╚════════════════════════════════════════════════════════════╝
  `);
});
