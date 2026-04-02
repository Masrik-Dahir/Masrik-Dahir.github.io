"""
test_map_links.py - Verify every clickable map region and software.js button
resolves to an existing HTML page.

Tests:
  1. Every DIRECT_URL_MAP entry in map-enhancer.js -> map/{slug}.html exists
  2. Every image.json-sourced entry (abbreviation) -> map/{abbr}.html exists
  3. Every software.js button URL -> map/{slug}.html exists
  4. Every SVG path data-name -> resolved page exists
  5. Every map/*.html page has a valid title and STATE_ABBR

Run: python tests/test_map_links.py
"""
import os
import re
import glob
import sys
import json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAP_DIR = os.path.join(ROOT, "map")
JS_DIR = os.path.join(ROOT, "js")
SVG_DIR = os.path.join(ROOT, "map", "svg")
VUEJS_DIR = os.path.join(ROOT, "vueJs")

failures = []
warnings = []
passes = 0


def fail(test, msg):
    failures.append(f"[FAIL] {test}: {msg}")


def warn(test, msg):
    warnings.append(f"[WARN] {test}: {msg}")


def passed():
    global passes
    passes += 1


def html_exists(slug):
    """Check if map/{slug}.html exists (case-insensitive on Windows)."""
    return os.path.isfile(os.path.join(MAP_DIR, slug + ".html"))


def get_all_map_html_files():
    """Return set of slugs (without .html) that exist in map/."""
    files = glob.glob(os.path.join(MAP_DIR, "*.html"))
    return {os.path.splitext(os.path.basename(f))[0] for f in files}


# --- Parse map-enhancer.js -----------------------------------------

def parse_map_enhancer():
    path = os.path.join(JS_DIR, "map-enhancer.js")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Extract DIRECT_URL_MAP entries: "KEY": "slug"
    direct_map = {}
    block_match = re.search(r'var DIRECT_URL_MAP\s*=\s*\{(.*?)\};', content, re.DOTALL)
    if block_match:
        block = block_match.group(1)
        for m in re.finditer(r'"([^"]+)"\s*:\s*"([^"]+)"', block):
            direct_map[m.group(1)] = m.group(2)

    # Extract NAME_OVERRIDES
    name_overrides = {}
    block_match = re.search(r'var NAME_OVERRIDES\s*=\s*\{(.*?)\};', content, re.DOTALL)
    if block_match:
        block = block_match.group(1)
        for m in re.finditer(r'"([^"]+)"\s*:\s*"([^"]+)"', block):
            name_overrides[m.group(1)] = m.group(2)

    # Extract URL_OVERRIDES
    url_overrides = {}
    block_match = re.search(r'var URL_OVERRIDES\s*=\s*\{(.*?)\};', content, re.DOTALL)
    if block_match:
        block = block_match.group(1)
        for m in re.finditer(r'"([^"]+)"\s*:\s*"([^"]+)"', block):
            url_overrides[m.group(1)] = m.group(2)

    return direct_map, name_overrides, url_overrides


# --- Parse software.js for URLs ------------------------------------

def parse_software_js_urls():
    """Extract all masrikdahir.com/map/ URLs from software.js."""
    path = os.path.join(VUEJS_DIR, "software.js")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    entries = []
    # Match patterns like: url: "https://www.masrikdahir.com/map/xxx" or url:"..."
    for m in re.finditer(r'url\s*:\s*"https?://(?:www\.)?masrikdahir\.com/map/([^"]+)"', content):
        slug = m.group(1)
        line_num = content[:m.start()].count('\n') + 1
        entries.append((slug, line_num))

    return entries


# --- Parse software.js for image.json-like entries ------------------

def parse_software_js_entries():
    """Extract {title, abv} entries that mirror image.json."""
    path = os.path.join(VUEJS_DIR, "software.js")
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    entries = []
    # Match: title: "Name", abv: "XXX"  (single-line compact format)
    for m in re.finditer(r'title:\s*"([^"]+)",\s*abv:\s*"([^"]+)"', content):
        entries.append({"name": m.group(1), "abbreviation": m.group(2)})

    # Match multi-line format: title:"Name",\n...abv:"XXX"
    for m in re.finditer(r'title\s*:\s*"([^"]+)"[^}]*?abv\s*:\s*"([^"]+)"', content, re.DOTALL):
        entry = {"name": m.group(1), "abbreviation": m.group(2)}
        if entry not in entries:
            entries.append(entry)

    return entries


