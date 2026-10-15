// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * SPEC v1.9.0 — every War Mode era is now a full strategy game.
 * For each era: selecting it opens the War Council, it has its own unit
 * roster, and a battle runs error-free.
 */
const PRE_EXISTING = /animateIcons|Failed to load resource|404|favicon/i;

test('every war era opens a War Council and battles error-free', async ({ page }) => {
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error' && !PRE_EXISTING.test(m.text())) errors.push(m.text()); });
    page.on('pageerror', (e) => { if (!PRE_EXISTING.test(String(e))) errors.push(String(e)); });

    await page.goto('/index.html', { waitUntil: 'load' });
    await page.waitForTimeout(600);

    const eraCount = await page.evaluate(() => window.getAllWarModes().length);
    expect(eraCount).toBeGreaterThan(10);

    for (let i = 0; i < eraCount; i++) {
        const info = await page.evaluate((idx) => {
            window.stopWarMode();
            window.setWarModeIndex(idx);
            window.toggleWarMode();
            const p = document.querySelector('.sa-strat');
            return {
                name: window.getWarModeName(),
                on: window.isWarModeOn(),
                councilOpen: p ? p.style.display !== 'none' : false,
                units: document.querySelectorAll('.hx').length
            };
        }, i);
        expect(info.on, `era ${i} on`).toBe(true);
        expect(info.councilOpen, `era ${i} (${info.name}) War Council open`).toBe(true);
        expect(info.units, `era ${i} (${info.name}) has a roster`).toBeGreaterThan(0);

        // give battle and let it run briefly
        await page.evaluate(() => { const g = document.querySelector('.sa-go[data-act=battle]'); if (g) g.click(); });
        await page.waitForTimeout(500);
    }

    await page.waitForTimeout(300);
    expect(errors).toEqual([]);
});
