import puppeteer from "puppeteer";

async function run() {
  const url = process.env.APP_URL || "http://localhost:3000";
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 800 });

  const results: Record<string, boolean | string | number> = {};

  try {
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.waitForSelector('[data-testid="hero-section"]', { timeout: 10000 });

    // Altura del Hero vs viewport menos header
    const metrics = await page.evaluate(() => {
      const hero = document.querySelector('[data-testid="hero-section"]') as HTMLElement | null;
      const header = document.querySelector('header') as HTMLElement | null;
      const vh = window.innerHeight;
      const headerH = header ? header.getBoundingClientRect().height : 0;
      const heroH = hero ? hero.getBoundingClientRect().height : 0;
      return { vh, headerH, heroH };
    });
    const expected = metrics.vh - metrics.headerH;
    const diff = Math.abs(metrics.heroH - expected);
    results.heroHeightMatch = diff <= 2;
    results.heroHeight = metrics.heroH;
    results.expectedHeight = expected;

    // Presencia de CTAs y atributos accesibles
    const ctas = await page.$$('[data-testid="cta-primary"], [data-testid="cta-secondary"]');
    results.ctaCount = ctas.length;
    results.ctasPresent = ctas.length >= 1;

    const hasAriaLabels = await page.evaluate(() => {
      const primary = document.querySelector('[data-testid="cta-primary"]');
      const secondary = document.querySelector('[data-testid="cta-secondary"]');
      const pOk = !!primary && !!primary.getAttribute('aria-label');
      const sOk = !!secondary && !!secondary.getAttribute('aria-label');
      return pOk && sOk;
    });
    results.ctaAriaLabels = hasAriaLabels;

    // Navegación por teclado: primer Tab debe enfocar algún CTA
    await page.keyboard.down('Tab');
    await page.keyboard.up('Tab');
    await page.waitForTimeout(100);
    const focusedIsCta = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return false;
      return el.matches('[data-testid="cta-primary"], [data-testid="cta-secondary"]');
    });
    results.keyboardFocusCta = focusedIsCta;

    // Legibilidad básica: existencia de título y texto dentro del Hero
    const hasTitleAndText = await page.evaluate(() => {
      const hero = document.querySelector('[data-testid="hero-section"]') as HTMLElement | null;
      if (!hero) return false;
      const h1 = hero.querySelector('h1');
      const p = hero.querySelector('p');
      return !!h1 && !!p && h1.textContent!.length > 10 && p.textContent!.length > 20;
    });
    results.titleTextPresent = hasTitleAndText;

    const allGood = Boolean(
      results.heroHeightMatch &&
      results.ctasPresent &&
      results.ctaAriaLabels &&
      results.keyboardFocusCta &&
      results.titleTextPresent
    );

    console.log("USABILIDAD HERO RESULTS", results);
    await browser.close();
    if (!allGood) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error("Error en prueba de usabilidad del Hero:", err);
    await browser.close();
    process.exit(1);
  }
}

run();