# Masrik Dahir - Personal Portfolio & Travel Photography

[![Jekyll site CI](https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/actions/workflows/jekyll.yml/badge.svg)](https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/actions/workflows/jekyll.yml)
[![CodeQL](https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/actions/workflows/codeql-analysis.yml)
[![Laravel](https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/actions/workflows/laravel.yml/badge.svg)](https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/actions/workflows/laravel.yml)
[![License: CC BY-NC-SA 4.0](https://licensebuttons.net/l/by-nc-sa/4.0/80x15.png)](https://creativecommons.org/licenses/by-nc-sa/4.0/)

**Live site:** [www.masrikdahir.com](https://www.masrikdahir.com)

![Site Preview](https://user-images.githubusercontent.com/69909265/226499069-4287478d-0d9e-49ad-be27-158ee9ecf077.png)

---

## About

A personal portfolio and travel photography website showcasing work experience, academic achievements, software projects, milestones, and an interactive world map with 290+ country and region photo galleries. Built as a static site hosted on GitHub Pages with media assets served via AWS CloudFront CDN.

---

## Features

- **Home** (`index.html`) - Landing page with animated navigation, social links, and a personal introduction
- **Work Experience** (`work.html`) - Professional experience timeline
- **Academia** (`academia.html`) - Academic achievements, coursework, and education history
- **Software** (`software.html`) - Software project showcase
- **Milestones** (`milestone.html`) - Personal milestones and achievements
- **Interactive Travel Map** (`map.html`) - SVG-based world map organized by continent and region with clickable country navigation
  - 23 interactive SVG region maps with hover tooltips
  - 290+ individual country/state/division gallery pages
  - Photo slideshows with gallery and slideshow view modes
  - Continent sub-navigation (North America, South America, Europe, Asia, Australia, Africa)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | [Vue.js 3.2.36](https://vuejs.org/) - Reactive data binding for photo galleries and button grids |
| **CSS Frameworks** | [W3.CSS 4](https://www.w3schools.com/w3css/) - Layout and responsive utilities |
| **UI Components** | [Bootstrap 3.4.1](https://getbootstrap.com/docs/3.4/) - Tooltips, modals, and grid components |
| **Icons** | [Font Awesome 4.7](https://fontawesome.com/v4/) |
| **DOM Manipulation** | [jQuery 3.6](https://jquery.com/) |
| **Animation** | [anime.js](https://animejs.com/) - Icon and text animations |
| **CDN / Media** | [AWS CloudFront](https://aws.amazon.com/cloudfront/) - Image and thumbnail delivery |
| **Hosting** | [GitHub Pages](https://pages.github.com/) with custom domain |
| **CI/CD** | GitHub Actions (Jekyll CI, CodeQL analysis, Laravel) |

---

## Project Structure

```
Masrik-Dahir.github.io/
├── index.html                  # Home page
├── work.html                   # Work experience
├── academia.html               # Academic history
├── software.html               # Software projects
├── milestone.html              # Personal milestones
├── map.html                    # Interactive world map (main hub)
│
├── map/                        # 290+ country/state/region gallery pages
│   ├── svg/                    # 23 interactive SVG region maps
│   │   ├── usa.svg
│   │   ├── canada.svg
│   │   ├── northern_europe.svg
│   │   └── ...
│   ├── northamerica.html       # Continent stub pages (loaded by continent-gallery.js)
│   ├── europe.html
│   ├── ak.html                 # Individual state/country gallery pages
│   ├── wash.html
│   └── ...
│
├── js/                         # Application JavaScript
│   ├── components.js           # Shared navigation bar and footer injection
│   ├── continent-gallery.js    # Dynamic template engine for continent/region pages
│   ├── state-gallery.js        # Template engine for US state photo galleries
│   ├── aesthetics.js           # Visual effects and UI enhancements
│   ├── icon-animation.js       # Animated icon effects
│   ├── hourglass.js            # Loading animation
│   ├── map.js                  # Map page utilities
│   └── ...
│
├── vueJs/                      # Vue.js application data and components
│   ├── software.js             # Region/country button grid data (flags, URLs, abbreviations)
│   ├── image.js                # State gallery Vue app (slideshow + gallery views)
│   ├── academia.js             # Academia page Vue data
│   ├── work.js                 # Work page Vue data
│   └── default.js              # Shared Vue utilities
│
├── css/                        # Stylesheets (31 files)
│   ├── default.css             # Base styles
│   ├── glowing.css             # Glowing button hover effects
│   ├── map.element.css         # SVG map element styles
│   ├── state-gallery.css       # State gallery layout
│   ├── vintage.css             # Vintage theme styles
│   ├── popup.css               # Popup and modal styles
│   └── ...
│
├── library/                    # Vendored third-party libraries
│   ├── vue@3.2.36.dist.vue.global.js
│   ├── www.w3schools.com.w3css.4.w3.css
│   └── ...
│
├── bootstrap/                  # Bootstrap JS dependencies
├── pdf/                        # PDF documents
├── Demo/                       # Demo assets
├── Json/                       # JSON data files
├── web/                        # Additional web assets
│
├── .github/workflows/          # CI/CD pipeline
│   ├── jekyll.yml              # Jekyll site CI
│   ├── codeql-analysis.yml     # CodeQL security analysis
│   └── laravel.yml             # Laravel workflow
│
├── CNAME                       # Custom domain: www.masrikdahir.com
├── LICENSE                     # CC BY-NC-SA 4.0
├── CODE_OF_CONDUCT.md
└── SECURITY.md
```

---

## Architecture

### Page Rendering

The site uses a **template injection** pattern rather than a traditional SPA or static site generator:

1. **Shared components** (`js/components.js`) inject the navigation bar and footer into placeholder `<div>` elements on every page
2. **Continent pages** (e.g., `map/europe.html`) are lightweight stubs that set `window.CONTINENT_ID` and load `continent-gallery.js`, which dynamically builds region cards, loads SVG maps, and creates Vue mount points
3. **State/country gallery pages** (e.g., `map/wash.html`) set `window.STATE_ABBR` and load `state-gallery.js`, which builds the slideshow/gallery UI with Vue-powered controls
4. **Vue.js** mounts onto the injected DOM elements to provide reactive data binding for photo galleries, button grids, and slideshow controls

### Media Delivery

All images, thumbnails, and media assets are hosted on **AWS S3** and served through **CloudFront CDN** (`d3dw5jtb3w1kgy.cloudfront.net`). Thumbnails follow the convention:
```
https://d3dw5jtb3w1kgy.cloudfront.net/{RegionName}/Thumbnail/img.png
```

### Interactive Maps

The world map page (`map.html`) contains inline SVG maps for each region. Continent stub pages load SVG files from `map/svg/` via `fetch()`. SVG paths have `data-name` attributes that power hover tooltips and click-to-navigate behavior.

---

## Getting Started

### Prerequisites

No build step required. This is a static site that runs directly in the browser.

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/Masrik-Dahir/Masrik-Dahir.github.io.git
   cd Masrik-Dahir.github.io
   ```

2. Serve with any static file server:
   ```bash
   # Python
   python -m http.server 8000

   # Node.js
   npx serve .

   # VS Code Live Server extension
   # Right-click index.html -> "Open with Live Server"
   ```

3. Open `http://localhost:8000` in your browser.

### Deployment

The site deploys automatically to GitHub Pages on push to `master`. The custom domain `www.masrikdahir.com` is configured via the `CNAME` file.

---

## Adding a New Country/State Gallery

1. **Upload images** to S3 under `s3://masrikdahir/{Name}/` with a thumbnail at `{Name}/Thumbnail/img.png`

2. **Create the HTML page** in `map/` (use an existing page like `map/wash.html` as a template):
   - Set `window.STATE_ABBR` to the page abbreviation
   - Include `state-gallery.js` and `vueJs/image.js` with `defer`

3. **Add Vue data** in `vueJs/image.js` - create a new Vue app mounting to `#app_{abbr}` with the image resource array

4. **Add the button** in `vueJs/software.js` under the appropriate region's data array with `title`, `abv`, `image`, and `url` fields

5. **Invalidate CloudFront cache** if thumbnails were updated:
   ```bash
   aws cloudfront create-invalidation --distribution-id E2NCS65HF57SMX --paths "/*"
   ```

---

## License

This project is licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-nc-sa/4.0/).

You are free to:
- **Share** - copy and redistribute the material in any medium or format
- **Adapt** - remix, transform, and build upon the material

Under the following terms:
- **Attribution** - You must give appropriate credit
- **NonCommercial** - You may not use the material for commercial purposes
- **ShareAlike** - If you remix, transform, or build upon the material, you must distribute your contributions under the same license
