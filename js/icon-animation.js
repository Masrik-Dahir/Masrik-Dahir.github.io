/**
 * Animate a FontAwesome icon element through a sequence of icon codes.
 *
 * @param {string} elementId - The DOM element ID to animate.
 * @param {string[]} icons - Array of HTML entity strings (e.g. ["&#xf244;", "&#xf243;"]).
 * @param {number} stepMs - Milliseconds between each icon change (default 1000).
 */
function animateIcons(elementId, icons, stepMs) {
    stepMs = stepMs || 1000;
    var totalDuration = icons.length * stepMs;

    function run() {
        var el = document.getElementById(elementId);
        if (!el) return;

        icons.forEach(function (icon, i) {
            setTimeout(function () {
                el.innerHTML = icon;
            }, i * stepMs);
        });
    }

    run();
    setInterval(run, totalDuration);
}
