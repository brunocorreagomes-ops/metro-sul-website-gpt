(() => {
  const root = document.documentElement;
  const canvas = document.getElementById('signalCanvas');
  const ctx = canvas?.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  let arcs = [];
  const mouse = { x: 0.62, y: 0.34, active: false };

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
      /* Meta Pixel base code, loaded only when a real pixel ID is present. */
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
          window.fbq('trackCustom', 'OutboundClick', {
            label,
            url: link.href
          });
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
    seedField();
  }

  function seedField() {
    const count = Math.round(Math.min(150, Math.max(68, width / 11)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      px: Math.random() * width,
      py: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.8 + 0.35,
      tone: Math.random() > 0.57 ? 'cyan' : Math.random() > 0.36 ? 'orange' : 'violet',
      phase: Math.random() * Math.PI * 2,
      pull: 0.006 + Math.random() * 0.012
    }));

    arcs = Array.from({ length: 9 }, (_, index) => ({
      radius: Math.min(width, height) * (0.13 + index * 0.035),
      tilt: -0.65 + index * 0.14,
      speed: 0.000065 + index * 0.000014,
      alpha: 0.15 - index * 0.009,
      offset: Math.random() * Math.PI * 2
    }));
  }

  function color(tone, alpha = 1) {
    if (tone === 'cyan') return `rgba(56, 217, 255, ${alpha})`;
    if (tone === 'violet') return `rgba(160, 92, 255, ${alpha})`;
    return `rgba(255, 75, 23, ${alpha})`;
  }

  function drawBackground() {
    const gradient = ctx.createRadialGradient(width * 0.58, height * 0.42, 0, width * 0.58, height * 0.42, Math.max(width, height) * 0.72);
    gradient.addColorStop(0, 'rgba(56, 217, 255, 0.08)');
    gradient.addColorStop(0.34, 'rgba(160, 92, 255, 0.035)');
    gradient.addColorStop(1, 'rgba(5, 7, 19, 0.0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  function drawOrbit(t) {
    const cx = width * (0.68 + (mouse.x - 0.5) * 0.05);
    const cy = height * (0.42 + (mouse.y - 0.5) * 0.05);
    const core = Math.min(width, height) * 0.18;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.000045);

    arcs.forEach((arc, index) => {
      ctx.save();
      ctx.rotate(arc.offset + t * arc.speed);
      ctx.beginPath();
      ctx.ellipse(0, 0, arc.radius * 1.42, arc.radius * (0.32 + index * 0.012), arc.tilt, 0, Math.PI * 2);
      ctx.strokeStyle = index % 3 === 1 ? `rgba(255,75,23,${arc.alpha})` : `rgba(56,217,255,${arc.alpha})`;
      ctx.lineWidth = index % 4 === 0 ? 1.25 : 0.7;
      ctx.stroke();
      ctx.restore();
    });

    for (let i = 0; i < 6; i += 1) {
      const start = t * 0.00042 + i * 1.05;
      ctx.beginPath();
      ctx.arc(0, 0, core * (0.7 + i * 0.18), start, start + Math.PI * (0.32 + i * 0.04));
      ctx.strokeStyle = i % 2 ? 'rgba(255,75,23,.24)' : 'rgba(56,217,255,.3)';
      ctx.lineWidth = i % 2 ? 2.2 : 1.2;
      ctx.shadowColor = i % 2 ? 'rgba(255,75,23,.55)' : 'rgba(56,217,255,.55)';
      ctx.shadowBlur = 18;
      ctx.stroke();
    }

    const pulse = 0.5 + Math.sin(t * 0.002) * 0.5;
    const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, core * 0.55);
    coreGradient.addColorStop(0, `rgba(255,255,255,${0.18 + pulse * 0.08})`);
    coreGradient.addColorStop(0.32, 'rgba(56,217,255,.18)');
    coreGradient.addColorStop(1, 'rgba(255,75,23,0)');
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(0, 0, core * 0.56, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawSignalBeams(t) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const columns = Math.floor(width / 34);
    for (let i = 0; i < columns; i += 1) {
      const x = i * 34 + Math.sin(i * 1.72 + t * 0.0005) * 18;
      const y = ((t * 0.018 + i * 53) % (height + 180)) - 90;
      const length = 60 + Math.sin(i * 2.1) * 38;
      const grad = ctx.createLinearGradient(x, y, x + 18, y + length);
      grad.addColorStop(0, 'rgba(56,217,255,0)');
      grad.addColorStop(0.5, i % 5 === 0 ? 'rgba(255,75,23,.12)' : 'rgba(56,217,255,.11)');
      grad.addColorStop(1, 'rgba(160,92,255,0)');
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.sin(t * 0.001 + i) * 20, y + length);
      ctx.strokeStyle = grad;
      ctx.lineWidth = i % 7 === 0 ? 1.3 : 0.65;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawParticles(t) {
    const attractorA = { x: width * 0.68, y: height * 0.42 };
    const attractorB = { x: width * (0.28 + (mouse.x - 0.5) * 0.08), y: height * (0.72 + (mouse.y - 0.5) * 0.06) };

    particles.forEach((p, index) => {
      p.px = p.x;
      p.py = p.y;
      p.phase += 0.008;

      const target = index % 4 === 0 ? attractorB : attractorA;
      const dx = target.x - p.x;
      const dy = target.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = Math.min(1.2, 80 / dist) * p.pull;

      p.vx += (dx / dist) * force + Math.sin(p.phase + t * 0.0007) * 0.006;
      p.vy += (dy / dist) * force + Math.cos(p.phase + t * 0.0006) * 0.006;
      p.vx *= 0.986;
      p.vy *= 0.986;
      p.x += p.vx + (mouse.x - 0.5) * 0.035;
      p.y += p.vy + (mouse.y - 0.5) * 0.025;

      if (p.x < -40 || p.x > width + 40 || p.y < -40 || p.y > height + 40) {
        p.x = Math.random() * width;
        p.y = Math.random() * height;
        p.px = p.x;
        p.py = p.y;
        p.vx = (Math.random() - 0.5) * 0.25;
        p.vy = (Math.random() - 0.5) * 0.25;
      }

      const alpha = 0.16 + Math.sin(t * 0.002 + p.phase) * 0.06;
      ctx.beginPath();
      ctx.moveTo(p.px, p.py);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = color(p.tone, alpha * 0.8);
      ctx.lineWidth = p.r * 0.68;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = color(p.tone, alpha + 0.08);
      ctx.fill();
    });
  }

  function render(time = 0) {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    drawBackground();
    drawSignalBeams(time);
    drawParticles(time);
    drawOrbit(time);
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
    }, { threshold: 0.13, rootMargin: '0px 0px -40px 0px' });
    elements.forEach((el) => observer.observe(el));
  }

  function initTilt() {
    if (reducedMotion) return;
    document.querySelectorAll('[data-tilt]').forEach((el) => {
      el.addEventListener('pointermove', (event) => {
        const rect = el.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg) translateY(-4px)`;
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
        el.style.transform = `translate(${x * 0.075}px, ${y * 0.105}px)`;
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
