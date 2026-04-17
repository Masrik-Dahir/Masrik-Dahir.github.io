// Scroll-triggered reveal for landing page
(function() {
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.lang-card, .feat, .cards-section h2, .cards-section .section-sub, .features-section h3').forEach(function(el) {
    obs.observe(el);
  });
})();

// Animated counter for hero stats
(function() {
  var nums = document.querySelectorAll('.stat-num[data-target]');
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      obs.unobserve(el);
      var target = el.dataset.target;
      var isNum = /^\d+$/.test(target.replace(/,/g,''));
      if (!isNum) return;
      var end = parseInt(target.replace(/,/g,''), 10);
      var dur = 1800;
      var start = performance.now();
      function tick(now) {
        var p = Math.min((now - start) / dur, 1);
        var ease = 1 - Math.pow(1 - p, 3);
        var val = Math.round(ease * end);
        el.textContent = val.toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  nums.forEach(function(n) { obs.observe(n); });
})();
