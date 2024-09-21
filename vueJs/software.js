const { createApp, ref } = Vue

const app_software = {
    data() {
        return {
            searchQuery: null,
            resources:[
                {
                    title:"Cronus",
                    des:"Comparing and Contrasting Concept Maps, Algorithmic Grading",
                    uri_github:"https://github.com/Masrik-Dahir/Cronus",
                    uri_windows:"",
                    uri_android:"",
                    uri_apple:"",
                    uri_web:"",
                    uri:"https://github.com/Masrik-Dahir/Cronus"
                },
                {
                    title:"Video Downloader",
                    des:"Download any video files from a web url, convert video to audio, YouTube video downloader",
                    uri_github:"https://github.com/Masrik-Dahir/Downloader",
                    uri_windows:"https://github.com/Masrik-Dahir/Downloader/releases/latest",
                    uri_android:"",
                    uri_apple:"",
                    uri_web:"",
                    uri:"https://github.com/Masrik-Dahir/Downloader"
                },
                {
                    title:"Fraud Detection Model",
                    des:"A threat modeling of attacks realizable in ClaimChain through attack trees, red flags identified by National Insurance Crime Bureau and use Machine Learning models to detect fraudulent activities with significant accuracy",
                    uri_github:"https://github.com/Masrik-Dahir/Fraud-Model",
                    uri_windows:"",
                    uri_android:"",
                    uri_apple:"",
                    uri_web:"",
                    uri:"https://github.com/Masrik-Dahir/Fraud-Model"
                },
                {
                    title:"DDoS Penetration Testing Tool",
                    des:"A penetration testing tool to conduct DDoS attack in Application layer and Transport layer",
                    uri_github:"https://github.com/Masrik-Dahir/DDoS_interface",
                    uri_windows:"https://github.com/Masrik-Dahir/DDoS-interface/releases/latest",
                    uri_android:"",
                    uri_apple:"",
                    uri_web:"",
                    uri:"https://github.com/Masrik-Dahir/DDoS_interface"
                },
                {
                    title:"Password Manager",
                    des:"Encrypt, decrypt files and folders and hash matches (md5, sha1, sha224, sha256, sha384, sha512) to check file integrity, password manager",
                    uri_github:"https://github.com/Masrik-Dahir/Encryption-decryption-interface",
                    uri_windows:"https://github.com/Masrik-Dahir/Encryption-decryption-interface/releases/latest",
                    uri_android:"",
                    uri_apple:"",
                    uri_web:"",
                    uri:"https://github.com/Masrik-Dahir/Encryption-decryption-interface"
                },
                {
                    title:"PDF Interface",
                    des:"",
                    uri_github:"https://github.com/Masrik-Dahir/Pdf_interface",
                    uri_windows:"",
                    uri_android:"",
                    uri_apple:"",
                    uri_web:"",
                    uri:"https://github.com/Masrik-Dahir/Pdf_interface"
                },
                {
                    title:"Formats",
                    des:"OCR, Bar code, and QR code scanner, text to speech",
                    uri_github:"https://github.com/Masrik-Dahir/Formats",
                    uri_windows:"",
                    uri_android:"https://github.com/Masrik-Dahir/Formats/releases/latest",
                    uri_apple:"",
                    uri_web:"",
                    uri:"https://github.com/Masrik-Dahir/Formats"
                },
                {
                    title:"Automata",
                    des:"Converts the regex to NFA, DFA, Minimum-DFA; converts CFG to LL Grammar and CNF",
                    uri_github:"https://github.com/Masrik-Dahir/Automation",
                    uri_windows:"",
                    uri_android:"https://github.com/Masrik-Dahir/Automation/releases/latest",
                    uri_apple:"",
                    uri_web:"",
                    uri:"https://github.com/Masrik-Dahir/Automation"
                },
                {
                    title:"Universal Calculator",
                    des:"Basic Calculator, Scientific Calculator, Bitwise Calculator (i.e., decimal, binary, hexadecimal), Unit Calculator (i.e., Any types of unit in all standards), Binary operations (i.e., 1's complement, 2's complement) ",
                    uri_github:"https://github.com/Masrik-Dahir/Universal-calculator",
                    uri_windows:"",
                    uri_android:"https://github.com/Masrik-Dahir/Universal-calculator/releases/latest",
                    uri_apple:"",
                    uri_web:"",
                    uri:"https://github.com/Masrik-Dahir/Universal-calculator"
                },
                {
                    title:"Real Estate Analyzer",
                    des:"Mortgage Analysis, Cash Flow Analysis",
                    uri_github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",
                    uri_windows:"",
                    uri_android:"",
                    uri_apple:"",
                    uri_web:"web/re",
                    uri:"web/re"
                },
                {
                    title:"Stock Market",
                    des:"PHP Server: Building financial model and charts for ETFs, Mutual Funds, Cryptocurrencies, and Options ",
                    uri_github:"https://github.com/Masrik-Dahir/DATABASE_database",
                    uri_windows:"",
                    uri_android:"",
                    uri_apple:"",
                    uri_web:"",
                    uri:"https://github.com/Masrik-Dahir/DATABASE_database"
                },
                {
                    title:"Employee Management System",
                    des:"NodeJS Server: CRUD Functionalities for employees ",
                    uri_github:"https://github.com/Masrik-Dahir/Fastify_server",
                    uri_windows:"",
                    uri_android:"",
                    uri_apple:"",
                    uri_web:"",
                    uri:"https://github.com/Masrik-Dahir/Fastify_server"
                },

            ]
        };
    },
    computed: {
        resultQuery(){
            if(this.searchQuery){
                return this.resources.filter((item)=>{
                    return this.searchQuery.toLowerCase().split(' ').every(v => item.title.toLowerCase().includes(v) || item.des.toLowerCase().includes(v))
                })
            }else{
                return this.resources;
            }
        }
    }
}

