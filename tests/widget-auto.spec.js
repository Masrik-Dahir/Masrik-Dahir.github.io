// @ts-check
const { test, expect } = require('@playwright/test');
test('auto-active widgets stop on click', async ({ page }) => {
    const errs = [];
    page.on('pageerror', e => errs.push(String(e)));
    await page.goto('/index.html', { waitUntil: 'load' });
    await page.waitForTimeout(700);
    const cfg = [
        { wrap: 'warBtn', auto: 'ttWarAutoBtn', core: '.war-core', active: 'active' },
        { wrap: 'missileBtn', auto: 'ttAttackAutoBtn', core: '.msl-core', active: 'armed' },
        { wrap: 'abductionBtn', auto: 'ttAbductionAutoBtn', core: '.abd-core', active: 'active' },
        { wrap: 'superheroBtn', auto: 'ttSuperheroAutoBtn', core: '.sup-core', active: 'active' },
    ];
    for (const w of cfg) {
        const r = await page.evaluate((w) => {
            const autoBtn = document.getElementById(w.auto);
            const wrap = document.getElementById(w.wrap);
            const core = wrap.querySelector(w.core);
            autoBtn.click();                              // turn auto ON
            const afterAuto = { autoOn: autoBtn.getAttribute('aria-pressed') === 'true', active: wrap.classList.contains(w.active) };
            core.click();                                 // click active widget → should stop
            const afterClick = { autoOn: autoBtn.getAttribute('aria-pressed') === 'true', active: wrap.classList.contains(w.active) };
            return { afterAuto, afterClick };
        }, w);
        expect(r.afterAuto.autoOn, `${w.wrap} auto turned on`).toBe(true);
        expect(r.afterAuto.active, `${w.wrap} shows active when auto on`).toBe(true);
        expect(r.afterClick.autoOn, `${w.wrap} auto stopped on click`).toBe(false);
        expect(r.afterClick.active, `${w.wrap} inactive after click`).toBe(false);
    }
    // defence is inverted (active = NOT offline)
    const d = await page.evaluate(() => {
        const autoBtn = document.getElementById('ttDefenceAutoBtn');
        const wrap = document.getElementById('defenceBtn');
        const core = wrap.querySelector('.dfn-core');
        autoBtn.click();
        const a = { autoOn: autoBtn.getAttribute('aria-pressed') === 'true', active: !wrap.classList.contains('offline') };
        core.click();
        const b = { autoOn: autoBtn.getAttribute('aria-pressed') === 'true', active: !wrap.classList.contains('offline') };
        return { a, b };
    });
    expect(d.a.autoOn && d.a.active, 'defence active when auto on').toBe(true);
    expect(d.b.autoOn, 'defence auto stopped').toBe(false);
    expect(d.b.active, 'defence inactive after click').toBe(false);
    expect(errs.filter(e => !/animateIcons/.test(e))).toEqual([]);
});
