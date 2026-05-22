/**
 * map-symbols.js — paints travel-themed symbols (globe, compass, plane,
 * mountain, sun, cloud, ship, suitcase, palm, map pin, camera,
 * passport) behind each .w3-card on map.html. Re-rolls on every hover.
 *
 * Logic in js/hover-symbols-engine.js.
 */
(function () {
    if (typeof window.setupHoverSymbols !== 'function') return;

    const SYMBOLS = [
        // globe
        "<circle cx='12' cy='12' r='9' fill='none' stroke='%23000' stroke-width='2'/><ellipse cx='12' cy='12' rx='4' ry='9' fill='none' stroke='%23000' stroke-width='2'/><path d='M3 12h18' stroke='%23000' stroke-width='2' fill='none'/>",
        // compass (with needle)
        "<circle cx='12' cy='12' r='9' fill='none' stroke='%23000' stroke-width='2'/><path d='M12 6l2 6-2 6-2-6z' fill='none' stroke='%23000' stroke-width='2' stroke-linejoin='round'/>",
        // airplane
        "<path d='M2 12l8-2 3-7 2 0 2 7 6 2 0 2-6 0-2 6 1 3-2 0-3-3-3 3-2 0 1-3-2-6-3 0z' stroke='%23000' stroke-width='1.8' fill='none' stroke-linejoin='round'/>",
        // mountain range
        "<path d='M2 20L8 8l4 6 3-4 7 10z M10 12l2-1' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // sun
        "<circle cx='12' cy='12' r='4' fill='none' stroke='%23000' stroke-width='2'/><path d='M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2 2 M16.4 16.4l2 2 M5.6 18.4l2-2 M16.4 7.6l2-2' stroke='%23000' stroke-width='2'/>",
        // cloud
        "<path d='M7 17h10a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1A3.5 3.5 0 0 0 7 17z' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // ship
        "<path d='M3 16h18l-2 5H5z M12 4v12 M5 16V9h14v7 M9 9h6V4H9z' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // suitcase
        "<path d='M4 8h16v12H4z M9 8V5h6v3 M4 13h16' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // palm tree
        "<path d='M12 22V10 M12 10c-3-4-7-3-9-1 3-1 6 0 8 1-2-3-1-7 1-9-1 3 0 6 1 8-1-2 2-5 6-5-3 1-5 3-5 6 1-2 5-3 7 0-3-1-6 0-9 0z' stroke='%23000' stroke-width='1.6' fill='none' stroke-linejoin='round'/>",
        // map pin
        "<path d='M12 22s-7-7-7-13a7 7 0 0 1 14 0c0 6-7 13-7 13z' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/><circle cx='12' cy='9' r='2.5' fill='none' stroke='%23000' stroke-width='2'/>",
        // camera
        "<path d='M3 8h4l2-3h6l2 3h4v12H3z' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/><circle cx='12' cy='13' r='4' fill='none' stroke='%23000' stroke-width='2'/>",
        // passport
        "<path d='M5 3h14v18H5z M9 7h6 M9 11h6 M12 14a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5z' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round'/>",
        // anchor
        "<circle cx='12' cy='5' r='2' fill='none' stroke='%23000' stroke-width='2'/><path d='M12 7v14 M5 14a7 7 0 0 0 14 0 M8 10h8' stroke='%23000' stroke-width='2' fill='none' stroke-linecap='round'/>",
        // train (subway/tram)
        "<path d='M6 4h12v12H6z M6 4a3 3 0 0 1 6 0 M18 4a3 3 0 0 1-6 0 M4 20l2-4 M20 20l-2-4 M9 10h0.01 M15 10h0.01' stroke='%23000' stroke-width='2' fill='none' stroke-linejoin='round' stroke-linecap='round'/>"
    ];

    // Country cards on map.html aren't inside #app_country (that wrapper
    // only contains the search bar). The cards all live as siblings under
    // .w3-content with the shared class `.animate-on-scroll`, so we key
    // off that.
    window.setupHoverSymbols({
        cardSelector:   '.w3-card.animate-on-scroll',
        classPrefix:    'mapsym-',
        sheetId:        'map-symbol-tiles',
        symbols:        SYMBOLS,
        selectorPrefix: 'body.polish ',
        // tiny travel icons on a tight grid — reads as a faint texture
        cellSize:       22,
        symbolScale:    0.55
    });
})();
