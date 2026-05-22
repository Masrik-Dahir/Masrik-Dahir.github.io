/**
 * academia-symbols.js — paints a card-sized canvas of educational symbols
 * (graduation cap, open book, pencil, ruler, atom, flask, apple, globe,
 * pi, microscope, calculator, abacus, beaker, lightbulb) behind each
 * .w3-card on academia.html. Re-rolls on every hover, avoiding text /
 * image / bullet zones.
 *
 * All logic lives in js/hover-symbols-engine.js — this file just supplies
 * the academia-themed symbol library and selector config.
 */
(function () {
    if (typeof window.setupHoverSymbols !== 'function') return;

    const SYMBOLS = [
        // graduation cap
        "<path d='M2 9l10-4 10 4-10 4z M6 11v4c0 2 12 2 12 0v-4 M22 9v5' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // open book
        "<path d='M4 5h6c1 0 2 0.6 2 2v13c0-1.4-1-2-2-2H4z M20 5h-6c-1 0-2 0.6-2 2v13c0-1.4 1-2 2-2h6z' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // pencil
        "<path d='M4 20l2-5L17 4l3 3L9 18z M14 7l3 3 M4 20l5-2' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // ruler
        "<path d='M3 17l14-14 4 4L7 21z M7 8l2 2 M10 5l2 2 M13 13l2 2 M16 10l2 2' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // atom (nucleus + 3 orbits)
        "<circle cx='12' cy='12' r='1.5' fill='%23000'/><ellipse cx='12' cy='12' rx='10' ry='4' fill='none' stroke='%23000' stroke-width='1.6'/><ellipse cx='12' cy='12' rx='10' ry='4' transform='rotate(60 12 12)' fill='none' stroke='%23000' stroke-width='1.6'/><ellipse cx='12' cy='12' rx='10' ry='4' transform='rotate(-60 12 12)' fill='none' stroke='%23000' stroke-width='1.6'/>",
        // Erlenmeyer flask
        "<path d='M9 3h6 M10 3v7L5 19a1.5 1.5 0 0 0 1.5 2h11A1.5 1.5 0 0 0 19 19L14 10V3 M7 16h10' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // apple
        "<path d='M12 8c-3 0-5 2-5 5 0 5 3 9 5 9s5-4 5-9c0-3-2-5-5-5z M12 8c0-2 2-3 4-3' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // globe
        "<circle cx='12' cy='12' r='9' fill='none' stroke='%23000' stroke-width='2'/><ellipse cx='12' cy='12' rx='4' ry='9' fill='none' stroke='%23000' stroke-width='2'/><path d='M3 12h18' stroke='%23000' stroke-width='2' fill='none'/>",
        // pi
        "<path d='M4 8h16 M9 8v12 M16 8v9 a2 2 0 0 0 4 0' stroke='%23000' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/>",
        // microscope
        "<path d='M6 22h12 M9 18h6 M10 14h4l-1 4h-2z M11 14V8h2v6 M13 8h4l-2-4z' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // calculator
        "<path d='M5 3h14v18H5z M7 6h10v3H7z M8 12h0.01 M12 12h0.01 M16 12h0.01 M8 16h0.01 M12 16h0.01 M16 16h0.01' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round' stroke-linecap='round'/>",
        // beaker
        "<path d='M6 3h12 M8 3v6L4 19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2L16 9V3 M5 14h14' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // lightbulb
        "<path d='M9 17h6 M10 20h4 M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // scroll (diploma)
        "<path d='M5 5a2 2 0 0 1 2-2h11l-1 2v15a2 2 0 0 1-2 2H5l1-2V5z M5 3v18' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>"
    ];

    window.setupHoverSymbols({
        cardSelector:   '#app_academia .w3-card',
        classPrefix:    'acsym-',
        sheetId:        'academia-symbol-tiles',
        symbols:        SYMBOLS,
        selectorPrefix: 'body.polish #app_academia ',
        cellSize:       38
    });
})();
