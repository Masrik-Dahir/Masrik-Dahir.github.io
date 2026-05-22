/**
 * games-symbols.js — paints arcade-themed symbols (joystick, controller,
 * dice, ghost, space invader, sword, shield, heart, coin, arrow target,
 * star coin, mushroom) behind each .game-card on games.html. Re-rolls
 * on every hover.
 *
 * Logic in js/hover-symbols-engine.js. Game cards are small thumbnails
 * (~180×220), so density is bumped and symbol scale is reduced.
 */
(function () {
    if (typeof window.setupHoverSymbols !== 'function') return;

    const SYMBOLS = [
        // joystick
        "<circle cx='12' cy='6' r='3' fill='none' stroke='%23000' stroke-width='2'/><path d='M12 9v8 M6 21h12 M9 17l-2 4 M15 17l2 4' stroke='%23000' stroke-width='2' fill='none' stroke-linecap='round'/>",
        // gamepad / controller
        "<path d='M5 8h14a3 3 0 0 1 3 3v4a3 3 0 0 1-5 2l-2-3H9l-2 3a3 3 0 0 1-5-2v-4a3 3 0 0 1 3-3z M7 12h3 M8.5 10.5v3' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round' stroke-linecap='round'/><circle cx='15' cy='11' r='1' fill='%23000'/><circle cx='17' cy='13' r='1' fill='%23000'/>",
        // dice (6-side)
        "<rect x='4' y='4' width='16' height='16' rx='2' fill='none' stroke='%23000' stroke-width='2'/><circle cx='9' cy='9' r='1' fill='%23000'/><circle cx='15' cy='9' r='1' fill='%23000'/><circle cx='12' cy='12' r='1' fill='%23000'/><circle cx='9' cy='15' r='1' fill='%23000'/><circle cx='15' cy='15' r='1' fill='%23000'/>",
        // ghost (pacman-style)
        "<path d='M5 11a7 7 0 0 1 14 0v9l-2-2-2 2-2-2-2 2-2-2-2 2-2-2z' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/><circle cx='10' cy='11' r='1.2' fill='%23000'/><circle cx='14' cy='11' r='1.2' fill='%23000'/>",
        // space invader
        "<path d='M5 6v6h2v2h2v2h6v-2h2v-2h2V6h-2v2h-2V6h-2V4h-2v2H9V4H7v2z M3 14h2v4M21 14h-2v4 M7 18v2h2v-2 M15 18v2h2v-2' stroke='%23000' stroke-width='1.8' fill='none' stroke-linejoin='round'/>",
        // sword
        "<path d='M3 21l4-2L17 7l4-4-4 0L7 13l-2 4z M14 10l3 3 M5 17l2 2' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round' stroke-linecap='round'/>",
        // shield
        "<path d='M12 3l7 3v6c0 5-3 8-7 9-4-1-7-4-7-9V6z' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // heart
        "<path d='M12 21s-7-4-7-10a4 4 0 0 1 7-3 4 4 0 0 1 7 3c0 6-7 10-7 10z' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // coin (circle + dollar)
        "<circle cx='12' cy='12' r='8' fill='none' stroke='%23000' stroke-width='2'/><path d='M12 7v10 M9 9.5h5a1.5 1.5 0 0 1 0 3h-4a1.5 1.5 0 0 0 0 3h6' stroke='%23000' stroke-width='1.6' fill='none' stroke-linecap='round'/>",
        // arrow target
        "<circle cx='12' cy='12' r='9' fill='none' stroke='%23000' stroke-width='2'/><path d='M12 5L5 12l4 0 0 4 4 0 0-4 7-7' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // five-point star
        "<path d='M12 3l2.5 6 6.5.5-5 4.5 1.5 6.5L12 17l-5.5 3.5 1.5-6.5-5-4.5 6.5-.5z' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // mushroom (1-up)
        "<path d='M4 12a8 8 0 0 1 16 0v2H4z M8 14v6h8v-6' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/><circle cx='9' cy='8' r='1.5' fill='%23000'/><circle cx='15' cy='8' r='1.5' fill='%23000'/>",
        // lightning bolt
        "<path d='M13 3L5 14h6l-2 7 9-11h-6z' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // arcade cabinet
        "<path d='M6 3h12v18H6z M8 6h8v6H8z M9 16h6 M9 18h6' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>"
    ];

    window.setupHoverSymbols({
        cardSelector:    '#gallery-view .game-card',
        classPrefix:     'gsym-',
        sheetId:         'games-symbol-tiles',
        symbols:         SYMBOLS,
        selectorPrefix:  'body.polish #gallery-view ',
        cellSize:        30,             // smaller cards, tighter grid
        bulletMarkerWidth: 0,
        cardPad:         4
    });
})();
