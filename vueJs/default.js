/**
 * default.js - Shared Vue 3 app factory for pages that need basic
 * responsive layout data (window dimensions, element positioning).
 *
 * Creates a Vue app with window resize tracking and positioning helpers.
 * Uses safeMount pattern: only mounts if the target selector exists.
 */
function createPortfolioApp(mountId, middleOffset) {
    var app = Vue.createApp({
        data: function () {
            return {
                greeting: "Hello Vue 3!",
                isVisible: false,
                isVisible2: true,
                button_to_activate_box: false,
                button_text: "show",
                windowHeight: window.innerHeight,
                windowWidth: window.innerWidth,
                rand: "10px",
                color: "red",
                middle: (window.innerWidth - middleOffset) / 2,
                middle2: (window.innerWidth - 10) / 2
            };
        },
        mounted: function () {
            this.$nextTick(function () {
                window.addEventListener("resize", this.onResize);
            });
        },
        beforeUnmount: function () {
            window.removeEventListener("resize", this.onResize);
        },
        methods: {
            toggleBox: function () {
                this.button_to_activate_box = !this.button_to_activate_box;
                this.button_text = this.button_text === "show" ? "hide" : "show";
            },
            greet: function (greeting) {
                console.log(greeting);
            },
            onResize: function () {
                this.windowHeight = window.innerHeight;
                this.windowWidth = window.innerWidth;
                this.middle = (window.innerWidth - middleOffset) / 2;
                this.middle2 = (window.innerWidth - 50) / 2;
            },
            modelStyle: function (slide) {
                if (slide === "middle") {
                    return { left: this.middle + "px" };
                } else if (slide === "middle2") {
                    return { left: this.middle2 + "px" };
                }
            }
        }
    });
    if (document.querySelector(mountId)) {
        app.mount(mountId);
    }
    return app;
}

var app = createPortfolioApp("#app", 900);
var app2 = createPortfolioApp("#app2", 960);
