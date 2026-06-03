// @ts-check
const { test, expect } = require('@playwright/test');

const PRE_EXISTING = /animateIcons|Failed to load resource|404|favicon/i;

test('auto war fields 50/side at full graphics (simple render OFF)', async ({ page }) => {
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error' && !PRE_EXISTING.test(m.text())) errors.push(m.text()); });
    page.on('pageerror', (e) => { if (!PRE_EXISTING.test(String(e))) errors.push(String(e)); });

    await page.goto('/index.html', { waitUntil: 'load' });
    await page.waitForTimeout(600);

    const s = await page.evaluate(() => {
        window.stopWarMode();
        window.toggleWarAuto();          // turn auto ON -> kicks off a battle
        window.stepWarBattle(33, 3);     // advance a few frames
        return window.getWarBattleState();
    });

    expect(s.auto, 'auto campaign on').toBe(true);
    expect(s.totalA, 'side A = 50').toBe(50);
    expect(s.totalB, 'side B = 50').toBe(50);
    expect(s.simple, 'auto keeps full-detail render (simple OFF)').toBe(false);
    expect(errors).toEqual([]);
});
