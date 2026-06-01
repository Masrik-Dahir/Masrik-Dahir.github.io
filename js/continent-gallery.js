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
        /* Top tile strip — mirrors map.html's .top-tile-strip layout.
           Populated after region Vue apps mount and we walk the DOM
           to collect every country tile. */
        '<div class="continent-top-strip-host" style="margin-top: 10px;">' +
            '<div style="display: inline-block; overflow: hidden; width: 100%;">' +
                '<div style="display: flex; flex-wrap: wrap; margin-left: 10px; justify-content: flex-start;">' +
                    '<div class="table continent-top-tile-strip" style="display: flex; flex-wrap: wrap;"></div>' +
                '</div>' +
                '<div class="continent-empty-msg" style="display:none; margin: 12px; color: #475569; font-style: italic;">No countries match your search.</div>' +
                '<div class="continent-pager md-pager" style="margin-top:10px;"></div>' +
            '</div>' +
        '</div>' +
        '<div class="continent-search-status" style="margin: 6px 4px 0; color: #475569; font-style: italic; font-size: 13px; min-height: 18px;"></div>' +
    '</div>';
}

function setupContinentSearch(continentId) {
    var input = document.querySelector('.continent-search-input');
    var clearBtn = document.querySelector('.continent-search-clear');
    var status = document.querySelector('.continent-search-status');
    var topStrip = document.querySelector('.continent-top-tile-strip');
    var pagerEl = document.querySelector('.continent-pager');
    var emptyMsg = document.querySelector('.continent-empty-msg');
    if (!input) return;

    var continentCountries = [];     // [{abv, title, image, url, regionTileEl, regionCardEl}]
    var regionCards = [];            // .w3-card elements (one per SVG region)
    var currentPage = 1;             // 1-based country page (mirrors map.html app_country.currentPage)
    function pageSize() {
        /* Same breakpoints as map.html app_country.pageSize:
           desktop 20, mobile 10. */
        return (window.innerWidth <= 640) ? 10 : 20;
    }

    function collectFromDOM() {
        var list = [];
        document.querySelectorAll('.continent-gallery-content .table > div').forEach(function (tile) {
            var img = tile.querySelector('img');
            var link = tile.querySelector('a');
            var titleEl = tile.querySelector('[title], [data-original-title]');
            var abv = (tile.textContent || '').trim();
            var title = '';
            if (titleEl) {
                title = titleEl.getAttribute('title') ||
                        titleEl.getAttribute('data-original-title') || '';
            }
            if (!img || !link) return;
            list.push({
                abv: abv,
                title: title || abv,
                image: img.src,
                url: link.href,
                regionTileEl: tile,
                regionCardEl: tile.closest('.w3-card')
            });
        });
        return list;
    }

    function collectRegionCards() {
        var cards = [];
        document.querySelectorAll('.continent-gallery-content > .w3-card').forEach(function (c) {
            cards.push(c);
        });
        return cards;
    }

    function filtered() {
        var q = (input.value || '').trim().toLowerCase();
        if (!q) return continentCountries.slice();
        return continentCountries.filter(function (c) {
            var hay = (c.abv + ' ' + c.title).toLowerCase();
            return q.split(/\s+/).every(function (term) {
                return hay.indexOf(term) !== -1;
            });
        });
    }

    function renderTopStrip() {
        /* Paginated top tile strip — 20 desktop / 10 mobile per page —
           same as map.html app_country.pagedResults. */
        if (!topStrip) return;
        var matches = filtered();
        var total = matches.length;
        var totalPages = Math.max(1, Math.ceil(total / pageSize()));
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;
        var start = (currentPage - 1) * pageSize();
        var pageItems = matches.slice(start, start + pageSize());

        topStrip.innerHTML = '';
        pageItems.forEach(function (c) {
            var wrap = document.createElement('div');
            wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;margin:0 15px;';
            wrap.setAttribute('data-toggle', 'tooltip');
            wrap.setAttribute('data-html', 'true');
            wrap.setAttribute('title', c.title);
            var center = document.createElement('center');
            var btn = document.createElement('button');
            btn.className = 'pop-up-button';
            btn.type = 'button';
            btn.style.cssText = 'background-color:transparent;border:1px solid black;margin-top:5px;cursor:pointer;width:50px;height:50px;display:flex;justify-content:center;align-items:center;';
            var im = document.createElement('img');
            im.src = c.image;
            im.alt = c.title;
            im.style.cssText = 'width:50px;height:100%;object-fit:contain;padding:2px;';
            btn.appendChild(im);
            var label = document.createElement('div');
            label.textContent = c.abv;
            label.style.cssText = 'color:black;text-align:center;width:50px;';
            btn.addEventListener('click', function (ev) {
                ev.stopPropagation();
                if (c.regionTileEl && c.regionCardEl) {
                    c.regionCardEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    c.regionTileEl.classList.add('continent-search-flash');
                    setTimeout(function () {
                        c.regionTileEl.classList.remove('continent-search-flash');
                    }, 1600);
                }
            });
            center.appendChild(btn);
            center.appendChild(label);
            wrap.appendChild(center);
            topStrip.appendChild(wrap);
        });

        if (emptyMsg) emptyMsg.style.display = total === 0 ? '' : 'none';
        if (status) {
            var q = (input.value || '').trim();
            if (!q) {
                status.textContent = continentCountries.length + ' countries';
            } else if (total === 0) {
                status.textContent = 'No matches in this continent.';
            } else {
                status.textContent = total + ' match' + (total === 1 ? '' : 'es');
            }
        }

        syncRegionCardsToPage();
        renderPager(total);
    }

    function syncRegionCardsToPage() {
        /* Distribute the region SVG cards proportionally across pager
           pages so every page shows at least one — same algorithm as
           map.html syncContentSectionsToPage. */
        if (regionCards.length === 0) return;
        var totalSections = regionCards.length;
        var matches = filtered();
        var totalPages = Math.max(1, Math.ceil(matches.length / pageSize()));
        var startIdx = Math.floor((currentPage - 1) * totalSections / totalPages);
        var endIdx   = Math.floor(currentPage * totalSections / totalPages);

        regionCards.forEach(function (card, i) {
            var visible = (i >= startIdx && i < endIdx);
            card.style.display = visible ? '' : 'none';
            var next = card.nextElementSibling;
            if (next && next.tagName === 'HR') {
                next.style.display = visible ? '' : 'none';
            }
        });
    }

    function renderPager(totalItems) {
        if (!pagerEl) return;
        var totalPages = Math.max(1, Math.ceil(totalItems / pageSize()));
        /* Hide the pager when only 1 page is needed — same rule as
           map.html (MDPager.render does this internally too). */
        if (totalPages <= 1) {
            pagerEl.innerHTML = '';
            pagerEl.style.display = 'none';
            return;
        }
        pagerEl.style.display = '';
        if (!window.MDPager) return;
        window.MDPager.render(pagerEl, {
            totalItems: totalItems,
            pageSize: pageSize(),
            currentPage: currentPage,
            onChange: function (p) {
                currentPage = p;
                renderTopStrip();
            }
        });
    }

    function refreshFromDOM() {
        continentCountries = collectFromDOM();
        regionCards = collectRegionCards();
        renderTopStrip();
    }

    input.addEventListener('input', function () {
        currentPage = 1;
        renderTopStrip();
    });
    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            input.value = '';
            currentPage = 1;
            renderTopStrip();
            input.focus();
        });
    }
    window.addEventListener('resize', function () { renderTopStrip(); });

    /* Poll for region tiles appearing — Vue mounts asynchronously. */
    var pollCount = 0;
    var lastCount = 0;
    var poll = setInterval(function () {
        pollCount++;
        var current = document.querySelectorAll('.continent-gallery-content .table > div').length;
        if (current !== lastCount) {
            lastCount = current;
            refreshFromDOM();
        }
        if (pollCount > 16) clearInterval(poll);
    }, 400);
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
