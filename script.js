(() => {
  const root = document.documentElement;
  const canvas = document.getElementById('energyCanvas');
  const ctx = canvas?.getContext('2d', { alpha: true });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  let sparks = [];
  const mouse = { x: 0.63, y: 0.32, active: false };

  function isGoogleId(id) {
    return typeof id === 'string' && /^G-[A-Z0-9]+$/i.test(id) && !id.includes('XXXX');
  }

  function isMetaPixelId(id) {
    return typeof id === 'string' && /^[0-9]{8,}$/.test(id) && !/^0+$/.test(id);
  }

  function initTracking() {
    const config = window.METRO_SUL_TRACKING || {};
    const gaId = config.googleAnalyticsId;
    const metaId = config.metaPixelId;

    if (isGoogleId(gaId)) {
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
      document.head.appendChild(gaScript);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(){ window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', gaId, { anonymize_ip: true });
    }

    if (isMetaPixelId(metaId)) {
      window.fbq = window.fbq || function fbq(){
        window.fbq.callMethod ? window.fbq.callMethod.apply(window.fbq, arguments) : window.fbq.queue.push(arguments);
      };
      if (!window._fbq) window._fbq = window.fbq;
      window.fbq.push = window.fbq;
      window.fbq.loaded = true;
      window.fbq.version = '2.0';
      window.fbq.queue = [];

      const pixelScript = document.createElement('script');
      pixelScript.async = true;
      pixelScript.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(pixelScript);

      window.fbq('init', metaId);
      window.fbq('track', 'PageView');
    }

    document.querySelectorAll('a[href^="http"], a[href^="mailto:"]').forEach((link) => {
      link.addEventListener('click', () => {
        const label = link.textContent.trim().replace(/\s+/g, ' ').slice(0, 80);
        if (window.gtag) {
          window.gtag('event', 'outbound_click', {
            event_category: 'engagement',
            event_label: label,
            link_url: link.href
          });
        }
        if (window.fbq) {
          window.fbq('trackCustom', 'OutboundClick', { label, url: link.href });
        }
      }, { passive: true });
    });
  }

  function resizeCanvas() {
    if (!ctx) return;
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedEnergy();
  }

  function seedEnergy() {
    const count = Math.round(Math.min(220, Math.max(86, width / 8)));
    particles = Array.from({ length: count }, (_, i) => {
      const side = i % 2 === 0 ? 'blue' : 'orange';
      const angle = (side === 'blue' ? Math.PI : 0) + (Math.random() - .5) * Math.PI * .9;
      const radius = Math.min(width, height) * (0.18 + Math.random() * 0.23);
      return {
        side,
        angle,
        radius,
        speed: (side === 'blue' ? -1 : 1) * (0.0007 + Math.random() * 0.0014),
        drift: Math.random() * Math.PI * 2,
        size: Math.random() * 1.9 + .35,
        alpha: .18 + Math.random() * .42,
        tail: 10 + Math.random() * 42,
        orbitJitter: Math.random() * 18
      };
    });

    sparks = Array.from({ length: 44 }, (_, i) => ({
      side: i % 2 ? 'orange' : 'blue',
      angle: Math.random() * Math.PI * 2,
      radius: Math.min(width, height) * (.22 + Math.random() * .25),
      speed: .002 + Math.random() * .003,
      life: Math.random(),
      length: 20 + Math.random() * 76
    }));
  }

  function rgba(side, alpha = 1) {
    return side === 'orange' ? `rgba(255, 106, 0, ${alpha})` : `rgba(55, 216, 255, ${alpha})`;
  }

  function getCenter() {
    const mobile = width < 900;
    return {
      x: width * (mobile ? .50 : .70) + (mouse.x - .5) * (mobile ? 22 : 42),
      y: height * (mobile ? .36 : .43) + (mouse.y - .5) * (mobile ? 18 : 36),
      r: Math.min(width, height) * (mobile ? .24 : .22)
    };
  }

  function drawAtmosphere() {
    const c = getCenter();
    const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, Math.max(width, height) * .72);
    g.addColorStop(0, 'rgba(244,248,255,.055)');
    g.addColorStop(.15, 'rgba(55,216,255,.055)');
    g.addColorStop(.42, 'rgba(255,106,0,.035)');
    g.addColorStop(1, 'rgba(3,5,10,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }

  function drawEnergyRing(t) {
    const c = getCenter();
    const pulse = Math.sin(t * .002) * .5 + .5;

    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate((mouse.x - .5) * .06);
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < 5; i += 1) {
      const r = c.r * (1 + i * .10 + pulse * .012);
      const line = i === 0 ? 3.2 : 1.1;
      const blur = i === 0 ? 24 : 12;

      ctx.beginPath();
      ctx.arc(0, 0, r, Math.PI * .70 + t * .00022 * (i + 1), Math.PI * 1.62 + t * .00018 * (i + 1));
      ctx.strokeStyle = `rgba(55,216,255,${.35 - i * .045})`;
      ctx.lineWidth = line;
      ctx.shadowColor = 'rgba(55,216,255,.65)';
      ctx.shadowBlur = blur;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, r * (1.01 + i * .008), -Math.PI * .32 - t * .0002 * (i + 1), Math.PI * .42 - t * .00018 * (i + 1));
      ctx.strokeStyle = `rgba(255,106,0,${.36 - i * .045})`;
      ctx.lineWidth = line * .92;
      ctx.shadowColor = 'rgba(255,106,0,.68)';
      ctx.shadowBlur = blur;
      ctx.stroke();
    }

    const core = ctx.createRadialGradient(0, 0, 0, 0, 0, c.r * .58);
    core.addColorStop(0, `rgba(244,248,255,${.13 + pulse * .05})`);
    core.addColorStop(.18, 'rgba(55,216,255,.11)');
    core.addColorStop(.54, 'rgba(255,106,0,.055)');
    core.addColorStop(1, 'rgba(3,5,10,0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(0, 0, c.r * .58, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawParticles(t) {
    const c = getCenter();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    particles.forEach((p) => {
      p.angle += p.speed;
      p.drift += .006;
      const sideWeight = p.side === 'orange' ? Math.cos(p.angle) : -Math.cos(p.angle);
      const force = Math.max(0, sideWeight);
      const rr = p.radius + Math.sin(p.drift + t * .0012) * p.orbitJitter + force * 28;
      const x = c.x + Math.cos(p.angle) * rr * (1.04 + Math.sin(p.drift) * .025);
      const y = c.y + Math.sin(p.angle) * rr * (.74 + Math.cos(p.drift) * .035);
      const tx = x - Math.cos(p.angle) * p.tail * (p.side === 'orange' ? 1 : -1) * .22;
      const ty = y - Math.sin(p.angle) * p.tail * .22;
      const a = p.alpha * (.45 + force * .68);

      const grad = ctx.createLinearGradient(tx, ty, x, y);
      grad.addColorStop(0, rgba(p.side, 0));
      grad.addColorStop(1, rgba(p.side, a));
      ctx.strokeStyle = grad;
      ctx.lineWidth = p.size;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, p.size * 1.15, 0, Math.PI * 2);
      ctx.fillStyle = rgba(p.side, a + .08);
      ctx.fill();
    });
    ctx.restore();
  }

  function drawSparks(t) {
    const c = getCenter();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    sparks.forEach((s) => {
      s.angle += s.speed * (s.side === 'orange' ? 1 : -1);
      s.life += .008 + s.speed;
      if (s.life > 1) {
        s.life = 0;
        s.radius = Math.min(width, height) * (.22 + Math.random() * .25);
        s.length = 20 + Math.random() * 76;
      }
      const fade = Math.sin(s.life * Math.PI);
      const x = c.x + Math.cos(s.angle) * s.radius;
      const y = c.y + Math.sin(s.angle) * s.radius * .78;
      const lx = x + Math.cos(s.angle) * s.length * (s.side === 'orange' ? 1 : -1);
      const ly = y + Math.sin(s.angle) * s.length * .46;
      const grad = ctx.createLinearGradient(x, y, lx, ly);
      grad.addColorStop(0, rgba(s.side, .0));
      grad.addColorStop(.35, rgba(s.side, .42 * fade));
      grad.addColorStop(1, rgba(s.side, 0));
      ctx.strokeStyle = grad;
      ctx.lineWidth = .6 + fade * 1.4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(lx, ly);
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawSignalRain(t) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const cols = Math.floor(width / 46);
    for (let i = 0; i < cols; i += 1) {
      const x = i * 46 + Math.sin(i * 1.6 + t * .00055) * 16;
      const y = ((t * .018 + i * 61) % (height + 160)) - 80;
      const len = 42 + Math.sin(i * 2.13) * 32;
      const side = i % 5 === 0 ? 'orange' : 'blue';
      const grad = ctx.createLinearGradient(x, y, x + 12, y + len);
      grad.addColorStop(0, rgba(side, 0));
      grad.addColorStop(.5, rgba(side, .08));
      grad.addColorStop(1, rgba(side, 0));
      ctx.strokeStyle = grad;
      ctx.lineWidth = i % 6 === 0 ? 1.2 : .55;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.sin(i + t * .001) * 12, y + len);
      ctx.stroke();
    }
    ctx.restore();
  }

  function render(time = 0) {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    drawAtmosphere();
    drawSignalRain(time);
    drawEnergyRing(time);
    drawParticles(time);
    drawSparks(time);
    if (!reducedMotion) window.requestAnimationFrame(render);
  }

  function updateMouse(event) {
    mouse.x = event.clientX / window.innerWidth;
    mouse.y = event.clientY / window.innerHeight;
    mouse.active = true;
    root.style.setProperty('--mx', mouse.x.toFixed(4));
    root.style.setProperty('--my', mouse.y.toFixed(4));
  }

  function initReveals() {
    const elements = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -48px 0px' });
    elements.forEach((el) => observer.observe(el));
  }

  function initTilt() {
    if (reducedMotion) return;
    document.querySelectorAll('[data-tilt]').forEach((el) => {
      el.addEventListener('pointermove', (event) => {
        const rect = el.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        el.style.transform = `rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg) translateY(-4px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  function initMagneticButtons() {
    if (reducedMotion) return;
    document.querySelectorAll('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (event) => {
        const rect = el.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * .065}px, ${y * .09}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  function boot() {
    initTracking();
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
    resizeCanvas();
    initReveals();
    initTilt();
    initMagneticButtons();
    if (reducedMotion) render(0);
    else window.requestAnimationFrame(render);
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });
  window.addEventListener('pointermove', updateMouse, { passive: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
