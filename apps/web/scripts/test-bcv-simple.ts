
import puppeteer from 'puppeteer';

async function testBCVScraping() {
    console.log('🚀 Launching Puppeteer for BCV...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        console.log('Navigating to BCV...');
        await page.goto('https://www.bcv.org.ve/', { waitUntil: 'networkidle2', timeout: 60000 });

        console.log('Page loaded. Extracting data...');

        // Try to find the rate
        // Based on user image, look for "USD" and associated rate

        const data = await page.evaluate(() => {
            const results = {};

            // Log logic for debugging inside browser
            const strongs = Array.from(document.querySelectorAll('strong'));
            for (const strong of strongs) {
                const text = strong.innerText.trim();
                // Check if this strong has a rate-like pattern
                if (/^\d{1,4}[,.]\d+/.test(text)) {
                    // Check siblings or parent for "USD"
                    const parent = strong.closest('div.row') || strong.parentElement;
                    if (parent && (parent.innerText.includes('USD') || parent.innerText.includes('Dolar'))) {
                        return { rate: text, currency: 'USD' };
                    }
                }
            }

            // Alternative: Specific common ID
            const dolarDiv = document.querySelector('#dolar strong');
            if (dolarDiv) {
                return { rate: dolarDiv.innerText.trim(), currency: 'USD (by ID)' };
            }

            return null;
        });

        if (data) {
            console.log('✅ Rate Found:', data);
        } else {
            console.log('❌ Rate NOT found via standard selectors.');
            const content = await page.content();
            console.log('Content dump snippet:', content.substring(0, 500));
        }

    } catch (error) {
        console.error('Error with Puppeteer:', error);
    } finally {
        await browser.close();
    }
}

testBCVScraping();
