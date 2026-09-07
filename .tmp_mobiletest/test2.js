const puppeteer = require('puppeteer-core');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
(async () => {
  const browser = await puppeteer.launch({ executablePath: chromePath, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1');
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto('https://muhammad-uzair-portfolio-nu.vercel.app', { waitUntil: 'networkidle2', timeout: 60000 });
  await new Promise(r => setTimeout(r, 4500));

  // hover media + widget computed styles
  const info = await page.evaluate(() => {
    const w = document.getElementById('chatWidget');
    const ws = getComputedStyle(w);
    const fab = document.getElementById('chatFab');
    const fs = getComputedStyle(fab);
    const ancestors = [];
    let el = w.parentElement;
    while (el && el !== document.body && ancestors.length < 8) {
      const cs = getComputedStyle(el);
      ancestors.push({ tag: el.tagName, id: el.id||'', cls: (el.className.baseVal!==undefined? el.className.baseVal : el.className)||'', transform: cs.transform, filter: cs.filter, position: cs.position, opacity: cs.opacity });
      el = el.parentElement;
    }
    const atFab = document.elementFromPoint(fab.getBoundingClientRect().left + 29, fab.getBoundingClientRect().top + 29);
    return {
      hoverHover: matchMedia('(hover: hover)').matches,
      hoverNone: matchMedia('(hover: none)').matches,
      pointerCoarse: matchMedia('(pointer: coarse)').matches,
      widget: { pos: ws.position, top: ws.top, right: ws.right, bottom: ws.bottom, left: ws.left, width: ws.width, height: ws.height, z: ws.zIndex },
      fab: { pos: fs.position, top: fs.top, right: fs.right, bottom: fs.bottom, left: fs.left },
      fabInnerText: fab.textContent.trim().slice(0, 30),
      ancestors,
      atFab: atFab ? atFab.tagName + '.' + (atFab.className.baseVal!==undefined?atFab.className.baseVal:atFab.className) : 'nothing',
      fabVisible: fs.display !== 'none' && fs.visibility !== 'hidden' && fs.opacity !== '0'
    };
  });
  console.log('INFO:', JSON.stringify(info, null, 1));

  // Programmatic clicks to bypass real-input layer
  const prog = await page.evaluate(() => {
    const out = {};
    // Explore
    const cta = document.querySelector('.hero-cta');
    const cat = document.createElement('canvas');
    const ctaRect = cta.getBoundingClientRect();
    out.ctaRect = { x: Math.round(ctaRect.x), y: Math.round(ctaRect.y), w: Math.round(ctaRect.width), h: Math.round(ctaRect.height) };
    out.ctaAtPoint = document.elementFromPoint(ctaRect.left + ctaRect.width/2, ctaRect.top + ctaRect.height/2)?.className || 'none';
    cta.click();
    return new Promise(res => setTimeout(() => { out.scrollY = Math.round(window.scrollY); res(out); }, 1500));
  });
  console.log('PROG EXPLORE:', JSON.stringify(prog));

  // Orbit: evaluate click on a node and check tooltip
  const orb = await page.evaluate(() => {
    document.getElementById('skills').scrollIntoView();
    return new Promise(res => setTimeout(() => {
      const n = document.querySelector('.orbit-node');
      const r = n.getBoundingClientRect();
      const atPoint = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
      const clickTarget = atPoint ? (atPoint.tagName + '.' + (atPoint.className.baseVal!==undefined?atPoint.className.baseVal:atPoint.className)) : 'none';
      n.click();
      setTimeout(() => {
        const tip = document.getElementById('orbitTooltip');
        res({ nodeRect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
              atPoint, clickTarget, tooltipShown: tip ? tip.classList.contains('show') : false,
              tooltipInline: tip ? (tip.style.left + '|' + tip.style.top + '|' + tip.style.transform) : 'none' });
      }, 500);
    }, 1200));
  });
  console.log('PROG ORBIT:', JSON.stringify(orb, null, 1));

  // Terminal: programmatic click
  const term = await page.evaluate(() => {
    document.getElementById('terminal').scrollIntoView();
    return new Promise(res => setTimeout(() => {
      const win = document.querySelector('.terminal-window');
      const r = win.getBoundingClientRect();
      const atPoint = document.elementFromPoint(r.left + r.width/2, r.top + r.height/2);
      win.click();
      setTimeout(() => res({ winRect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
                             atPoint: atPoint ? atPoint.tagName + (atPoint.className? '.' + atPoint.className : '') : 'none',
                             focused: document.activeElement && document.activeElement.id === 'terminalInput' }), 400);
    }, 1200));
  });
  console.log('PROG TERM:', JSON.stringify(term, null, 1));

  console.log('PAGEERRORS:', errs.length ? errs.join('\n') : 'none');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