const app_map = {
    data() {
        return {
            greeting: 'Hello Vue 3!',
            isVisible: false,
            isVisible2: true,
            button_to_activate_box: false,
            button_text: "show",
            windowHeight: window.innerHeight,
            windowWidth: window.innerWidth,
            rand: '10px',
            color: 'red',
            middle: (window.innerWidth - 900)/2,
            middle2: (window.innerWidth - 10)/2,

            searchQuery: null,
            resources:[
                {
                    title:"United States",
                },
                {
                    title:"Canada",
                },
                {
                    title:"British Isles",
                },

            ]
        };
    },
    computed: {
        resultQuery(){
            if(this.searchQuery){
                return this.resources.filter((item)=>{
                    return this.searchQuery.toLowerCase().split(' ').every(v => item.title.toLowerCase().includes(v))
                })
            }else{
                return this.resources;
            }
        }
    },


    mounted() {
        this.$nextTick(() => {
            window.addEventListener('resize', this.onResize);
        })
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.onResize);
    },
    methods: {
        toggleBox() {
            this.button_to_activate_box = !this.button_to_activate_box;

            if (this.button_text == "show") {
                this.button_text = "hide";
            } else {
                this.button_text = "show";
            }
        },
        greet(greeting) {
            console.log(greeting);
        },
        onResize() {
            this.windowHeight = window.innerHeight;
            this.windowWidth = window.innerWidth;
            this.middle = (window.innerWidth - 1000) / 2;
            this.middle2 = (window.innerWidth - 50) / 2;
        },
        modelStyle: function (slide) {

            if (slide === 'middle') {
                return {
                    'left': `${this.middle}px`
                };
            } else if (slide === 'middle2') {
                return {
                    'left': `${this.middle2}px`
                };
            }

        }
    }
}

