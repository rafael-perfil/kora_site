/* Kora Hub — shared site enhancements
 * - Smooth scroll for anchor links (no scrollIntoView)
 * - Header gets a "scrolled" class when window scrolls past 40px
 * - Scroll reveal animations via IntersectionObserver
 * - Animated number counters for metric values
 * - Integration category filter (v3)
 * - Hero bar chart grow-in animation (v3)
 * - Chat message stagger reveal (v2)
 * - Mobile menu toggle (auto-injected if header.site exists with nav)
 * - Logo subtle glow on hover
 */
(function () {
  'use strict';

  // ---- 1. Inject shared CSS ----
  const css = `
    /* Scroll reveal */
    .reveal { opacity: 0; transform: translateY(24px); transition: opacity .9s cubic-bezier(.16,.84,.28,1), transform .9s cubic-bezier(.16,.84,.28,1); will-change: opacity, transform; }
    .reveal.is-visible { opacity: 1; transform: translateY(0); }
    .reveal-delay-1 { transition-delay: .06s; }
    .reveal-delay-2 { transition-delay: .12s; }
    .reveal-delay-3 { transition-delay: .18s; }
    .reveal-delay-4 { transition-delay: .24s; }

    /* Header scrolled state */
    header.site { transition: box-shadow .3s ease, background .3s ease, padding .3s ease; }
    header.site.scrolled { box-shadow: 0 10px 30px rgba(0,0,0,.35); }

    /* Logo glow on hover */
    .logo-center img, .logo-top img, .foot-brand img, .ft-brand img {
      transition: filter .4s ease, transform .4s ease;
    }
    .logo-center:hover img, .logo-top:hover img {
      filter: drop-shadow(0 0 14px rgba(159,197,240,.5));
    }

    /* Pulsing dot for "online" indicators */
    @keyframes kora-pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.4); opacity: 0.6; }
    }
    .dot-r, .badge::before, .eyebrow .dot {
      animation: kora-pulse 2.4s ease-in-out infinite;
    }

    /* Animated bar chart on first paint */
    .dash-chart .bar, .d-bars > div {
      transform-origin: bottom;
      transform: scaleY(0);
      transition: transform .9s cubic-bezier(.16,.84,.28,1);
    }
    .dash-chart.is-visible .bar, .d-bars.is-visible > div {
      transform: scaleY(1);
    }

    /* Integration filter — hidden state */
    .integ-card.filter-hidden {
      opacity: 0; transform: scale(.95);
      pointer-events: none;
      max-height: 0; padding: 0; margin: 0; border: 0;
      overflow: hidden;
      transition: opacity .3s, transform .3s;
    }

    /* Mobile menu drawer */
    .kora-mobile-toggle {
      display: none;
      width: 40px; height: 40px;
      background: transparent;
      border: 1px solid rgba(159,197,240,.15);
      border-radius: 10px;
      color: inherit;
      cursor: pointer;
      align-items: center; justify-content: center;
    }
    .kora-mobile-toggle svg { width: 18px; height: 18px; }
    .kora-mobile-drawer {
      position: fixed; inset: 0;
      background: rgba(7, 16, 31, 0.96);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      z-index: 100;
      display: none;
      flex-direction: column;
      padding: 80px 28px 32px;
      opacity: 0;
      transition: opacity .25s ease;
    }
    .kora-mobile-drawer.open { display: flex; opacity: 1; }
    .kora-mobile-drawer a {
      color: #E8EDF7;
      text-decoration: none;
      font-size: 22px;
      padding: 16px 0;
      border-bottom: 1px solid rgba(159,197,240,.08);
      font-weight: 500;
    }
    .kora-mobile-close {
      position: absolute; top: 18px; right: 22px;
      width: 40px; height: 40px;
      background: transparent;
      border: 1px solid rgba(159,197,240,.15);
      border-radius: 10px;
      color: #E8EDF7; cursor: pointer;
      display: grid; place-items: center;
    }
    @media (max-width: 960px) {
      .kora-mobile-toggle { display: inline-flex; }
      /* Keep logo centered on mobile by overriding the per-page mobile grid */
      header.site .inner, header.site .h-inner {
        grid-template-columns: auto 1fr auto !important;
        gap: 12px !important;
      }
      header.site .logo-center, header.site .logo-top {
        justify-self: center !important;
      }
    }

    /* Hero chat message stagger (v2) */
    .chat-frame .chat-msg, .wa-phone .wa-msg, .hp-chat .hp-msg {
      opacity: 0;
      transform: translateY(8px);
      animation: kora-msg-in .5s cubic-bezier(.2,.7,.2,1) forwards;
    }
    .chat-frame .chat-msg:nth-child(2),
    .wa-phone .wa-msg:nth-child(2),
    .hp-chat .hp-msg:nth-child(1) { animation-delay: .2s; }
    .chat-frame .chat-msg:nth-child(3),
    .wa-phone .wa-msg:nth-child(3),
    .hp-chat .hp-msg:nth-child(2) { animation-delay: .55s; }
    .chat-frame .chat-msg:nth-child(4),
    .wa-phone .wa-msg:nth-child(4),
    .hp-chat .hp-msg:nth-child(3) { animation-delay: .9s; }
    .chat-frame .chat-msg:nth-child(5),
    .wa-phone .wa-msg:nth-child(5),
    .hp-chat .hp-msg:nth-child(4) { animation-delay: 1.25s; }
    .chat-frame .chat-msg:nth-child(6),
    .wa-phone .wa-msg:nth-child(6) { animation-delay: 1.6s; }
    @keyframes kora-msg-in {
      to { opacity: 1; transform: translateY(0); }
    }
    .chat-frame .typing { opacity: 0; animation: kora-msg-in .5s cubic-bezier(.2,.7,.2,1) forwards; animation-delay: 1.95s; }
    .chat-frame .typing span {
      animation: kora-typing 1.2s infinite;
    }
    .chat-frame .typing span:nth-child(2) { animation-delay: .15s; }
    .chat-frame .typing span:nth-child(3) { animation-delay: .3s; }
    @keyframes kora-typing {
      0%, 60%, 100% { opacity: .3; transform: translateY(0); }
      30% { opacity: 1; transform: translateY(-2px); }
    }

    /* Respect reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .reveal, .reveal.is-visible { opacity: 1; transform: none; transition: none; }
      .dash-chart .bar, .d-bars > div { transform: scaleY(1); transition: none; }
      .chat-frame .chat-msg, .wa-phone .wa-msg, .hp-chat .hp-msg { opacity: 1; transform: none; animation: none; }
      .dot-r, .badge::before, .eyebrow .dot, .chat-frame .typing span { animation: none; }
    }
  `;
  const styleEl = document.createElement('style');
  styleEl.id = 'kora-runtime-css';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ---- 2. Smooth scroll for anchor links ----
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href === '#' || href.length < 2) return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const headerH = (document.querySelector('header.site')?.offsetHeight || 0) + 12;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH;
    window.scrollTo({ top, behavior: 'smooth' });
    // Close mobile menu if open
    document.querySelector('.kora-mobile-drawer')?.classList.remove('open');
  });

  // ---- 3. Header scrolled state ----
  const header = document.querySelector('header.site');
  if (header) {
    const updateHeader = () => {
      if (window.scrollY > 40) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  // ---- 4. Scroll reveal ----
  const revealSelectors = [
    '[data-reveal]',
    '.hero-text', '.hero-visual', '.dash-mock', '.hero-product',
    '.feat', '.feat-block',
    '.step', '.how-step',
    '.metric', '.metric-card', '.num-cell',
    '.case-card', '.case-card-sm', '.case-feature', '.case-c',
    '.plan', '.plan-card',
    '.pillar-card', '.integ-card', '.integ-cell',
    '.about-grid > *',
    '.section-head',
    '.cta-card',
    '.dash-chart', '.d-bars',
  ];
  const revealEls = document.querySelectorAll(revealSelectors.join(','));
  revealEls.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));

    // Also animate bar charts when they enter viewport
    document.querySelectorAll('.dash-chart, .d-bars').forEach(el => io.observe(el));
  } else {
    // Fallback: reveal everything
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // ---- 5. Animated number counters ----
  const parseNumberFromText = (text) => {
    // Extract first number (handles +312%, R$ 184k, 2.1×, R$ 1.497, etc.)
    const match = text.replace(/\./g, '').match(/([+\-−]?[\d,]+(?:\.\d+)?)/);
    if (!match) return null;
    const num = parseFloat(match[1].replace(',', '.').replace('−', '-').replace('+', ''));
    return isFinite(num) ? num : null;
  };

  const animateCounter = (el, targetNum, originalText, duration = 1400) => {
    const startNum = 0;
    const startTime = performance.now();
    const isPercent = originalText.includes('%');
    const hasKsuffix = /\dk/i.test(originalText);
    const hasX = originalText.includes('×') || originalText.includes('x');
    const hasMillion = /\dM/i.test(originalText);
    const hasPlus = originalText.includes('+');
    const hasMinus = originalText.includes('−') || originalText.startsWith('-');
    const isDecimal = /\d\.\d/.test(originalText) && !originalText.includes('R$');
    const hasReais = originalText.includes('R$');

    const formatValue = (n) => {
      let v = n;
      if (hasMinus) v = -v;
      let str;
      if (isDecimal) {
        str = v.toFixed(1);
      } else {
        str = Math.round(v).toLocaleString('pt-BR');
      }
      let prefix = '';
      let suffix = '';
      if (hasReais) prefix = 'R$ ';
      if (hasPlus && !hasMinus) prefix = '+' + prefix;
      if (hasMinus) prefix = '−' + prefix.replace('−', '');
      if (hasPercent) suffix = '%';
      if (hasKsuffix) suffix = 'k';
      if (hasMillion) suffix = 'M+';
      if (hasX) suffix = '×';
      return prefix + str + suffix;
    };

    const tick = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = startNum + (Math.abs(targetNum) - startNum) * eased;
      el.textContent = formatValue(cur);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = originalText;
    };
    requestAnimationFrame(tick);
  };

  const counterSelectors = [
    '.metric .big',
    '.metric-card .v',
    '.num-cell .big',
    '.case-c .case-stat .v',
    '.case-feature .visual-pad .stat-pad .v',
    '.ab-st .v',
  ];
  const counters = document.querySelectorAll(counterSelectors.join(','));
  counters.forEach(el => {
    const original = el.textContent.trim();
    const num = parseNumberFromText(original);
    if (num === null || original.toLowerCase().includes('custom')) return;
    el.dataset.koraTarget = String(num);
    el.dataset.koraOriginal = original;
  });

  if ('IntersectionObserver' in window) {
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = parseFloat(el.dataset.koraTarget);
        const original = el.dataset.koraOriginal;
        if (!isNaN(target) && original) {
          animateCounter(el, target, original);
        }
        counterIO.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(el => { if (el.dataset.koraTarget) counterIO.observe(el); });
  }

  // ---- 6. Integration category filter (v3) ----
  const catTabs = document.querySelectorAll('.cat-tab');
  if (catTabs.length) {
    const integCards = document.querySelectorAll('.integ-card');
    // Add data-cat to each card based on its .cat text
    integCards.forEach(card => {
      const catText = card.querySelector('.cat')?.textContent?.toLowerCase() || '';
      let category = 'todas';
      if (catText.includes('canal')) category = 'canais';
      else if (catText.includes('marketplace')) category = 'marketplaces';
      else if (catText.includes('erp')) category = 'erps';
      else if (catText.includes('plataforma')) category = 'plataformas';
      else if (catText.includes('sob demanda')) category = 'all-always';
      card.dataset.cat = category;
    });

    catTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        catTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const label = tab.textContent.trim().toLowerCase();
        integCards.forEach(card => {
          const cat = card.dataset.cat;
          const show = (label === 'todas') || (cat === label) || (cat === 'all-always');
          if (show) card.classList.remove('filter-hidden');
          else card.classList.add('filter-hidden');
        });
      });
    });
  }

  // ---- 7. Mobile menu toggle ----
  if (header) {
    const navLeft = header.querySelector('nav.left, .h-nav.left');
    const navRight = header.querySelector('nav.right, .h-nav.right');
    const allNavLinks = [
      ...(navLeft ? Array.from(navLeft.querySelectorAll('a')) : []),
      ...(navRight ? Array.from(navRight.querySelectorAll('a')) : []),
    ].filter(a => a.getAttribute('href')?.startsWith('#'));

    if (allNavLinks.length) {
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'kora-mobile-toggle';
      toggleBtn.setAttribute('aria-label', 'Menu');
      toggleBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round"/></svg>';

      const drawer = document.createElement('div');
      drawer.className = 'kora-mobile-drawer';
      drawer.innerHTML = '<button class="kora-mobile-close" aria-label="Fechar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M6 6l12 12M6 18L18 6" stroke-linecap="round"/></svg></button>';
      allNavLinks.forEach(link => {
        const clone = link.cloneNode(true);
        clone.classList.remove('pill-cta', 'nav-cta');
        drawer.appendChild(clone);
      });

      // Insert toggle as a SIBLING of navLeft (not child) so it's visible
      // even when navLeft has display:none on mobile.
      const inner = header.querySelector('.h-inner, .inner');
      if (navLeft && navLeft.parentNode) {
        navLeft.parentNode.insertBefore(toggleBtn, navLeft);
      } else if (inner) {
        inner.insertBefore(toggleBtn, inner.firstChild);
      }
      document.body.appendChild(drawer);

      toggleBtn.addEventListener('click', () => drawer.classList.add('open'));
      drawer.querySelector('.kora-mobile-close').addEventListener('click', () => drawer.classList.remove('open'));
    }
  }

  // ---- 8. Mark up year in footer ----
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // ---- 9. Hero form: gentle feedback (v3) ----
  document.querySelectorAll('.hero-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const btn = form.querySelector('button');
      if (!input || !btn) return;
      const oldText = btn.textContent;
      btn.textContent = '✓ Recebido';
      btn.style.background = '#4ADE80';
      btn.style.color = '#06101F';
      input.value = '';
      setTimeout(() => {
        btn.textContent = oldText;
        btn.style.background = '';
        btn.style.color = '';
      }, 2400);
    });
  });

})();
