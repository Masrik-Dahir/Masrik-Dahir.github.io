# CLAUDE.md - Project Guide

## Project Overview

Personal portfolio and travel photography website for Masrik Dahir, hosted on GitHub Pages at `www.masrikdahir.com`. Static HTML/CSS/JS site with Vue 3 components — no build step, no bundler, no Node.js.

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS + Vue 3 (loaded via CDN script tag, `vue@3.2.36`)
- **Hosting**: GitHub Pages (static, no server)
- **Assets**: AWS S3 bucket `masrikdahir` served via CloudFront CDN (`https://d3dw5jtb3w1kgy.cloudfront.net/`)
- **CloudFront Distribution ID**: `E2NCS65HF57SMX`
- **Domain**: `www.masrikdahir.com` (CNAME in repo root)

## Directory Structure

```
/                       Root pages (index.html, map.html, software.html, etc.)
├── css/                Stylesheets (no preprocessor build — .scss files are manually compiled)
├── js/                 Core JS modules (vanilla JS, no modules/imports)
│   ├── map-enhancer.js     SVG map click-to-navigate + flag pattern fills
│   ├── continent-gallery.js Dynamic template engine for continent pages
│   ├── state-gallery.js    Shared gallery/slideshow template for region pages
│   ├── components.js       Shared Vue components
│   └── ...                 Other utility scripts
├── vueJs/              Vue component definitions
│   ├── image.js            Gallery/slideshow Vue components (mounts per region)
│   ├── software.js         Software project cards with thumbnails
│   └── ...
├── map/                Individual region gallery pages (~294 HTML files)
│   ├── svg/            SVG map files (23 maps: continents, countries, subdivisions)
│   ├── africa.html     Continent gallery pages (load SVGs dynamically)
│   ├── ny.html         Individual region pages (US states, countries, etc.)
│   └── ...
├── library/            Vendored JS/CSS (jQuery, Bootstrap, Vue CDN copy)
└── bootstrap/          Bootstrap assets
```

## Key Architecture Patterns

### Image Data Flow
1. `image.json` on CDN (`/Json/image.json`) — master list of ~248 regions with `{name, abbreviation, numImages, isActive}`
2. `vueJs/image.js` fetches `image.json`, creates a Vue app per region via `createStateComponent()`
3. `safeMount()` only mounts if the target `#app_{abbreviation}` element exists in the DOM
4. Photos stored at: `cloudfront.net/{RegionName}/{i}.jpg` (1-indexed)

### Thumbnail URLs
- **Current format**: `cloudfront.net/Thumbnail/{RegionName}/img.png`
- Old format (removed from S3): `cloudfront.net/{RegionName}/Thumbnail/img.png`
- Thumbnails are used as favicons in region pages, title bar images, and SVG map hover fills

### Region Gallery Pages (`map/*.html`)
Each region page follows this pattern:
1. Sets `window.STATE_ABBR = '{code}'` before scripts load
2. Includes `state-gallery.js` (deferred) — injects gallery template with controls
3. Includes `vueJs/image.js` (deferred) — mounts Vue to `#app_{code}`
4. Title format: `"Masrik Dahir - {Region Name}"` — `state-gallery.js` extracts the region name from `document.title`
5. Title bar (region name + flag thumbnail) renders statically from `document.title`, independent of Vue mounting

### SVG Map Enhancement (`js/map-enhancer.js`)
- Fetches `image.json`, builds lookup maps by abbreviation and name
- `enhance(svgEl)` processes all `<path data-name="...">` elements in an SVG
- Visited regions (numImages > 0): teal fill, flag image on hover via SVG `<pattern>` fills
- Unvisited regions: grey fill, navigates to region page on click
- **NAME_OVERRIDES**: maps SVG `data-name` values to `image.json` names (e.g., "District of Columbia" -> "Washington DC")
- **URL_OVERRIDES**: maps abbreviation to URL slug (e.g., "WA" -> "wash" for Washington state)
- **DIRECT_URL_MAP**: handles regions not in `image.json` (Australian states, NZ regions, Canadian provinces, Bangladesh divisions, territories)

### Continent Gallery Pages (`js/continent-gallery.js`)
- `window.CONTINENT_ID` set before script loads (e.g., `'africa'`)
- `CONTINENT_DATA` maps continent IDs to region configs with SVG file paths and Vue mount points
- SVGs loaded via `fetch()` from `map/svg/`, injected via `innerHTML`
- `MapEnhancer.enhanceAsync()` called after SVG injection for click/hover behavior

### Script Load Order (critical)
For continent pages: `map-enhancer.js` -> `continent-gallery.js` -> `software.js` (all deferred)
For region pages: `state-gallery.js` -> `image.js` (all deferred)

## Common Tasks

### Adding a New Region Page
1. Create `map/{code}.html` following the template in existing pages (e.g., `map/on.html`)
2. Set `window.STATE_ABBR = '{code}'` and title to `"Masrik Dahir - {Region Name}"`
3. Set favicon to `cloudfront.net/Thumbnail/{RegionName}/img.png`
4. If region has photos, ensure it exists in `image.json` on S3

### Adding Thumbnails to S3
1. Upload to `s3://masrikdahir/Thumbnail/{RegionName}/img.png` with `--content-type image/png`
2. Quote paths with spaces in region names
3. Invalidate CloudFront: `aws cloudfront create-invalidation --distribution-id E2NCS65HF57SMX --paths "/*"`

### Updating `vueJs/software.js`
- Contains ~491 entries defining project/region cards with `title`, `image`, `link` fields
- Thumbnail URLs must use format: `cloudfront.net/Thumbnail/{title}/img.png`
- The `title` field must exactly match the S3 folder name (watch for trailing spaces)

## Naming Gotchas

| SVG data-name | image.json name | Notes |
|---|---|---|
| District of Columbia | Washington DC | NAME_OVERRIDES in map-enhancer.js |
| Republic of Congo | Congo | |
| Antigua and Barbuda | Antigua & Deps | |
| Timor-Leste | East Timor | |
| Bosnia and Herzegovina | Bosnia Herzegovina | |
| Burkina Faso | Burkina | |
| Guinea-Bissau | Guinea Bissau | |
| Brunei Darussalam | Brunei | |
| Lao People's Democratic Republic | Laos | |
| Gambia | The Gambia | |

Washington state uses URL slug `wash` (not `wa`) to avoid collision with Western Australia.

## Line Endings

Repository uses CRLF (Windows). When processing files with bash loops that read file contents, strip `\r` with `tr -d '\r'` or use Python to avoid parsing issues.

## What NOT to Change Without Care

- `image.json` on S3 — source of truth for which regions have photos; `map-enhancer.js` and `image.js` both depend on it
- SVG `data-name` attributes — these must match NAME_OVERRIDES or image.json names exactly
- Script load order in HTML pages — Vue must load before component scripts; `state-gallery.js` must load before `image.js`
- `document.title` format in region pages — `state-gallery.js` parses `"Masrik Dahir - {Name}"` to extract region name
