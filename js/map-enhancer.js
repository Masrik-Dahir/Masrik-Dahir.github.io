/**
 * map-enhancer.js - Adds click-to-navigate and dynamic flag fills to SVG map paths.
 *
 * After an SVG is loaded (inline or via fetch), call MapEnhancer.enhance(svgEl)
 * to:
 *   1. Match each <path data-name="..."> to an image.json entry
 *   2. If numImages > 0, fill the path with that location's flag/thumbnail pattern
 *   3. Add a click handler to navigate to the location's gallery page
 *
 * Requires: nothing (standalone). Load with defer BEFORE continent-gallery.js.
 */
(function () {
    var JSON_URL = "https://d3dw5jtb3w1kgy.cloudfront.net/Json/image.json";
    var CDN_BASE = "https://d3dw5jtb3w1kgy.cloudfront.net/";
    var SITE_BASE = "https://www.masrikdahir.com";

    // SVG data-name → image.json name (for countries with different naming)
    var NAME_OVERRIDES = {
        "District of Columbia": "Washington DC",
        "Republic of Congo": "Congo",
        "Antigua and Barbuda": "Antigua & Deps",
        "Timor-Leste": "East Timor",
        "Macedonia": "North Macedonia",
        "Bosnia and Herzegovina": "Bosnia Herzegovina",
        "Burkina Faso": "Burkina",
        "Guinea-Bissau": "Guinea Bissau",
        "Brunei Darussalam": "Brunei",
        "Lao People's Democratic Republic": "Laos",
        "Gambia": "The Gambia"
    };

    // Edge-case URL slug overrides: abbreviation → slug
    var URL_OVERRIDES = {
        "WA": "wash"
    };

    // Direct URL map for paths NOT in image.json (subdivisions, territories, etc.)
    // Keyed by SVG path id OR "name:DataName" for 2-letter id collisions
    var DIRECT_URL_MAP = {
        // Australian states
        "AU-ACT": "act", "AU-NSW": "nsw", "AU-NT": "ntr", "AU-QLD": "qld",
        "AU-SA": "sa", "AU-TAS": "tas", "AU-VIC": "vic", "AU-WA": "wa",
        // New Zealand regions
        "NZ-AUK": "akl", "NZ-BOP": "bop", "NZ-CAN": "cby", "NZ-GIS": "gis",
        "NZ-HKB": "hkb", "NZ-MBH": "mbh", "NZ-MWT": "mwt", "NZ-NSN": "nsn",
        "NZ-NTL": "ntl", "NZ-OTA": "ota", "NZ-STL": "stl", "NZ-TAS": "tsn",
        "NZ-TKI": "tki", "NZ-WKO": "wko", "NZ-WGN": "wlg", "NZ-WTC": "wtc",
        "NZ-CIT": "cit",
        // Canadian provinces (except Ontario which is in image.json)
        "CA-AB": "ab", "CA-BC": "bc", "CA-MB": "mb", "CA-NB": "nb",
        "CA-NL": "nl", "CA-NS": "ns", "CA-NT": "nt", "CA-NU": "nu",
        "CA-PE": "pe", "CA-QC": "qc", "CA-SK": "sk", "CA-YT": "yt",
        // Bangladesh divisions
        "BD-A": "bar", "BD-B": "ctg", "BD-C": "dhk", "BD-D": "khl",
        "BD-E": "raj", "BD-F": "rpr", "BD-G": "syl",
        // Countries/territories not in image.json (keyed by SVG 2-letter id)
        "name:Eritrea": "eri", "name:Panama": "pan", "name:Namibia": "nam",
        "name:Swaziland": "swz", "name:Czech Republic": "cze",
        "name:Gibraltar": "gib", "name:San Marino": "smr",
        "name:Hong Kong": "hkg", "name:Macau": "mco",
        "name:Myanmar": "mmr", "name:Palestinian Territories": "pse",
        "name:Western Sahara": "esh", "name:Reunion": "reu",
        "name:Aruba": "abw", "name:Guadeloupe": "glp",
        "name:Cayman Islands": "cym", "name:Puerto Rico": "pri",
        "name:Montserrat": "msr", "name:Martinique": "mtq",
        "name:Turks and Caicos Islands": "tca",
        "name:British Virgin Islands": "vgb", "name:US Virgin Islands": "vir",
        "name:French Guiana": "guf", "name:Falkland Islands": "flk",
        "name:Sint Maarten": "sxm", "name:Isle of Man": "imn",
        "name:Svalbard and Jan Mayen": "sjm", "name:Faroe Islands": "fro",
        "name:Jersey": "jey", "name:Guernsey": "ggy",
        "name:South Georgia and South Sandwich Islands": "sgs",
        "name:Bouvet Island": "bvt", "name:Anguilla": "aia",
        "name:Niue": "niu", "name:Tokelau": "tkl",
        "name:American Samoa": "asm", "name:Guam": "gum",
        "name:Northern Mariana Islands": "mnp",
        "name:Wallis and Futuna": "wlf",
        "name:British Indian Ocean Territory": "iot",
        "name:Cocos (Keeling) Islands": "cck",
        "name:Christmas Island": "cxr",
        "name:Federated States of Micronesia": "fsm",
        // US minor outlying islands
        "UM-81": "umi81", "UM-84": "umi84", "UM-67": "umi67", "UM-71": "umi71",
        // Caribbean territories
        "name:Saint-Barth\u00e9lemy": "blm",
        "name:Saint Martin": "maf",
        "name:Bonaire, Saint Eustachius and Saba": "bes"
    };


    // Cached data
    var _dataPromise = null;
    var _lookups = null;

    // ── Data fetching ─────────────────────────────────────────────

    function fetchData() {
        if (_dataPromise) return _dataPromise;
        _dataPromise = fetch(JSON_URL + "?cb=" + Date.now(), {
            mode: "cors",
            credentials: "omit",
            cache: "no-store"
        })
        .then(function (res) {
            if (!res.ok) throw new Error("image.json fetch failed: " + res.status);
            return res.json();
        })
        .then(function (data) {
            _lookups = buildLookups(data);
            return data;
        })
        .catch(function (err) {
            console.error("MapEnhancer: failed to fetch image.json", err);
            return [];
        });
        return _dataPromise;
    }

    function buildLookups(data) {
        var byAbbr = {};   // "MA" → entry, "FRA" → entry
        var byName = {};   // "Massachusetts" → entry, "France" → entry
        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            byAbbr[d.abbreviation.toUpperCase()] = d;
            byName[d.name] = d;
        }
        return { byAbbr: byAbbr, byName: byName };
    }

    // ── Path → entry resolution ───────────────────────────────────

    function resolveEntry(pathEl) {
        if (!_lookups) return null;
        var id = (pathEl.id || "").toUpperCase();
        var dataName = pathEl.dataset ? pathEl.dataset.name : pathEl.getAttribute("data-name");
        if (!dataName) return null;

        var lookupName = NAME_OVERRIDES[dataName] || dataName;

        // Strategy 1: Canadian province (CA-XX) → match by name
        if (id.indexOf("CA-") === 0) {
            return _lookups.byName[lookupName] || null;
        }

        // Strategy 2: Direct abbreviation match (covers US states: MA, NY, DC …)
        // Also verify the name matches to avoid IN=Indiana colliding with IN=India
        if (id.length === 2 && _lookups.byAbbr[id] && _lookups.byAbbr[id].abbreviation.length === 2) {
            var candidate = _lookups.byAbbr[id];
            if (candidate.name === lookupName) {
                return candidate;
            }
        }

        // Strategy 3: Bangladesh divisions (BD-X) → match by name
        if (id.indexOf("BD-") === 0) {
            return _lookups.byName[lookupName] || null;
        }

        // Strategy 4: Country name match (skip 2-letter abbreviation entries to avoid
        // "Georgia" state/country ambiguity in non-US SVGs)
        var entry = _lookups.byName[lookupName];
        if (entry && entry.abbreviation.length >= 3) {
            return entry;
        }

        return null;
    }

    // ── URL resolution ────────────────────────────────────────────

    function getNavUrl(pathEl, entry) {
        if (!entry) return null;
        var abbr = entry.abbreviation;
        var id = (pathEl.id || "").toUpperCase();

        // Canadian provinces: use 2-letter suffix from SVG id
        if (id.indexOf("CA-") === 0) {
            return SITE_BASE + "/map/" + id.substring(3).toLowerCase();
        }

        // URL override (e.g., WA → wash)
        if (URL_OVERRIDES[abbr.toUpperCase()]) {
            return SITE_BASE + "/map/" + URL_OVERRIDES[abbr.toUpperCase()];
        }

        return SITE_BASE + "/map/" + abbr.toLowerCase();
    }

    // Resolve URL from DIRECT_URL_MAP for paths NOT in image.json
    function getDirectUrl(pathEl) {
        var id = (pathEl.id || "").toUpperCase();
        var dataName = pathEl.dataset ? pathEl.dataset.name : pathEl.getAttribute("data-name");

        // Try by SVG id first (subdivisions: AU-ACT, NZ-AUK, CA-AB, BD-A)
        if (id && DIRECT_URL_MAP[id]) {
            return SITE_BASE + "/map/" + DIRECT_URL_MAP[id];
        }

        // Try by "name:DataName" key (countries/territories not in image.json)
        if (dataName && DIRECT_URL_MAP["name:" + dataName]) {
            return SITE_BASE + "/map/" + DIRECT_URL_MAP["name:" + dataName];
        }

        return null;
    }

    // ── SVG pattern creation ──────────────────────────────────────

    function ensureDefs(svgEl) {
        var defs = svgEl.querySelector("defs");
        if (!defs) {
            defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            svgEl.insertBefore(defs, svgEl.firstChild);
        }
        return defs;
    }

    var TILES_ACROSS = 5; // target ~5 tiles across the region width

    function createFlagPattern(svgEl, patternId, imageUrl, pathEl) {
        var defs = ensureDefs(svgEl);
        if (defs.querySelector("#" + patternId)) return; // already exists

        var ns = "http://www.w3.org/2000/svg";
        var pattern = document.createElementNS(ns, "pattern");
        pattern.setAttribute("id", patternId);

        /* SIZE CHECK — decide between single-fitted and tiled rendering.
           Compare the path's largest dimension against the SVG viewBox.
           A state/country whose bbox spans more than ~30% of the SVG's
           larger viewBox axis is "too big" — a single fitted flag would
           render so huge that it looks blurry and stretched. For those
           cases we switch to a TILED pattern (multiple smaller flag
           instances) so the visual stays sharp.

           Threshold rationale:
             • USA map viewBox ~1000×600 → 30% ≈ 300 px. Texas (~250 wide)
               stays single; Alaska (~400 wide w/ Aleutians) tiles.
             • Africa map viewBox ~900×900 → 30% ≈ 270 px. Sudan,
               Algeria, DRC, etc. tile; smaller countries stay single. */
        var bbox;
        try { bbox = pathEl.getBBox(); } catch (e) { bbox = null; }
        var vb = svgEl.viewBox && svgEl.viewBox.baseVal;
        var svgMaxDim = (vb && vb.width && vb.height)
                        ? Math.max(vb.width, vb.height)
                        : 1000;
        var bboxMaxDim = (bbox && bbox.width && bbox.height)
                        ? Math.max(bbox.width, bbox.height)
                        : 0;
        var isLarge = bboxMaxDim > svgMaxDim * 0.30;

        var img = document.createElementNS(ns, "image");
        img.setAttribute("href", imageUrl);
        img.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", imageUrl);
        img.setAttribute("preserveAspectRatio", "xMidYMid slice");

        if (isLarge) {
            /* TILED PATTERN — flag repeats at a smaller tile size so the
               source image never has to be blown up beyond its natural
               resolution. Tile dimensions are derived from the SVG's
               viewBox so the tile is the same physical size regardless
               of which path uses the pattern. Tile ~12% of the SVG's
               larger axis with a 3:2 flag aspect ratio. */
            var tileW = svgMaxDim * 0.12;
            var tileH = tileW * (2 / 3);
            pattern.setAttribute("patternUnits", "userSpaceOnUse");
            pattern.setAttribute("width", tileW);
            pattern.setAttribute("height", tileH);
            img.setAttribute("x", "0");
            img.setAttribute("y", "0");
            img.setAttribute("width", tileW);
            img.setAttribute("height", tileH);
        } else {
            /* SINGLE-FITTED PATTERN — one flag covers the path's bbox,
               scaled to fit with aspect preserved (excess cropped). */
            pattern.setAttribute("patternUnits", "objectBoundingBox");
            pattern.setAttribute("width", "1");
            pattern.setAttribute("height", "1");
            pattern.setAttribute("viewBox", "0 0 100 100");
            pattern.setAttribute("preserveAspectRatio", "xMidYMid slice");
            img.setAttribute("x", "0");
            img.setAttribute("y", "0");
            img.setAttribute("width", "100");
            img.setAttribute("height", "100");
        }

        pattern.appendChild(img);
        defs.appendChild(pattern);
    }

    // ── Fill helpers ──────────────────────────────────────────────

    function setPathFill(pathEl, fillValue) {
        var style = pathEl.getAttribute("style") || "";
        if (/fill\s*:\s*[^;]+/.test(style)) {
            style = style.replace(/fill\s*:\s*[^;]+/, "fill:" + fillValue);
        } else {
            style = style ? style.replace(/;?\s*$/, ";fill:" + fillValue) : "fill:" + fillValue;
        }
        pathEl.setAttribute("style", style);
    }

    function getThumbnailUrl(name) {
        return CDN_BASE + "Thumbnail/" + name + "/img.png";
    }

    function makePatternId(pathEl) {
        var id = (pathEl.id || "unknown").toLowerCase().replace(/[^a-z0-9]/g, "-");
        var name = (pathEl.dataset ? pathEl.dataset.name : pathEl.getAttribute("data-name")) || "";
        return "flag-" + id + "-" + name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    }

    // ── Colors ─────────────────────────────────────────────────────

    var VISITED_COLOR = "#26A69A";       // teal
    var UNVISITED_COLOR = "#E0E0E0";     // light grey
    var UNVISITED_HOVER = "#B0BEC5";     // blue-grey on hover

    // ── Main enhance function ─────────────────────────────────────

    function enhance(svgEl) {
        if (!svgEl || !_lookups) return;

        var paths = svgEl.querySelectorAll("path[data-name]");
        for (var i = 0; i < paths.length; i++) {
            var p = paths[i];
            var entry = resolveEntry(p);

            // Fallback: if not in image.json, check DIRECT_URL_MAP
            if (!entry) {
                var directUrl = getDirectUrl(p);
                if (directUrl) {
                    // Add click handler for direct-mapped paths
                    (function (pathEl, navUrl) {
                        pathEl.addEventListener("click", function (e) {
                            e.stopPropagation();
                            pathEl.classList.add("map-click-flash");
                            setTimeout(function () {
                                window.location.href = navUrl;
                            }, 400);
                        });
                    })(p, directUrl);
                    p.style.cursor = "pointer";

                    // Unvisited styling with flag thumbnail on hover
                    var directDataName = p.dataset ? p.dataset.name : p.getAttribute("data-name");
                    var directPatternId = makePatternId(p);
                    var directThumbUrl = getThumbnailUrl(NAME_OVERRIDES[directDataName] || directDataName);
                    createFlagPattern(svgEl, directPatternId, directThumbUrl, p);
                    setPathFill(p, UNVISITED_COLOR);
                    (function (pathEl, pId) {
                        pathEl.addEventListener("mouseenter", function () {
                            setPathFill(pathEl, "url(#" + pId + ")");
                        });
                        pathEl.addEventListener("mouseleave", function () {
                            setPathFill(pathEl, UNVISITED_COLOR);
                        });
                    })(p, directPatternId);
                }
                continue;
            }

            // Click-to-navigate for ALL matched paths (even 0 photos)
            var url = getNavUrl(p, entry);
            if (url) {
                (function (pathEl, navUrl, hasPhotos, pId) {
                    pathEl.addEventListener("click", function (e) {
                        e.stopPropagation();
                        // Show flag fill before animating away
                        if (hasPhotos && pId) {
                            setPathFill(pathEl, "url(#" + pId + ")");
                        }
                        pathEl.classList.add("map-click-flash");
                        setTimeout(function () {
                            window.location.href = navUrl;
                        }, 400);
                    });
                })(p, url, entry.numImages > 0, entry.numImages > 0 ? makePatternId(p) : null);
                p.style.cursor = "pointer";
            }

            // Visited: teal fill, flag reveals on hover
            if (entry.numImages > 0) {
                var patternId = makePatternId(p);
                var thumbUrl = getThumbnailUrl(entry.name);
                createFlagPattern(svgEl, patternId, thumbUrl, p);
                setPathFill(p, VISITED_COLOR);

                // Flag fades in on hover, teal returns on leave
                (function (pathEl, pId) {
                    pathEl.addEventListener("mouseenter", function () {
                        setPathFill(pathEl, "url(#" + pId + ")");
                    });
                    pathEl.addEventListener("mouseleave", function () {
                        setPathFill(pathEl, VISITED_COLOR);
                    });
                })(p, patternId);
            } else {
                // Unvisited: grey, flag thumbnail reveals on hover
                var unvisitedPatternId = makePatternId(p);
                var unvisitedThumbUrl = getThumbnailUrl(entry.name);
                createFlagPattern(svgEl, unvisitedPatternId, unvisitedThumbUrl, p);
                setPathFill(p, UNVISITED_COLOR);
                (function (pathEl, pId) {
                    pathEl.addEventListener("mouseenter", function () {
                        setPathFill(pathEl, "url(#" + pId + ")");
                    });
                    pathEl.addEventListener("mouseleave", function () {
                        setPathFill(pathEl, UNVISITED_COLOR);
                    });
                })(p, unvisitedPatternId);
            }
        }
    }

    // ── Public API ────────────────────────────────────────────────

    function enhanceAsync(svgEl) {
        return fetchData().then(function () {
            enhance(svgEl);
        });
    }

    window.MapEnhancer = {
        fetchData: fetchData,
        enhance: enhance,
        enhanceAsync: enhanceAsync
    };
})();
