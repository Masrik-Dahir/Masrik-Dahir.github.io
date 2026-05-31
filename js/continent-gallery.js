/**
 * continent-gallery.js - Dynamic template engine for continent/region pages.
 *
 * Reads window.CONTINENT_ID (set by each stub page) and injects:
 *   - Region cards with headers, SVG map containers, and Vue mount points
 *   - Loads SVG maps from map/svg/ via fetch
 *   - Sets up SVG hover/click tooltip (details-box)
 *
 * Requires: Vue 3, vueJs/software.js (for region Vue components)
 * Script order: this file must load BEFORE software.js (both defer).
 */

var CONTINENT_DATA = {
    africa: {
        regions: [
            { id: "northern_africa", name: "Northern Africa", thumbnail: "https://d3dw5jtb3w1kgy.cloudfront.net/NorthernAfrica.webp", svgFile: "northern_africa.svg", vueMount: "app_pic_northern_africa" },
            { id: "western_africa", name: "Western Africa", thumbnail: "https://d3dw5jtb3w1kgy.cloudfront.net/WesternAfrica.png", svgFile: "western_africa.svg", vueMount: "app_pic_western_africa" },
            { id: "eastern_africa", name: "Eastern Africa", thumbnail: "https://d3dw5jtb3w1kgy.cloudfront.net/EasternAfrica.png", svgFile: "eastern_africa.svg", vueMount: "app_pic_eastern_africa" },
            { id: "central_africa", name: "Central Africa", thumbnail: "https://d3dw5jtb3w1kgy.cloudfront.net/CentralAfricanEmpire.gif", svgFile: "central_africa.svg", vueMount: "app_pic_central_africa" },
            { id: "southern_africa", name: "Southern Africa", thumbnail: "https://d3dw5jtb3w1kgy.cloudfront.net/SouthAfrica.jpg", svgFile: "southern_africa.svg", vueMount: "app_pic_southern_africa" }
        ]
    },
    asia: {
        regions: [
            { id: "bangladesh", name: "Bangladesh", thumbnail: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Bangladesh/img.png", svgFile: "bangladesh.svg", vueMount: "app_pic_bangladesh", cardId: "scroll_BGD" },
            { id: "northern_asia", name: "Northern Asia", thumbnail: "https://d3dw5jtb3w1kgy.cloudfront.net/NorthernAsia.svg.png", svgFile: "northern_asia.svg", vueMount: "app_pic_northern_asia" },
            { id: "southern_asia", name: "Southern Asia", thumbnail: "https://d3dw5jtb3w1kgy.cloudfront.net/SouthernAsia.png", svgFile: "southern_asia.svg", vueMount: "app_pic_southern_asia" },
            { id: "eastern_asia", name: "Eastern Asia", thumbnail: "https://d3dw5jtb3w1kgy.cloudfront.net/EastAsia.png", svgFile: "eastern_asia.svg", vueMount: "app_pic_eastern_asia" },
            { id: "central_asia", name: "Central Asia", thumbnail: "https://d3dw5jtb3w1kgy.cloudfront.net/CentralAsia.png", svgFile: "central_asia.svg", vueMount: "app_pic_central_asia" },
            { id: "south_eastern_asia", name: "South Eastern Asia", thumbnail: "https://d3dw5jtb3w1kgy.cloudfront.net/SouthEastAsia.png", svgFile: "south_eastern_asia.svg", vueMount: "app_pic_south_eastern_asia" },
            { id: "middle_east", name: "Middle East", thumbnail: "https://d3dw5jtb3w1kgy.cloudfront.net/middleEast.jpeg", svgFile: "middle_east.svg", vueMount: "app_pic_middle_east" }
        ]
    },
    australia: {
        regions: [
            { id: "australia", name: "Australia", thumbnail: "https://d3dw5jtb3w1kgy.cloudfront.net/Australia.svg", svgFile: "australia.svg", vueMount: "app_pic_australia" },
            { id: "new_zealand", name: "New Zealand", thumbnail: "https://d3dw5jtb3w1kgy.cloudfront.net/New_Zealand.svg.png", svgFile: "new_zealand.svg", vueMount: "app_pic_new_zealand" }
        ]
    },
    europe: {
        regions: [
            { id: "western_europe", name: "Western Europe", thumbnail: "https://d3dw5jtb3w1kgy.cloudfront.net/western_europe.svg.png", svgFile: "western_europe.svg", vueMount: "app_pic_western_europe" },
            { id: "eastern_europe", name: "Eastern Europe", thumbnail: "https://d3dw5jtb3w1kgy.cloudfront.net/eastern_europe.png", svgFile: "eastern_europe.svg", vueMount: "app_pic_eastern_europe" },
            { id: "southern_europe", name: "Southern Europe", thumbnail: "https://d3dw5jtb3w1kgy.cloudfront.net/southern_europe.svg.png", svgFile: "southern_europe.svg", vueMount: "app_pic_southern_europe" },
            { id: "northern_europe", name: "Northern Europe", thumbnail: "https://d3dw5jtb3w1kgy.cloudfront.net/northern_europe.svg.png", svgFile: "northern_europe.svg", vueMount: "app_pic_northern_europe" }
        ]
    },
    northamerica: {
        regions: [
            { id: "usa", name: "United States", thumbnail: "https://d3dw5jtb3w1kgy.cloudfront.net/usa.webp", svgFile: "usa.svg", vueMount: "app_pic", cardId: "scroll_USA" },
            { id: "canada", name: "Canada", thumbnail: "https://d3dw5jtb3w1kgy.cloudfront.net/CAN.svg.png", svgFile: "canada.svg", vueMount: "app_pic_can", cardId: "scroll_CAN" },
            /* Mexico is part of the Central America Vue mount (its tiles
               are listed alongside the other 7 Central American countries
               in app_pic_central_america). Reclassifying centralamerica +
               caribbeanamerica from South America to North America moves
               Mexico with it. */
            { id: "centralamerica", name: "Central America (incl. Mexico)", thumbnail: "https://d3dw5jtb3w1kgy.cloudfront.net/central_america.svg.png", svgFile: "centralamerica.svg", vueMount: "app_pic_central_america" },
            { id: "caribbeanamerica", name: "Caribbean Islands", thumbnail: "https://d3dw5jtb3w1kgy.cloudfront.net/caribbean_america.svg.png", svgFile: "caribbeanamerica.svg", vueMount: "app_pic_caribbean_america" }
        ]
    },
    southamerica: {
        regions: [
            { id: "southamerica", name: "South America", thumbnail: "https://d3dw5jtb3w1kgy.cloudfront.net/south_america.svg.png", svgFile: "southamerica.svg", vueMount: "app_pic_south_america" }
        ]
    }
};

var CONTINENT_NAV = [
    { id: "northamerica", label: "North America", path: "/map/northamerica" },
    { id: "southamerica", label: "South America", path: "/map/southamerica" },
    { id: "europe", label: "Europe", path: "/map/europe" },
    { id: "asia", label: "Asia", path: "/map/asia" },
    { id: "australia", label: "Australia", path: "/map/australia" },
    { id: "africa", label: "Africa", path: "/map/africa" }
];

function buildContinentSubNav(activeContinentId) {
    var BASE_URL = "https://www.masrikdahir.com";
    /* Render as a `.lang-bar` — same fixed second top nav used
       on map.html, library/awsutil*, and web/<app>*.html. The
       continent links sit in the center; "Travel" is the breadcrumb
       root on the left, in red when on a continent page. */
    var html = '<div class="lang-bar resizing-1026-more">' +
        '<a class="lang-home" href="' + BASE_URL + '/map" title="Travel">' +
            '<button class="glow-on-hover-nav glow-sm" type="button" style="margin-inline:5px;border:none;background:transparent">' +
                '<div class="w3-padding-small"><div>' +
                    '<b style="color:black;font-size:calc(11px + 0.3vw)">Travel</b>' +
                '</div></div>' +
            '</button>' +
        '</a>' +
        '<span style="margin:0 6px;color:#9ca3af;font-size:calc(12px + 0.3vw)">&rsaquo;</span>' +
        '<div class="lang-links">';

    for (var i = 0; i < CONTINENT_NAV.length; i++) {
        var c = CONTINENT_NAV[i];
        var color = (c.id === activeContinentId) ? "red" : "black";
        html += '<a href="' + BASE_URL + c.path + '" style="text-decoration:none">' +
            '<button class="glow-on-hover-nav glow-sm" type="button" style="margin-inline:5px;border:none;background:transparent">' +
                '<div class="w3-padding-small"><div>' +
                    '<b style="color:' + color + ';font-size:calc(11px + 0.3vw)">' + c.label + '</b>' +
                '</div></div>' +
            '</button></a>';
    }

    html += '</div></div>';
    return html;
}

function buildRegionCard(region, isFirst) {
    var cardClass = isFirst
        ? "w3-card w3-margin-top w3-margin-bottom"
        : "w3-card w3-margin-bottom";
    var cardIdAttr = region.cardId ? ' id="' + region.cardId + '"' : "";

    return '<div class="' + cardClass + '" style="margin-left: 0px"' + cardIdAttr + '>' +
        '<TABLE WIDTH="100%">' +
            '<TR>' +
                '<TD WIDTH="50%" style="float: left">' +
                    '<h4 style="margin-top: 0px;">' +
                        '<img style="width: calc(5% + 40px); margin: 1px" src="' + region.thumbnail + '" alt="' + region.name + '"/> ' +
                        region.name +
                    '</h4>' +
                '</TD>' +
            '</TR>' +
        '</TABLE>' +
        '<div id="' + region.id + '"></div>' +
        '<hr>' +
        '<a class="btn1" style="margin: 0px;"><center><img type="button" class="btn-outline-primary" style="width: calc(1% + 45px); height: calc(1% + 45px); border: 0px solid black; background: white;" src="https://d3dw5jtb3w1kgy.cloudfront.net/Icons/photo.png" alt=""/></center></a>' +
        '<div id="' + region.vueMount + '" style="margin-top: 33px">' +
            '<div class="" style="color:transparent;">' +
                '<div style="display: inline-block">' +
                    '<div style="display: flex; flex-wrap: wrap;margin-left: 10px">' +
                        '<div v-if="resources.length" v-cloak class="table" style="display: flex; flex-wrap: wrap;">' +
                            '<div v-for="(item, index) in resultQuery" :key="index" style="margin-right: 15px; margin-bottom: 15px;">' +
                                '<div data-toggle="tooltip" data-html="true" :title="item.title">' +
                                    '<a :href="item.url" style="text-decoration: none">' +
                                        '<button class="pop-up-button" style="background-color: transparent; border: 1px solid black; cursor: pointer; width: 50px; height: 50px; display: flex; justify-content: center; align-items: center;">' +
                                            '<img :src="item.image" :alt="item.title" style="width: 50px; height: 100%; object-fit: contain; padding: 2px"/>' +
                                        '</button>' +
                                        '<center><div v-cloak style="color: black">{{ item.abv }}</div></center>' +
                                    '</a>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
    '</div>' +
    '<hr>';
}

function buildContinentSearchBar(continentLabel) {
    /* Search input that filters every country tile across every region
       card on this continent page. Same look as the map.html search bar
       (.search-wrapper / .search_searchbar) so behavior + styling are
       consistent across the site. */
    return '<div class="continent-search-host" style="margin: 15px 0 10px 0;">' +
        '<div class="row" style="margin: 0;">' +
            '<div class="form-control search-wrapper panel-heading" style="display: flex; align-items: center; width: 100%; min-width: 250px;">' +
                '<div class="search_bar" style="display: flex; align-items: center; width: 100%;">' +
                    '<img src="https://d3dw5jtb3w1kgy.cloudfront.net/Search.png" width="25" style="margin-left: 8px; margin-right: 8px;" alt="Search"/>' +
                    '<div style="display: flex; align-items: center; width: 100%; margin-right: 8px;">' +
                        '<input class="search_searchbar continent-search-input" type="text" title="Search" placeholder="Search ' + continentLabel + '..." style="flex-grow: 1; width: 100%; height: calc(1vw + 25px); min-height: 40px; max-height: 60px; padding-right: 40px;"/>' +
                        '<button class="search-cross-btn continent-search-clear" aria-label="Clear search" type="button">' +
                            '<i class="fa fa-times"></i>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>' +
        '<div class="continent-search-status" style="margin: 6px 4px 0; color: #475569; font-style: italic; font-size: 13px; min-height: 18px;"></div>' +
    '</div>';
}

function setupContinentSearch(continentId) {
    var input = document.querySelector('.continent-search-input');
    var clearBtn = document.querySelector('.continent-search-clear');
    var status = document.querySelector('.continent-search-status');
    if (!input) return;

    function getAllTiles() {
        /* Each region card has a Vue app inside that renders tile divs
           inside a .table flex container. We filter the direct children
           of every .table on the page (the per-country wrapper divs). */
        var tiles = [];
        document.querySelectorAll('.continent-gallery-content .table > div').forEach(function (tile) {
            tiles.push(tile);
        });
        return tiles;
    }

    function tileText(tile) {
        /* Tile contains the country thumbnail + the ABV label.
           Search matches against the ABV text + the tooltip title. */
        var abv = (tile.textContent || '').trim();
        var titleEl = tile.querySelector('[title], [data-original-title]');
        var title = '';
        if (titleEl) {
            title = titleEl.getAttribute('title') ||
                    titleEl.getAttribute('data-original-title') || '';
        }
        return (abv + ' ' + title).toLowerCase();
    }

    function applyFilter() {
        var q = (input.value || '').trim().toLowerCase();
        var tiles = getAllTiles();
        var firstMatch = null;
        var matchCount = 0;
        tiles.forEach(function (tile) {
            if (!q) {
                tile.style.display = '';
                return;
            }
            var hay = tileText(tile);
            var hit = q.split(/\s+/).every(function (term) {
                return hay.indexOf(term) !== -1;
            });
            tile.style.display = hit ? '' : 'none';
            if (hit) {
                matchCount++;
                if (!firstMatch) firstMatch = tile;
            }
        });
        if (status) {
            if (!q) {
                status.textContent = '';
            } else if (matchCount === 0) {
                status.textContent = 'No matches in this continent.';
            } else {
                status.textContent = matchCount + ' match' + (matchCount === 1 ? '' : 'es');
            }
        }
        /* If the search has narrowed to one match, scroll it into view
           inside its region card. */
        if (q && firstMatch) {
            var card = firstMatch.closest('.w3-card');
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'start' });
                /* brief outline highlight on the matched tile */
                firstMatch.classList.add('continent-search-flash');
                setTimeout(function () {
                    firstMatch.classList.remove('continent-search-flash');
                }, 1400);
            }
        }
    }

    input.addEventListener('input', applyFilter);
    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            input.value = '';
            applyFilter();
            input.focus();
        });
    }

    /* Re-poll after Vue mounts tiles — the .table children may not exist
       at first paint. Run the empty-filter pass every 500 ms for the
       first few seconds so styles are correct as tiles appear. */
    var pollCount = 0;
    var poll = setInterval(function () {
        pollCount++;
        if (pollCount > 8 || (input.value || '').trim()) {
            clearInterval(poll);
            return;
        }
        if (getAllTiles().length > 0) {
            applyFilter();
        }
    }, 500);
}

