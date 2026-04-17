// Ambient floating particles
(function() {
  var container = document.getElementById('sw-particles');
  if (!container) return;
  var colors = ['rgba(59,130,246,.08)','rgba(99,102,241,.06)','rgba(6,182,212,.07)','rgba(16,185,129,.06)','rgba(139,92,246,.05)'];
  for (var i = 0; i < 18; i++) {
    var p = document.createElement('div');
    p.className = 'sw-particle';
    var size = 4 + Math.random() * 14;
    p.style.cssText = 'width:' + size + 'px;height:' + size + 'px;' +
      'left:' + (Math.random() * 100) + '%;' +
      'background:' + colors[i % colors.length] + ';' +
      '--dur:' + (10 + Math.random() * 16) + 's;' +
      '--del:' + (Math.random() * 12) + 's;';
    container.appendChild(p);
  }
})();
