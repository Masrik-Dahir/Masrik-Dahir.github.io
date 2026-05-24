/**
 * games-symbols.js — paints arcade-themed symbols behind each .game-card
 * on games.html. Re-rolls on every hover. Symbols are designed at 24×24
 * and rendered SMALL + DENSE so the card reads as a rich pixel-arcade
 * sticker sheet rather than a sparse decorator strip.
 *
 * Mix of crisp outline glyphs (gamepad, joystick, sword) and bold
 * pixel-art fills (Space Invader, Pac-Man ghost, 8-bit heart, 1-up
 * mushroom, gem, 8-bit star, skull). Pixel icons use solid fills so
 * the rainbow gradient through the mask reads as solid coloured
 * 8-bit chunks instead of thin lines.
 *
 * Logic in js/hover-symbols-engine.js.
 */
(function () {
    if (typeof window.setupHoverSymbols !== 'function') return;

    // All symbols draw onto a 24×24 box. `%23000` = `#000` URL-encoded
    // for the data-URL mask. Use single quotes only — the engine wraps
    // the whole SVG in double quotes.
    const SYMBOLS = [
        // ── Pixel-art (solid fills, read as crisp 8-bit blocks) ──

        // Space Invader (squid)
        "<path d='M6 6h2v2H6z M16 6h2v2h-2z M8 8h2v2H8z M14 8h2v2h-2z M6 10h12v2H6z M4 12h2v2H4z M8 12h2v2H8z M14 12h2v2h-2z M18 12h2v2h-2z M4 14h16v2H4z M6 16h2v2H6z M10 16h4v2h-4z M16 16h2v2h-2z M4 18h2v2H4z M10 18h1v2h-1z M13 18h1v2h-1z M18 18h2v2h-2z' fill='%23000'/>",

        // Pac-Man ghost (Blinky shape)
        "<path d='M6 6h12v12H6z M4 8h2v10H4z M18 8h2v10h-2z M5 18h2v2H5z M9 18h2v2H9z M13 18h2v2h-2z M17 18h2v2h-2z' fill='%23000'/><circle cx='10' cy='11' r='1.6' fill='%23fff'/><circle cx='14' cy='11' r='1.6' fill='%23fff'/>",

        // Pac-Man (with mouth)
        "<path d='M12 3a9 9 0 1 0 7.5 13.95L12 12V3z M21 12L12 12 19.5 7.05A9 9 0 0 1 21 12z' fill='%23000'/>",

        // 8-bit heart
        "<path d='M4 6h4v2H4z M10 6h4v2h-4z M16 6h4v2h-4z M2 8h8v2H2z M14 8h8v2h-8z M4 10h16v2H4z M6 12h12v2H6z M8 14h8v2H8z M10 16h4v2h-4z M11 18h2v2h-2z' fill='%23000'/>",

        // 1-up mushroom
        "<path d='M8 4h8v2H8z M5 6h3v2H5z M16 6h3v2h-3z M4 8h6v4H4z M14 8h6v4h-6z M10 8h4v2h-4z M11 10h2v2h-2z M4 12h16v2H4z M7 14h10v6H7z' fill='%23000'/><path d='M8 16h2v2H8z M14 16h2v2h-2z' fill='%23fff'/>",

        // Gem / diamond
        "<path d='M8 4h8v2H8z M5 6h3v2H5z M16 6h3v2h-3z M3 8h4v2H3z M17 8h4v2h-4z M7 8h10v2H7z M5 10h14v2H5z M7 12h10v2H7z M9 14h6v2H9z M11 16h2v2h-2z' fill='%23000'/>",

        // 8-bit star
        "<path d='M11 3h2v4h-2z M9 5h2v2H9z M13 5h2v2h-2z M3 9h6v2H3z M15 9h6v2h-6z M9 9h6v4H9z M7 11h2v2H7z M15 11h2v2h-2z M5 13h4v2H5z M15 13h4v2h-4z M9 13h2v6H9z M13 13h2v6h-2z M11 13h2v4h-2z M9 19h2v2H9z M13 19h2v2h-2z M7 19h2v2H7z M15 19h2v2h-2z' fill='%23000'/>",

        // Skull
        "<path d='M7 5h10v2H7z M5 7h2v8H5z M17 7h2v8h-2z M7 15h2v2H7z M11 15h2v2h-2z M15 15h2v2h-2z M9 17h2v2H9z M13 17h2v2h-2z' fill='%23000'/><circle cx='10' cy='11' r='1.8' fill='%23fff'/><circle cx='14' cy='11' r='1.8' fill='%23fff'/>",

        // Coin (gold-style, $ inside)
        "<circle cx='12' cy='12' r='9' fill='%23000'/><path d='M11 6h2v12h-2z M9 8h6v2H9z M9 14h6v2H9z' fill='%23fff'/>",

        // Lightning bolt (filled)
        "<path d='M14 3L4 14h6l-2 7L20 9h-7z' fill='%23000'/>",

        // Crown
        "<path d='M3 8l3 8h12l3-8-5 4-4-7-4 7z M3 18h18v2H3z' fill='%23000'/>",

        // Bomb (round + fuse + spark)
        "<circle cx='11' cy='14' r='7' fill='%23000'/><path d='M15 7l2-2 M17 4l2 0 0 2 M14 6l2-1' stroke='%23000' stroke-width='1.6' fill='none' stroke-linecap='round'/><circle cx='19' cy='5' r='1.2' fill='%23000'/>",

        // Key
        "<circle cx='7' cy='12' r='4' fill='none' stroke='%23000' stroke-width='2.2'/><path d='M11 12h11 M18 12v3 M22 12v4' stroke='%23000' stroke-width='2.2' fill='none' stroke-linecap='round'/>",

        // UFO / saucer
        "<ellipse cx='12' cy='14' rx='9' ry='3' fill='%23000'/><path d='M7 12a5 4 0 0 1 10 0z' fill='%23000'/><circle cx='3' cy='18' r='1' fill='%23000'/><circle cx='21' cy='18' r='1' fill='%23000'/><circle cx='12' cy='20' r='1' fill='%23000'/>",

        // Rocket
        "<path d='M12 2c3 2 5 6 5 11l-2 2v3l-3-2-3 2v-3l-2-2c0-5 2-9 5-11z M9 11a3 3 0 0 1 6 0' stroke='%23000' stroke-width='1.6' fill='%23000'/><circle cx='12' cy='10' r='1.5' fill='%23fff'/><path d='M7 18l-2 4 4-2 M17 18l2 4-4-2' fill='%23000'/>",

        // ── Outline arcade glyphs (kept thin + crisp at small sizes) ──

        // Joystick (ball + stick + base)
        "<circle cx='12' cy='5' r='2.5' fill='%23000'/><path d='M12 7.5v8 M5 21h14 M8 17l-2 4 M16 17l2 4' stroke='%23000' stroke-width='2' fill='none' stroke-linecap='round'/>",

        // Gamepad / NES controller
        "<rect x='3' y='9' width='18' height='8' rx='1' fill='%23000'/><rect x='5.5' y='11' width='4' height='4' fill='%23fff'/><circle cx='14' cy='13' r='1' fill='%23fff'/><circle cx='17' cy='15' r='1' fill='%23fff'/><rect x='11' y='12' width='3' height='1' fill='%23fff'/>",

        // Sword
        "<path d='M3 21l4-2L17 7l4-4-4 0L7 13l-2 4z M14 10l3 3 M5 17l2 2' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round' stroke-linecap='round'/>",

        // Shield (filled)
        "<path d='M12 3l8 3v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z' fill='%23000'/><path d='M10 12l2 2 4-4' stroke='%23fff' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/>",

        // Target / bullseye
        "<circle cx='12' cy='12' r='9' fill='none' stroke='%23000' stroke-width='2'/><circle cx='12' cy='12' r='5' fill='none' stroke='%23000' stroke-width='2'/><circle cx='12' cy='12' r='1.6' fill='%23000'/>",

        // Dice (5-side, fits a 24×24 box cleanly)
        "<rect x='4' y='4' width='16' height='16' rx='2.5' fill='none' stroke='%23000' stroke-width='2'/><circle cx='8.5' cy='8.5' r='1.3' fill='%23000'/><circle cx='15.5' cy='8.5' r='1.3' fill='%23000'/><circle cx='12' cy='12' r='1.3' fill='%23000'/><circle cx='8.5' cy='15.5' r='1.3' fill='%23000'/><circle cx='15.5' cy='15.5' r='1.3' fill='%23000'/>",

        // Arcade cabinet (with screen + slot)
        "<path d='M6 3h12v18H6z' fill='none' stroke='%23000' stroke-width='2'/><rect x='8' y='5' width='8' height='6' fill='%23000'/><path d='M9 14h6 M9 16h6 M10 19h4' stroke='%23000' stroke-width='1.6' stroke-linecap='round'/>",

        // Trophy
        "<path d='M8 4h8v6a4 4 0 0 1-8 0z M4 5h4v3a2 2 0 0 1-4 0z M16 5h4v3a2 2 0 0 1-4 0z M10 13h4v3h-4z M7 18h10v2H7z' fill='%23000'/>",

        // Lightning bolt (alt outline)
        "<path d='M13 3L5 14h6l-2 7 9-11h-6z' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>"
    ];

    window.setupHoverSymbols({
        cardSelector:    '#gallery-view .game-card',
        classPrefix:     'gsym-',
        sheetId:         'games-symbol-tiles',
        symbols:         SYMBOLS,
        selectorPrefix:  'body.polish #gallery-view ',
        cellSize:        22,             // tighter grid → smaller, denser icons
        symbolScale:     0.78,           // crisper at small sizes
        bulletMarkerWidth: 0,
        cardPad:         3
    });
})();
