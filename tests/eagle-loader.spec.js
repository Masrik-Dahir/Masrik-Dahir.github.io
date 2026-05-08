// @ts-check
const { test, expect } = require('@playwright/test');

const PAGES = [
    '/index.html',
    '/work.html',
    '/academia.html',
    '/software.html',
    '/milestone.html',
    '/games.html',
    '/map.html',
];

test.describe('Eagle Loader — site-wide loading screen', () => {
    for (const path of PAGES) {
        test(`appears on ${path}`, async ({ page }) => {
            await page.goto(path);
            await expect(page.locator('.eagle-loader')).toBeAttached({ timeout: 2000 });
        });

        test(`hides after window load on ${path}`, async ({ page }) => {
            await page.goto(path, { waitUntil: 'load' });
            // Loader has a min-visible-ms guard (~420 ms) before fading out
            await page.waitForTimeout(900);
            const isHidden = await page.evaluate(() => {
                const el = document.querySelector('.eagle-loader');
                if (!el) return true;
                return el.classList.contains('is-hidden')
                    || getComputedStyle(el).visibility === 'hidden';
            });
            expect(isHidden).toBe(true);
        });
    }

    test('public API show / hide / isVisible round-trip', async ({ page }) => {
        await page.goto('/index.html', { waitUntil: 'load' });
        await page.waitForTimeout(900);
        const result = await page.evaluate(async () => {
            const log = [];
            log.push(['initial', !!window.EagleLoader, window.EagleLoader && window.EagleLoader.isVisible()]);
            window.EagleLoader.show();
            await new Promise(r => setTimeout(r, 50));
            log.push(['after-show', window.EagleLoader.isVisible()]);
            window.EagleLoader.hide();
            await new Promise(r => setTimeout(r, 600));
            log.push(['after-hide', window.EagleLoader.isVisible()]);
            return log;
        });
        expect(result[0][1]).toBe(true);            // EagleLoader exists
        expect(result[1][1]).toBe(true);            // visible after show
        expect(result[2][1]).toBe(false);           // hidden after hide
    });

    test('polish class is applied to body', async ({ page }) => {
        await page.goto('/work.html', { waitUntil: 'load' });
        await expect(page.locator('body.polish')).toBeAttached();
    });

    test('page graphics canvas is created when theme is set', async ({ page }) => {
        await page.goto('/work.html', { waitUntil: 'load' });
        await page.waitForTimeout(500);
        await expect(page.locator('#page-graphics-canvas')).toBeAttached();
    });

    test('page graphics canvas is NOT created when theme is none', async ({ page }) => {
        await page.goto('/index.html', { waitUntil: 'load' });
        await page.waitForTimeout(500);
        const count = await page.locator('#page-graphics-canvas').count();
        expect(count).toBe(0);
    });

    test('top nav stays pinned when the page is scrolled (no transform on body)', async ({ page }) => {
        await page.goto('/work.html', { waitUntil: 'load' });
        await page.waitForTimeout(900);
        const result = await page.evaluate(async () => {
            window.scrollTo(0, 600);
            await new Promise(r => setTimeout(r, 200));
            const nav = document.querySelector('.topnav');
            return {
                bodyTransform: getComputedStyle(document.body).transform,
                navTop: nav ? nav.getBoundingClientRect().top : null,
                scrollY: window.scrollY
            };
        });
        // Body must have no non-`none` transform — anything else creates a
        // containing block and breaks Bootstrap's navbar-fixed-top.
        expect(result.bodyTransform).toBe('none');
        // Nav must still be at the top of the viewport after scrolling.
        expect(result.navTop).toBe(0);
        expect(result.scrollY).toBeGreaterThan(0);
    });

    test('top nav is rendered ABOVE content when scrolled (z-index stacking)', async ({ page }) => {
        await page.goto('/work.html', { waitUntil: 'load' });
        await page.waitForTimeout(900);
        const result = await page.evaluate(async () => {
            window.scrollTo(0, 800);
            await new Promise(r => setTimeout(r, 200));
            // Hit-test the top-center of the viewport — it should hit the
            // topnav (or one of its descendants), not page content.
            const els = document.elementsFromPoint(window.innerWidth / 2, 20);
            const topnav = document.querySelector('.topnav');
            const hitsNav = els.some(e => e === topnav || topnav.contains(e));
            return {
                hitsNav: hitsNav,
                topElementTag: els[0] ? els[0].tagName : null,
                topElementClasses: els[0] ? (els[0].className || '').toString().slice(0, 80) : null
            };
        });
        expect(result.hitsNav).toBe(true);
    });
});