function renderContinentGallery(containerId) {
    var continentId = window.CONTINENT_ID;
    if (!continentId || !CONTINENT_DATA[continentId]) return;

    // Inject continent sub-navigation above the gallery
    var subNavEl = document.getElementById("continent-subnav-placeholder");
    if (subNavEl) {
        subNavEl.innerHTML = buildContinentSubNav(continentId);
    }

    var container = document.getElementById(containerId);
    if (!container) return;

    var data = CONTINENT_DATA[continentId];
    /* Resolve the continent's display label from CONTINENT_NAV for the
       search placeholder text. */
    var contLabel = continentId;
    for (var ci = 0; ci < CONTINENT_NAV.length; ci++) {
        if (CONTINENT_NAV[ci].id === continentId) {
            contLabel = CONTINENT_NAV[ci].label;
            break;
        }
    }

    var html = buildContinentSearchBar(contLabel);
    html += '<div class="continent-gallery-content">';
    data.regions.forEach(function (region, i) {
        html += buildRegionCard(region, i === 0);
    });
    html += '</div>';
    html += '<div id="details-box"></div>';
    container.innerHTML = html;

    /* Inject the search-flash highlight style once (no separate CSS file
       needed — keeps continent-gallery a single-file drop-in). */
    if (!document.getElementById('continent-search-flash-css')) {
        var style = document.createElement('style');
        style.id = 'continent-search-flash-css';
        style.textContent =
            '.continent-search-flash { outline: 3px solid #facc15; ' +
            'outline-offset: 2px; box-shadow: 0 0 0 4px rgba(250,204,21,0.35); ' +
            'transition: outline-color 0.5s ease, box-shadow 0.5s ease; ' +
            'border-radius: 4px; }' +
            '.continent-search-clear { background: transparent; border: none; ' +
            'cursor: pointer; color: #94a3b8; padding: 4px 8px; }' +
            '.continent-search-clear:hover { color: #475569; }';
        document.head.appendChild(style);
    }

    /* Wire the search-bar filter once tiles start appearing. */
    setupContinentSearch(continentId);

    // Resolve SVG base path relative to the page
    var basePath = "svg/";

    // Pre-fetch image.json so it's ready when SVGs load
    var enhancerReady = window.MapEnhancer ? window.MapEnhancer.fetchData() : Promise.resolve();

    // Load SVGs asynchronously
    data.regions.forEach(function (region) {
        var svgContainer = document.getElementById(region.id);
        if (!svgContainer) return;

        fetch(basePath + region.svgFile)
            .then(function (res) {
                if (!res.ok) throw new Error("SVG load failed: " + res.status);
                return res.text();
            })
            .then(function (svgText) {
                svgContainer.innerHTML = svgText;
                // Enhance SVG paths with click-to-navigate and flag fills
                var svgEl = svgContainer.querySelector("svg");
                if (svgEl && window.MapEnhancer) {
                    enhancerReady.then(function () {
                        window.MapEnhancer.enhance(svgEl);
                    });
                }
            })
            .catch(function (err) {
                console.error("Failed to load SVG for " + region.id + ":", err);
            });
    });

    // Set up SVG hover/click tooltip
    var detailsBox = document.getElementById("details-box");
    if (detailsBox) {
        document.addEventListener("mouseover", function (e) {
            if (e.target.tagName === "path" && e.target.dataset.name) {
                detailsBox.innerHTML = e.target.dataset.name;
                detailsBox.style.opacity = "100%";
            }
        });

        document.addEventListener("mouseout", function (e) {
            if (e.target.tagName === "path") {
                detailsBox.style.opacity = "0%";
            }
        });

        document.addEventListener("click", function () {
            detailsBox.style.opacity = "0%";
        });

        window.addEventListener("pageshow", function () {
            detailsBox.style.opacity = "0%";
        });

        window.addEventListener("mousemove", function (e) {
            detailsBox.style.top = (e.clientY + 20) + "px";
            detailsBox.style.left = e.clientX + "px";
        });
    }
}

// Run immediately — this script is loaded with defer, so the DOM is already parsed.
// Must execute before software.js so Vue mount targets exist.
renderContinentGallery("continent-gallery-container");
