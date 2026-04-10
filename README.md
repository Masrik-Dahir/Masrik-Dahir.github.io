<!-- README auto-maintained. Update this file whenever: code structure changes,
     new env vars added, commands change, new workflows added, or deps updated. -->

<div align="center">

*— project —*

<!-- Project Banner: globe-orbit-trace -->
<a href="https://www.masrikdahir.com">
<img src="https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/raw/master/.github/banners/globe-orbit-trace.svg"
     alt="Masrik-Dahir.github.io" width="800"/>
</a>

*— author —*

<!-- Author Banner: compass-rose-unfold -->
<a href="https://www.masrikdahir.com">
<img src="https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/raw/master/.github/banners/compass-rose-unfold.svg"
     alt="Masrik Dahir — Masrik-Dahir.github.io" width="800"/>
</a>

> A personal portfolio and interactive travel photography atlas with 290+ region galleries, SVG maps with hover-to-preview flags, and photo slideshows — all static, no build step required.

[![Jekyll site CI](https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/actions/workflows/jekyll.yml/badge.svg)](https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/actions/workflows/jekyll.yml)
[![CodeQL](https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/actions/workflows/codeql-analysis.yml)
[![License: CC BY-NC-SA 4.0](https://licensebuttons.net/l/by-nc-sa/4.0/80x15.png)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Stars](https://img.shields.io/badge/stars-0-yellow)](https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/stargazers)
[![Forks](https://img.shields.io/badge/forks-0-blue)](https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/network/members)
[![Downloads](https://img.shields.io/badge/downloads-0-brightgreen)](https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/releases)
[![Visitors](https://visitor-badge.laobi.icu/badge?page_id=Masrik-Dahir.Masrik-Dahir.github.io)](https://github.com/Masrik-Dahir/Masrik-Dahir.github.io)

</div>

<p align="center">
  <img src="https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/raw/master/.github/screenshots/hero.svg"
       alt="Masrik-Dahir.github.io — application screenshot" width="900"/>
</p>

## ⚡ TL;DR

- **What:** A static personal portfolio and travel photography site featuring an interactive SVG world map with 290+ clickable region galleries and photo slideshows.
- **Who:** Anyone curious about Masrik Dahir's travel photography, work experience, software projects, and academic background.
- **Why:** Zero build step, zero server — pure HTML/CSS/JS with Vue 3 CDN and media served through CloudFront, making it instantly forkable and deployable on GitHub Pages.
- **Start:** `git clone https://github.com/Masrik-Dahir/Masrik-Dahir.github.io.git && python -m http.server 8000` — open `http://localhost:8000` and you're browsing.
- **Know:** All photos are hosted on AWS S3/CloudFront, not in the repo — the HTML pages reference CDN URLs, so gallery content requires the S3 bucket to be populated.

---

## 📋 Table of Contents

- [⚡ TL;DR](#-tldr)
- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [📁 Project Structure](#-project-structure)
- [⚙️ Prerequisites](#️-prerequisites)
- [🚀 Quick Start](#-quick-start)
- [📖 Usage](#-usage)
- [🔄 CI/CD](#-cicd)
- [📈 Repository Statistics](#-repository-statistics)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [📝 Changelog](#-changelog)

---

## ✨ Features

- 🗺️ **Interactive SVG World Map** — 23 SVG region maps with click-to-navigate and hover-to-preview flag thumbnails via dynamic pattern fills
- 📸 **290+ Photo Galleries** — Individual region pages with gallery grid and slideshow view modes powered by Vue 3
- ⚙️ **Dynamic Template Engine** — `continent-gallery.js` and `state-gallery.js` inject gallery layouts from lightweight HTML stubs without any build step
- 🌐 **CloudFront CDN Media Delivery** — All images and thumbnails served through AWS CloudFront for fast global access
- 🧭 **Responsive Navigation** — Shared navbar and footer injected via `components.js` across all pages
- 💼 **Portfolio Sections** — Work experience timeline, academic history, software project showcase, and personal milestones
- 🏳️ **Region Hover Tooltips** — SVG map paths show country/state names and photo counts on hover with flag image fills for visited regions
- 🚀 **Zero Build, Zero Server** — Entirely static — clone and serve with any HTTP server, deploy instantly on GitHub Pages

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph Browser["🖥️ Browser"]
        Pages["📄 HTML Pages<br/>index, map, work, software..."]
        Vue["⚡ Vue 3 CDN<br/>Reactive galleries"]
        JS["🔧 Vanilla JS Modules<br/>map-enhancer, continent-gallery,<br/>state-gallery, components"]
    end

    subgraph GitHub["🌐 GitHub Pages"]
        Static["📡 Static Hosting<br/>www.masrikdahir.com"]
    end

    subgraph AWS["☁️ AWS Cloud"]
        S3["🗄️ S3 Bucket<br/>masrikdahir"]
        CF["⚡ CloudFront CDN<br/>d3dw5jtb3w1kgy.cloudfront.net"]
        ImageJSON["📋 image.json<br/>Region metadata"]
    end

    Pages --> Vue
    Pages --> JS
    Static --> |serves| Pages
    JS --> |fetch| ImageJSON
    JS --> |fetch| CF
    Vue --> |render images from| CF
    S3 --> |origin| CF
    ImageJSON --> |hosted on| CF
```

### Page Rendering Flow

```mermaid
flowchart LR
    Stub["HTML Stub<br/>sets window.STATE_ABBR"] --> SGJ["state-gallery.js<br/>injects gallery template"]
    SGJ --> VueMount["vueJs/image.js<br/>mounts Vue app"]
    VueMount --> CDN["CloudFront CDN<br/>loads photos"]

    CStub["Continent Stub<br/>sets window.CONTINENT_ID"] --> CGJ["continent-gallery.js<br/>fetches SVG, builds cards"]
    CGJ --> ME["map-enhancer.js<br/>adds hover + click behavior"]
    ME --> CDN
```

---

## 📁 Project Structure

```
📦 Masrik-Dahir.github.io/
├── 📄 index.html               # Home / landing page
├── 📄 work.html                # Work experience timeline
├── 📄 academia.html            # Academic history
├── 📄 software.html            # Software project showcase
├── 📄 milestone.html           # Personal milestones
├── 📄 map.html                 # Interactive world map hub
│
├── 📁 map/                     # 290+ region gallery pages
│   ├── 📁 svg/                 # 23 interactive SVG region maps
│   │   ├── usa.svg
│   │   ├── canada.svg
│   │   ├── northern_europe.svg
│   │   └── ...
│   ├── northamerica.html       # Continent gallery stubs
│   ├── europe.html
│   ├── africa.html
│   ├── ak.html                 # Individual region galleries
│   ├── wash.html
│   └── ...
│
├── 📁 js/                      # Core JavaScript modules
│   ├── 🔧 components.js        # Shared navbar + footer injection
│   ├── 🔧 continent-gallery.js # Dynamic continent page builder
│   ├── 🔧 state-gallery.js     # Region gallery template engine
│   ├── 🔧 map-enhancer.js      # SVG map hover/click behavior
│   ├── 🔧 aesthetics.js        # Visual effects
│   ├── 🔧 icon-animation.js    # Animated icon effects
│   ├── 🔧 hourglass.js         # Loading animation
│   └── 🔧 map.js               # Map page utilities
│
├── 📁 vueJs/                   # Vue component data
│   ├── ⚡ image.js              # Gallery/slideshow Vue apps
│   ├── ⚡ software.js           # Software project cards
│   ├── ⚡ academia.js           # Academia page data
│   ├── ⚡ work.js               # Work page data
│   └── ⚡ default.js            # Shared Vue utilities
│
├── 📁 css/                     # Stylesheets
│   ├── 🎨 default.css          # Base styles
│   ├── 🎨 glowing.css          # Glowing button hover effects
│   ├── 🎨 map.element.css      # SVG map element styles
│   ├── 🎨 state-gallery.css    # Gallery layout
│   ├── 🎨 vintage.css          # Vintage theme
│   └── ...
│
├── 📁 library/                 # Vendored third-party libraries
│   └── vue@3.2.36.dist.vue.global.js
│
├── 📁 bootstrap/               # Bootstrap JS dependencies
│
├── 📁 .github/
│   ├── 📁 workflows/           # CI/CD pipelines
│   │   ├── jekyll.yml
│   │   ├── codeql-analysis.yml
│   │   ├── laravel.yml
│   │   ├── banner-archive.yml
│   │   ├── stats.yml
│   │   ├── release-stats.yml
│   │   └── update-badges.yml
│   ├── 📁 banners/             # Animated SVG banners
│   ├── 📁 screenshots/         # UI mockup screenshots
│   └── ⚙️ dependabot.yml
│
├── 🌐 CNAME                    # Custom domain: www.masrikdahir.com
├── 📄 LICENSE                   # CC BY-NC-SA 4.0
├── 📄 CHANGELOG.md
├── 📄 CODE_OF_CONDUCT.md
└── 📄 SECURITY.md
```

```mermaid
graph LR
    Root["📦 Masrik-Dahir.github.io"] --> Pages["📄 HTML Pages"]
    Root --> MapDir["🗺️ map/ — 290+ galleries"]
    Root --> JS["🔧 js/ — core modules"]
    Root --> VueDir["⚡ vueJs/ — Vue data"]
    Root --> CSS["🎨 css/ — stylesheets"]
    Root --> GH["⚙️ .github/ — CI + banners"]
    MapDir --> SVGs["🌍 svg/ — 23 region maps"]
    JS --> |"template injection"| MapDir
    VueDir --> |"reactive data"| MapDir
    GH --> Workflows["🔄 workflows/"]
    GH --> Banners["🎨 banners/"]
```

---

## ⚙️ Prerequisites

Before you begin, make sure you have the following installed:

| Tool | Version | Install |
|------|---------|---------|
| Any HTTP server | Any | Python 3 (`python -m http.server`), Node.js (`npx serve`), or VS Code Live Server |
| Git | Any | [git-scm.com](https://git-scm.com) |
| AWS CLI *(optional, for media uploads)* | >= 2.x | [aws.amazon.com/cli](https://aws.amazon.com/cli/) |

> 💡 **Tip:** No build step, no package manager, no bundler required. The site runs as pure static files.

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/Masrik-Dahir/Masrik-Dahir.github.io.git
cd Masrik-Dahir.github.io
```

### 2. Serve with any static file server

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# VS Code Live Server extension
# Right-click index.html -> "Open with Live Server"
```

### 3. Open in your browser

```
http://localhost:8000
```

Navigate to the **Travel Map** page to explore the interactive SVG maps and photo galleries.

---

## 📖 Usage

### Adding a New Region Gallery

1. **Upload photos** to S3:
   ```bash
   aws s3 cp ./photos/ s3://masrikdahir/{RegionName}/ --recursive --content-type image/jpeg
   aws s3 cp thumbnail.png "s3://masrikdahir/Thumbnail/{RegionName}/img.png" --content-type image/png
   ```

2. **Create the HTML page** at `map/{code}.html` (use any existing page as a template):
   - Set `window.STATE_ABBR = '{code}'`
   - Set the page title to `"Masrik Dahir - {Region Name}"`
   - Set the favicon to the CloudFront thumbnail URL

3. **Update `image.json`** on S3 to include the new region with `name`, `abbreviation`, `numImages`, and `isActive` fields.

4. **Invalidate CloudFront cache**:
   ```bash
   aws cloudfront create-invalidation --distribution-id E2NCS65HF57SMX --paths "/*"
   ```

### Deployment

The site deploys automatically to GitHub Pages on push to `master`. The custom domain `www.masrikdahir.com` is configured via the `CNAME` file.

---

## 🔄 CI/CD

This project uses GitHub Actions for automated validation, statistics collection, and badge updates.

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| Jekyll CI | `jekyll.yml` | Push / PR | Site build validation |
| CodeQL | `codeql-analysis.yml` | Push / PR / schedule | Security analysis |
| Laravel | `laravel.yml` | Push / PR | Additional checks |
| Banner Archive | `banner-archive.yml` | Push to banners / README | Validate and archive SVG banners |
| Traffic Stats | `stats.yml` | Daily cron + manual | Harvest views, clones, referrers before 14-day expiry |
| Release Downloads | `release-stats.yml` | Release published + daily | Record per-asset download counts |
| Badge Updater | `update-badges.yml` | After stats workflows | Keep README badge numbers current |

### Pipeline Flow

```mermaid
flowchart LR
    PR[Pull Request] --> Jekyll["Jekyll CI"]
    PR --> CodeQL["CodeQL Analysis"]
    Jekyll --> Deploy["GitHub Pages<br/>auto-deploy on master"]
    Push["Push to banners/"] --> Banner["Banner Archive"]
    Cron["Daily Cron"] --> Stats["Traffic Stats"]
    Release["Release Published"] --> RelStats["Release Stats"]
    Stats --> Badges["Update Badges"]
    RelStats --> Badges
    Stats --> StatsStore["stats branch"]
    RelStats --> StatsStore
```

> All checks must pass before merging. See [`.github/workflows/`](.github/workflows/) for full configuration.

---

## 📈 Repository Statistics

> Traffic and download data are harvested daily by automated workflows and stored in the [`stats`](../../tree/stats) branch before GitHub's 14-day retention window expires.

| Metric | Where stored | Updated |
|--------|-------------|---------|
| Page views & unique visitors | `stats/traffic/views_YYYY-MM-DD.json` | Daily |
| Git clones | `stats/traffic/clones_YYYY-MM-DD.json` | Daily |
| Top referrers | `stats/traffic/referrers_YYYY-MM-DD.json` | Daily |
| Stars, forks, watchers | `stats/traffic/repo_stats_YYYY-MM-DD.json` | Daily |
| Release asset downloads | `stats/releases/downloads_YYYY-MM-DD.json` | On release + daily |
| Cumulative download total | `stats/releases/summary.json` | On release + daily |

### Viewing Historical Stats

```bash
# Clone just the stats branch (lightweight — no source code)
git clone --single-branch --branch stats https://github.com/Masrik-Dahir/Masrik-Dahir.github.io.git repo-stats
cd repo-stats

# Inspect a specific day's traffic
cat traffic/views_2026-04-10.json

# See total downloads across all releases
cat releases/summary.json
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feat/amazing-feature`
5. **Open** a Pull Request

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use for |
|--------|---------|
| `feat:` | New features |
| `fix:` | Bug fixes |
| `docs:` | Documentation only |
| `chore:` | Build / tooling changes |
| `test:` | Adding or fixing tests |

> Please ensure all checks pass before opening a PR.

---

## 📄 License

Distributed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-nc-sa/4.0/).

You are free to:
- **Share** — copy and redistribute the material in any medium or format
- **Adapt** — remix, transform, and build upon the material

Under the following terms:
- **Attribution** — You must give appropriate credit
- **NonCommercial** — You may not use the material for commercial purposes
- **ShareAlike** — If you remix, transform, or build upon the material, you must distribute your contributions under the same license

---

## 📝 Changelog

| Version | Date | Changes |
|---------|------|---------|
| v2.0.0 | 2026-04-10 | Full README rewrite with animated banners, hero screenshot, Mermaid diagrams, stats workflows |
| v1.0.0 | — | Initial README |

---

<div align="center">

Made with love by **[Masrik Dahir](https://www.masrikdahir.com)**

Star this repo if you find it helpful!

</div>