# --- Parse SVG files for data-name paths ----------------------------

def parse_svg_data_names():
    """Extract all data-name and id attributes from SVG path elements."""
    paths = []
    for svg_file in glob.glob(os.path.join(SVG_DIR, "*.svg")):
        fname = os.path.basename(svg_file)
        with open(svg_file, "r", encoding="utf-8") as f:
            content = f.read()
        for m in re.finditer(r'<path[^>]*?data-name="([^"]+)"[^>]*?>', content):
            tag = m.group(0)
            data_name = m.group(1)
            id_match = re.search(r'id="([^"]+)"', tag)
            path_id = id_match.group(1) if id_match else ""
            paths.append({"data_name": data_name, "id": path_id, "svg": fname})
    return paths


# --- Parse map/*.html for STATE_ABBR and title ---------------------

def parse_map_html_pages():
    """Check each map HTML page has valid STATE_ABBR and title."""
    pages = []
    # Exclude continent/collection pages that don't use STATE_ABBR
    collection_pages = {
        "africa", "asia", "australia", "europe", "northamerica",
        "southamerica", "oceania", "caribbean", "centralamerica",
        "middleeast"
    }
    for html_file in glob.glob(os.path.join(MAP_DIR, "*.html")):
        slug = os.path.splitext(os.path.basename(html_file))[0]
        if slug in collection_pages:
            continue
        with open(html_file, "r", encoding="utf-8") as f:
            content = f.read()
        abbr_match = re.search(r"window\.STATE_ABBR\s*=\s*'([^']+)'", content)
        title_match = re.search(r"<title>([^<]+)</title>", content)
        pages.append({
            "slug": slug,
            "state_abbr": abbr_match.group(1) if abbr_match else None,
            "title": title_match.group(1) if title_match else None,
            "file": html_file
        })
    return pages


# ===================================================================
# TEST 1: DIRECT_URL_MAP -> HTML files exist
# ===================================================================

def test_direct_url_map():
    print("\n-- Test 1: DIRECT_URL_MAP entries have corresponding HTML pages --")
    direct_map, _, _ = parse_map_enhancer()

    for key, slug in direct_map.items():
        if html_exists(slug):
            passed()
        else:
            fail("DIRECT_URL_MAP", f'"{key}": "{slug}" -> map/{slug}.html MISSING')

    print(f"   Checked {len(direct_map)} entries")


# ===================================================================
# TEST 2: software.js button URLs -> HTML files exist
# ===================================================================

def test_software_js_urls():
    print("\n-- Test 2: software.js button URLs resolve to existing pages --")
    entries = parse_software_js_urls()
    existing = get_all_map_html_files()

    for slug, line_num in entries:
        if slug in existing:
            passed()
        else:
            fail("software.js URL", f'Line {line_num}: url "/map/{slug}" -> map/{slug}.html MISSING')

    print(f"   Checked {len(entries)} URLs")


# ===================================================================
# TEST 3: SVG data-name paths -> resolve to a page via map-enhancer logic
# ===================================================================

