// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Home-page widget hover panels must fit on short laptop screens: the
 * placement script in index.html flips a panel below its button (or caps
 * its height) when there is no room above, and nudges it back on-screen
 * horizontally.
 */

test.describe('Home widget tooltips — fit short laptop screens', () => {
    for (const vp of [{ width: 1366, height: 700 }, { width: 1280, height: 600 }, { width: 1100, height: 560 }, { width: 1920, height: 1080 }]) {
        test(`every hover panel is fully visible at ${vp.width}x${vp.height}`, async ({ browser }) => {
            const ctx = await browser.newContext({ viewport: vp });
            const page = await ctx.newPage();
            await page.goto('/index.html', { waitUntil: 'load' });
            await page.waitForTimeout(1500);

            const count = await page.evaluate(() => {
                const tips = document.querySelectorAll('.widget-tooltip');
                tips.forEach((t, i) => t.parentElement.setAttribute('data-tt-test', String(i)));
                return tips.length;
            });
            expect(count).toBeGreaterThan(0);

            for (let i = 0; i < count; i++) {
                const host = page.locator(`[data-tt-test="${i}"]`);
                if (!(await host.isVisible())) continue;
                await page.mouse.move(2, vp.height - 2);
                await page.waitForTimeout(150);
                await host.hover();
                await page.waitForTimeout(600);
                const r = await page.evaluate((idx) => {
                    const tip = document.querySelector(`[data-tt-test="${idx}"] > .widget-tooltip`);
                    const box = tip.getBoundingClientRect();
                    const nav = document.querySelector('.topnav.navbar-fixed-top').getBoundingClientRect();
                    return { top: box.top, bottom: box.bottom, left: box.left, right: box.right,
                             navBottom: nav.bottom, opacity: +getComputedStyle(tip).opacity, cls: tip.className };
                }, i);
                expect(r.opacity, r.cls).toBeGreaterThan(0.9);
                expect(r.top, `${r.cls} hidden under the nav`).toBeGreaterThanOrEqual(r.navBottom - 1);
                expect(r.bottom, `${r.cls} runs off the bottom`).toBeLessThanOrEqual(vp.height + 1);
                expect(r.left, `${r.cls} runs off the left`).toBeGreaterThanOrEqual(-1);
                expect(r.right, `${r.cls} runs off the right`).toBeLessThanOrEqual(vp.width + 1);
            }
            await ctx.close();
        });
    }
});
