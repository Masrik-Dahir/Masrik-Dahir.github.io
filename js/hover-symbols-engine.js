/**
 * hover-symbols-engine.js — shared engine for the per-page liquid-glass
 * hover effects (work, academia, map, games). Milestone keeps the
 * default polish.css hexagon tile and is NOT routed through this engine.
 *
 * Each page paints a card-sized, non-repeating SVG mask of themed
 * outline symbols. Symbols are laid out on a uniform GRID (line by
 * line, like a hex tessellation) — not scattered randomly — so the
 * result reads as a clean ordered pattern. Cells that overlap any
 * text glyph, image, or bullet marker inside the widget are dropped,
 * so symbols only appear in the white space around content.
 *
 * Every hover re-rolls which symbols sit in which cells (positions are
 * fixed, identities shuffle), so the same card never glistens the same
 * way twice.
 *
 * Per-page files (e.g. js/work-symbols.js) call setupHoverSymbols(...)
 * with the container selector + themed symbol library. The engine
 * handles polling for Vue mount, tagging each widget with a unique
 * class, building the mask, and writing a class-keyed stylesheet that
 * bypasses Vue's vDOM patching of inline `style` attributes (which
 * would otherwise truncate data URLs at the first `;`).
 *
 * Exposes one global: `window.setupHoverSymbols(config)`.
 *
 *   config.cardSelector     — CSS selector for the widgets to paint.
 *   config.classPrefix      — unique per-page class prefix (no `.`).
 *   config.sheetId          — id for the JS-managed <style> element.
 *   config.symbols          — array of outline SVG fragments (24×24).
 *   config.selectorPrefix   — text prepended to the per-card rule for
 *                             specificity (e.g. "body.polish ").
 *   config.cellSize         — grid cell pitch in px (default 38).
 *   config.symbolScale      — scale applied to each 24×24 symbol
 *                             (default ≈ cellSize / 24 * 0.9).
 *   config.textGutter       — padding around text/image exclude rects.
 *   config.bulletMarkerWidth — width of the no-icon strip to the LEFT
 *                              of every <li> for the ::marker bullet.
 *                              0 disables.
 *   config.cardPad          — keep symbols this far from the card edge.
 */
