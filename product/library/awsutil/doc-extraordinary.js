/* ═══════════════════════════════════════════════════════════════════════════
   doc-extraordinary.js  —  Premium animation layer for AwsUtil doc pages
   Load with defer. Requires the base Vue app to be present.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 1. Inject background mesh orbs ── */
  function injectMesh() {
    if (document.querySelector('.bg-mesh')) return;
    var mesh = document.createElement('div');
    mesh.className = 'bg-mesh';
    mesh.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 3; i++) {
      var orb = document.createElement('div');
      orb.className = 'orb';
      mesh.appendChild(orb);
    }
    document.body.insertBefore(mesh, document.body.firstChild);
  }

  /* ── 2. Floating particles canvas ── */
  function initParticles() {
    var canvas = document.createElement('canvas');
    canvas.id = 'doc-particles';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(canvas, document.body.firstChild);
    var ctx = canvas.getContext('2d');
    var particles = [];
    var PARTICLE_COUNT = 15;

    var accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#6366f1';

    function hexToRgb(hex) {
      hex = hex.replace('#', '');
      if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
      var n = parseInt(hex, 16);
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }
    var rgb = hexToRgb(accent);

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        o: Math.random() * 0.5 + 0.1
      });
    }

    var raf;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + p.o + ')';
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    // Pause when tab hidden
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) cancelAnimationFrame(raf);
      else draw();
    });
  }


  /* ── 4. Animated stat counters ── */
  function animateCounters() {
    var stats = document.querySelectorAll('.page-hdr .stats strong');
    stats.forEach(function (el) {
      var text = el.textContent.replace(/,/g, '');
      var target = parseInt(text, 10);
      if (isNaN(target) || target === 0) return;
      el.textContent = '0';

      var start = null;
      var duration = 1200;
      function step(ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        // ease-out cubic
        var ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * ease).toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
      }
      // Start when scrolled into view (or if already visible)
      var obs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          requestAnimationFrame(step);
          obs.disconnect();
        }
      }, { threshold: 0.5 });
      obs.observe(el);
    });
  }

  /* ── 5. Keyboard shortcut for search (Ctrl/Cmd + K) ── */
  function initSearchShortcut() {
    var searchInput = document.getElementById('side-search');
    if (!searchInput) return;

    // Add keyboard hint badge
    var wrap = searchInput.parentElement;
    if (wrap && wrap.classList.contains('search-wrap')) {
      var kbd = document.createElement('span');
      kbd.className = 'search-kbd';
      var isMac = /Mac|iPhone|iPad/.test(navigator.platform || '');
      kbd.textContent = isMac ? '\u2318K' : 'Ctrl+K';
      wrap.appendChild(kbd);
    }

    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
      if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.blur();
      }
    });
  }

  /* ── 6. Copy buttons on code blocks ── */
  function getLangLabel() {
    var d = window.AWSUTIL_DATA;
    if (!d) return 'code';
    var map = { python:'python', csharp:'c#', go:'go', java:'java', rust:'rust', typescript:'ts', ruby:'ruby' };
    return map[d.lang] || d.lang || 'code';
  }

  function initCopyButtons() {
    var blocks = document.querySelectorAll('.fn-body pre');
    var langLabel = getLangLabel();
    blocks.forEach(function (pre) {
      if (pre.parentNode && pre.parentNode.classList.contains('pre-wrap')) return;
      // Wrap pre in a container with a toolbar row
      var wrapper = document.createElement('div');
      wrapper.className = 'pre-wrap';
      pre.parentNode.insertBefore(wrapper, pre);

      // Toolbar: dots + lang label + copy button
      var toolbar = document.createElement('div');
      toolbar.className = 'pre-toolbar';

      var dots = document.createElement('div');
      dots.className = 'pre-toolbar-dots';
      dots.innerHTML = '<span></span><span></span><span></span>';

      var lang = document.createElement('span');
      lang.className = 'pre-toolbar-lang';
      lang.textContent = langLabel;

      var btn = document.createElement('button');
      btn.className = 'code-copy-btn';
      btn.textContent = 'Copy';
      btn.addEventListener('click', function () {
        var code = pre.querySelector('code');
        var text = (code || pre).textContent;
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
          }, 1800);
        });
      });

      toolbar.appendChild(dots);
      toolbar.appendChild(lang);
      toolbar.appendChild(btn);
      wrapper.appendChild(toolbar);
      wrapper.appendChild(pre);
    });
  }

  /* ── 7. Active sidebar tracking on scroll ── */
  function initActiveTracking() {
    var sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    var navLinks = sidebar.querySelectorAll('.mod-item > a');
    var sections = [];
    navLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href && href.charAt(0) === '#') {
        var target = document.getElementById(href.substring(1));
        if (target) sections.push({ link: link, target: target });
      }
    });
    if (!sections.length) return;

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var scrollY = window.scrollY + 200;
        var active = null;
        for (var i = sections.length - 1; i >= 0; i--) {
          if (sections[i].target.offsetTop <= scrollY) {
            active = sections[i]; break;
          }
        }
        navLinks.forEach(function (l) { l.classList.remove('active-nav'); });
        if (active) active.link.classList.add('active-nav');
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── 8. MutationObserver: only attach copy buttons to new code blocks ── */
  function watchVueUpdates() {
    var wrapper = document.getElementById('api-docs-wrapper');
    if (!wrapper) return;
    var debounceTimer;
    var mutObs = new MutationObserver(function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        // Only re-run the lightweight, idempotent helper
        initCopyButtons();
      }, 250);
    });
    mutObs.observe(wrapper, { childList: true, subtree: true });
  }

  /* ── 9. Smooth page entrance ── */
  function pageEntrance() {
    var content = document.getElementById('content');
    if (!content) return;
    content.style.opacity = '0';
    content.style.transform = 'translateY(16px)';
    content.style.transition = 'opacity .6s cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.22,1,.36,1)';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
      });
    });
  }

  /* ── Boot everything ── */
  function boot() {
    injectMesh();
    initParticles();
    pageEntrance();
    animateCounters();
    initSearchShortcut();
    initCopyButtons();
    initActiveTracking();
    watchVueUpdates();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      // Slight delay to let Vue mount first
      setTimeout(boot, 350);
    });
  } else {
    setTimeout(boot, 350);
  }
})();
