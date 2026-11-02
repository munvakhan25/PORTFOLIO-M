// Elements
const modal = document.getElementById('resumeModal');
const openButtons = document.querySelectorAll('[data-open-resume]');
const closeButtons = document.querySelectorAll('[data-close-resume]');
const printButtons = document.querySelectorAll('[data-print-resume]');
const menuToggle = document.querySelector('.menu-toggle');
const themeToggle = document.querySelector('.theme-toggle');
const nav = document.querySelector('.main-nav');
const topbar = document.querySelector('.topbar');
const yearSpan = document.getElementById('year');
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.main-nav a')];
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

let lastFocusedElement = null;

function setTheme(theme, persist = false) {
  const isDark = theme === 'dark';
  document.body.dataset.theme = isDark ? 'dark' : 'light';

  if (themeToggle) {
    const nextTheme = isDark ? 'light' : 'dark';
    themeToggle.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
    themeToggle.setAttribute('title', `Switch to ${nextTheme} theme`);
    themeToggle.setAttribute('aria-pressed', String(isDark));
  }

  if (themeColorMeta) {
    themeColorMeta.content = isDark ? '#101622' : '#e6ecf4';
  }

  if (persist) {
    try {
      window.localStorage.setItem('pmk-portfolio-theme', isDark ? 'dark' : 'light');
    } catch (error) {
      console.warn('Theme preference could not be saved.', error);
    }
  }
}

if (themeToggle) {
  try {
    const savedTheme = window.localStorage.getItem('pmk-portfolio-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') setTheme(savedTheme);
  } catch (error) {
    console.warn('Saved theme preference could not be read.', error);
  }

  themeToggle.addEventListener('click', () => {
    setTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark', true);
  });
}

// Dynamic copyright year
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Resume Modal
const printResume = new URLSearchParams(window.location.search).has('print-resume');

if (printResume && modal) {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('print-resume');
}

function openResume() {
  lastFocusedElement = document.activeElement;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const closeBtn = modal.querySelector('button[data-close-resume]');
  if (closeBtn) closeBtn.focus();
}

function closeResume() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
}

openButtons.forEach((button) => button.addEventListener('click', openResume));
closeButtons.forEach((button) => button.addEventListener('click', closeResume));
printButtons.forEach((button) => button.addEventListener('click', () => {
  document.body.classList.add('print-resume');
  window.print();
}));

window.addEventListener('afterprint', () => {
  if (!printResume) document.body.classList.remove('print-resume');
});

// Mobile Navigation Toggle
function closeMobileMenu() {
  if (nav && nav.classList.contains('open')) {
    nav.classList.remove('open');
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.textContent = '☰';
    }
  }
}

if (menuToggle && nav) {
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.textContent = isOpen ? '×' : '☰';
  });

  nav.querySelectorAll('a, button').forEach((item) => {
    item.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('click', (e) => {
    if (nav.classList.contains('open') && !nav.contains(e.target) && e.target !== menuToggle) {
      closeMobileMenu();
    }
  });
}

// Global Keyboard Handler (Escape key)
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (modal && modal.classList.contains('open')) {
      closeResume();
    } else if (nav && nav.classList.contains('open')) {
      closeMobileMenu();
    }
  }
});

// Quick Panel Scroll Buttons
document.querySelectorAll('[data-scroll]').forEach((button) => {
  button.addEventListener('click', () => {
    const target = document.getElementById(button.dataset.scroll);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Topbar background styling on scroll
function handleTopbarScroll() {
  if (!topbar) return;
  if (window.scrollY > 30) {
    topbar.classList.add('scrolled');
  } else {
    topbar.classList.remove('scrolled');
  }
}

// Active Nav Link Spy on Scroll
function updateActiveNav() {
  if (!sections.length || !navLinks.length) return;

  // If near the top, mark Home as active
  if (window.scrollY < 120) {
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === '#home');
    });
    return;
  }

  // If at or near bottom of document, mark Contact as active
  const scrollTotal = document.documentElement.scrollHeight;
  const scrollPos = window.innerHeight + window.scrollY;
  if (scrollPos >= scrollTotal - 100) {
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === '#contact');
    });
    return;
  }

  // Find section in view
  const triggerPoint = window.scrollY + 180;
  let currentId = '';

  for (let i = sections.length - 1; i >= 0; i--) {
    const section = sections[i];
    if (section.offsetTop <= triggerPoint) {
      currentId = section.id;
      break;
    }
  }

  if (currentId) {
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
    });
  }
}

