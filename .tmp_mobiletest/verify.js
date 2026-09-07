const puppeteer = require('puppeteer-core');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:8899/index.html';

(async () => {
  const browser = await puppeteer.launch({ executablePath: chromePath, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });

  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 4000));

  const results = {};

  // 1. FAB position (must be bottom-right)
  results.fab = await page.evaluate(() => {
    const fab = document.getElementById('chatFab');
    const r = fab.getBoundingClientRect();
    const w = document.getElementById('chatWidget');
    const wr = w.getBoundingClientRect();
    return { fabRect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
             widgetRect: { x: Math.round(wr.x), y: Math.round(wr.y), w: Math.round(wr.width), h: Math.round(wr.height) },
             vw: innerWidth, vh: innerHeight };
  });

  // 2. What element is at the center of the old overlay areas (hero CTA spot)
  results.heroHit = await page.evaluate(() => {
    const cta = document.querySelector('.hero-cta');
    const r = cta.getBoundingClientRect();
    const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { ctaRect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
             hit: el ? (el.className.baseVal !== undefined ? el.className.baseVal : el.className) : 'none' };
  });

  // 3. REAL TAP on Explore
  await page.tap('.hero-cta');
  await new Promise(r => setTimeout(r, 2600));
  results.afterExplore = await page.evaluate(() => ({ scrollY: Math.round(window.scrollY), workVisible: document.getElementById('work').getBoundingClientRect().top < innerHeight }));

  // 4. Scroll to orbit and REAL TAP a node
  await page.evaluate(() => document.getElementById('skills').scrollIntoView());
  await new Promise(r => setTimeout(r, 1500));
  const nodeHit = await page.evaluate(() => {
    const n = document.querySelector('.orbit-node');
    const r = n.getBoundingClientRect();
    const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { nodeRect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
             hit: el ? (el.className.baseVal !== undefined ? el.className.baseVal : el.className) : 'none' };
  });
  results.orbitNodeHit = nodeHit;
  await page.tap('.orbit-node');
  await new Promise(r => setTimeout(r, 700));
  results.orbitTooltipShown = await page.evaluate(() => document.getElementById('orbitTooltip').classList.contains('show'));

  // 5. REAL TAP on terminal
  await page.evaluate(() => document.getElementById('terminal').scrollIntoView());
  await new Promise(r => setTimeout(r, 1200));
  const termHit = await page.evaluate(() => {
    const w = document.querySelector('.terminal-window');
    const r = w.getBoundingClientRect();
    const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { hit: el ? el.className : 'none' };
  });
  results.termHit = termHit;
  await page.tap('.terminal-window');
  await new Promise(r => setTimeout(r, 500));
  results.termFocused = await page.evaluate(() => document.activeElement && document.activeElement.id === 'terminalInput');

  // 6. REAL TAP on chat FAB opens panel
  await page.tap('.chat-fab');
  await new Promise(r => setTimeout(r, 600));
  results.chatOpened = await page.evaluate(() => document.getElementById('chatWidget').classList.contains('open'));
  results.chatPanelRect = await page.evaluate(() => {
    const p = document.getElementById('chatPanel');
    const r = p.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), visible: getComputedStyle(p).visibility !== 'hidden' };
  });

  // 7. REAL TAP on nav toggle
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 600));
  const navHit = await page.evaluate(() => {
    const t = document.getElementById('navToggle');
    const r = t.getBoundingClientRect();
    const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }, hit: el ? el.className : 'none' };
  });
  results.navHit = navHit;
  await page.tap('#navToggle');
  await new Promise(r => setTimeout(r, 600));
  results.navMenuOpened = await page.evaluate(() => document.getElementById('navLinks').classList.contains('open'));

  console.log('RESULTS:', JSON.stringify(results, null, 1));
  console.log('PAGE ERRORS:', errs.length ? errs.join('\n') : 'none');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
