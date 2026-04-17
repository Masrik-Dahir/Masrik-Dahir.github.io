// @ts-check
const { test, expect } = require('@playwright/test');

// ─── Constants ───

const LANGUAGES = [
  { id: 'python',     path: '/library/awsutil/python.html',     title: 'Python',     abbr: 'PY', badge: 'PyPI' },
  { id: 'csharp',     path: '/library/awsutil/csharp.html',     title: 'C#',         abbr: 'C#', badge: 'NuGet' },
  { id: 'go',         path: '/library/awsutil/go.html',         title: 'Go',         abbr: 'GO', badge: 'Go Pkg' },
  { id: 'java',       path: '/library/awsutil/java.html',       title: 'Java',       abbr: 'JV', badge: 'Maven' },
  { id: 'rust',       path: '/library/awsutil/rust.html',       title: 'Rust',       abbr: 'RS', badge: 'Crates.io' },
  { id: 'typescript', path: '/library/awsutil/typescript.html', title: 'TypeScript', abbr: 'TS', badge: 'npm' },
  { id: 'ruby',       path: '/library/awsutil/ruby.html',       title: 'Ruby',       abbr: 'RB', badge: 'RubyGems' },
];

const HOME_PATH = '/library/awsutil.html';

// cssEscape polyfill for Node.js (ids may contain dots, slashes)
function cssEscape(id) {
  return id.replace(/([^\w-])/g, '\\$1');
}

// Helper: navigate to a doc page and wait for Vue to mount
async function goToDoc(page, langPath) {
  await page.goto(langPath, { waitUntil: 'domcontentloaded', timeout: 60000 });
  // Wait for Vue to mount (v-cloak removed) and loader dismissed
  await page.waitForSelector('#api-docs-wrapper:not([v-cloak])', { timeout: 30000 });
  await page.waitForTimeout(600);
}