const app_pic = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
                {
                    title:"Kentucky",
                    abv:"KY",
                    image:"https://www.masrikdahir.com/Images/Kentucky/Thumbnail/KY.svg.png",
                    url:"https://www.masrikdahir.com/map/ky",
                },
                {
                    title:"Maine",
                    abv:"ME",
                    image:"https://www.masrikdahir.com/Images/Maine/Thumbnail/ME.svg.png",
                    url:"https://www.masrikdahir.com/map/me",
                },
                {
                    title:"Vermont",
                    abv:"VT",
                    image:"https://www.masrikdahir.com/Images/Vermont/Thumbnail/VT.svg.png",
                    url:"https://www.masrikdahir.com/map/vt",
                },
                {
                    title:"New Hampshire",
                    abv:"WH",
                    image:"https://www.masrikdahir.com/Images/New Hampshire/Thumbnail/WH.svg.png",
                    url:"https://www.masrikdahir.com/map/nh",
                },
                {
                    title:"New York",
                    abv:"NY",
                    image:"https://www.masrikdahir.com/Images/New York/Thumbnail/NY.svg.png",
                    url:"https://www.masrikdahir.com/map/ny",
                },
                {
                    title:"Massachusetts",
                    abv:"MA",
                    image:"https://www.masrikdahir.com/Images/Massachusetts/Thumbnail/MA.svg.png",
                    url:"https://www.masrikdahir.com/map/ma",
                },
                {
                    title:"Connecticut",
                    abv:"CT",
                    image:"https://www.masrikdahir.com/Images/Connecticut/Thumbnail/CT.svg.png",
                    url:"https://www.masrikdahir.com/map/ct",
                },
                {
                    title:"New Jersey",
                    abv:"NJ",
                    image:"https://www.masrikdahir.com/Images/New Jersey/Thumbnail/NJ.svg.png",
                    url:"",
                },
                {
                    title:"Virginia",
                    abv:"VA",
                    image:"https://www.masrikdahir.com/Images/Virginia/Thumbnail/VA.svg.png",
                    url:"https://www.masrikdahir.com/map/va",
                },
                {
                    title:"West Virginia",
                    abv:"WV",
                    image:"https://www.masrikdahir.com/Images/West Virginia/Thumbnail/WV.svg.png",
                    url:"https://www.masrikdahir.com/map/wv",
                },
                {
                    title:"Maryland",
                    abv:"MD",
                    image:"https://www.masrikdahir.com/Images/Maryland/Thumbnail/MD.svg.png",
                    url:"https://www.masrikdahir.com/map/md",
                },
                {
                    title:"Delaware",
                    abv:"DE",
                    image:"https://www.masrikdahir.com/Images/Delaware/Thumbnail/DE.svg.png",
                    url:"https://www.masrikdahir.com/map/de",
                },
                {
                    title:"North Carolina",
                    abv:"NC",
                    image:"https://www.masrikdahir.com/Images/North Carolina/Thumbnail/NC.svg.png",
                    url:"https://www.masrikdahir.com/map/nc",
                },
                {
                    title:"Indiana",
                    abv:"IN",
                    image:"https://www.masrikdahir.com/Images/Indiana/Thumbnail/IN.svg.png",
                    url:"https://www.masrikdahir.com/map/in",
                },
                {
                    title:"Tennessee",
                    abv:"TN",
                    image:"https://www.masrikdahir.com/Images/Tennessee/Thumbnail/TN.svg.png",
                    url:"https://www.masrikdahir.com/map/tn",
                },
                {
                    title:"Washington DC",
                    abv:"DC",
                    image:"https://www.masrikdahir.com/Images/Washington DC/Thumbnail/DC.svg.png",
                    url:"https://www.masrikdahir.com/map/dc",
                },
                {
                    title:"Pennsylvania",
                    abv:"PA",
                    image:"https://www.masrikdahir.com/Images/Pennsylvania/Thumbnail/PA.svg.png",
                    url:"https://www.masrikdahir.com/map/pa",
                },
                {
                    title:"South Carolina",
                    abv:"SC",
                    image:"https://www.masrikdahir.com/Images/South Carolina/Thumbnail/SC.svg.png",
                    url:"https://www.masrikdahir.com/map/sc",
                },
                {
                    title:"Georgia",
                    abv:"GA",
                    image:"https://www.masrikdahir.com/Images/Georgia/Thumbnail/GA.svg.png",
                    url:"https://www.masrikdahir.com/map/ga",
                },
                {
                    title:"Alabama",
                    abv:"AL",
                    image:"https://www.masrikdahir.com/Images/Alabama/Thumbnail/AL.svg.png",
                    url:"https://www.masrikdahir.com/map/al",
                },
                {
                    title:"Ohio",
                    abv:"OH",
                    image:"https://www.masrikdahir.com/Images/Ohio/Thumbnail/OH.svg.png",
                    url:"https://www.masrikdahir.com/map/oh",
                },
                {
                    title:"Michigan",
                    abv:"MI",
                    image:"https://www.masrikdahir.com/Images/Michigan/Thumbnail/MI.svg.png",
                    url:"https://www.masrikdahir.com/map/mi",
                },
                {
                    title:"Wisconsin",
                    abv:"WI",
                    image:"https://www.masrikdahir.com/Images/Wisconsin/Thumbnail/WI.svg.png",
                    url:"https://www.masrikdahir.com/map/wi",
                },
                {
                    title:"Illinois",
                    abv:"IL",
                    image:"https://www.masrikdahir.com/Images/Illinois/Thumbnail/IL.svg.png",
                    url:"https://www.masrikdahir.com/map/il",
                },
                {
                    title:"Iowa",
                    abv:"IA",
                    image:"https://www.masrikdahir.com/Images/Iowa/Thumbnail/IA.svg.png",
                    url:"https://www.masrikdahir.com/map/ia",
                },
                {
                    title:"Missouri",
                    abv:"MO",
                    image:"https://www.masrikdahir.com/Images/Missouri/Thumbnail/MO.svg.png",
                    url:"https://www.masrikdahir.com/map/mo",
                },
                {
                    title:"Arkansas",
                    abv:"AR",
                    image:"https://www.masrikdahir.com/Images/Arkansas/Thumbnail/AR.svg.png",
                    url:"https://www.masrikdahir.com/map/ar",
                },
                {
                    title:"Louisiana",
                    abv:"LA",
                    image:"https://www.masrikdahir.com/Images/Louisiana/Thumbnail/LA.svg.png",
                    url:"https://www.masrikdahir.com/map/la",
                },
                {
                    title:"Mississippi",
                    abv:"MS",
                    image:"https://www.masrikdahir.com/Images/Mississippi/Thumbnail/MS.svg.png",
                    url:"https://www.masrikdahir.com/map/ms",
                },
                {
                    title:"Texas",
                    abv:"TX",
                    image:"https://www.masrikdahir.com/Images/Texas/Thumbnail/TX.svg.png",
                    url:"https://www.masrikdahir.com/map/tx",
                },
            ]
        };
    },
    computed: {
        resultQuery(){
            if(this.searchQuery){
                return this.resources.filter((item)=>{
                    return this.searchQuery.toLowerCase().split(' ').every(v => item.title.toLowerCase().includes(v))
                })
            }else{
                return this.resources;
            }
        }
    },
    mounted() {
        this.$nextTick(() => {
            window.addEventListener('resize', this.onResize);
        })
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.onResize);
    },
    methods: {
        toggleBox() {
            this.button_to_activate_box = !this.button_to_activate_box;

            if (this.button_text == "show") {
                this.button_text = "hide";
            } else {
                this.button_text = "show";
            }
        },
        greet(greeting) {
            console.log(greeting);
        },
        onResize() {
            this.windowHeight = window.innerHeight;
            this.windowWidth = window.innerWidth;
            this.middle = (window.innerWidth - 1000) / 2;
            this.middle2 = (window.innerWidth - 50) / 2;
        },
        modelStyle: function (slide) {

            if (slide === 'middle') {
                return {
                    'left': `${this.middle}px`
                };
            } else if (slide === 'middle2') {
                return {
                    'left': `${this.middle2}px`
                };
            }

        },
        openPopup(index) {
            this.showingPopupIndex = index;
        },
        closePopup() {
            this.showingPopupIndex = null;
        }
    }
}

