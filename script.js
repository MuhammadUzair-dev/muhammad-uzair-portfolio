/* ================================================================
   MUHAMMAD UZAIR — PORTFOLIO 2026  ·  V3 ELITE Engine
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const G = typeof gsap !== 'undefined';
  const ST = typeof ScrollTrigger !== 'undefined';
  if (G && ST) gsap.registerPlugin(ScrollTrigger);

  // ─── LOADER ───
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loaderProgress');
  const loaderNum = document.getElementById('loaderCounter');
  let lp = 0;

  const loadTick = setInterval(() => {
    lp += Math.random() * 14 + 3;
    if (lp >= 100) { lp = 100; clearInterval(loadTick); setTimeout(() => { loader.classList.add('done'); revealHero(); }, 350); }
    loaderBar.style.width = lp + '%';
    loaderNum.textContent = Math.floor(lp);
  }, 70);

  // ─── SCROLL PROGRESS BAR ───
  const progBar = document.getElementById('scrollProgress');
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (h > 0) progBar.style.width = (window.scrollY / h * 100) + '%';
  }, { passive: true });

  // ─── CURSOR ───
  const cursor = document.getElementById('cursor');
  if (cursor && window.innerWidth > 768) {
    let mx = 0, my = 0, cx = 0, cy = 0;
    const label = document.createElement('div');
    label.className = 'cursor-label';
    cursor.querySelector('.cursor-ring').appendChild(label);

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    (function tick() { cx += (mx - cx) * 0.14; cy += (my - cy) * 0.14; cursor.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(tick); })();

    document.querySelectorAll('a,button,[data-magnetic]').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
    document.querySelectorAll('[data-cursor-text]').forEach(el => {
      el.addEventListener('mouseenter', () => { cursor.classList.add('text'); label.textContent = el.dataset.cursorText; });
      el.addEventListener('mouseleave', () => { cursor.classList.remove('text'); label.textContent = ''; });
    });
  }

  // ─── PARTICLES ───
  const cvs = document.getElementById('particleCanvas');
  if (cvs) {
    const ctx = cvs.getContext('2d');
    let w, h, pts = [];
    function resize() { w = cvs.width = window.innerWidth; h = cvs.height = window.innerHeight; }
    resize(); window.addEventListener('resize', resize);

    const N = Math.min(55, Math.floor(window.innerWidth / 28));
    const isMobile = window.innerWidth <= 768;
    // Fewer particles + closer connection lines on phones for GPU/battery efficiency
    const MOBILE_N = Math.min(18, Math.floor(window.innerWidth / 40));
    const LINK = isMobile ? 90 : 140;
    for (let i = 0; i < (isMobile ? MOBILE_N : N); i++) pts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, r: Math.random() * 1.1 + .3, a: Math.random() * .25 + .04 });

    (function draw() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]; p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0; if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,255,${p.a})`; ctx.fill();
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(0,212,255,${.025 * (1 - d / LINK)})`; ctx.lineWidth = .5; ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    })();
  }

  // ─── NAVBAR ───
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 80), { passive: true });

  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const closeMenu = () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
    document.body.classList.remove('menu-open');
  };
  navToggle.addEventListener('click', () => {
    const opening = !navLinks.classList.contains('open');
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
    // Lock background scroll while the mobile menu is open (immersive)
    document.body.classList.toggle('menu-open', opening);
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 768) closeMenu(); });

  // ─── SMOOTH SCROLL ───
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const el = document.querySelector(a.getAttribute('href'));
      if (el) window.scrollTo({ top: el.offsetTop - navbar.offsetHeight - 10, behavior: 'smooth' });
    });
  });

  // ─── TEXT SCRAMBLE ───
  class Scramble {
    constructor(el) { this.el = el; this.chars = '!<>-_\\/[]{}—=+*^?#_'; this.frame = 0; this.queue = []; }
    set(text) {
      const old = this.el.innerText;
      const len = Math.max(old.length, text.length);
      return new Promise(r => {
        this.resolve = r; this.queue = [];
        for (let i = 0; i < len; i++) {
          const f = old[i] || '', t = text[i] || '', s = Math.floor(Math.random() * 25), e = s + Math.floor(Math.random() * 25);
          this.queue.push({ f, t, s, e });
        }
        cancelAnimationFrame(this.raf); this.frame = 0; this.update();
      });
    }
    update() {
      let out = '', done = 0;
      for (let i = 0; i < this.queue.length; i++) {
        let { f, t, s, e, c } = this.queue[i];
        if (this.frame >= e) { done++; out += t }
        else if (this.frame >= s) { if (!c || Math.random() < .28) { c = this.chars[Math.floor(Math.random() * this.chars.length)]; this.queue[i].c = c } out += `<span style="color:var(--accent2)">${c}</span>` }
        else { out += f }
      }
      this.el.innerHTML = out;
      if (done === this.queue.length) this.resolve();
      else { this.raf = requestAnimationFrame(() => this.update()); this.frame++ }
    }
  }

  // ─── HERO REVEAL ───
  function revealHero() {
    document.querySelectorAll('.char').forEach((c, i) => setTimeout(() => c.classList.add('revealed'), 70 * i));
    const se = document.querySelector('.scramble-text');
    if (se) { const s = new Scramble(se); setTimeout(() => s.set(se.dataset.text), 500); }

    if (G) {
      gsap.from('.hero-line', { scaleX: 0, duration: .8, delay: .3, ease: 'power3.out' });
      gsap.to('.hero-desc', { opacity: 1, y: 0, duration: 1, delay: 1.1, ease: 'power3.out' });
      gsap.from('.hero-cta', { scale: 0, opacity: 0, duration: .8, delay: 1.4, ease: 'back.out(1.7)' });
      gsap.from('.marquee-divider', { y: 30, opacity: 0, duration: 1, delay: 1.7, ease: 'power3.out' });
      gsap.from('.hero-scroll', { opacity: 0, y: 20, duration: .8, delay: 1.9, ease: 'power3.out' });
    }
  }

  // ─── MARQUEE DUPLICATE ───
  const mq = document.getElementById('marqueeTrack');
  if (mq) mq.innerHTML += mq.innerHTML;

  // ─── GSAP SCROLL ANIMATIONS ───
  if (G && ST) {
    // Big text reveals (word by word)
    document.querySelectorAll('[data-reveal]').forEach(el => {
      const words = el.innerHTML.split(/(\s+|<[^>]+>)/);
      el.innerHTML = words.map(w => {
        if (w.trim() === '' || w.startsWith('<')) return w;
        return `<span class="word-wrap"><span class="word">${w}</span></span>`;
      }).join('');

      gsap.from(el.querySelectorAll('.word'), {
        scrollTrigger: { trigger: el, start: 'top 82%' },
        y: '100%', opacity: 0,
        duration: 0.7, stagger: 0.04, ease: 'power3.out'
      });
    });

    // Add CSS for word-wrap
    const style = document.createElement('style');
    style.textContent = '.word-wrap{display:inline-block;overflow:hidden;vertical-align:top}.word{display:inline-block}';
    document.head.appendChild(style);

    // Section headers
    gsap.utils.toArray('.section-header').forEach(h => {
      gsap.from(h, { scrollTrigger: { trigger: h, start: 'top 85%' }, y: 50, opacity: 0, duration: 1, ease: 'power3.out' });
    });

    // Bento cards
    gsap.utils.toArray('.bento-card').forEach((c, i) => {
      gsap.from(c, { scrollTrigger: { trigger: c, start: 'top 88%' }, y: 70, opacity: 0, duration: .9, delay: i * .08, ease: 'power3.out' });
    });

    // Stats counter
    document.querySelectorAll('.stat').forEach(s => {
      const numEl = s.querySelector('.stat__number');
      const target = parseInt(s.dataset.count);
      ScrollTrigger.create({
        trigger: s,
        start: 'top 85%',
        onEnter: () => {
          gsap.to({ val: 0 }, {
            val: target, duration: 2, ease: 'power2.out',
            onUpdate: function () { numEl.textContent = Math.floor(this.targets()[0].val); }
          });
        },
        once: true
      });
    });

    // Skill cards + bars
    gsap.utils.toArray('.skill-card').forEach((c, i) => {
      gsap.from(c, {
        scrollTrigger: { trigger: c, start: 'top 85%' },
        y: 50, opacity: 0, duration: .8, delay: i * .12, ease: 'power3.out',
        onComplete: () => c.querySelectorAll('.skill-fill').forEach(f => f.classList.add('active'))
      });
    });

    // Contact
    gsap.from('.contact-form', { scrollTrigger: { trigger: '.contact-grid', start: 'top 80%' }, x: -30, opacity: 0, duration: 1, ease: 'power3.out' });
    gsap.from('.contact-side', { scrollTrigger: { trigger: '.contact-grid', start: 'top 80%' }, x: 30, opacity: 0, duration: 1, delay: .15, ease: 'power3.out' });

    // Parallax
    gsap.utils.toArray('[data-speed]').forEach(el => {
      gsap.to(el, {
        y: () => -70 * parseFloat(el.dataset.speed), ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
    });
  }

  // ─── MAGNETIC ───
  if (window.innerWidth > 768) {
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * .22}px,${y * .22}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
        el.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)';
        setTimeout(() => el.style.transition = '', 500);
      });
    });
  }

  // ─── TILT ───
  if (window.innerWidth > 768) {
    document.querySelectorAll('.bento-card').forEach(c => {
      c.addEventListener('mousemove', e => {
        const r = c.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - .5) * 7;
        const y = ((e.clientY - r.top) / r.height - .5) * 7;
        c.style.transform = `translateY(-5px) perspective(900px) rotateX(${-y}deg) rotateY(${x}deg)`;
      });
      c.addEventListener('mouseleave', () => { c.style.transform = ''; c.style.transition = 'all .5s cubic-bezier(.16,1,.3,1)'; setTimeout(() => c.style.transition = '', 500) });
    });
    document.querySelectorAll('[data-tilt]').forEach(c => {
      c.addEventListener('mousemove', e => {
        const r = c.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - .5) * 10;
        const y = ((e.clientY - r.top) / r.height - .5) * 10;
        c.style.transform = `translateY(-6px) perspective(800px) rotateX(${-y}deg) rotateY(${x}deg)`;
      });
      c.addEventListener('mouseleave', () => { c.style.transform = ''; c.style.transition = 'all .5s cubic-bezier(.16,1,.3,1)'; setTimeout(() => c.style.transition = '', 500) });
    });
  }

  // ─── FORM ───
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('.btn-send');
      const txt = btn.querySelector('.btn-send__text');
      const orig = txt.textContent;
      txt.textContent = 'Sent! ✓';
      btn.style.borderColor = 'var(--green)';
      btn.style.color = 'var(--green)';
      btn.style.pointerEvents = 'none';
      setTimeout(() => { txt.textContent = orig; btn.style.borderColor = ''; btn.style.color = ''; btn.style.pointerEvents = ''; form.reset(); }, 2500);
    });
  }

  /* ================================================================
     V3.1 ENHANCEMENTS — Theme / Spotlight / Blobs / Terminal / Chat
     ================================================================ */

  // ─── THEME SWITCHER ───
  const themeBtns = document.querySelectorAll('.theme-btn');
  const savedTheme = localStorage.getItem('mu-theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.theme;
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('mu-theme', t);
      themeBtns.forEach(b => b.classList.toggle('active', b === btn));
    });
  });
  if (savedTheme) themeBtns.forEach(b => b.classList.toggle('active', b.dataset.theme === savedTheme));

  // ─── MOUSE-FOLLOWING SPOTLIGHT ───
  const spotlight = document.getElementById('spotlight');
  if (spotlight && window.innerWidth > 768) {
    let sx = window.innerWidth / 2, sy = 300;
    let tx = sx, ty = sy;
    document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
    (function spotTick() {
      sx += (tx - sx) * 0.08;
      sy += (ty - sy) * 0.08;
      // Center the glow slightly to the right of the cursor
      spotlight.style.transform = `translate(${sx - 180}px, ${sy - 260}px)`;
      requestAnimationFrame(spotTick);
    })();
    document.body.classList.add('spotlight-on');
  }

  // ─── BLOB MORPHING (JS path animation) ───
  (function blobMorphJS() {
    const paths = document.querySelectorAll('.blob path');
    if (!paths.length) return;
    // Mobile: CSS d-path animation (where supported) is enough — skip JS loop for battery
    if (window.innerWidth <= 768) return;
    // If CSS `d:` animation is supported, skip JS fallback
    const testPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    if ('d' in testPath.style && typeof CSS.supports === 'function' && (CSS.supports('d', 'path("M0,0Z")') || CSS.supports('d', 'M0,0Z'))) return;
    const SHAPES = [
      "M250,20 C350,20 480,120 480,250 C480,380 360,480 250,480 C140,480 20,380 20,250 C20,120 150,20 250,20 Z",
      "M250,60 C380,10 470,140 460,270 C450,400 330,470 240,450 C150,430 20,380 40,250 C60,120 120,110 250,60 Z",
      "M260,45 C340,70 450,110 470,240 C490,370 370,450 250,460 C130,470 20,390 30,260 C40,130 180,20 260,45 Z",
      "M240,30 C360,45 460,130 455,260 C450,390 350,455 240,445 C130,435 25,370 35,240 C45,110 120,15 240,30 Z"
    ];
    let ci = 0;
    setInterval(() => {
      paths.forEach(p => p.setAttribute('d', SHAPES[ci]));
      ci = (ci + 1) % SHAPES.length;
    }, 6500);
  })();

  // ─── HERO AI TYPE EFFECT ───
  const heroTypeEl = document.getElementById('heroType');
  const TAGLINES = [
    "'building the future with code & ai'",
    "'full-stack dev · ai integrator'",
    "'crafting intelligent web experiences'",
    "'turning bold ideas into shipped products'",
    "'where clean design meets smart systems'"
  ];
  if (heroTypeEl) {
    const typeWrap = heroTypeEl.closest('.hero-type');
    let ti = 0, ci2 = 0, deleting = false;
    function typeTick() {
      const current = TAGLINES[ti];
      if (!deleting) {
        ci2++;
        heroTypeEl.textContent = current.slice(0, ci2);
        if (ci2 >= current.length) { deleting = true; setTimeout(typeTick, 2200); return; }
        setTimeout(typeTick, 55 + Math.random() * 45);
      } else {
        ci2--;
        heroTypeEl.textContent = current.slice(0, ci2);
        if (ci2 <= 0) {
          deleting = false;
          ti = (ti + 1) % TAGLINES.length;
          setTimeout(typeTick, 400);
          return;
        }
        setTimeout(typeTick, 26);
      }
    }
    setTimeout(() => {
      if (typeWrap) typeWrap.classList.add('visible');
      setTimeout(typeTick, 900);
    }, 2400);
  }

  // ─── INTERACTIVE TERMINAL ───
  const termBody = document.getElementById('terminalBody');
  const termInput = document.getElementById('terminalInput');

  if (termBody && termInput) {
    const termWindow = termBody.closest('.terminal-window');
    const termCmd = {
      help: () => [
        '<span class="term-success">✦ Available commands:</span>',
        '&nbsp;&nbsp;<span class="term-accent">about</span> — who I am',
        '&nbsp;&nbsp;<span class="term-accent">skills</span> — what I\'m good at',
        '&nbsp;&nbsp;<span class="term-accent">projects</span> — what I\'ve built',
        '&nbsp;&nbsp;<span class="term-accent">contact</span> — how to reach me',
        '&nbsp;&nbsp;<span class="term-accent">clear</span> — clear the screen',
        '&nbsp;&nbsp;<span class="term-accent">themes</span> — try: dark / midnight / aurora'
      ],
      about: () => [
        '<span class="term-purple">Muhammad Uzair</span> — Full-Stack Developer & AI Integrator from Karachi, PK 🇵🇰',
        'I build <span class="term-accent">full-stack products end-to-end</span> and explore how AI can make them smarter — genuinely useful, not just functional.',
        '<span class="term-accent">3+</span> years of coding · <span class="term-accent">10+</span> projects built · <span class="term-accent">5+</span> clients served',
        '<span class="term-output--dim">Type "skills" or "projects" to dig deeper.</span>'
      ],
      skills: () => [
        '<span class="term-success">Frontend:</span> React · Tailwind · HTML5 · JavaScript(ES6+) · Figma',
        '<span class="term-success">Backend:</span> Node.js · Express · PostgreSQL · Prisma ORM',
        '<span class="term-success">Logic:</span> Python · C++ · OOP Architecture · Algorithms',
        '<span class="term-success">AI:</span> AI Integration · System Design · REST APIs'
      ],
      projects: () => [
        '<span class="term-purple">01 · Magnum AI</span> — AI agent integrating ML models into web environments <span class="term-output--dim">(Python · APIs · React)</span>',
        '<span class="term-purple">02 · oneup fits</span> — full-stack e-commerce, market-ready <span class="term-output--dim">(Node · Express · PostgreSQL · React)</span>',
        '<span class="term-purple">03 · FinTech Simulator</span> — secure banking simulation, strong OOP <span class="term-output--dim">(Python · OOP)</span>',
        '<span class="term-purple">04 · Usaid Shaikh Portfolio</span> — custom UI/UX for a video pro <span class="term-output--dim">(UI/UX · Frontend)</span> <span class="term-output--dim">· coming soon</span>',
        '<span class="term-purple">05 · Zenithflow</span> — real-time analytics platform with live dashboards <span class="term-output--dim">(React · Node · PostgreSQL)</span>',
        '<span class="term-purple">06 · Aurastream</span> — AI-assisted media discovery experience <span class="term-output--dim">(Python · AI · REST APIs)</span>'
      ],
      contact: () => [
        '📧 <span class="term-accent">Email:</span> available via the contact form below ↓',
        '💬 <span class="term-accent">WhatsApp:</span> listed in the Contact section',
        '📍 <span class="term-accent">Location:</span> Karachi, Pakistan',
        '<span class="term-success">● Open for freelance & collaboration — currently available!</span>'
      ],
      themes: () => [
        'Try switching themes: <span class="term-accent">dark</span>, <span class="term-purple">midnight</span>, or <span class="term-success">aurora</span> — via the toggler in the navbar ↑',
        '…or type <span class="term-accent">themes dark</span> to change right here ✨'
      ]
    };

    let termBusy = false;

    function termPrint(htmlLines, done) {
      let i = 0;
      const promptLine = termBody.querySelector('.terminal-line:last-of-type');
      function next() {
        if (i < htmlLines.length) {
          const p = document.createElement('p');
          p.className = 'terminal-line term-output';
          p.innerHTML = htmlLines[i];
          termBody.insertBefore(p, promptLine);
          termBody.scrollTop = termBody.scrollHeight;
          i++;
          setTimeout(next, 120);
        } else { done(); }
      }
      next();
    }

    function termLine(text) {
      const p = document.createElement('p');
      p.className = 'terminal-line';
      p.innerHTML = `<span class="term-prompt">guest@portfolio:~$</span> <span class="term-cmd">${text}</span>`;
      termBody.insertBefore(p, termBody.querySelector('.terminal-line:last-of-type'));
      termBody.scrollTop = termBody.scrollHeight;
    }

    function termFocus() {
      if (window.innerWidth > 768) termInput.focus();
    }

    // Live echo of the typed command before pressing Enter
    function termEcho() {
      const inputLine = termBody.querySelector('.term-input');
      const caret = termBody.querySelector('.term-caret');
      if (inputLine) {
        inputLine.textContent = termInput.value;
        if (caret) inputLine.appendChild(caret);
        termBody.scrollTop = termBody.scrollHeight;
      }
    }
    termInput.addEventListener('input', termEcho);
    termInput.addEventListener('focus', () => termBody.closest('.terminal-window').classList.add('focused'));
    termInput.addEventListener('blur', () => termBody.closest('.terminal-window').classList.remove('focused'));

    termWindow.addEventListener('click', termFocus);
    termWindow.addEventListener('wheel', e => {
      if (window.innerWidth > 768) {
        termBody.scrollTop += e.deltaY;
        e.preventDefault();
      }
    }, { passive: false });

    termInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !termBusy) {
        const raw = termInput.value.trim();
        if (!raw) return;
        termInput.value = '';
        termEcho();
        termLine(raw);
        const parts = raw.toLowerCase().split(/\s+/);
        const base = parts[0];
        const arg = parts[1];

        let out;
        if (base === 'clear') {
          const promptLine = termBody.querySelector('.terminal-line:last-of-type');
          termBody.querySelectorAll('.terminal-line').forEach(l => { if (l !== promptLine) l.remove(); });
          return;
        }
        if (termCmd[base]) {
          out = termCmd[base]();
        } else if (arg && ['dark', 'midnight', 'aurora'].includes(arg)) {
          document.documentElement.setAttribute('data-theme', arg);
          localStorage.setItem('mu-theme', arg);
          themeBtns.forEach(b => b.classList.toggle('active', b.dataset.theme === arg));
          out = [`<span class="term-success">✓ Theme switched to "${arg}"</span>`];
        } else {
          out = [`<span class="term-error">✗ Command not found: ${base}</span>`, 'Type <span class="term-accent">help</span> to see available commands.'];
        }
        termBusy = true;
        termPrint(out, () => { termBusy = false; termFocus(); });
      }
    });
  }

  // ─── CODE SNIPPET TYPEWRITER ───
  const codeEls = document.querySelectorAll('.code-snippet__body code');
  const codeCursor = document.getElementById('codeCursor');
  if (codeEls.length && codeCursor) {
    const snippet = document.querySelector('.code-snippet');
    const codeBody = snippet.querySelector('.code-snippet__body');
    let codeStarted = false;

    function animateCode() {
      if (codeStarted) return;
      codeStarted = true;
      codeCursor.classList.add('active');
      codeEls.forEach((line, i) => {
        setTimeout(() => {
          line.classList.add('typed');
        }, 350 + i * 260);
      });
      // Reposition cursor to follow last typed line
      let ln = 1;
      const cursorMove = setInterval(() => {
        if (ln >= codeEls.length) { clearInterval(cursorMove); codeCursor.classList.remove('active'); return; }
        const lineEl = codeEls[ln - 1];
        codeCursor.style.top = (lineEl.offsetTop + 14) + 'px';
        codeCursor.style.left = (lineEl.offsetLeft + lineEl.offsetWidth + 8) + 'px';
        ln++;
      }, 260);
    }

    if (G && ST) {
      const t = gsap.utils.toArray('.code-snippet')[0];
      if (t) {
        ScrollTrigger.create({ trigger: t, start: 'top 80%', once: true, onEnter: animateCode });
      }
    }
    setTimeout(() => { if (!codeStarted && window.scrollY > 200) animateCode(); }, 3500);
    // Fallback trigger
    window.addEventListener('scroll', () => {
      if (!codeStarted && snippet) {
        const r = snippet.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.85) animateCode();
      }
    }, { passive: true });
  }

  // ─── SKILLS ORBIT TOOLTIP ───
  const orbitTooltip = document.getElementById('orbitTooltip');
  const skillOrbit = document.getElementById('skillOrbit');
  const orbitNodes = document.querySelectorAll('.orbit-node');
  if (orbitTooltip) {
    const tipName = orbitTooltip.querySelector('.orbit-tooltip__name');
    const tipBar = orbitTooltip.querySelector('.orbit-tooltip__bar i');
    orbitNodes.forEach(n => {
      n.addEventListener('mouseenter', () => {
        tipName.textContent = n.dataset.skill + ' · ' + n.dataset.level + '%';
        // Anchor the tooltip to the hovered node (which orbits around)
        requestAnimationFrame(() => { tipBar.style.width = n.dataset.level + '%'; });
        if (skillOrbit) {
          const ob = skillOrbit.getBoundingClientRect();
          const nb = n.getBoundingClientRect();
          orbitTooltip.style.left = (nb.left - ob.left + nb.width / 2) + 'px';
          orbitTooltip.style.top = (nb.top - ob.top + nb.height / 2) + 'px';
          orbitTooltip.style.transform = 'translate(-50%, calc(-100% - 14px))';
        }
        orbitTooltip.classList.add('show');
      });
      n.addEventListener('mouseleave', () => {
        orbitTooltip.classList.remove('show');
        tipBar.style.width = '0%';
      });
    });
  }

  // ─── ENHANCED PROJECT CARDS (View → + preview shimmer) ───
  document.querySelectorAll('.bento-card').forEach(card => {
    if (card.querySelector('.bento-card__preview')) return;
    const preview = document.createElement('div');
    preview.className = 'bento-card__preview';
    preview.innerHTML = '<div class="bento-card__preview-img"></div>';
    card.appendChild(preview);

    const bottom = card.querySelector('.bento-card__bottom');
    if (bottom && !card.classList.contains('bento-card--coming')) {
      const view = document.createElement('a');
      view.className = 'bento-card__view';
      view.href = '#';
      view.addEventListener('click', e => e.preventDefault());
      view.innerHTML = 'View Project <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
      bottom.appendChild(view);
    }
  });

  // ─── SCROLL-DRIVEN SECTION TRANSITION ───
  const stmt = document.querySelector('.statement-section');
  if (stmt && ST) {
    ScrollTrigger.create({
      trigger: stmt,
      start: 'top 90%',
      end: 'top 40%',
      scrub: true,
      onUpdate: self => {
        stmt.classList.toggle('pull', self.progress < 0.35);
      }
    });
  }

  // ─── AI CHAT ASSISTANT ("Ask MU") ───
  const chatWidget = document.getElementById('chatWidget');
  const chatFab = document.getElementById('chatFab');
  const chatPanel = document.getElementById('chatPanel');
  const chatClose = document.getElementById('chatClose');
  const chatBody = document.getElementById('chatBody');
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');

  if (chatWidget && chatBody) {
    function toggleChat(open) {
      const willOpen = typeof open === 'boolean' ? open : !chatWidget.classList.contains('open');
      chatWidget.classList.toggle('open', willOpen);
      if (willOpen) setTimeout(() => chatInput.focus(), 500);
    }
    chatFab.addEventListener('click', () => toggleChat());
    chatClose.addEventListener('click', () => toggleChat(false));
    chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });
    chatSend.addEventListener('click', sendChat);

    // Quick suggestion chips
    document.querySelectorAll('.chat-quick span').forEach(chip => {
      chip.addEventListener('click', () => sendChat(chip.textContent.trim()));
    });

    function addMsg(text, who) {
      const msg = document.createElement('div');
      msg.className = 'chat-msg chat-msg--' + who;
      const bubble = document.createElement('div');
      bubble.className = 'chat-msg__bubble';
      bubble.innerHTML = text;
      msg.appendChild(bubble);
      chatBody.appendChild(msg);
      chatBody.scrollTop = chatBody.scrollHeight;
      return msg;
    }

    function showTyping() {
      const msg = document.createElement('div');
      msg.className = 'chat-msg chat-msg--bot';
      msg.innerHTML = '<div class="chat-msg__bubble"><span class="chat-msg__typing"><i></i><i></i><i></i></span></div>';
      chatBody.appendChild(msg);
      chatBody.scrollTop = chatBody.scrollHeight;
      return msg;
    }

    function sendChat(prefill) {
      const raw = (prefill || chatInput.value).trim();
      if (!raw) return;
      chatInput.value = '';
      if (!prefill) addMsg(raw, 'user');
      const typing = showTyping();
      setTimeout(() => {
        typing.remove();
        addMsg(botReply(raw), 'bot');
      }, 700 + Math.random() * 600);
    }

    // ─── Chatbot Knowledge Base ───
    function botReply(q) {
      const t = q.toLowerCase();
      const has = (...w) => w.some(k => t.includes(k));

      if (has('hi', 'hello', 'hey', 'salam')) return "Hey there! 👋 I'm MU's digital brain. Ask me about his <b>skills</b>, <b>projects</b>, <b>experience</b>, or if he's <b>available</b> for work!";
      if (has('who', 'name', 'about mu', 'about uzair')) return "I'm the AI assistant for <b>Muhammad Uzair</b> — Full-Stack Developer & AI Integrator from Karachi 🇵🇰. He builds full-stack products end-to-end and experiments with AI to make them genuinely useful. ✨";
      if (has('hire', 'freelance', 'available', 'availability', 'price', 'rate', 'pricing')) return "Yes! ✅ Uzair is <b>open for freelance & collaboration</b> right now. Use the <b>contact form</b> below, or the WhatsApp button. He responds fast! ⚡";
      if (has('best project', 'favorite', 'featured', 'magnum', 'showcase')) return "That's <b>Magnum AI</b> 🚀 — an AI agent integrating ML models into a functional web environment. Stack: <b>Python · APIs · React</b>.";
      if (has('e-commerce', 'ecommerce', 'oneup', 'shop')) return "<b>oneup fits</b> is a full-stack e-commerce build 🛍️ — deployed and market-ready. Stack: <b>Node.js · Express · PostgreSQL · React</b>.";
      if (has('fintech', 'banking', 'finance', 'simulator')) return "<b>FinTech Transaction Simulator</b> 💳 — secure banking simulation with strong OOP principles. Built in <b>Python</b>.";
      if (has('usaid', 'video', 'ui/ux')) return "<b>Usaid Shaikh Portfolio</b> 🎬 — custom UI/UX for a video professional. Coming soon to the Work section!";
      if (has('zenith', 'zenithflow', 'analytics', 'dashboard')) return "<b>Zenithflow</b> 📈 — a real-time analytics platform that turns raw product data into clear, actionable dashboards. Stack: <b>React · Node.js · PostgreSQL</b>.";
      if (has('aura', 'aurastream', 'stream', 'media', 'music')) return "<b>Aurastream</b> 🌌 — an AI-assisted media discovery experience that learns from user behaviour to surface personalized content. Stack: <b>Python · AI · REST APIs</b>.";
      if (has('react')) return "Absolutely! ✅ Uzair works with <b>React</b> daily (~<b>92%</b>) — components, hooks, state management, SPAs.";
      if (has('python')) return "<b>Python</b> is a core strength (~<b>92%</b>) — AI integration, back-end logic, and intelligent agents. 🐍";
      if (has('node', 'backend', 'express')) return "<b>Node.js + Express</b> (~<b>90%</b>) — REST APIs, auth, server architecture. Paired with <b>PostgreSQL + Prisma</b>.";
      if (has('javascript', 'js')) return "Vanilla <b>JS (ES6+)</b> (~<b>90%</b>) — this entire portfolio is hand-rolled JS. The cursor, loader, particles? All custom. ✍️";
      if (has('css', 'tailwind', 'design')) return "Frontend is his playground 🎨 — <b>Tailwind</b> (~88%), <b>HTML5</b> (~95%), <b>Figma</b> (~78%).";
      if (has('ai', 'ml', 'model', 'gpt', 'llm')) return "AI Integration is his specialty ⚡ — bridging ML models and AI agents into real web products. See <b>Magnum AI</b>!";
      if (has('database', 'postgres', 'sql', 'prisma')) return "<b>PostgreSQL</b> (~85%) and <b>Prisma ORM</b> (~82%) — schema design, queries, migrations. 🗄️";
      if (has('experience', 'years')) return "<b>3+ years</b> of coding, <b>10+ projects</b>, <b>5+ clients</b>. Currently diving deeper into AI-driven development. 📈";
      if (has('location', 'where', 'karachi')) return "📍 Based in <b>Karachi, Pakistan</b>. Remote-friendly and open to global collaborations. 🌍";
      if (has('contact', 'email', 'whatsapp')) return "Head to the <b>Contact</b> section: form + WhatsApp button. Uzair is <b>open for freelance</b> right now! 📬";
      if (has('skill', 'tech', 'stack')) return "Core stack: <b>React · Node.js · Express · PostgreSQL · Python · C++ · Tailwind</b>. Plus AI integration and system design. 💪";
      if (has('thank')) return "You're welcome! 💙 Anything else? Skills, projects, availability — I'm all ears. 😄";
      if (has('bye')) return "Catch you later! 👋 Contact form is right there if you want to work with Uzair. Have a great day!";

      return "Good question! 🤔 Try asking about <b>skills</b>, <b>projects</b>, <b>availability</b>, or specific tech like <b>React</b>, <b>Python</b>, or <b>AI</b>. Or check the sections below!";
    }
  }

  // ─── SMART SKILL MATCHING (contact form) ───
  const projType = document.getElementById('formType');
  const smartSuggest = document.getElementById('smartMatchSuggest');
  if (projType && smartSuggest) {
    const SKILL_MAP = {
      'Web App': ['React', 'Node.js', 'PostgreSQL', 'REST APIs'],
      'AI Integration': ['Python', 'AI Agents', 'LLM APIs', 'Prompt Design'],
      'E-commerce': ['Node.js', 'PostgreSQL', 'Payment APIs', 'Prisma ORM'],
      'UI/UX': ['Figma', 'Tailwind CSS', 'Motion Design', 'Prototyping'],
      'API': ['Express', 'PostgreSQL', 'Auth/JWT', 'System Design']
    };

    projType.addEventListener('change', () => {
      const skills = SKILL_MAP[projType.value] || [];
      smartSuggest.innerHTML = '';
      if (!skills.length) { smartSuggest.classList.remove('show'); return; }
      skills.forEach((s, i) => {
        const tag = document.createElement('span');
        tag.className = 'smart-match__tag';
        tag.style.animationDelay = (i * 0.05) + 's';
        tag.innerHTML = '<em>✓</em> ' + s;
        smartSuggest.appendChild(tag);
      });
      smartSuggest.classList.add('show');
    });
  }

}); // end DOMContentLoaded

