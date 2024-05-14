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
                    uri_windows:"https://mega.nz/file/uSISSYLS#5htqGrOOXY66HbqrZLY68TVwKkfSDlcPwf79WyMu6pY",
                    uri_android:"",
                    uri_apple:"",
                    uri_web:"",
                    uri:"https://mega.nz/file/uSISSYLS#5htqGrOOXY66HbqrZLY68TVwKkfSDlcPwf79WyMu6pY"
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
                    uri_windows:"https://mega.nz/file/LHAGRKob#apm6_LpDjX1A8svDQeXTRIWElwoQlBX4Xc4DGfWlHC0",
                    uri_android:"",
                    uri_apple:"",
                    uri_web:"",
                    uri:"https://mega.nz/file/LHAGRKob#apm6_LpDjX1A8svDQeXTRIWElwoQlBX4Xc4DGfWlHC0"
                },
                {
                    title:"Password Manager",
                    des:"Encrypt, decrypt files and folders and hash matches (md5, sha1, sha224, sha256, sha384, sha512) to check file integrity, password manager",
                    uri_github:"https://github.com/Masrik-Dahir/Encryption-decryption-interface",
                    uri_windows:"https://mega.nz/file/jTJHSAzI#oD6NmCxgvR2DtMdBKI9ghtaV1nK-sKgepvglF2lhUuI",
                    uri_android:"",
                    uri_apple:"",
                    uri_web:"",
                    uri:"https://mega.nz/file/jTJHSAzI#oD6NmCxgvR2DtMdBKI9ghtaV1nK-sKgepvglF2lhUuI"
                },
                {
                    title:"PDF Interface",
                    des:"",
                    uri_github:"https://github.com/Masrik-Dahir/Pdf_interface",
                    uri_windows:"",
                    uri_android:"",
                    uri_apple:"", uri_web:"",
                    uri:"https://github.com/Masrik-Dahir/Pdf_interface"
                },
                {
                    title:"Synchronizer",
                    des:"",
                    uri_github:"",
                    uri_windows:"",
                    uri_android:"",
                    uri_apple:"",
                    uri_web:"",
                    uri:""
                },
                {
                    title:"Formats",
                    des:"OCR, Bar code, and QR code scanner, text to speech",
                    uri_github:"",
                    uri_windows:"",
                    uri_android:"https://play.google.com/store/apps/details?id=com.apps.masrik.formats",
                    uri_apple:"",
                    uri_web:"",
                    uri:"https://play.google.com/store/apps/details?id=com.apps.masrik.formats"
                },
                {
                    title:"Automata",
                    des:"Converts the regex to NFA, DFA, Minimum-DFA; converts CFG to LL Grammar and CNF",
                    uri_github:"",
                    uri_windows:"",
                    uri_android:"https://play.google.com/store/apps/details?id=com.masrik.automation",
                    uri_apple:"",
                    uri_web:"",
                    uri:"https://play.google.com/store/apps/details?id=com.masrik.automation"
                },
                {
                    title:"Universal Calculator",
                    des:"Basic Calculator, Scientific Calculator, Bitwise Calculator (i.e., decimal, binary, hexadecimal), Unit Calculator (i.e., Any types of unit in all standards), Binary operations (i.e., 1's complement, 2's complement) ",
                    uri_github:"",
                    uri_windows:"",
                    uri_android:"https://play.google.com/store/apps/details?id=com.masrik.convertme",
                    uri_apple:"",
                    uri_web:"",
                    uri:"https://play.google.com/store/apps/details?id=com.masrik.convertme"
                },
                {
                    title:"Real Estate Analyzer",
                    des:"Mortgage Analysis, Cash Flow Analysis",
                    uri_github:"",
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
                    title:"United States of America",
                },
                {
                    title:"United Kingdom",
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
                    abv:"DC",
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
                    url:"",
                },
                {
                    title:"West Virginia",
                    abv:"WV",
                    image:"./Images/West Virginia/WV.svg.png",
                    url:"",
                },
                {
                    title:"Maryland",
                    abv:"MD",
                    image:"./Images/Maryland/MD.svg.png",
                    url:"",
                },
                {
                    title:"Delaware",
                    abv:"DE",
                    image:"./Images/Delaware/DE.svg.png",
                    url:"",
                },
                {
                    title:"North Carolina",
                    abv:"NC",
                    image:"./Images/North Carolina/NC.svg.png",
                    url:"",
                },
                {
                    title:"Indiana",
                    abv:"IN",
                    image:"./Images/Indiana/IN.svg.png",
                    url:"",
                },
                {
                    title:"Tennessee",
                    abv:"TN",
                    image:"./Images/Tennessee/TN.svg.png",
                    url:"",
                },
                {
                    title:"Washington DC",
                    abv:"DC",
                    image:"./Images/DC/DC.svg.png",
                    url:"",
                },
                {
                    title:"Pennsylvania ",
                    abv:"DC",
                    image:"./Images/Pennsylvania/PA.svg.png",
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

const app_pic_gbr = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
                {
                    title:"England",
                    abv:"GB-ENG",
                    image:"./Images/England/GB-ENG.svg.png",
                    url:"",
                },
                {
                    title:"Wales",
                    abv:"GB-WLS",
                    image:"./Images/Wales/GB-WLS.svg.png",
                    url:"",
                },
                {
                    title:"Northern Ireland",
                    abv:"GB-NIR",
                    image:"./Images/North Ireland/GB-NIR.svg.png",
                    url:"",
                },
                {
                    title:"Scotland",
                    abv:"GB-SCT",
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
Vue.createApp(app_pic_gbr).mount('#app_pic_gbr')
Vue.createApp(app_kentucky).mount('#app_kentucky')
Vue.createApp(app_maine).mount('#app_maine')
Vue.createApp(app_new_hampshire).mount('#app_new_hampshire')
Vue.createApp(app_connecticut).mount('#app_connecticut')
Vue.createApp(app_vermont).mount('#app_vermont')
Vue.createApp(app_new_york).mount('#app_new_york')
Vue.createApp(app_massachusetts).mount('#app_massachusetts')