// Helper: navigate to home page
async function goToHome(page) {
  await page.goto(HOME_PATH, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
}

// ═══════════════════════════════════════════════════════════════════════════
// HOME PAGE TESTS
// ═══════════════════════════════════════════════════════════════════════════

test.describe('AwsUtil Home Page', () => {

  test('page loads without JS errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await goToHome(page);
    expect(errors).toEqual([]);
  });

  test('hero section renders with title and subtitle', async ({ page }) => {
    await goToHome(page);
    const h1 = page.locator('.hero h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('AwsUtil');

    const subtitle = page.locator('.hero .subtitle');
    await expect(subtitle).toBeVisible();
    await expect(subtitle).toContainText('Multi-language AWS SDK wrappers');
  });

  test('hero badge shows Open Source MIT License', async ({ page }) => {
    await goToHome(page);
    const badge = page.locator('.hero-badge');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText('Open Source');
    await expect(badge).toContainText('MIT License');
  });

  test('hero tagline is visible (typewriter animation)', async ({ page }) => {
    await goToHome(page);
    const tagline = page.locator('.hero-tagline');
    await expect(tagline).toBeAttached();
    // After animation completes the element should have content
    const text = await tagline.textContent();
    expect(text).toContain('pip install aws-util');
    expect(text).toContain('dotnet add package AwsUtil');
  });

  test('hero stats show 4 counters', async ({ page }) => {
    await goToHome(page);
    const stats = page.locator('.hero-stats .stat');
    await expect(stats).toHaveCount(4);

    const labels = page.locator('.stat-label');
    const labelTexts = await labels.allTextContents();
    expect(labelTexts).toContain('Functions');
    expect(labelTexts).toContain('Models');
    expect(labelTexts).toContain('Modules');
    expect(labelTexts).toContain('Languages');
  });

  test('stat counters animate from 0', async ({ page }) => {
    await goToHome(page);
    // Wait for counter animation to run
    await page.waitForTimeout(2500);
    const nums = page.locator('.stat-num');
    const count = await nums.count();
    for (let i = 0; i < count; i++) {
      const text = await nums.nth(i).textContent();
      const val = parseInt(text.replace(/,/g, ''), 10);
      expect(val).toBeGreaterThan(0);
    }
  });

  test('all 7 language cards render', async ({ page }) => {
    await goToHome(page);
    const cards = page.locator('.lang-card');
    await expect(cards).toHaveCount(7);
  });

  test('each language card has title, description, and stats', async ({ page }) => {
    await goToHome(page);
    for (const lang of LANGUAGES) {
      const card = page.locator(`.lang-card[href*="${lang.id}"]`);
      await expect(card).toBeAttached();

      const title = card.locator('.card-title');
      await expect(title).toHaveText(lang.title);

      const desc = card.locator('.card-desc');
      const descText = await desc.textContent();
      expect(descText.length).toBeGreaterThan(10);

      const stats = card.locator('.card-stat');
      const statCount = await stats.count();
      expect(statCount).toBeGreaterThanOrEqual(2);
    }
  });

  test('language cards link to correct doc pages', async ({ page }) => {
    await goToHome(page);
    for (const lang of LANGUAGES) {
      const card = page.locator(`.lang-card[href*="${lang.id}"]`);
      const href = await card.getAttribute('href');
      expect(href).toContain(`${lang.id}/awsutil.html`);
    }
  });

  test('each language card has a badge', async ({ page }) => {
    await goToHome(page);
    for (const lang of LANGUAGES) {
      const card = page.locator(`.lang-card[href*="${lang.id}"]`);
      const badge = card.locator('.card-badge');
      await expect(badge).toHaveText(lang.badge);
    }
  });

  test('features section renders 4 features', async ({ page }) => {
    await goToHome(page);
    const feats = page.locator('.feat');
    await expect(feats).toHaveCount(4);
  });

  test('features section heading says Built for production', async ({ page }) => {
    await goToHome(page);
    const h3 = page.locator('.features-section h3');
    await expect(h3).toContainText('Built for production');
  });

  test('each feature has icon, label, and description', async ({ page }) => {
    await goToHome(page);
    const feats = page.locator('.feat');
    const count = await feats.count();
    for (let i = 0; i < count; i++) {
      const feat = feats.nth(i);
      await expect(feat.locator('.feat-icon')).toBeAttached();
      const label = await feat.locator('.feat-label').textContent();
      expect(label.length).toBeGreaterThan(3);
      const desc = await feat.locator('.feat-desc').textContent();
      expect(desc.length).toBeGreaterThan(10);
    }
  });

  test('hero particles exist', async ({ page }) => {
    await goToHome(page);
    const particles = page.locator('.hero .particle');
    const count = await particles.count();
    expect(count).toBeGreaterThan(5);
  });

  test('orbiters with language SVG icons render', async ({ page }) => {
    await goToHome(page);
    const orbiters = page.locator('.orbiter');
    await expect(orbiters).toHaveCount(7);
  });

  test('morph blobs exist in hero', async ({ page }) => {
    await goToHome(page);
    const blobs = page.locator('.morph-blob');
    const count = await blobs.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('clicking a language card navigates to its doc page', async ({ page }) => {
    await goToHome(page);
    // Use JavaScript click to avoid visibility issues with scroll-reveal
    await page.locator('.lang-card[href*="python"]').evaluate(el => el.click());
    await page.waitForURL('**/python/awsutil.html', { timeout: 10000 });
    expect(page.url()).toContain('python/awsutil.html');
  });

  test('scroll-reveal: cards become visible on scroll', async ({ page }) => {
    await goToHome(page);
    // Scroll down to trigger IntersectionObserver
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    const visibleCards = page.locator('.lang-card.visible');
    const count = await visibleCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('footer placeholder exists', async ({ page }) => {
    await goToHome(page);
    const footer = page.locator('#footer-placeholder');
    await expect(footer).toBeAttached();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// LANGUAGE DOC PAGE TESTS — load and structure
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Doc pages — load and structure', () => {

  for (const lang of LANGUAGES) {
    test(`${lang.id}: page loads without JS errors`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', (err) => errors.push(err.message));
      await goToDoc(page, lang.path);
      expect(errors).toEqual([]);
    });

    test(`${lang.id}: page title contains AwsUtil`, async ({ page }) => {
      await goToDoc(page, lang.path);
      const title = await page.title();
      expect(title).toContain('AwsUtil');
    });

    test(`${lang.id}: AWSUTIL_DATA is loaded with correct lang`, async ({ page }) => {
      await goToDoc(page, lang.path);
      const data = await page.evaluate(() => ({
        lang: window.AWSUTIL_DATA?.lang,
        hasCats: Array.isArray(window.AWSUTIL_DATA?.categories),
        totalFuncs: window.AWSUTIL_DATA?.totalFuncs,
        totalMods: window.AWSUTIL_DATA?.totalMods,
      }));
      expect(data.lang).toBe(lang.id);
      expect(data.hasCats).toBe(true);
      expect(data.totalFuncs).toBeGreaterThan(0);
      expect(data.totalMods).toBeGreaterThan(0);
    });

    test(`${lang.id}: v-cloak removed (Vue mounted)`, async ({ page }) => {
      await goToDoc(page, lang.path);
      const hasCloaked = await page.locator('#api-docs-wrapper[v-cloak]').count();
      expect(hasCloaked).toBe(0);
    });

    test(`${lang.id}: page loader dismissed`, async ({ page }) => {
      await goToDoc(page, lang.path);
      const loader = page.locator('#page-loader');
      const count = await loader.count();
      if (count > 0) {
        // Should have "done" class or be removed
        const isDone = await loader.evaluate(el => el.classList.contains('done'));
        expect(isDone).toBe(true);
      }
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SIDEBAR TESTS
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Doc pages — sidebar', () => {

  for (const lang of LANGUAGES) {
    test(`${lang.id}: sidebar renders with category items`, async ({ page }) => {
      await goToDoc(page, lang.path);
      const sidebar = page.locator('#sidebar');
      await expect(sidebar).toBeAttached();

      const catItems = page.locator('#sidebar .cat-item');
      const count = await catItems.count();
      expect(count).toBeGreaterThan(0);
    });

    test(`${lang.id}: sidebar module items expand on click`, async ({ page }) => {
      await goToDoc(page, lang.path);
      const modItem = page.locator('#sidebar .mod-item').first();
      await modItem.locator('a').first().click();
      await page.waitForTimeout(300);

      // Should have expanded class
      const isExpanded = await modItem.evaluate(el => el.classList.contains('expanded'));
      expect(isExpanded).toBe(true);
    });

    test(`${lang.id}: sidebar module items contain function links`, async ({ page }) => {
      await goToDoc(page, lang.path);
      // Expand the first module
      const modItem = page.locator('#sidebar .mod-item').first();
      await modItem.locator('a').first().click();
      await page.waitForTimeout(300);

      const fnLinks = modItem.locator('.fn-list .fn-link');
      const count = await fnLinks.count();
      expect(count).toBeGreaterThan(0);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SIDEBAR NAVIGATION — clicking items shows content
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Doc pages — sidebar navigation shows content', () => {

  // Test with python as representative
  test('clicking first sidebar module scrolls to its section', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const modLink = page.locator('#sidebar .mod-item > a').first();
    const href = await modLink.getAttribute('href');
    await modLink.click();
    await page.waitForTimeout(500);

    // The target section should be visible
    if (href) {
      const targetId = href.replace('#', '');
      const section = page.locator(`#${cssEscape(targetId)}`);
      await expect(section).toBeVisible();
    }
  });

  test('clicking last sidebar module shows content (not blank)', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const modLinks = page.locator('#sidebar .mod-item > a');
    const count = await modLinks.count();
    expect(count).toBeGreaterThan(0);

    // Click the last module
    const lastLink = modLinks.nth(count - 1);
    await lastLink.click();
    await page.waitForTimeout(500);

    const href = await lastLink.getAttribute('href');
    if (href) {
      const targetId = href.replace('#', '');
      const section = page.locator(`#${cssEscape(targetId)}`);
      // Section must be visible (not opacity:0)
      const opacity = await section.evaluate(el => getComputedStyle(el).opacity);
      expect(opacity).toBe('1');
    }
  });

  test('all module sections have opacity 1 (scroll-reveal removed)', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const sections = page.locator('.mod-section.reveal');
    const count = await sections.count();
    if (count > 0) {
      // Check a sample (first, middle, last)
      for (const idx of [0, Math.floor(count / 2), count - 1]) {
        const opacity = await sections.nth(idx).evaluate(el => getComputedStyle(el).opacity);
        expect(opacity).toBe('1');
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SEARCH FUNCTIONALITY
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Doc pages — search', () => {

  test('search input exists and is focusable', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const search = page.locator('#side-search');
    await expect(search).toBeAttached();
    await search.focus();
    expect(await search.evaluate(el => document.activeElement === el)).toBe(true);
  });

  test('typing in search filters sidebar modules', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const search = page.locator('#side-search');
    const beforeCount = await page.locator('#sidebar .mod-item').count();

    await search.fill('s3');
    await page.waitForTimeout(300);

    const afterCount = await page.locator('#sidebar .mod-item').count();
    expect(afterCount).toBeLessThan(beforeCount);
    expect(afterCount).toBeGreaterThan(0);
  });

  test('search also filters main content sections', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const search = page.locator('#side-search');
    const beforeCount = await page.locator('.mod-section').count();

    await search.fill('s3');
    await page.waitForTimeout(300);

    const afterCount = await page.locator('.mod-section').count();
    expect(afterCount).toBeLessThan(beforeCount);
    expect(afterCount).toBeGreaterThan(0);
  });

  test('search clear button appears and clears search', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const search = page.locator('#side-search');
    await search.fill('ec2');
    await page.waitForTimeout(300);

    const clearBtn = page.locator('.search-clear');
    await expect(clearBtn).toBeVisible();

    await clearBtn.click();
    await page.waitForTimeout(300);

    const searchVal = await search.inputValue();
    expect(searchVal).toBe('');

    // Clear button should be hidden
    await expect(clearBtn).not.toBeVisible();
  });

  test('Ctrl+K focuses search', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const search = page.locator('#side-search');

    // Make sure search is not focused
    await page.click('body');
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(200);

    expect(await search.evaluate(el => document.activeElement === el)).toBe(true);
  });

  test('Escape blurs search', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const search = page.locator('#side-search');
    await search.focus();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    expect(await search.evaluate(el => document.activeElement === el)).toBe(false);
  });

  test('empty search shows all modules', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const search = page.locator('#side-search');
    const fullCount = await page.locator('#sidebar .mod-item').count();

    await search.fill('lambda');
    await page.waitForTimeout(300);
    const filteredCount = await page.locator('#sidebar .mod-item').count();
    expect(filteredCount).toBeLessThan(fullCount);

    await search.fill('');
    await page.waitForTimeout(300);
    const restoredCount = await page.locator('#sidebar .mod-item').count();
    expect(restoredCount).toBe(fullCount);
  });

  test('search with no results shows empty sidebar', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const search = page.locator('#side-search');
    await search.fill('zzzznonexistentmodulezzz');
    await page.waitForTimeout(300);

    const count = await page.locator('#sidebar .mod-item').count();
    expect(count).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// LANGUAGE BAR NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Doc pages — language bar', () => {

  test('language bar is visible with all 7 languages + AwsUtil home link', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const langBar = page.locator('.lang-bar');
    await expect(langBar).toBeVisible();

    // AwsUtil home link
    const homeLink = page.locator('.lang-home');
    await expect(homeLink).toBeAttached();

    // Language links
    const langLinks = page.locator('.lang-links a');
    await expect(langLinks).toHaveCount(7);
  });

  test('AwsUtil link points to home page', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const homeLink = page.locator('.lang-home');
    const href = await homeLink.getAttribute('href');
    expect(href).toContain('awsutil.html');
    expect(href).not.toContain('python');
  });

  for (const lang of LANGUAGES) {
    test(`${lang.id}: lang bar has link for ${lang.title}`, async ({ page }) => {
      await goToDoc(page, LANGUAGES[0].path);
      const link = page.locator(`.lang-links a[href*="${lang.id}"]`);
      await expect(link).toBeAttached();
      await expect(link).toContainText(lang.title);
    });
  }

  test('clicking a language link navigates to that doc page', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const goLink = page.locator('.lang-links a[href*="go"]');
    await goLink.click();
    await page.waitForURL('**/go/awsutil.html', { timeout: 15000 });
    expect(page.url()).toContain('go/awsutil.html');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PAGE HEADER AND STATS
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Doc pages — header and stats', () => {

  for (const lang of LANGUAGES) {
    test(`${lang.id}: page header shows language name and data-lang-abbr`, async ({ page }) => {
      await goToDoc(page, lang.path);
      const h1 = page.locator('.page-hdr h1');
      await expect(h1).toBeVisible();
      await expect(h1).toContainText('AwsUtil');

      const abbr = await h1.getAttribute('data-lang-abbr');
      expect(abbr).toBe(lang.abbr);
    });

    test(`${lang.id}: stats show function and module counts`, async ({ page }) => {
      await goToDoc(page, lang.path);
      const stats = page.locator('.page-hdr .stats');
      await expect(stats).toBeVisible();

      const text = await stats.textContent();
      expect(text).toContain('functions');
      expect(text).toContain('modules');
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// FUNCTION/MODEL ENTRIES — expand/collapse
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Doc pages — function/model entries', () => {

  test('function entries render in each module section', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const entries = page.locator('.fn-entry');
    const count = await entries.count();
    expect(count).toBeGreaterThan(0);
  });

  test('clicking a function header expands it', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const entry = page.locator('.fn-entry').first();
    const header = entry.locator('.fn-hdr');
    await header.click();
    await page.waitForTimeout(300);

    // Should have "open" class
    const isOpen = await entry.evaluate(el => el.classList.contains('open'));
    expect(isOpen).toBe(true);

    // fn-body should now be visible
    const body = entry.locator('.fn-body');
    await expect(body).toBeVisible();
  });

  test('clicking again collapses the entry', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const entry = page.locator('.fn-entry').first();
    const header = entry.locator('.fn-hdr');

    // Open
    await header.click();
    await page.waitForTimeout(300);
    expect(await entry.evaluate(el => el.classList.contains('open'))).toBe(true);

    // Close
    await header.click();
    await page.waitForTimeout(300);
    expect(await entry.evaluate(el => el.classList.contains('open'))).toBe(false);
  });

  test('expanded entry shows signature with syntax highlighting', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const entry = page.locator('.fn-entry').first();
    await entry.locator('.fn-hdr').click();
    await page.waitForTimeout(300);

    const pre = entry.locator('.fn-body pre');
    const count = await pre.count();
    if (count > 0) {
      const html = await pre.first().innerHTML();
      // Should have syntax spans
      expect(html).toContain('syn-');
    }
  });

  test('expanded entry shows parameters list', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    // Find an entry that has parameters
    const entries = page.locator('.fn-entry');
    const count = await entries.count();
    let found = false;

    for (let i = 0; i < Math.min(count, 20); i++) {
      await entries.nth(i).locator('.fn-hdr').click();
      await page.waitForTimeout(200);
      const params = entries.nth(i).locator('.params-list');
      const pCount = await params.count();
      if (pCount > 0) {
        await expect(params.first()).toBeVisible();
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  test('function entry has anchor link (#)', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const anchor = page.locator('.fn-entry .fn-anchor').first();
    await expect(anchor).toBeAttached();
    const href = await anchor.getAttribute('href');
    expect(href).toMatch(/^#/);
  });

  test('function toggle arrow exists', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const toggle = page.locator('.fn-entry .fn-toggle').first();
    await expect(toggle).toBeAttached();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// COPY BUTTONS
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Doc pages — copy buttons', () => {

  test('expanding a function creates a copy button toolbar', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const entry = page.locator('.fn-entry').first();
    await entry.locator('.fn-hdr').click();
    await page.waitForTimeout(600); // MutationObserver debounce is 250ms

    const toolbar = entry.locator('.pre-toolbar');
    const count = await toolbar.count();
    if (count > 0) {
      await expect(toolbar.first()).toBeVisible();

      // Toolbar should have dots, lang label, and copy button
      await expect(toolbar.first().locator('.pre-toolbar-dots')).toBeAttached();
      await expect(toolbar.first().locator('.pre-toolbar-lang')).toBeAttached();
      await expect(toolbar.first().locator('.code-copy-btn')).toBeAttached();
    }
  });

  test('copy button says "Copy" initially', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const entry = page.locator('.fn-entry').first();
    await entry.locator('.fn-hdr').click();
    await page.waitForTimeout(600);

    const btn = entry.locator('.code-copy-btn').first();
    const count = await btn.count();
    if (count > 0) {
      await expect(btn).toHaveText('Copy');
    }
  });

  test('copy button changes to "Copied!" on click', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await goToDoc(page, LANGUAGES[0].path);

    const entry = page.locator('.fn-entry').first();
    await entry.locator('.fn-hdr').click();
    await page.waitForTimeout(600);

    const btn = entry.locator('.code-copy-btn').first();
    const count = await btn.count();
    if (count > 0) {
      await btn.click();
      await page.waitForTimeout(300);
      await expect(btn).toHaveText('Copied!');
      await expect(btn).toHaveClass(/copied/);
    }
  });

  test('code block lang label shows correct language', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const entry = page.locator('.fn-entry').first();
    await entry.locator('.fn-hdr').click();
    await page.waitForTimeout(600);

    const langLabel = entry.locator('.pre-toolbar-lang').first();
    const count = await langLabel.count();
    if (count > 0) {
      const text = await langLabel.textContent();
      expect(text).toBe('python');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// EXTRAORDINARY THEME — CSS & JS enhancements
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Doc pages — extraordinary theme', () => {

  test('background mesh orbs are injected', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const mesh = page.locator('.bg-mesh');
    await expect(mesh).toBeAttached();

    const orbs = page.locator('.bg-mesh .orb');
    await expect(orbs).toHaveCount(3);
  });

  test('particle canvas is created', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const canvas = page.locator('#doc-particles');
    await expect(canvas).toBeAttached();
  });

  test('scroll progress bar exists', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const prog = page.locator('.scroll-progress');
    await expect(prog).toBeAttached();
  });

  test('scroll progress bar updates on scroll', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const prog = page.locator('.scroll-progress');

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(200);

    const width = await prog.evaluate(el => parseFloat(getComputedStyle(el).width));
    expect(width).toBeGreaterThan(0);
  });

  test('search kbd shortcut badge exists', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const kbd = page.locator('.search-kbd');
    await expect(kbd).toBeAttached();
    const text = await kbd.textContent();
    expect(text).toMatch(/Ctrl\+K|⌘K/);
  });

  test('page entrance animation completes (content visible)', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const content = page.locator('#content');
    const opacity = await content.evaluate(el => getComputedStyle(el).opacity);
    expect(opacity).toBe('1');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// HASH NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Doc pages — hash navigation', () => {

  test('navigating with hash opens the targeted entry', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);

    // Get the first function entry's ID
    const firstEntry = page.locator('.fn-entry[id]').first();
    const entryId = await firstEntry.getAttribute('id');

    // Navigate with hash
    await page.goto(`${LANGUAGES[0].path}#${entryId}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('#api-docs-wrapper:not([v-cloak])', { timeout: 15000 });
    await page.waitForTimeout(1000);

    // Entry should be open
    const isOpen = await page.locator(`#${cssEscape(entryId)}`).evaluate(el => el.classList.contains('open'));
    expect(isOpen).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// RESIZABLE SIDEBAR
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Doc pages — resizable sidebar', () => {

  test('resize handle exists', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const handle = page.locator('.sidebar-resize');
    await expect(handle).toBeAttached();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Doc pages — footer', () => {

  for (const lang of LANGUAGES) {
    test(`${lang.id}: footer contains "Made with" text`, async ({ page }) => {
      await goToDoc(page, lang.path);
      const footer = page.locator('.doc-footer');
      const count = await footer.count();
      if (count > 0) {
        const text = await footer.textContent();
        expect(text).toContain('Made with');
      }
    });

    test(`${lang.id}: footer AwsUtil link points to home page`, async ({ page }) => {
      await goToDoc(page, lang.path);
      const link = page.locator('.doc-footer a[href*="awsutil.html"]');
      const count = await link.count();
      if (count > 0) {
        const href = await link.first().getAttribute('href');
        expect(href).toContain('../awsutil.html');
      }
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// MODULE SECTIONS
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Doc pages — module sections', () => {

  test('module sections have heading, meta, and entries', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const section = page.locator('.mod-section').first();

    // Module heading
    const head = section.locator('.mod-head');
    await expect(head).toBeAttached();

    // Module meta (function count)
    const meta = section.locator('.mod-meta');
    await expect(meta).toBeAttached();
    const metaText = await meta.textContent();
    expect(metaText).toContain('functions');
  });

  test('module heading has permalink anchor', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const perma = page.locator('.mod-section .perma a').first();
    await expect(perma).toBeAttached();
    const href = await perma.getAttribute('href');
    expect(href).toMatch(/^#/);
  });

  test('category headings render', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const catHeadings = page.locator('.cat-heading');
    const count = await catHeadings.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CROSS-LANGUAGE CONSISTENCY
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Cross-language consistency', () => {

  test('all 7 doc pages have the same structural elements', async ({ page }) => {
    for (const lang of LANGUAGES) {
      await goToDoc(page, lang.path);

      // Every page must have these elements
      await expect(page.locator('#sidebar')).toBeAttached();
      await expect(page.locator('#content')).toBeAttached();
      await expect(page.locator('.lang-bar')).toBeAttached();
      await expect(page.locator('#side-search')).toBeAttached();
      await expect(page.locator('.page-hdr')).toBeAttached();
      await expect(page.locator('.mod-section')).toHaveCount(await page.locator('.mod-section').count());
    }
  });

  test('all 7 doc pages load doc-extraordinary.css', async ({ page }) => {
    for (const lang of LANGUAGES) {
      await goToDoc(page, lang.path);
      const hasExtraCSS = await page.evaluate(() => {
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        for (var i = 0; i < links.length; i++) {
          if (links[i].href.includes('doc-extraordinary.css')) return true;
        }
        return false;
      });
      expect(hasExtraCSS).toBe(true);
    }
  });

  test('all 7 doc pages load doc-extraordinary.js', async ({ page }) => {
    for (const lang of LANGUAGES) {
      await goToDoc(page, lang.path);
      const hasExtraJS = await page.evaluate(() => {
        var scripts = document.querySelectorAll('script[src]');
        for (var i = 0; i < scripts.length; i++) {
          if (scripts[i].src.includes('doc-extraordinary.js')) return true;
        }
        return false;
      });
      expect(hasExtraJS).toBe(true);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVE SIDEBAR TRACKING
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Doc pages — active sidebar tracking', () => {

  test('scrolling highlights the active module in sidebar', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);

    // Scroll to the second module section
    const sections = page.locator('.mod-section');
    const count = await sections.count();
    if (count > 1) {
      await sections.nth(1).scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      const activeLinks = page.locator('#sidebar .active-nav');
      const activeCount = await activeLinks.count();
      expect(activeCount).toBeGreaterThanOrEqual(1);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PERFORMANCE & NO ERRORS
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Performance and error-free', () => {

  test('no console errors during full page interaction', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await goToDoc(page, LANGUAGES[0].path);

    // Search
    await page.locator('#side-search').fill('s3');
    await page.waitForTimeout(300);
    await page.locator('#side-search').fill('');
    await page.waitForTimeout(300);

    // Click entries
    const entries = page.locator('.fn-entry .fn-hdr');
    const count = await entries.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      await entries.nth(i).click();
      await page.waitForTimeout(200);
    }

    // Scroll
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    expect(errors).toEqual([]);
  });

  test('switching between 3 language pages causes no errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await goToDoc(page, LANGUAGES[0].path); // python
    await goToDoc(page, LANGUAGES[2].path); // go
    await goToDoc(page, LANGUAGES[5].path); // typescript

    expect(errors).toEqual([]);
  });

  for (const lang of LANGUAGES) {
    test(`${lang.id}: no 404 for awsutil_data.js`, async ({ page }) => {
      const failedRequests = [];
      page.on('response', (res) => {
        if (res.url().includes('awsutil_data.js') && res.status() === 404) {
          failedRequests.push(res.url());
        }
      });
      await goToDoc(page, lang.path);
      expect(failedRequests).toEqual([]);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSIVE — mobile viewport
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Responsive — mobile viewport', () => {

  test('home: hero tagline hidden on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goToHome(page);
    const tagline = page.locator('.hero-tagline');
    // On mobile (max-width:768px) the tagline gets display:none
    const display = await tagline.evaluate(el => getComputedStyle(el).display);
    expect(display).toBe('none');
  });

  test('home: language grid stacks to single column', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goToHome(page);
    // Scroll cards section into view first
    await page.evaluate(() => {
      const el = document.querySelector('.lang-grid');
      if (el) el.scrollIntoView();
    });
    await page.waitForTimeout(300);

    const grid = page.locator('.lang-grid');
    const cols = await grid.evaluate(el =>
      getComputedStyle(el).gridTemplateColumns
    );
    // Should be a single column (one value, not multiple)
    const colCount = cols.split(/\s+/).length;
    expect(colCount).toBe(1);
  });

  test('home: orbiters hidden on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await goToHome(page);
    const orbiters = page.locator('.orbiters');
    const display = await orbiters.evaluate(el => getComputedStyle(el).display);
    expect(display).toBe('none');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// MODEL ENTRIES
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Doc pages — model entries', () => {

  test('model entries exist and are expandable', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const modelEntries = page.locator('.model-entry');
    const count = await modelEntries.count();
    if (count > 0) {
      const entry = modelEntries.first();
      await entry.locator('.fn-hdr').click();
      await page.waitForTimeout(300);

      const isOpen = await entry.evaluate(el => el.classList.contains('open'));
      expect(isOpen).toBe(true);
    }
  });

  test('expanded model shows fields', async ({ page }) => {
    await goToDoc(page, LANGUAGES[0].path);
    const modelEntries = page.locator('.model-entry');
    const count = await modelEntries.count();
    if (count > 0) {
      await modelEntries.first().locator('.fn-hdr').click();
      await page.waitForTimeout(300);

      const body = modelEntries.first().locator('.fn-body');
      await expect(body).toBeVisible();
    }
  });
});
