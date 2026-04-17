/**
 * animations.js - Site-wide animation engine.
 *
 * Features:
 *   1. Button click ripple effect (all buttons get a material-design ripple)
 *   2. Scroll-reveal via IntersectionObserver (elements with .animate-on-scroll fade in)
 *   3. Auto-stagger for card lists (Vue-rendered lists get staggered delays)
 */
(function () {
    "use strict";

    // ── 1. Button Click Ripple ────────────────────────────────────

    function createRipple(e) {
        var btn = e.currentTarget;
        var rect = btn.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height) * 2;
        var x = e.clientX - rect.left - size / 2;
        var y = e.clientY - rect.top - size / 2;

        var ripple = document.createElement("span");
        ripple.className = "ripple-effect";
        ripple.style.width = ripple.style.height = size + "px";
        ripple.style.left = x + "px";
        ripple.style.top = y + "px";

        btn.appendChild(ripple);

        ripple.addEventListener("animationend", function () {
            ripple.remove();
        });
    }

    function attachRipples() {
        var buttons = document.querySelectorAll(
            "button:not(.glow-on-hover-nav), .glow-on-hover, .glow-on-hover2, .glow-on-hover3, " +
            ".glow-on-hover4, .glow-on-hover5, .glow-on-hover6, " +
            ".glow-on-hover8, .glow-on-hover9, .glow-on-hover12, " +
            ".pop-up-button, .button-55"
        );
        for (var i = 0; i < buttons.length; i++) {
            if (!buttons[i].dataset.ripple) {
                buttons[i].style.position = buttons[i].style.position || "relative";
                buttons[i].style.overflow = "hidden";
                buttons[i].addEventListener("click", createRipple);
                buttons[i].dataset.ripple = "1";
            }
        }
    }

    // ── 2. Scroll-Reveal (IntersectionObserver) ───────────────────

    var scrollObserver = null;

    function initScrollReveal() {
        if (!("IntersectionObserver" in window)) {
            // Fallback: just show everything
            var els = document.querySelectorAll(".animate-on-scroll, .animate-slide-left, .animate-slide-right, .animate-scale");
            for (var i = 0; i < els.length; i++) {
                els[i].classList.add("animated");
            }
            return;
        }

        scrollObserver = new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
                if (entries[i].isIntersecting) {
                    entries[i].target.classList.add("animated");
                    scrollObserver.unobserve(entries[i].target);
                }
            }
        }, {
            threshold: 0.08,
            rootMargin: "0px 0px -40px 0px"
        });

        observeElements();
    }

    function observeElements() {
        if (!scrollObserver) return;
        var els = document.querySelectorAll(
            ".animate-on-scroll:not(.animated), " +
            ".animate-slide-left:not(.animated), " +
            ".animate-slide-right:not(.animated), " +
            ".animate-scale:not(.animated)"
        );
        for (var i = 0; i < els.length; i++) {
            scrollObserver.observe(els[i]);
        }
    }

    // ── 3. Auto-Stagger for Dynamic Lists ─────────────────────────

    function autoStagger() {
        // Stagger w3-card elements inside Vue app containers
        var containers = document.querySelectorAll(
            "#app_software, #app_work, #app_academia, " +
            "[id^='app_'] .w3-card"
        );

        // Also stagger direct child cards in common containers
        var cardContainers = document.querySelectorAll(
            ".w3-content, .w3-row-padding"
        );

        for (var c = 0; c < cardContainers.length; c++) {
            var cards = cardContainers[c].querySelectorAll(":scope > .w3-card, :scope > .w3-card-2, :scope > div > .w3-card, :scope > div > .w3-card-2");
            for (var i = 0; i < cards.length; i++) {
                if (!cards[i].classList.contains("animate-on-scroll")) {
                    cards[i].classList.add("animate-on-scroll");
                    var delay = Math.min(i * 0.12, 1.0);
                    cards[i].style.transitionDelay = delay + "s";
                }
            }
        }

        observeElements();
    }

    // ── 4. Re-attach after Vue Renders ────────────────────────────

    function onReady() {
        attachRipples();
        initScrollReveal();

        // Wait for Vue to render, then stagger + re-attach ripples
        setTimeout(function () {
            autoStagger();
            attachRipples();
            observeElements();
        }, 300);

        // Also watch for late-loading Vue content
        setTimeout(function () {
            attachRipples();
            observeElements();
        }, 1500);
    }

    // ── Init ──────────────────────────────────────────────────────

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", onReady);
    } else {
        onReady();
    }

    // Re-observe when new content is injected (e.g., Vue v-for renders)
    if ("MutationObserver" in window) {
        var mo = new MutationObserver(function () {
            attachRipples();
            observeElements();
        });
        mo.observe(document.documentElement, { childList: true, subtree: true });
    }
})();
