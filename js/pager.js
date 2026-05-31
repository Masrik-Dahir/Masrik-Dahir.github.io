(function () {
    'use strict';

    function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

    function pageNumbersToShow(current, total) {
        if (total <= 7) {
            var arr = [];
            for (var i = 1; i <= total; i++) arr.push(i);
            return arr;
        }
        var set = {};
        set[1] = true;
        set[total] = true;
        set[current] = true;
        if (current - 1 >= 1) set[current - 1] = true;
        if (current + 1 <= total) set[current + 1] = true;
        var sorted = Object.keys(set).map(Number).sort(function (a, b) { return a - b; });
        var out = [];
        for (var j = 0; j < sorted.length; j++) {
            if (j > 0 && sorted[j] - sorted[j - 1] > 1) out.push('…');
            out.push(sorted[j]);
        }
        return out;
    }

    function render(mountEl, opts) {
        if (!mountEl) return { destroy: function () {} };

        var totalItems = opts.totalItems || 0;
        var pageSize = opts.pageSize || 12;
        var totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        var current = clamp(opts.currentPage || 1, 1, totalPages);
        var onChange = typeof opts.onChange === 'function' ? opts.onChange : function () {};

        mountEl.innerHTML = '';
        mountEl.classList.add('md-pager');

        if (totalItems <= pageSize) {
            return { destroy: function () { mountEl.innerHTML = ''; } };
        }

        function btn(label, page, attrs) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'md-pager-btn';
            if (attrs && attrs.active) b.classList.add('is-active');
            if (attrs && attrs.nav) b.classList.add('md-pager-nav');
            if (attrs && attrs.disabled) {
                b.classList.add('is-disabled');
                b.disabled = true;
            }
            b.textContent = label;
            b.setAttribute('aria-label', (attrs && attrs.ariaLabel) || ('Page ' + label));
            if (!b.disabled && page !== current) {
                b.addEventListener('click', function () { onChange(page); });
            }
            return b;
        }

        mountEl.appendChild(btn('‹', current - 1, {
            nav: true,
            disabled: current <= 1,
            ariaLabel: 'Previous page'
        }));

        var pages = pageNumbersToShow(current, totalPages);
        for (var i = 0; i < pages.length; i++) {
            var p = pages[i];
            if (p === '…') {
                var span = document.createElement('span');
                span.className = 'md-pager-ellipsis';
                span.textContent = '…';
                mountEl.appendChild(span);
            } else {
                mountEl.appendChild(btn(String(p), p, { active: p === current }));
            }
        }

        mountEl.appendChild(btn('›', current + 1, {
            nav: true,
            disabled: current >= totalPages,
            ariaLabel: 'Next page'
        }));

        return { destroy: function () { mountEl.innerHTML = ''; } };
    }

    window.MDPager = { render: render };
})();
