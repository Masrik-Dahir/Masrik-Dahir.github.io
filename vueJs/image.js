/**
 * image.js - Vue components for state/region image galleries.
 *
 * Data flow:
 *   1. fetchData() loads image counts from CloudFront JSON
 *   2. mountVueInstances() creates a Vue app per state via createStateComponent()
 *   3. safeMount() only mounts if the target selector exists in the DOM
 *
 * Each state component provides:
 *   - Gallery view (grid of thumbnails with active selection)
 *   - Slideshow view (auto-advancing slides via state-gallery.js controls)
 *   - Search filtering on image titles
 *
 * Requires: Vue 3, state-gallery.js (for slideshow DOM controls)
 */
function createStateComponent(stateName, stateAbbreviation, numImages = 10) {
    return {
        name: `app_${stateAbbreviation.toLowerCase()}`,
        data() {
            let resources = [];
            for (let i = 1; i <= numImages; i++) {
                resources.push({
                    title: `${i}`,
                    url: `https://d3dw5jtb3w1kgy.cloudfront.net/${stateName}/${i}.jpg`,
                    isActive: false
                });
            }

            return {
                // currentIndex: 0,
                searchQuery: "",

                // ✅ GALLERY FIRST BY DEFAULT
                isSlideVisible: false,

                resources,
                name: stateName
            };
        },
        mounted() {
            if (this.resources.length) this.resources[0].isActive = true;

            // ✅ Force gallery after Vue mounts (prevents blank first load)
            this.isSlideVisible = false;

            // Sync with global DOM togglers if present
            if (typeof window.showGalById === "function") {
                window.showGalById();
            }
        },
        computed: {
            resultQuery() {
                if (this.searchQuery) {
                    return this.resources.filter(item =>
                        this.searchQuery.toLowerCase().split(" ")
                            .every(v => item.title.toLowerCase().includes(v))
                    );
                }
                return this.resources;
            },
            limitedResultQuery() {
                return this.resultQuery.slice(0, Math.min(this.resultQuery.length, 30));
            },
            phoneLimitedResultQuery() {
                return this.resultQuery.slice(0, Math.min(this.resultQuery.length, 10));
            }
        },
        methods: {
            selectImage(index) {
                /* Mark this card as the active one, then OPEN the
                   full-viewport lightbox at that exact photo. The
                   user clicks a thumbnail → that photo blows up to
                   fill the screen. */
                this.resources.forEach((item, i) => {
                    item.isActive = (i === index);
                });
                this.isSlideVisible = true;
                if (typeof window.showSlideById === "function") {
                    window.showSlideById();
                }
                if (typeof window.currentSlide === "function") {
                    window.currentSlide(index + 1);
                }
                /* Auto-pause: opening from a thumbnail means the user
                   wants to study THAT photo — don't auto-advance. */
                if (typeof window.pauseSlideShow === "function") {
                    setTimeout(window.pauseSlideShow, 0);
                }
            },
            scrollToActiveImage() {
                this.$nextTick(() => {
                    const activeIndex = this.resources.findIndex(item => item.isActive);
                    if (activeIndex !== -1) {
                        const activeImage = this.$refs[`activeImage${activeIndex}`];
                        if (activeImage) {
                            activeImage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                    }
                });
            },

            // ✅ Show slideshow (Vue + global JS)
            showSlide() {
                this.isSlideVisible = true;
                if (typeof window.showSlideById === "function") {
                    window.showSlideById(); // also starts slideshow interval in your HTML script
                }
            },

            // ✅ Show gallery (Vue + global JS)
            showGallery() {
                this.isSlideVisible = false;
                if (typeof window.showGalById === "function") {
                    window.showGalById(); // also stops slideshow interval in your HTML script
                }
            },

            // Dot click -> sync Vue + global slideshow
            currentSlideVue(index) {
                // this.currentIndex = index;
                if (window.currentSlide) window.currentSlide(index + 1);
            }
        }
    };
}

async function fetchData() {
    const url = 'https://d3dw5jtb3w1kgy.cloudfront.net/Json/image.json';
    try {
        const response = await fetch(`${url}?cb=${Date.now()}`, {
            mode: "cors",
            credentials: "omit",
            cache: "no-store",
        });
        if (!response.ok) throw new Error(`Bad status ${response.status}`);
        return await response.json();
    } catch (err) {
        console.error("Error fetching JSON:", err);
        return [];
    }
}

function safeMount(app, selector) {
    if (document.querySelector(selector)) app.mount(selector);
}

function mountVueInstances(images) {
    images.forEach(state => {
        const baseId = `app_${state.abbreviation.toLowerCase().replace(/\s+/g, '_')}`;

        safeMount(Vue.createApp(createStateComponent(state.name, state.abbreviation, state.numImages)), `#${baseId}`);
        safeMount(Vue.createApp(createStateComponent(state.name, state.abbreviation, state.numImages)), `#${baseId}_2`);
        safeMount(Vue.createApp(createStateComponent(state.name, state.abbreviation, state.numImages)), `#${baseId}_3`);
        safeMount(Vue.createApp(createStateComponent(state.name, state.abbreviation, state.numImages)), `.${baseId}`);
    });
}

fetchData().then(mountVueInstances);
