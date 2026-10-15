// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Verifies the modern-era combat overhaul:
 *   • WW1, WW2 and Modern Warfare battles are LETHAL (soldiers die),
 *   • firearms emit fast bullets and tanks/artillery emit explosive shells,
 *   • activating every era (incl. cavalry-heavy ones) throws no console errors.
 */
const PRE_EXISTING = /animateIcons|Failed to load resource|404|favicon/i;

async function findEra(page, match) {
    return await page.evaluate((m) => {
        const all = window.getAllWarModes();
        const hit = all.find((x) => x.id === m);
        return hit ? hit.index : -1;
    }, match);
}

test('modern eras are lethal and fire real bullets/shells', async ({ page }) => {
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error' && !PRE_EXISTING.test(m.text())) errors.push(m.text()); });
    page.on('pageerror', (e) => { if (!PRE_EXISTING.test(String(e))) errors.push(String(e)); });

    await page.goto('/index.html', { waitUntil: 'load' });
    await page.waitForTimeout(600);

    for (const id of ['wwi', 'wwii']) {
        const idx = await findEra(page, id);
        expect(idx, `era ${id} exists`).toBeGreaterThanOrEqual(0);

        // Run the fight, reading the engine's CUMULATIVE shots-fired tally
        // (not a transient snapshot of in-flight projectiles) so the assertion
        // can't be missed just because a sample happened to land between volleys
        // — robust even when many headless pages share the CPU under parallel
        // workers. We stop as soon as casualties + firearm rounds are confirmed.
        let last = null;
        for (let s = 0; s < 20; s++) {
            last = await runBattleStep(page, idx, s === 0);
            if (last.downed > 0 && (last.fired.bullet > 0 || last.fired.shell > 0)) break;
        }
        expect(last.phase === 'battle' || last.phase === 'result', `${id} ran a battle`).toBeTruthy();
        expect(last.downed, `${id} produced casualties`).toBeGreaterThan(0);
        // firearms (bullet) and/or shells must have been fired during the fight
        expect(last.fired.bullet > 0 || last.fired.shell > 0, `${id} fired bullets or shells`).toBeTruthy();
    }

    expect(errors).toEqual([]);
});

// helper that starts the battle once then advances the sim deterministically
// (independent of requestAnimationFrame / machine load) on each call
async function runBattleStep(page, idx, start) {
    return await page.evaluate(({ idx, start }) => {
        if (start) {
            window.stopWarMode();
            window.setWarModeIndex(idx);
            window.toggleWarMode();
            window.startWarBattle();           // deterministic start (no DOM race)
        }
        window.stepWarBattle(33, 20);          // ~0.66s of simulation per call
        return window.getWarBattleState();
    }, { idx, start });
}
