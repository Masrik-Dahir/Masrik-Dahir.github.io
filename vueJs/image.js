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
                isSlideVisible: true,
                resources,
                name: stateName
            };
        },
        mounted() {
            if (this.resources.length) this.resources[0].isActive = true;
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
                // this.currentIndex = index;
                this.resources.forEach((item, i) => {
                    item.isActive = (i === index);
                });
                this.scrollToActiveImage();
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
            showSlide() { this.isSlideVisible = true; },
            showGallery() { this.isSlideVisible = false; },

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