// Scroll listener
window.addEventListener('scroll', () => {
  handleTopbarScroll();
  updateActiveNav();
}, { passive: true });

// Initial run
handleTopbarScroll();
updateActiveNav();

// One-time hero sequence: signal, data structures, then identity reveal.
const hero = document.querySelector('.hero');
const sequenceCanvas = document.getElementById('hero-sequence-canvas');
const sequenceLabel = document.getElementById('sequence-label');
const sequenceSkip = document.querySelector('.sequence-skip');
const sequenceOverlay = sequenceCanvas && sequenceCanvas.closest('.hero-sequence');

if (hero && sequenceCanvas && sequenceLabel && sequenceSkip) {
  const sequenceContext = sequenceCanvas.getContext('2d');

  if (sequenceContext) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rawDuration = prefersReducedMotion ? 1200 : 1700;
    const structureDuration = prefersReducedMotion ? 1000 : 1600;
    const revealDuration = prefersReducedMotion ? 1200 : 1500;
    const settleDuration = prefersReducedMotion ? 500 : 800;
    const revealStart = rawDuration + structureDuration;
    const settleStart = revealStart + revealDuration;
    const totalDuration = settleStart + settleDuration;
    const random = (seed) => {
      const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
      return value - Math.floor(value);
    };
    const particles = Array.from({ length: prefersReducedMotion ? 48 : 92 }, (_, index) => ({
      startX: random(index + 1) * 0.9 + 0.05,
      startY: random(index + 101) * 0.62 + 0.2,
      targetX: 0.09 + random(index + 201) * 0.52,
      targetY: 0.31 + random(index + 301) * 0.24,
      radius: random(index + 401) * 1.5 + 0.8,
      green: index % 5 === 0
    }));

    let canvasWidth = 0;
    let canvasHeight = 0;
    let animationFrame = 0;
    let startedAt = 0;
    let pausedAt = 0;
    let hasStarted = false;
    let finished = false;

    function resizeSequenceCanvas() {
      const bounds = hero.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      canvasWidth = bounds.width;
      canvasHeight = bounds.height;
      sequenceCanvas.width = Math.round(canvasWidth * scale);
      sequenceCanvas.height = Math.round(canvasHeight * scale);
      sequenceContext.setTransform(scale, 0, 0, scale, 0, 0);
    }

    function getSequencePalette() {
      if (document.body.dataset.theme === 'dark') {
        return {
          signal: '#53ffd0',
          signalGlow: '#00e5ff',
          signalHead: '#c2ffe8',
          signalHeadGlow: '#36ffc0',
          structureStroke: 'rgba(0, 229, 255, 0.64)',
          structureFill: 'rgba(0, 229, 255, 0.11)',
          structureGlow: 'rgba(0, 229, 255, 0.5)',
          greenPoint: '#5dff9e',
          bluePoint: '#9afaff',
          greenParticle: '#62ff9f',
          blueParticle: '#70f5ff'
        };
      }

      return {
        signal: '#087f8c',
        signalGlow: '#0f766e',
        signalHead: '#0f766e',
        signalHeadGlow: '#0f766e',
        structureStroke: 'rgba(8, 94, 115, 0.82)',
        structureFill: 'rgba(8, 94, 115, 0.12)',
        structureGlow: 'rgba(8, 94, 115, 0.22)',
        greenPoint: '#147d52',
        bluePoint: '#176b8a',
        greenParticle: '#147d52',
        blueParticle: '#176b8a'
      };
    }

    function drawSignal(progress, time, opacity = 1) {
      const palette = getSequencePalette();
      const endX = canvasWidth * progress;
      const middleY = canvasHeight * 0.5;
      sequenceContext.save();
      sequenceContext.globalAlpha = opacity;
      sequenceContext.beginPath();

      for (let x = 0; x <= endX; x += 3) {
        const beat = (x / Math.max(canvasWidth, 1) * 4 + 0.18) % 1;
        const qrs = Math.exp(-Math.pow((beat - 0.5) / 0.018, 2)) * 76
          - Math.exp(-Math.pow((beat - 0.477) / 0.012, 2)) * 19
          - Math.exp(-Math.pow((beat - 0.535) / 0.014, 2)) * 27;
        const softPulse = Math.exp(-Math.pow((beat - 0.28) / 0.05, 2)) * 9
          + Math.exp(-Math.pow((beat - 0.72) / 0.09, 2)) * 13;
        const noise = Math.sin(x * 0.11 + time * 0.008) * 1.5
          + Math.sin(x * 0.023 + time * 0.003) * 3;
        const y = middleY - qrs - softPulse - noise;

        if (x === 0) sequenceContext.moveTo(x, y);
        else sequenceContext.lineTo(x, y);
      }

      sequenceContext.strokeStyle = palette.signal;
      sequenceContext.lineWidth = 2;
      sequenceContext.shadowBlur = document.body.dataset.theme === 'dark' ? 18 : 8;
      sequenceContext.shadowColor = palette.signalGlow;
      sequenceContext.stroke();
      sequenceContext.restore();

      if (endX > 0) {
        const headX = Math.min(endX, canvasWidth);
        sequenceContext.beginPath();
        sequenceContext.arc(headX, middleY, 3, 0, Math.PI * 2);
        sequenceContext.fillStyle = palette.signalHead;
        sequenceContext.shadowBlur = document.body.dataset.theme === 'dark' ? 22 : 10;
        sequenceContext.shadowColor = palette.signalHeadGlow;
        sequenceContext.fill();
        sequenceContext.shadowBlur = 0;
      }
    }

    function drawStructures(progress, opacity = 1) {
      const palette = getSequencePalette();
      const eased = 1 - Math.pow(1 - progress, 3);
      const unit = Math.min(canvasWidth / 1000, 1);
      const centerY = canvasHeight * 0.51;
      sequenceContext.save();
      sequenceContext.globalAlpha = opacity;
      sequenceContext.lineWidth = 1;
      sequenceContext.strokeStyle = palette.structureStroke;
      sequenceContext.fillStyle = palette.structureFill;
      sequenceContext.shadowBlur = document.body.dataset.theme === 'dark' ? 12 : 5;
      sequenceContext.shadowColor = palette.structureGlow;

      const barBase = centerY + 68 * unit;
      const barHeights = [34, 58, 43, 82, 65, 98];
      barHeights.forEach((height, index) => {
        const x = canvasWidth * 0.15 + index * 17 * unit;
        const barHeight = height * unit * eased;
        sequenceContext.fillRect(x, barBase - barHeight, 9 * unit, barHeight);
        sequenceContext.strokeRect(x, barBase - barHeight, 9 * unit, barHeight);
      });

      const plotX = canvasWidth * 0.48;
      const plotY = centerY - 43 * unit;
      const plotWidth = 154 * unit;
      const plotHeight = 96 * unit;
      sequenceContext.strokeRect(plotX, plotY, plotWidth * eased, plotHeight * eased);
      for (let row = 1; row < 4; row++) {
        const y = plotY + row * plotHeight / 4;
        sequenceContext.beginPath();
        sequenceContext.moveTo(plotX, y);
        sequenceContext.lineTo(plotX + plotWidth * eased, y);
        sequenceContext.stroke();
      }
      for (let column = 1; column < 4; column++) {
        const x = plotX + column * plotWidth / 4;
        sequenceContext.beginPath();
        sequenceContext.moveTo(x, plotY);
        sequenceContext.lineTo(x, plotY + plotHeight * eased);
        sequenceContext.stroke();
      }

      const points = Array.from({ length: 8 }, (_, index) => ({
        x: canvasWidth * 0.79 + random(index + 501) * 0.13 * canvasWidth,
        y: centerY - 45 * unit + random(index + 601) * 90 * unit
      }));
      points.forEach((point, index) => {
        if (index > 0) {
          sequenceContext.beginPath();
          sequenceContext.moveTo(points[index - 1].x, points[index - 1].y);
          sequenceContext.lineTo(point.x, point.y);
          sequenceContext.stroke();
        }
        sequenceContext.beginPath();
        sequenceContext.arc(point.x, point.y, 3 * unit * eased, 0, Math.PI * 2);
        sequenceContext.fillStyle = index % 3 === 0 ? palette.greenPoint : palette.bluePoint;
        sequenceContext.fill();
      });
      sequenceContext.restore();
    }

    function drawConvergingParticles(progress) {
      const palette = getSequencePalette();
      const eased = 1 - Math.pow(1 - progress, 3);
      sequenceContext.save();
      sequenceContext.globalAlpha = 0.95 - progress * 0.35;

      particles.forEach((particle) => {
        const x = canvasWidth * (
          particle.startX + (particle.targetX - particle.startX) * eased
        );
        const y = canvasHeight * (
          particle.startY + (particle.targetY - particle.startY) * eased
        );
        sequenceContext.beginPath();
        sequenceContext.arc(x, y, particle.radius, 0, Math.PI * 2);
        sequenceContext.fillStyle = particle.green ? palette.greenParticle : palette.blueParticle;
        sequenceContext.shadowBlur = document.body.dataset.theme === 'dark' ? 10 : 4;
        sequenceContext.shadowColor = sequenceContext.fillStyle;
        sequenceContext.fill();
      });

      sequenceContext.restore();
    }

    function finishSequence() {
      if (finished) return;
      finished = true;
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', resizeSequenceCanvas);
      hero.classList.remove('is-sequencing');
      hero.removeAttribute('data-stage');
      sequenceOverlay.classList.add('is-settled');
      sequenceSkip.remove();
      window.setTimeout(() => sequenceOverlay.remove(), 850);
    }

    function animateSequence(now) {
      if (finished) return;
      const elapsed = now - startedAt;
      sequenceContext.clearRect(0, 0, canvasWidth, canvasHeight);

      if (elapsed < rawDuration) {
        hero.dataset.stage = '1';
        sequenceLabel.textContent = '01 / RAW SIGNAL';
        drawSignal(elapsed / rawDuration, elapsed);
      } else if (elapsed < revealStart) {
        hero.dataset.stage = '2';
        sequenceLabel.textContent = '02 / STRUCTURING DATA';
        drawSignal(1, elapsed, 1 - (elapsed - rawDuration) / structureDuration);
        drawStructures((elapsed - rawDuration) / structureDuration);
      } else if (elapsed < settleStart) {
        hero.dataset.stage = '3';
        sequenceLabel.textContent = '03 / SYNTHESIZING IDENTITY';
        const progress = (elapsed - revealStart) / revealDuration;
        drawStructures(1, 1 - progress);
        drawConvergingParticles(progress);
      } else if (elapsed < totalDuration) {
        hero.dataset.stage = '4';
        sequenceLabel.textContent = '04 / SYSTEM ONLINE';
      } else {
        finishSequence();
        return;
      }

      animationFrame = window.requestAnimationFrame(animateSequence);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        if (hasStarted && !pausedAt) pausedAt = performance.now();
        window.cancelAnimationFrame(animationFrame);
        return;
      }

      if (pausedAt) {
        startedAt += performance.now() - pausedAt;
        pausedAt = 0;
      } else if (hasStarted) {
        return;
      } else {
        startedAt = performance.now();
        hasStarted = true;
      }
      if (!finished) animationFrame = window.requestAnimationFrame(animateSequence);
    }

    resizeSequenceCanvas();
    hero.classList.add('is-sequencing');
    sequenceSkip.addEventListener('click', finishSequence);
    window.addEventListener('resize', resizeSequenceCanvas, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    if (document.visibilityState === 'visible') {
      startedAt = performance.now();
      hasStarted = true;
      animationFrame = window.requestAnimationFrame(animateSequence);
    }
  } else {
    sequenceSkip.remove();
    sequenceOverlay.remove();
  }
} else if (sequenceSkip) {
  sequenceSkip.remove();
  if (sequenceOverlay) sequenceOverlay.remove();
}
