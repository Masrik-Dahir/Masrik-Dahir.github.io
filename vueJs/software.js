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
                    image:"./Images/Kentucky/KY.svg.png",
                    url:"https://www.masrikdahir.com/map/ky",
                },
                {
                    title:"Maine",
                    abv:"ME",
                    image:"./Images/Maine/ME.svg.png",
                    url:"https://www.masrikdahir.com/map/me",
                },
                {
                    title:"Vermont",
                    abv:"VT",
                    image:"./Images/Vermont/VT.svg.png",
                    url:"https://www.masrikdahir.com/map/vt",
                },
                {
                    title:"New Hampshire",
                    abv:"WH",
                    image:"./Images/New Hampshire/WH.svg.png",
                    url:"https://www.masrikdahir.com/map/nh",
                },
                {
                    title:"New York",
                    abv:"NY",
                    image:"./Images/New York/NY.svg.png",
                    url:"https://www.masrikdahir.com/map/ny",
                },
                {
                    title:"Massachusetts",
                    abv:"MA",
                    image:"./Images/Massachusetts/MA.svg.png",
                    url:"https://www.masrikdahir.com/map/ma",
                },
                {
                    title:"Connecticut",
                    abv:"CT",
                    image:"./Images/Connecticut/CT.svg.png",
                    url:"https://www.masrikdahir.com/map/ct",
                },
                {
                    title:"New Jersey",
                    abv:"NJ",
                    image:"./Images/New Jersey/NJ.svg.png",
                    url:"",
                },
                {
                    title:"Virginia",
                    abv:"VA",
                    image:"./Images/va.png",
                    url:"https://www.masrikdahir.com/map/va",
                },
                {
                    title:"West Virginia",
                    abv:"WV",
                    image:"./Images/West Virginia/WV.svg.png",
                    url:"https://www.masrikdahir.com/map/wv",
                },
                {
                    title:"Maryland",
                    abv:"MD",
                    image:"./Images/Maryland/MD.svg.png",
                    url:"https://www.masrikdahir.com/map/md",
                },
                {
                    title:"Delaware",
                    abv:"DE",
                    image:"./Images/Delaware/DE.svg.png",
                    url:"https://www.masrikdahir.com/map/de",
                },
                {
                    title:"North Carolina",
                    abv:"NC",
                    image:"./Images/North Carolina/NC.svg.png",
                    url:"https://www.masrikdahir.com/map/nc",
                },
                {
                    title:"Indiana",
                    abv:"IN",
                    image:"./Images/Indiana/IN.svg.png",
                    url:"https://www.masrikdahir.com/map/in",
                },
                {
                    title:"Tennessee",
                    abv:"TN",
                    image:"./Images/Tennessee/TN.svg.png",
                    url:"https://www.masrikdahir.com/map/tn",
                },
                {
                    title:"Washington DC",
                    abv:"DC",
                    image:"./Images/Washington DC/DC.svg.png",
                    url:"https://www.masrikdahir.com/map/dc",
                },
                {
                    title:"Pennsylvania",
                    abv:"PA",
                    image:"./Images/Pennsylvania/PA.svg.png",
                    url:"https://www.masrikdahir.com/map/pa",
                },
                {
                    title:"South Carolina",
                    abv:"SC",
                    image:"./Images/South Carolina/SC.svg.png",
                    url:"https://www.masrikdahir.com/map/sc",
                },
                {
                    title:"Georgia",
                    abv:"GA",
                    image:"./Images/Georgia/GA.svg.png",
                    url:"https://www.masrikdahir.com/map/ga",
                },
                {
                    title:"Alabama",
                    abv:"AL",
                    image:"./Images/Alabama/AL.svg.png",
                    url:"https://www.masrikdahir.com/map/al",
                },
                {
                    title:"Ohio",
                    abv:"OH",
                    image:"./Images/Ohio/OH.svg.png",
                    url:"https://www.masrikdahir.com/map/oh",
                },
                {
                    title:"Michigan",
                    abv:"MI",
                    image:"./Images/Michigan/MI.svg.png",
                    url:"https://www.masrikdahir.com/map/mi",
                },
                {
                    title:"Wisconsin",
                    abv:"WI",
                    image:"./Images/Wisconsin/WI.svg.png",
                    url:"https://www.masrikdahir.com/map/wi",
                },
                {
                    title:"Illinois",
                    abv:"IL",
                    image:"./Images/Illinois/IL.svg.png",
                    url:"https://www.masrikdahir.com/map/il",
                },
                {
                    title:"Iowa",
                    abv:"IA",
                    image:"./Images/Iowa/IA.svg.png",
                    url:"https://www.masrikdahir.com/map/ia",
                },
                {
                    title:"Missouri",
                    abv:"MO",
                    image:"./Images/Missouri/MO.svg.png",
                    url:"https://www.masrikdahir.com/map/mo",
                },
                {
                    title:"Arkansas",
                    abv:"AR",
                    image:"./Images/Arkansas/AR.svg.png",
                    url:"https://www.masrikdahir.com/map/ar",
                },
                {
                    title:"Louisiana",
                    abv:"LA",
                    image:"./Images/Louisiana/LA.svg.png",
                    url:"https://www.masrikdahir.com/map/la",
                },
                {
                    title:"Mississippi",
                    abv:"MS",
                    image:"./Images/Mississippi/MS.svg.png",
                    url:"https://www.masrikdahir.com/map/ms",
                },
                {
                    title:"Texas",
                    abv:"TX",
                    image:"./Images/Texas/TX.svg.png",
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
                    image:"./Images/Ontario/ON.svg.png",
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
                    image:"./Images/England/GB-ENG.svg.png",
                    url:"",
                },
                {
                    title:"Wales",
                    abv:"WLS",
                    image:"./Images/Wales/GB-WLS.svg.png",
                    url:"",
                },
                {
                    title:"Northern Ireland",
                    abv:"NIR",
                    image:"./Images/North Ireland/GB-NIR.svg.png",
                    url:"",
                },
                {
                    title:"Scotland",
                    abv:"SCT",
                    image:"./Images/Scotland/GB-SCT.svg.png",
                    url:"",
                },
                {
                    title:"Ireland",
                    abv:"IRL",
                    image:"./Images/Ireland/IRL.svg.png",
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

const app_kentucky = {
    data() {
        return {
            resources:[
                {
                    title:"1",
                    url:"../Images/Kentucky/1.jpg",
                },
                {
                    title:"2",
                    url:"../Images/Kentucky/2.jpg",
                },
                {
                    title:"3",
                    url:"../Images/Kentucky/3.jpg",
                },
                {
                    title:"4",
                    url:"../Images/Kentucky/4.jpg",
                },
                {
                    title:"5",
                    url:"../Images/Kentucky/5.jpg",
                },
                {
                    title:"6",
                    url:"../Images/Kentucky/6.jpg",
                },
                {
                    title:"7",
                    url:"../Images/Kentucky/7.jpg",
                },
                {
                    title:"8",
                    url:"../Images/Kentucky/8.jpg",
                },
                {
                    title:"9",
                    url:"../Images/Kentucky/9.jpg",
                },
                {
                    title:"10",
                    url:"../Images/Kentucky/10.jpg",
                },
                {
                    title:"11",
                    url:"../Images/Kentucky/11.jpg",
                },
                {
                    title:"12",
                    url:"../Images/Kentucky/12.jpg",
                },
                {
                    title:"13",
                    url:"../Images/Kentucky/13.jpg",
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
    }
}

const app_maine = {
    data() {
        return {
            resources:[
                {
                    title:"1",
                    url:"../Images/Maine/1.jpg",
                },
                {
                    title:"2",
                    url:"../Images/Maine/2.jpg",
                },
                {
                    title:"3",
                    url:"../Images/Maine/3.jpg",
                },
                {
                    title:"4",
                    url:"../Images/Maine/4.jpg",
                },
                {
                    title:"5",
                    url:"../Images/Maine/5.jpg",
                },
                {
                    title:"6",
                    url:"../Images/Maine/6.jpg",
                },
                {
                    title:"7",
                    url:"../Images/Maine/7.jpg",
                },
                {
                    title:"8",
                    url:"../Images/Maine/8.jpg",
                },
                {
                    title:"9",
                    url:"../Images/Maine/9.jpg",
                },
                {
                    title:"10",
                    url:"../Images/Maine/10.jpg",
                },
                {
                    title:"11",
                    url:"../Images/Maine/11.jpg",
                },
                {
                    title:"12",
                    url:"../Images/Maine/12.jpg",
                },
                {
                    title:"13",
                    url:"../Images/Maine/13.jpg",
                },
                {
                    title:"14",
                    url:"../Images/Maine/14.jpeg",
                },
                {
                    title:"15",
                    url:"../Images/Maine/15.jpg",
                },
                {
                    title:"16",
                    url:"../Images/Maine/16.jpg",
                },
                {
                    title:"17",
                    url:"../Images/Maine/17.jpg",
                },
                {
                    title:"18",
                    url:"../Images/Maine/18.jpg",
                },
                {
                    title:"19",
                    url:"../Images/Maine/19.jpg",
                },
                {
                    title:"20",
                    url:"../Images/Maine/20.jpg",
                },
                {
                    title:"21",
                    url:"../Images/Maine/21.jpg",
                },
                {
                    title:"22",
                    url:"../Images/Maine/22.jpg",
                },
                {
                    title:"23",
                    url:"../Images/Maine/23.jpg",
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
    }
}

const app_new_hampshire = {
    data() {
        return {
            resources:[
                {
                    title:"1",
                    url:"../Images/New Hampshire/1.jpg",
                },
                {
                    title:"2",
                    url:"../Images/New Hampshire/2.jpg",
                },
                {
                    title:"3",
                    url:"../Images/New Hampshire/3.jpg",
                },
                {
                    title:"4",
                    url:"../Images/New Hampshire/4.jpg",
                },
                {
                    title:"5",
                    url:"../Images/New Hampshire/5.jpg",
                },
                {
                    title:"6",
                    url:"../Images/New Hampshire/6.jpg",
                },
                {
                    title:"7",
                    url:"../Images/New Hampshire/7.jpg",
                },
                {
                    title:"8",
                    url:"../Images/New Hampshire/8.jpg",
                },
                {
                    title:"9",
                    url:"../Images/New Hampshire/9.jpg",
                },
                {
                    title:"10",
                    url:"../Images/New Hampshire/10.jpg",
                },
                {
                    title:"11",
                    url:"../Images/New Hampshire/11.jpg",
                },
                {
                    title:"12",
                    url:"../Images/New Hampshire/12.jpg",
                },
                {
                    title:"13",
                    url:"../Images/New Hampshire/13.jpg",
                },
                {
                    title:"14",
                    url:"../Images/New Hampshire/14.jpg",
                },
                {
                    title:"15",
                    url:"../Images/New Hampshire/15.jpg",
                },
                {
                    title:"16",
                    url:"../Images/New Hampshire/16.jpg",
                },
                {
                    title:"17",
                    url:"../Images/New Hampshire/17.jpg",
                },
                {
                    title:"18",
                    url:"../Images/New Hampshire/18.jpg",
                },
                {
                    title:"19",
                    url:"../Images/New Hampshire/19.jpg",
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
    }
}

const app_vermont = {
    data() {
        return {
            resources:[
                {
                    title:"1",
                    url:"../Images/Vermont/1.jpg",
                },
                {
                    title:"2",
                    url:"../Images/Vermont/2.jpg",
                },
                {
                    title:"3",
                    url:"../Images/Vermont/3.jpg",
                },
                {
                    title:"4",
                    url:"../Images/Vermont/4.jpg",
                },
                {
                    title:"5",
                    url:"../Images/Vermont/5.jpg",
                },
                {
                    title:"6",
                    url:"../Images/Vermont/6.jpg",
                },
                {
                    title:"7",
                    url:"../Images/Vermont/7.jpg",
                },
                {
                    title:"8",
                    url:"../Images/Vermont/8.jpg",
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
    }
}

const app_connecticut  = {
    data() {
        return {
            resources:[
                {
                    title:"1",
                    url:"../Images/Connecticut/1.jpg",
                },
                {
                    title:"2",
                    url:"../Images/Connecticut/2.jpg",
                },
                {
                    title:"3",
                    url:"../Images/Connecticut/3.jpg",
                },
                {
                    title:"4",
                    url:"../Images/Connecticut/4.jpg",
                },
                {
                    title:"5",
                    url:"../Images/Connecticut/5.jpg",
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
    }
}

const app_new_york = {
    data() {
        return {
            resources:[
                {
                    title:"1",
                    url:"../Images/New York/1.jpg",
                },
                {
                    title:"2",
                    url:"../Images/New York/2.jpg",
                },
                {
                    title:"3",
                    url:"../Images/New York/3.jpg",
                },
                {
                    title:"4",
                    url:"../Images/Maine/4.jpg",
                },
                {
                    title:"5",
                    url:"../Images/New York/5.jpg",
                },
                {
                    title:"6",
                    url:"../Images/New York/6.jpg",
                },
                {
                    title:"7",
                    url:"../Images/New York/7.jpg",
                },
                {
                    title:"8",
                    url:"../Images/New York/8.jpg",
                },
                {
                    title:"9",
                    url:"../Images/New York/9.jpg",
                },
                {
                    title:"10",
                    url:"../Images/New York/10.jpg",
                },
                {
                    title:"11",
                    url:"../Images/New York/11.jpg",
                },
                {
                    title:"12",
                    url:"../Images/New York/12.jpg",
                },
                {
                    title:"13",
                    url:"../Images/New York/13.jpg",
                },
                {
                    title:"14",
                    url:"../Images/New York/14.jpg",
                },
                {
                    title:"15",
                    url:"../Images/New York/15.jpg",
                },
                {
                    title:"16",
                    url:"../Images/New York/16.jpg",
                },
                {
                    title:"17",
                    url:"../Images/New York/17.jpg",
                },
                {
                    title:"18",
                    url:"../Images/New York/18.jpg",
                },
                {
                    title:"19",
                    url:"../Images/New York/19.jpg",
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
    }
}

const app_massachusetts = {
    data() {
        return {
            resources:[
                {
                    title:"1",
                    url:"../Images/Massachusetts/1.jpg",
                },
                {
                    title:"2",
                    url:"../Images/Massachusetts/2.jpg",
                },
                {
                    title:"3",
                    url:"../Images/Massachusetts/3.jpg",
                },
                {
                    title:"4",
                    url:"../Images/Massachusetts/4.jpg",
                },
                {
                    title:"5",
                    url:"../Images/Massachusetts/5.jpg",
                },
                {
                    title:"6",
                    url:"../Images/Massachusetts/6.jpg",
                },
                {
                    title:"7",
                    url:"../Images/Massachusetts/7.jpg",
                },
                {
                    title:"8",
                    url:"../Images/Massachusetts/8.jpg",
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
    }
}

const app_south_carolina = {
    data() {
        return {
            resources:[
                {
                    title:"1",
                    url:"../Images/South Carolina/1.jpg",
                },
                {
                    title:"2",
                    url:"../Images/South Carolina/2.jpg",
                },
                {
                    title:"3",
                    url:"../Images/South Carolina/3.jpg",
                },
                {
                    title:"4",
                    url:"../Images/South Carolina/4.jpg",
                },
                {
                    title:"5",
                    url:"../Images/South Carolina/5.jpg",
                },
                {
                    title:"6",
                    url:"../Images/South Carolina/6.jpg",
                },
                {
                    title:"7",
                    url:"../Images/South Carolina/7.jpg",
                },
                {
                    title:"8",
                    url:"../Images/South Carolina/8.jpg",
                },
                {
                    title:"9",
                    url:"../Images/South Carolina/9.jpg",
                },
                {
                    title:"10",
                    url:"../Images/South Carolina/10.jpg",
                },
                {
                    title:"11",
                    url:"../Images/South Carolina/11.jpg",
                },
                {
                    title:"12",
                    url:"../Images/South Carolina/12.jpg",
                },
                {
                    title:"13",
                    url:"../Images/South Carolina/13.jpg",
                },
                {
                    title:"14",
                    url:"../Images/South Carolina/14.jpg",
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
    }
}

const app_georgia = {
    data() {
        return {
            resources:[
                {
                    title:"1",
                    url:"../Images/Georgia/1.jpg",
                },
                {
                    title:"2",
                    url:"../Images/Georgia/2.jpg",
                },
                {
                    title:"3",
                    url:"../Images/Georgia/3.jpg",
                },
                {
                    title:"4",
                    url:"../Images/Georgia/4.jpg",
                },
                {
                    title:"5",
                    url:"../Images/Georgia/5.jpg",
                },
                {
                    title:"6",
                    url:"../Images/Georgia/6.jpg",
                },
                {
                    title:"7",
                    url:"../Images/Georgia/7.jpg",
                },
                {
                    title:"8",
                    url:"../Images/Georgia/8.jpg",
                },
                {
                    title:"9",
                    url:"../Images/Georgia/9.jpg",
                },
                {
                    title:"10",
                    url:"../Images/Georgia/10.jpg",
                },
                {
                    title:"11",
                    url:"../Images/Georgia/11.jpg",
                },
                {
                    title:"12",
                    url:"../Images/Georgia/12.jpg",
                },
                {
                    title:"13",
                    url:"../Images/Georgia/13.jpg",
                },
                {
                    title:"14",
                    url:"../Images/Georgia/14.jpg",
                },
                {
                    title:"15",
                    url:"../Images/Georgia/15.jpg",
                },
                {
                    title:"16",
                    url:"../Images/Georgia/16.jpg",
                },
                {
                    title:"17",
                    url:"../Images/Georgia/17.jpg",
                },
                {
                    title:"18",
                    url:"../Images/Georgia/18.jpg",
                },
                {
                    title:"19",
                    url:"../Images/Georgia/19.jpg",
                },
                {
                    title:"20",
                    url:"../Images/Georgia/20.jpg",
                },
                {
                    title:"21",
                    url:"../Images/Georgia/21.jpg",
                },
                {
                    title:"22",
                    url:"../Images/Georgia/22.jpg",
                },
                {
                    title:"23",
                    url:"../Images/Georgia/23.jpg",
                },
                {
                    title:"24",
                    url:"../Images/Georgia/24.jpg",
                },
                {
                    title:"25",
                    url:"../Images/Georgia/25.jpg",
                },
                {
                    title:"26",
                    url:"../Images/Georgia/26.jpg",
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
    }
}

const app_alabama = {
    data() {
        return {
            resources:[
                {
                    title:"1",
                    url:"../Images/Alabama/1.jpg",
                },
                {
                    title:"2",
                    url:"../Images/Alabama/2.jpg",
                },
                {
                    title:"3",
                    url:"../Images/Alabama/3.jpg",
                },
                {
                    title:"4",
                    url:"../Images/Alabama/4.jpg",
                },
                {
                    title:"5",
                    url:"../Images/Alabama/5.jpg",
                },
                {
                    title:"6",
                    url:"../Images/Alabama/6.jpg",
                },
                {
                    title:"7",
                    url:"../Images/Alabama/7.jpg",
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
    }
}

const app_tennessee = {
    data() {
        return {
            resources:[
                {
                    title:"1",
                    url:"../Images/Tennessee/1.jpg",
                },
                {
                    title:"2",
                    url:"../Images/Tennessee/2.jpg",
                },
                {
                    title:"3",
                    url:"../Images/Tennessee/3.jpg",
                },
                {
                    title:"4",
                    url:"../Images/Tennessee/4.jpg",
                },
                {
                    title:"5",
                    url:"../Images/Tennessee/5.jpg",
                },
                {
                    title:"6",
                    url:"../Images/Tennessee/6.jpg",
                },
                {
                    title:"7",
                    url:"../Images/Tennessee/7.jpg",
                },
                {
                    title:"8",
                    url:"../Images/Tennessee/8.jpg",
                },
                {
                    title:"9",
                    url:"../Images/Tennessee/9.jpg",
                },
                {
                    title:"10",
                    url:"../Images/Tennessee/10.jpg",
                },
                {
                    title:"11",
                    url:"../Images/Tennessee/11.jpg",
                },
                {
                    title:"12",
                    url:"../Images/Tennessee/12.jpg",
                },
                {
                    title:"13",
                    url:"../Images/Tennessee/13.jpg",
                },
                {
                    title:"14",
                    url:"../Images/Tennessee/14.jpg",
                },
                {
                    title:"15",
                    url:"../Images/Tennessee/15.jpg",
                },
                {
                    title:"16",
                    url:"../Images/Tennessee/16.jpg",
                },
                {
                    title:"17",
                    url:"../Images/Tennessee/17.jpg",
                },
                {
                    title:"18",
                    url:"../Images/Tennessee/18.jpg",
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
    }
}

const app_pennsylvania = {
    data() {
        return {
            resources:[
                {
                    title:"1",
                    url:"../Images/Pennsylvania/1.jpg",
                },
                {
                    title:"2",
                    url:"../Images/Pennsylvania/2.jpg",
                },
                {
                    title:"3",
                    url:"../Images/Pennsylvania/3.jpg",
                },
                {
                    title:"4",
                    url:"../Images/Pennsylvania/4.jpg",
                },
                {
                    title:"5",
                    url:"../Images/Pennsylvania/5.jpg",
                },
                {
                    title:"6",
                    url:"../Images/Pennsylvania/6.jpg",
                },
                {
                    title:"7",
                    url:"../Images/Pennsylvania/7.jpg",
                },
                {
                    title:"8",
                    url:"../Images/Pennsylvania/8.jpg",
                },
                {
                    title:"9",
                    url:"../Images/Pennsylvania/9.jpg",
                },
                {
                    title:"10",
                    url:"../Images/Pennsylvania/10.jpg",
                },
                {
                    title:"11",
                    url:"../Images/Pennsylvania/11.jpg",
                },
                {
                    title:"12",
                    url:"../Images/Pennsylvania/12.jpg",
                },
                {
                    title:"13",
                    url:"../Images/Pennsylvania/13.jpg",
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
    }
}

const app_ontario = {
    data() {
        return {
            resources:[
                {
                    title:"1",
                    url:"../Images/Ontario/1.jpg",
                },
                {
                    title:"2",
                    url:"../Images/Ontario/2.jpg",
                },
                {
                    title:"3",
                    url:"../Images/Ontario/3.jpg",
                },
                {
                    title:"4",
                    url:"../Images/Ontario/4.jpg",
                },
                {
                    title:"5",
                    url:"../Images/Ontario/5.jpg",
                },
                {
                    title:"6",
                    url:"../Images/Ontario/6.jpg",
                },
                {
                    title:"7",
                    url:"../Images/Ontario/7.jpg",
                },
                {
                    title:"8",
                    url:"../Images/Ontario/8.jpg",
                },
                {
                    title:"9",
                    url:"../Images/Ontario/9.jpg",
                },
                {
                    title:"10",
                    url:"../Images/Ontario/10.jpg",
                },
                {
                    title:"11",
                    url:"../Images/Ontario/11.jpg",
                },
                {
                    title:"12",
                    url:"../Images/Ontario/12.jpg",
                },
                {
                    title:"13",
                    url:"../Images/Ontario/13.jpg",
                },
                {
                    title:"14",
                    url:"../Images/Ontario/14.jpg",
                },
                {
                    title:"15",
                    url:"../Images/Ontario/15.jpg",
                },
                {
                    title:"16",
                    url:"../Images/Ontario/16.jpg",
                },
                {
                    title:"17",
                    url:"../Images/Ontario/17.jpg",
                },
                {
                    title:"18",
                    url:"../Images/Ontario/28.jpg",
                },
                {
                    title:"19",
                    url:"../Images/Ontario/19.jpg",
                },
                {
                    title:"20",
                    url:"../Images/Ontario/20.jpg",
                },
                {
                    title:"21",
                    url:"../Images/Ontario/21.jpg",
                },
                {
                    title:"22",
                    url:"../Images/Ontario/22.jpg",
                },
                {
                    title:"23",
                    url:"../Images/Ontario/23.jpg",
                },
                {
                    title:"24",
                    url:"../Images/Ontario/24.jpg",
                },
                {
                    title:"25",
                    url:"../Images/Ontario/25.jpg",
                },
                {
                    title:"26",
                    url:"../Images/Ontario/26.jpg",
                },
                {
                    title:"27",
                    url:"../Images/Ontario/27.jpg",
                },
                {
                    title:"28",
                    url:"../Images/Ontario/28.jpg",
                },
                {
                    title:"29",
                    url:"../Images/Ontario/29.jpg",
                },
                {
                    title:"30",
                    url:"../Images/Ontario/30.jpg",
                },
                {
                    title:"31",
                    url:"../Images/Ontario/31.jpg",
                },
                {
                    title:"32",
                    url:"../Images/Ontario/32.jpg",
                },
                {
                    title:"33",
                    url:"../Images/Ontario/33.jpg",
                },
                {
                    title:"34",
                    url:"../Images/Ontario/34.jpg",
                },
                {
                    title:"35",
                    url:"../Images/Ontario/35.jpg",
                },
                {
                    title:"36",
                    url:"../Images/Ontario/36.jpg",
                },
                {
                    title:"37",
                    url:"../Images/Ontario/37.jpg",
                },
                {
                    title:"38",
                    url:"../Images/Ontario/38.jpg",
                },
                {
                    title:"39",
                    url:"../Images/Ontario/39.jpg",
                },
                {
                    title:"40",
                    url:"../Images/Ontario/40.jpg",
                },
                {
                    title:"41",
                    url:"../Images/Ontario/41.jpg",
                },
                {
                    title:"42",
                    url:"../Images/Ontario/42.jpg",
                },
                {
                    title:"43",
                    url:"../Images/Ontario/43.jpg",
                },
                {
                    title:"44",
                    url:"../Images/Ontario/44.jpg",
                },
                {
                    title:"45",
                    url:"../Images/Ontario/45.jpg",
                },
                {
                    title:"46",
                    url:"../Images/Ontario/46.jpg",
                },
                {
                    title:"47",
                    url:"../Images/Ontario/47.jpg",
                },
                {
                    title:"48",
                    url:"../Images/Ontario/48.jpg",
                },
                {
                    title:"49",
                    url:"../Images/Ontario/49.jpg",
                },
                {
                    title:"50",
                    url:"../Images/Ontario/50.jpg",
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
    }
}

const app_ohio = {
    data() {
        return {
            resources:[
                {
                    title:"1",
                    url:"../Images/Ohio/1.jpg",
                },
                {
                    title:"2",
                    url:"../Images/Ohio/2.jpg",
                },
                {
                    title:"3",
                    url:"../Images/Ohio/3.jpg",
                },
                {
                    title:"4",
                    url:"../Images/Ohio/4.jpg",
                },
                {
                    title:"5",
                    url:"../Images/Ohio/5.jpg",
                },
                {
                    title:"6",
                    url:"../Images/Ohio/6.jpg",
                },
                {
                    title:"7",
                    url:"../Images/Ohio/7.jpg",
                },
                {
                    title:"8",
                    url:"../Images/Ohio/8.jpg",
                },
                {
                    title:"9",
                    url:"../Images/Ohio/9.jpg",
                },
                {
                    title:"10",
                    url:"../Images/Ohio/10.jpg",
                },
                {
                    title:"11",
                    url:"../Images/Ohio/11.jpg",
                },
                {
                    title:"12",
                    url:"../Images/Ohio/12.jpg",
                },
                {
                    title:"13",
                    url:"../Images/Ohio/13.jpg",
                },
                {
                    title:"14",
                    url:"../Images/Ohio/14.jpg",
                },
                {
                    title:"15",
                    url:"../Images/Ohio/15.jpg",
                },
                {
                    title:"16",
                    url:"../Images/Ohio/16.jpg",
                },
                {
                    title:"17",
                    url:"../Images/Ohio/17.jpg",
                },
                {
                    title:"18",
                    url:"../Images/Ohio/18.jpg",
                },
                {
                    title:"19",
                    url:"../Images/Ohio/19.jpg",
                },
                {
                    title:"20",
                    url:"../Images/Ohio/20.jpg",
                },
                {
                    title:"21",
                    url:"../Images/Ohio/21.jpg",
                },
                {
                    title:"22",
                    url:"../Images/Ohio/22.jpg",
                },
                {
                    title:"23",
                    url:"../Images/Ohio/23.jpg",
                },
                {
                    title:"24",
                    url:"../Images/Ohio/24.jpg",
                },
                {
                    title:"25",
                    url:"../Images/Ohio/25.jpg",
                },
                {
                    title:"26",
                    url:"../Images/Ohio/26.jpg",
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
Vue.createApp(app_kentucky).mount('#app_kentucky')
Vue.createApp(app_maine).mount('#app_maine')
Vue.createApp(app_new_hampshire).mount('#app_new_hampshire')
Vue.createApp(app_connecticut).mount('#app_connecticut')
Vue.createApp(app_vermont).mount('#app_vermont')
Vue.createApp(app_new_york).mount('#app_new_york')
Vue.createApp(app_massachusetts).mount('#app_massachusetts')
Vue.createApp(app_south_carolina).mount('#app_south_carolina')
Vue.createApp(app_georgia).mount('#app_georgia')
Vue.createApp(app_alabama).mount('#app_alabama')
Vue.createApp(app_tennessee).mount('#app_tennessee')
Vue.createApp(app_pennsylvania).mount('#app_pennsylvania')
Vue.createApp(app_ohio).mount('#app_ohio')
Vue.createApp(app_ontario).mount('#app_ontario')


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
                resources: resources,
            };
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
    };
}
const states = [
    { name: "Wisconsin", abbreviation: "WI", numImages: 51 },
    { name: "Michigan", abbreviation: "MI", numImages: 14 },
    { name: "Illinois", abbreviation: "IL", numImages: 48 },
    { name: "Iowa", abbreviation: "IA", numImages: 16 },
    { name: "Missouri", abbreviation: "MO", numImages: 21 },
    { name: "Arkansas", abbreviation: "AR", numImages: 12 },
    { name: "Louisiana", abbreviation: "LA", numImages: 13 },
    { name: "Texas", abbreviation: "TX", numImages: 20 },
    { name: "Mississippi", abbreviation: "MS", numImages: 14 },
    { name: "Virginia", abbreviation: "VA", numImages: 42 },
    { name: "West Virginia", abbreviation: "WV", numImages: 18 },
    { name: "North Carolina", abbreviation: "NC", numImages: 26 },
    { name: "Washington DC", abbreviation: "DC", numImages: 61 },
    { name: "Delaware", abbreviation: "DE", numImages: 17 },
    { name: "Indiana", abbreviation: "IN", numImages: 23 },
    { name: "Maryland", abbreviation: "MD", numImages: 7 },
];

states.forEach(state => {
    Vue.createApp(createStateComponent(state.name, state.abbreviation, state.numImages)).mount(`#app_${state.abbreviation.toLowerCase()}`);
    Vue.createApp(createStateComponent(state.name, state.abbreviation, state.numImages)).mount(`#app_${state.abbreviation.toLowerCase()}_2`);
    Vue.createApp(createStateComponent(state.name, state.abbreviation, state.numImages)).mount(`#app_${state.abbreviation.toLowerCase()}_3`);
    Vue.createApp(createStateComponent(state.name, state.abbreviation, state.numImages)).mount(`.app_${state.abbreviation.toLowerCase()}`);
});






