/**
 * work-symbols.js — paints a card-sized canvas of work-related symbols
 * (briefcase, gear, code brackets, laptop, chart, lightbulb, pen, key,
 * wrench, server, cloud, document, lock, clock, envelope, terminal)
 * behind each .w3-card on work.html. Re-rolls a fresh random
 * arrangement on every hover, avoiding text and bullet zones.
 *
 * All heavy lifting lives in js/hover-symbols-engine.js — this file just
 * supplies the work-themed symbol library and selector config.
 */
(function () {
    if (typeof window.setupHoverSymbols !== 'function') return;

    // Single-quoted SVG attribute values throughout — a stray double
    // quote would close the outer url("...") string. Each symbol is
    // drawn in a 24×24 local viewBox so rotate-about-center (12,12)
    // works uniformly.
    const SYMBOLS = [
        "<path d='M4 8h16v11H4z M9 8V5h6v3' fill='none' stroke='%23000' stroke-width='2' stroke-linejoin='round'/>",
        "<circle cx='12' cy='12' r='4' fill='none' stroke='%23000' stroke-width='2'/><path d='M12 3v2 M12 19v2 M3 12h2 M19 12h2 M5.6 5.6l1.4 1.4 M17 17l1.4 1.4 M5.6 18.4l1.4-1.4 M17 7l1.4-1.4' stroke='%23000' stroke-width='2' fill='none'/>",
        "<path d='M9 7L4 12l5 5 M15 7l5 5-5 5' stroke='%23000' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/>",
        "<path d='M5 6h14v10H5z M3 18h18' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        "<path d='M6 18V10 M12 18V5 M18 18V13 M3 21h18' stroke='%23000' stroke-width='2' fill='none' stroke-linecap='round'/>",
        "<path d='M9 17h6 M10 20h4 M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        "<path d='M4 20l2-5L17 4l3 3L9 18z M14 7l3 3' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        "<circle cx='8' cy='12' r='3.5' fill='none' stroke='%23000' stroke-width='2'/><path d='M11.5 12H22 M19 12v3 M22 12v3' stroke='%23000' stroke-width='2' fill='none'/>",
        "<path d='M14 4a4 4 0 0 0 5 5l2 2-9 9-2-2a4 4 0 0 0-5-5z' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        "<path d='M4 5h16v5H4z M4 14h16v5H4z M7 7.5h0.01 M7 16.5h0.01' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round' stroke-linecap='round'/>",
        "<path d='M7 17h10a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1A3.5 3.5 0 0 0 7 17z' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        "<path d='M6 3h9l4 4v14H6z M15 3v4h4' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        "<path d='M6 11h12v9H6z M9 11V8a3 3 0 0 1 6 0v3' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        "<circle cx='12' cy='12' r='8' fill='none' stroke='%23000' stroke-width='2'/><path d='M12 7v5l3 2' stroke='%23000' stroke-width='2' fill='none' stroke-linecap='round'/>",
        "<path d='M3 6h18v12H3z M3 6l9 7 9-7' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        "<path d='M3 5h18v14H3z M6 9l3 3-3 3 M12 15h6' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round' stroke-linecap='round'/>"
    ];

    window.setupHoverSymbols({
        cardSelector:   '#app_work .w3-card',
        classPrefix:    'wsym-',
        sheetId:        'work-symbol-tiles',
        symbols:        SYMBOLS,
        selectorPrefix: 'body.polish #app_work ',
        cellSize:       38   // structured grid, like milestone's hex tile
    });
})();