def test_svg_paths_resolve():
    print("\n-- Test 3: SVG path data-names resolve to existing pages --")
    direct_map, name_overrides, url_overrides = parse_map_enhancer()
    software_entries = parse_software_js_entries()
    svg_paths = parse_svg_data_names()

    # Build lookups mirroring map-enhancer.js
    by_abbr = {}
    by_name = {}
    for e in software_entries:
        by_abbr[e["abbreviation"].upper()] = e
        by_name[e["name"]] = e

    for p in svg_paths:
        data_name = p["data_name"]
        path_id = p["id"].upper()
        svg_file = p["svg"]
        lookup_name = name_overrides.get(data_name, data_name)

        # Try DIRECT_URL_MAP first (by id, then by name:DataName)
        direct_slug = direct_map.get(path_id) or direct_map.get("name:" + data_name)
        if direct_slug:
            if html_exists(direct_slug):
                passed()
            else:
                fail("SVG->DIRECT", f'{svg_file}: "{data_name}" (id={p["id"]}) -> map/{direct_slug}.html MISSING')
            continue

        # Simulate resolveEntry logic
        entry = None

        # Canadian province
        if path_id.startswith("CA-"):
            entry = by_name.get(lookup_name)
        # US state (2-letter id)
        elif len(path_id) == 2 and path_id in by_abbr and len(by_abbr[path_id]["abbreviation"]) == 2:
            candidate = by_abbr[path_id]
            if candidate["name"] == lookup_name:
                entry = candidate
        # Bangladesh
        elif path_id.startswith("BD-"):
            entry = by_name.get(lookup_name)
        # Country by name
        else:
            e = by_name.get(lookup_name)
            if e and len(e["abbreviation"]) >= 3:
                entry = e

        if not entry:
            # Not resolvable via image.json — check if it's in DIRECT_URL_MAP by name
            if "name:" + data_name not in direct_map and path_id not in direct_map:
                warn("SVG->unlinked", f'{svg_file}: "{data_name}" (id={p["id"]}) has no click target')
            continue

        # Simulate getNavUrl
        abbr = entry["abbreviation"]
        if path_id.startswith("CA-"):
            slug = path_id[3:].lower()
        elif abbr.upper() in url_overrides:
            slug = url_overrides[abbr.upper()]
        else:
            slug = abbr.lower()

        if html_exists(slug):
            passed()
        else:
            fail("SVG->page", f'{svg_file}: "{data_name}" -> /map/{slug} -> map/{slug}.html MISSING')


# ===================================================================
# TEST 4: map/*.html pages have valid STATE_ABBR matching filename
# ===================================================================

def test_page_state_abbr():
    print("\n-- Test 4: map/*.html pages have STATE_ABBR matching filename --")
    pages = parse_map_html_pages()

    for page in pages:
        if page["state_abbr"] is None:
            fail("STATE_ABBR", f'map/{page["slug"]}.html has no window.STATE_ABBR')
        elif page["state_abbr"] != page["slug"]:
            fail("STATE_ABBR", f'map/{page["slug"]}.html has STATE_ABBR=\'{page["state_abbr"]}\' (should be \'{page["slug"]}\')')
        else:
            passed()

    print(f"   Checked {len(pages)} pages")


# ===================================================================
# TEST 5: map/*.html pages have proper title format
# ===================================================================

def test_page_titles():
    print("\n-- Test 5: map/*.html pages have 'Masrik Dahir - Region' title --")
    pages = parse_map_html_pages()

    for page in pages:
        if page["title"] is None:
            fail("title", f'map/{page["slug"]}.html has no <title> tag')
        elif not page["title"].startswith("Masrik Dahir - "):
            fail("title", f'map/{page["slug"]}.html title is "{page["title"]}" (expected "Masrik Dahir - ...")')
        else:
            passed()

    print(f"   Checked {len(pages)} pages")


# ===================================================================
# TEST 6: No duplicate abbreviation/slug collisions
# ===================================================================

def test_no_duplicate_slugs():
    print("\n-- Test 6: No duplicate slugs in DIRECT_URL_MAP --")
    direct_map, _, _ = parse_map_enhancer()

    slug_to_keys = {}
    for key, slug in direct_map.items():
        slug_to_keys.setdefault(slug, []).append(key)

    for slug, keys in slug_to_keys.items():
        if len(keys) > 1:
            fail("duplicate slug", f'Slug "{slug}" mapped by multiple keys: {keys}')
        else:
            passed()

    print(f"   Checked {len(slug_to_keys)} unique slugs")


# ===================================================================

def main():
    print("=" * 70)
    print("Map Link Integrity Tests")
    print("=" * 70)

    test_direct_url_map()
    test_software_js_urls()
    test_svg_paths_resolve()
    test_page_state_abbr()
    test_page_titles()
    test_no_duplicate_slugs()

    print("\n" + "=" * 70)
    print(f"Results: {passes} passed, {len(failures)} failed, {len(warnings)} warnings")
    print("=" * 70)

    if warnings:
        print("\nWarnings:")
        for w in warnings:
            print(f"  {w}")

    if failures:
        print("\nFailures:")
        for f in failures:
            print(f"  {f}")
        sys.exit(1)
    else:
        print("\nAll tests passed!")
        sys.exit(0)


if __name__ == "__main__":
    main()