(function () {
    const SYMBOL_BOX = 24;

    window.setupHoverSymbols = function (config) {
        const cardSelector  = config.cardSelector;
        const classPrefix   = config.classPrefix;
        const sheetId       = config.sheetId;
        const SYMBOLS       = config.symbols;
        const selectorPrefix = config.selectorPrefix || '';
        const CELL          = config.cellSize != null ? config.cellSize : 38;
        const SYMBOL_SCALE  = config.symbolScale != null
                                ? config.symbolScale
                                : Math.min(1.4, (CELL / SYMBOL_BOX) * 0.95);
        const SYMBOL_SIZE   = SYMBOL_BOX * SYMBOL_SCALE;
        const TEXT_GUTTER   = config.textGutter != null ? config.textGutter : 3;
        const BULLET_W      = config.bulletMarkerWidth != null
                                ? config.bulletMarkerWidth : 32;
        const CARD_PAD      = config.cardPad != null ? config.cardPad : 4;

        // Builds a non-repeating mask URL sized exactly to the card.
        // Symbols are placed on a regular `CELL × CELL` grid centred
        // inside the card; any cell whose centre would land inside a
        // padded text/image rect is skipped. Outer wrapper uses double
        // quotes; every SVG attribute uses single quotes — a stray
        // double quote inside any symbol would close the url() string
        // and corrupt the mask.
        function buildTile(width, height, excludes) {
            const innerW = width  - CARD_PAD * 2;
            const innerH = height - CARD_PAD * 2;
            const cellsX = Math.max(1, Math.floor(innerW / CELL));
            const cellsY = Math.max(1, Math.floor(innerH / CELL));
            // Centre the grid in the card (any leftover slack from the
            // floor() above is split evenly left/right and top/bottom).
            const startX = CARD_PAD + (innerW - cellsX * CELL) / 2;
            const startY = CARD_PAD + (innerH - cellsY * CELL) / 2;
            const symHalf = SYMBOL_SIZE / 2;
            const fragments = [];
            for (let cy = 0; cy < cellsY; cy++) {
                for (let cx = 0; cx < cellsX; cx++) {
                    const centerX = startX + cx * CELL + CELL / 2;
                    const centerY = startY + cy * CELL + CELL / 2;
                    // Skip cells whose symbol footprint would overlap
                    // a padded text/image/bullet rect.
                    let inText = false;
                    for (let i = 0; i < excludes.length; i++) {
                        const r = excludes[i];
                        if (centerX + symHalf > r.left   - TEXT_GUTTER &&
                            centerX - symHalf < r.right  + TEXT_GUTTER &&
                            centerY + symHalf > r.top    - TEXT_GUTTER &&
                            centerY - symHalf < r.bottom + TEXT_GUTTER) {
                            inText = true;
                            break;
                        }
                    }
                    if (inText) continue;
                    const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                    // 24-unit symbol's local origin is its top-left, so
                    // shift by half SYMBOL_SIZE to centre on (centerX,
                    // centerY) after the scale transform.
                    const tx = centerX - 12 * SYMBOL_SCALE;
                    const ty = centerY - 12 * SYMBOL_SCALE;
                    fragments.push(
                        "<g transform='translate(" + tx.toFixed(1) + "," +
                        ty.toFixed(1) + ") scale(" +
                        SYMBOL_SCALE.toFixed(2) + ")'>" + sym + "</g>"
                    );
                }
            }
            const svg =
                "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 " +
                width + " " + height + "'>" + fragments.join('') + "</svg>";
            return "url(\"data:image/svg+xml;utf8," + svg + "\")";
        }

        // Tight exclusion rects: per-line text-node rects from the Range
        // API (so symbols pack right up to where the glyphs end), plus
        // full image rects, plus a left-side strip for every <li>'s
        // ::marker bullet (the Range walker can't see markers).
        function gatherExcludeRects(card) {
            const cardRect = card.getBoundingClientRect();
            const out = [];
            function push(r) {
                if (!r) return;
                const w = r.right - r.left;
                const h = r.bottom - r.top;
                if (w <= 0 || h <= 0) return;
                out.push({
                    left:   r.left   - cardRect.left,
                    top:    r.top    - cardRect.top,
                    right:  r.right  - cardRect.left,
                    bottom: r.bottom - cardRect.top
                });
            }
            card.querySelectorAll('img').forEach(function (el) {
                push(el.getBoundingClientRect());
            });
            if (BULLET_W > 0) {
                card.querySelectorAll('li').forEach(function (li) {
                    const r = li.getBoundingClientRect();
                    push({
                        left:   r.left - BULLET_W,
                        top:    r.top,
                        right:  r.left + 4,
                        bottom: r.bottom
                    });
                });
            }
            const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT, {
                acceptNode: function (n) {
                    return n.nodeValue && n.nodeValue.trim()
                        ? NodeFilter.FILTER_ACCEPT
                        : NodeFilter.FILTER_REJECT;
                }
            });
            const range = document.createRange();
            let node;
            while ((node = walker.nextNode())) {
                range.selectNodeContents(node);
                const rects = range.getClientRects();
                for (let i = 0; i < rects.length; i++) push(rects[i]);
            }
            return out;
        }

        let sheet = null;
        function ensureSheet() {
            if (sheet) return sheet;
            sheet = document.createElement('style');
            sheet.id = sheetId;
            document.head.appendChild(sheet);
            return sheet;
        }

        const tiles = new Map();   // idx → { url, w, h }
        function renderSheet() {
            const rules = [];
            tiles.forEach(function (t, idx) {
                rules.push(
                    selectorPrefix + '.' + classPrefix + idx + '::before{' +
                    '-webkit-mask-image:' + t.url + ';' +
                    'mask-image:' + t.url + ';' +
                    '-webkit-mask-size:' + t.w + 'px ' + t.h + 'px;' +
                    'mask-size:' + t.w + 'px ' + t.h + 'px;' +
                    '-webkit-mask-repeat:no-repeat;' +
                    'mask-repeat:no-repeat;}'
                );
            });
            ensureSheet().textContent = rules.join('\n');
        }

        function reroll(card, idx) {
            const w = card.offsetWidth;
            const h = card.offsetHeight;
            if (!w || !h) return;
            const excludes = gatherExcludeRects(card);
            tiles.set(idx, { url: buildTile(w, h, excludes), w: w, h: h });
            renderSheet();
        }

        function attach() {
            const cards = document.querySelectorAll(cardSelector);
            if (!cards.length) return false;
            cards.forEach(function (card, idx) {
                const klass = classPrefix + idx;
                if (!card.classList.contains(klass)) card.classList.add(klass);
                if (tiles.has(idx)) return;
                reroll(card, idx);
                card.addEventListener('mouseenter', function () {
                    reroll(card, idx);
                });
            });
            return true;
        }

        // Vue mounts cards asynchronously and may add more after the first
        // paint. Poll for ~12 s; attach() is idempotent.
        const iv = setInterval(attach, 120);
        setTimeout(function () { clearInterval(iv); }, 12000);
    };
})();
