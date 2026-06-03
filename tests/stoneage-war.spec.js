// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * SPEC v1.8.0 — Stone Age Tribal War scene takeover.
 * Canvas pixels are not directly assertable, so this spec validates:
 *   • the War-Mode public API drives the stoneage chip without throwing,
 *   • the simulation animates error-free for ~1.5 s while active,
 *   • toggling on/off never freezes or throws.
 */
test.describe('Stone Age Tribal War — war-mode scene takeover', () => {
    test('stoneage chip activates without console errors', async ({ page }) => {
        // Pre-existing, site-wide noise unrelated to this feature:
        //  • "animateIcons is not defined" — load-order race in icon-animation.js
        //  • 404 resource loads from other widgets
        // Filter those out; any OTHER error (especially from the war/stone-age
        // simulation in nyc-city.js) must fail the test.
        const PRE_EXISTING = /animateIcons|Failed to load resource|404|favicon/i;
        const errors = [];
        const record = (txt) => { if (!PRE_EXISTING.test(txt)) errors.push(txt); };
        page.on('console', (msg) => { if (msg.type() === 'error') record(msg.text()); });
        page.on('pageerror', (err) => record(String(err)));

        await page.goto('/index.html', { waitUntil: 'load' });
        await page.waitForTimeout(600);

        const api = await page.evaluate(() => {
            return {
                hasSet: typeof window.setWarModeIndex === 'function',
                hasName: typeof window.getWarModeName === 'function',
                hasOn: typeof window.isWarModeOn === 'function'
            };
        });
        expect(api.hasSet).toBe(true);
        expect(api.hasName).toBe(true);
        expect(api.hasOn).toBe(true);

        // Selecting a war type from the tooltip must NOT start the war —
        // only the War Mode button (toggleWarMode) starts it.
        const afterSelect = await page.evaluate(() => {
            window.setWarModeIndex(0);            // index 0 === stoneage
            return { on: window.isWarModeOn(), name: window.getWarModeName() };
        });
        expect(afterSelect.name).toContain('Stone Age');
        expect(afterSelect.on).toBe(false);       // selecting alone does not start

        // Clicking the button (toggleWarMode) starts it.
        const state = await page.evaluate(() => {
            window.toggleWarMode();
            return { on: window.isWarModeOn(), name: window.getWarModeName() };
        });
        expect(state.on).toBe(true);
        expect(state.name).toContain('Stone Age');

        // let the battle simulation run
        await page.waitForTimeout(1500);

        // toggling off then on must not throw or freeze
        await page.evaluate(() => {
            window.stopWarMode();
            window.setWarModeIndex(0);
            window.toggleWarMode();
            window.toggleWarMode();
        });
        await page.waitForTimeout(400);

        expect(errors).toEqual([]);
    });
});