const app_pic_can = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
                {
                    title:"Ontario ",
                    abv:"ON",
                    image:"https://www.masrikdahir.com/Images/Ontario/Thumbnail/ON.svg.png",
                    url:"https://www.masrikdahir.com/map/on",
                }
            ]
        };
    },
    computed: {
        resultQuery(){
            if(this.searchQuery){
                return this.resources.filter((item)=>{
                    return this.searchQuery.toLowerCase().split(' ').every(v => item.title.toLowerCase().includes(v))
                })
            }else{
                return this.resources;
            }
        }
    },
    mounted() {
        this.$nextTick(() => {
            window.addEventListener('resize', this.onResize);
        })
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.onResize);
    },
    methods: {
        toggleBox() {
            this.button_to_activate_box = !this.button_to_activate_box;

            if (this.button_text == "show") {
                this.button_text = "hide";
            } else {
                this.button_text = "show";
            }
        },
        greet(greeting) {
            console.log(greeting);
        },
        onResize() {
            this.windowHeight = window.innerHeight;
            this.windowWidth = window.innerWidth;
            this.middle = (window.innerWidth - 1000) / 2;
            this.middle2 = (window.innerWidth - 50) / 2;
        },
        modelStyle: function (slide) {

            if (slide === 'middle') {
                return {
                    'left': `${this.middle}px`
                };
            } else if (slide === 'middle2') {
                return {
                    'left': `${this.middle2}px`
                };
            }

        },
        openPopup(index) {
            this.showingPopupIndex = index;
        },
        closePopup() {
            this.showingPopupIndex = null;
        }
    }
}

