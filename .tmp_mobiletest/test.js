const puppeteer = require('puppeteer-core');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({ executablePath: chromePath, headless: 'new', args: ['--no-sandbox', '--disable-gpu'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');

  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

  await page.goto('https://muhammad-uzair-portfolio-nu.vercel.app', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 4500));

  // 1. Loader state
  const loaderState = await page.evaluate(() => {
    const l = document.getElementById('loader');
    if (!l) return 'no loader';
    return { done: l.classList.contains('done'), visibility: getComputedStyle(l).visibility, opacity: getComputedStyle(l).opacity };
  });
  console.log('LOADER:', JSON.stringify(loaderState));

  // 2. Chat FAB position
  const fab = await page.evaluate(() => {
    const el = document.getElementById('chatFab');
    if (!el) return 'no element';
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    const cw = getComputedStyle(el.closest('.chat-widget'));
    return { rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
             position: cw.position, right: cw.right, bottom: cw.bottom, left: cw.left, display: cs.display, visibility: cs.visibility, opacity: cs.opacity };
  });
  console.log('FAB:', JSON.stringify(fab, null, 1));

  // 3. Explore button tap -> scroll
  const beforeScroll = await page.evaluate(() => window.scrollY);
  await page.tap('.hero-cta');
  await new Promise(r => setTimeout(r, 2500));
  const afterScroll = await page.evaluate(() => ({ y: Math.round(window.scrollY), workTop: Math.round(document.getElementById('work').getBoundingClientRect().top) }));
  console.log('EXPLORE: before=', beforeScroll, 'after=', JSON.stringify(afterScroll));

  // 4. Scroll to skills orbit, tap a node
  await page.evaluate(() => document.getElementById('skills').scrollIntoView());
  await new Promise(r => setTimeout(r, 1500));
  const orbitInfo = await page.evaluate(() => {
    const orb = document.getElementById('skillOrbit');
    const nodes = document.querySelectorAll('.orbit-node');
    const tip = document.getElementById('orbitTooltip');
    if (!orb) return 'no orbit';
    const r = orb.getBoundingClientRect();
    return { rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
             nodeCount: nodes.length, nodeRects: Array.from(nodes).slice(0,3).map(n => { const nr = n.getBoundingClientRect(); return { x: Math.round(nr.x), y: Math.round(nr.y), w: Math.round(nr.width), h: Math.round(nr.height) }; }),
             tipExists: !!tip };
  });
  console.log('ORBIT:', JSON.stringify(orbitInfo, null, 1));

  const node = await page.$('.orbit-node');
  if (node) { await node.tap(); await new Promise(r => setTimeout(r, 700)); }
  const tipVisible = await page.evaluate(() => {
    const tip = document.getElementById('orbitTooltip');
    return !!tip && (tip.classList.contains('show'));
  });
  console.log('ORBIT TOOLTIP after tap:', tipVisible);

  // 5. Terminal tap
  await page.evaluate(() => document.getElementById('terminal').scrollIntoView());
  await new Promise(r => setTimeout(r, 1200));
  await page.tap('.terminal-window');
  await new Promise(r => setTimeout(r, 500));
  const termFocused = await page.evaluate(() => {
    const inp = document.getElementById('terminalInput');
    return inp && document.activeElement === inp;
  });
  console.log('TERMINAL focused after tap:', termFocused);

  await page.screenshot({ path: 'd:\\Work\\My portfolio\\.tmp_mobiletest\\mobile_hero.png' });
  await page.evaluate(() => document.getElementById('skills').scrollIntoView());
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: 'd:\\Work\\My portfolio\\.tmp_mobiletest\\mobile_skills.png' });

  console.log('--- ERRORS ---');
  console.log(errors.length ? errors.join('\n') : 'none');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
