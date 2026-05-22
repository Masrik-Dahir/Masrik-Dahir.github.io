/**
 * milestone-symbols.js — paints achievement-themed symbols (trophy,
 * medal, star, ribbon, crown, gem, flag, target, certificate, laurel,
 * sparkle) behind each milestone-btn button on milestone.html. Re-rolls
 * on every hover, avoiding the button's title text, logo image, and
 * description.
 *
 * Logic in js/hover-symbols-engine.js. Milestone widgets are smaller
 * than work/academia cards, so we bump density (lower pxPerSymbol,
 * shorter minDist).
 */
(function () {
    if (typeof window.setupHoverSymbols !== 'function') return;

    const SYMBOLS = [
        // trophy
        "<path d='M7 4h10v3a5 5 0 0 1-10 0z M9 16h6v4H9z M11 12h2v4h-2z M5 6H3v2a3 3 0 0 0 3 3 M19 6h2v2a3 3 0 0 1-3 3' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // medal
        "<circle cx='12' cy='15' r='6' fill='none' stroke='%23000' stroke-width='2'/><path d='M9 9L7 3h10l-2 6 M12 12l1 2h-2z' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // five-pointed star
        "<path d='M12 3l2.5 6 6.5.5-5 4.5 1.5 6.5L12 17l-5.5 3.5 1.5-6.5-5-4.5 6.5-.5z' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // ribbon / rosette
        "<circle cx='12' cy='9' r='5' fill='none' stroke='%23000' stroke-width='2'/><path d='M9 14l-2 8 5-3 5 3-2-8' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // crown
        "<path d='M3 8l3 8h12l3-8-5 4-4-7-4 7z' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // gem / diamond
        "<path d='M6 4h12l4 6-10 12L2 10z M6 4l4 6h4l4-6 M2 10h20' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // flag
        "<path d='M5 3v18 M5 4h12l-3 4 3 4H5' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // target / bullseye
        "<circle cx='12' cy='12' r='9' fill='none' stroke='%23000' stroke-width='2'/><circle cx='12' cy='12' r='5' fill='none' stroke='%23000' stroke-width='2'/><circle cx='12' cy='12' r='1.5' fill='%23000'/>",
        // certificate / scroll
        "<path d='M5 4h14v12H5z M8 20l4-2 4 2v-4H8z M8 8h8 M8 12h6' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // laurel wreath (two leaves)
        "<path d='M8 20c-4-2-6-7-4-12 4 1 7 5 7 10 M16 20c4-2 6-7 4-12-4 1-7 5-7 10 M11 11v9 M13 11v9' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // four-point sparkle
        "<path d='M12 3v6l5 3-5 3v6l-5-3-3 3 3-5-6-1 6-1-3-5 3 3z' stroke='%23000' stroke-width='1.6' fill='none' stroke-linejoin='round'/>",
        // checkmark in circle
        "<circle cx='12' cy='12' r='9' fill='none' stroke='%23000' stroke-width='2'/><path d='M8 12l3 3 5-6' stroke='%23000' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/>",
        // shield
        "<path d='M12 3l7 3v6c0 5-3 8-7 9-4-1-7-4-7-9V6z' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>"
    ];

    window.setupHoverSymbols({
        cardSelector:    '#app_milestone .milestone-btn',
        classPrefix:     'mssym-',
        sheetId:         'milestone-symbol-tiles',
        symbols:         SYMBOLS,
        selectorPrefix:  'body.polish #app_milestone ',
        // Tighter packing — these buttons are 220×280 (~62k px²), so a
        // looser px-per-symbol would leave them sparse.
        pxPerSymbol:     1800,
        minDist:         32,
        bulletMarkerWidth: 0,  // no <li> in these buttons
        symbolScale:     0.85,
        cardPad:         6
    });
})();