const app_pic_gbr = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
                {
                    title:"England",
                    abv:"ENG",
                    image:"https://www.masrikdahir.com/Images/England/Thumbnail/GB-ENG.svg.png",
                    url:"",
                },
                {
                    title:"Wales",
                    abv:"WLS",
                    image:"https://www.masrikdahir.com/Images/Wales/Thumbnail/GB-WLS.svg.png",
                    url:"",
                },
                {
                    title:"Northern Ireland",
                    abv:"NIR",
                    image:"https://www.masrikdahir.com/Images/North Ireland/Thumbnail/GB-NIR.svg.png",
                    url:"",
                },
                {
                    title:"Scotland",
                    abv:"SCT",
                    image:"https://www.masrikdahir.com/Images/Scotland/Thumbnail/GB-SCT.svg.png",
                    url:"",
                },
                {
                    title:"Ireland",
                    abv:"IRL",
                    image:"https://www.masrikdahir.com/Images/Ireland/Thumbnail/IRL.svg.png",
                    url:"",
                }
            ]
        };
    },
    computed: {
        resultQuery(){
            if(this.searchQuery){
                return this.resources.filter((item)=>{
                    return this.searchQuery.toLowerCase().split(' ').every(v => item.title.toLowerCase().includes(v))
                })
            }else{
                return this.resources;
            }
        }
    },



    mounted() {
        this.$nextTick(() => {
            window.addEventListener('resize', this.onResize);
        })
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.onResize);
    },
    methods: {
        toggleBox() {
            this.button_to_activate_box = !this.button_to_activate_box;

            if (this.button_text == "show") {
                this.button_text = "hide";
            } else {
                this.button_text = "show";
            }
        },
        greet(greeting) {
            console.log(greeting);
        },
        onResize() {
            this.windowHeight = window.innerHeight;
            this.windowWidth = window.innerWidth;
            this.middle = (window.innerWidth - 1000) / 2;
            this.middle2 = (window.innerWidth - 50) / 2;
        },
        modelStyle: function (slide) {

            if (slide === 'middle') {
                return {
                    'left': `${this.middle}px`
                };
            } else if (slide === 'middle2') {
                return {
                    'left': `${this.middle2}px`
                };
            }

        },
        openPopup(index) {
            this.showingPopupIndex = index;
        },
        closePopup() {
            this.showingPopupIndex = null;
        }
    }
}

const top_nav = {
    data() {
        return {
            searchQuery: null,
            resources:[
                {
                    title:"Hone",
                },
                {
                    title:"Work Experience",
                },
                {
                    title:"Publication",
                },
                {
                    title:"Education",
                },
                {
                    title:"Software",
                },
                {
                    title:"Entrepreneurship",
                },
                {
                    title:"Leadership",
                },
                {
                    title:"Travel",
                },

            ]
        };
    },
    computed: {
        resultQuery(){
            if(this.searchQuery){
                return this.resources.filter((item)=>{
                    return this.searchQuery.toLowerCase().split(' ').every(v => item.title.toLowerCase().includes(v))
                })
            }else{
                return this.resources;
            }
        }
    }
}


Vue.createApp(app_software).mount('#app_software')
Vue.createApp(app_map).mount('#app_map')
Vue.createApp(app_pic).mount('#app_pic')
Vue.createApp(app_pic_can).mount('#app_pic_can')
Vue.createApp(app_pic_gbr).mount('#app_pic_gbr')

function createStateComponent(stateName, stateAbbreviation, numImages = 10) {
    return {
        name: `app_${stateAbbreviation.toLowerCase()}`, // Component name
        data() {
            // Generate resources array dynamically based on numImages
            let resources = [];
            for (let i = 1; i <= numImages; i++) {
                resources.push({
                    title: `${i}`,
                    url: `../Images/${stateName}/${i}.jpg`, // Adjust folder and file name as per your structure
                });
            }

            return {
                isSlideVisible: true,
                resources: resources,
                name: stateName
            };
        },
        mounted() {
            if (this.resources.length > 0) {
                this.resources[0].isActive = true; // Set the first item as active
            }
        },
        computed: {
            resultQuery() {
                if (this.searchQuery) {
                    return this.resources.filter((item) => {
                        return this.searchQuery.toLowerCase().split(' ').every(v => item.title.toLowerCase().includes(v))
                    });
                } else {
                    return this.resources;
                }
            },
            limitedResultQuery() {
                return this.resultQuery.slice(0, Math.min(this.resultQuery.length, 50));
            },
            phoneLimitedResultQuery() {
                return this.resultQuery.slice(0, Math.min(this.resultQuery.length, 10));
            }
        },
        methods:{
            selectImage(index) {
                this.resources.forEach((item, i) => {
                    item.isActive = (i === index); // Set active state based on clicked index
                });
                this.scrollToActiveImage();
            },
            scrollToActiveImage() {
                this.$nextTick(() => {
                    const activeIndex = this.resources.findIndex(item => item.isActive);
                    if (activeIndex !== -1) {
                        const activeImage = this.$refs[`activeImage${activeIndex}`]; // Use a dynamic ref
                        if (activeImage) {
                            activeImage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                    }
                });
            },
            showSlide() {
                this.isSlideVisible = true; // Show slides
            },
            showGallery() {
                this.isSlideVisible = false; // Show gallery
            },
        }
    };
}


// Fetch data and handle errors with async/await and try/catch
async function fetchData() {
    try {
        const response = await fetch('../Json/image.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (err) {
        console.error('Error fetching JSON:', err);
        return [];
    }
}

// Define a function to mount Vue instances
function mountVueInstances(images) {
    images.forEach(state => {
        const baseId = `app_${state.abbreviation.toLowerCase().replace(/\s+/g, '_')}`;

        // Mount Vue instances to different elements
        Vue.createApp(createStateComponent(state.name, state.abbreviation, state.numImages))
            .mount(`#${baseId}`);

        Vue.createApp(createStateComponent(state.name, state.abbreviation, state.numImages))
            .mount(`#${baseId}_2`);

        Vue.createApp(createStateComponent(state.name, state.abbreviation, state.numImages))
            .mount(`#${baseId}_3`);

        Vue.createApp(createStateComponent(state.name, state.abbreviation, state.numImages))
            .mount(`.${baseId}`);
    });
}

// Use the fetched data to mount Vue instances
fetchData().then(mountVueInstances);













