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

const app_country = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources: [
                { title: "United States", abv: "USA", "image": "https://www.masrikdahir.com/Images/United States/Thumbnail/USA.svg.png", url: "https://www.masrikdahir.com/map/us", id: "scroll_USA" },
                { title: "Canada", abv: "CAN", "image": "https://www.masrikdahir.com/Images/Canada/Thumbnail/CAN.svg.png", url: "https://www.masrikdahir.com/map/ca", id: "scroll_CAN" },
                { title: "Bangladesh", abv: "BGD", "image": "https://www.masrikdahir.com/Images/Bangladesh/Thumbnail/BGD.svg.png", url: "https://www.masrikdahir.com/map/bd", id: "scroll_BGD" },
                { title: "Mexico", abv: "MEX", "image": "https://www.masrikdahir.com/Images/Mexico/Thumbnail/MEX.svg.png", url: "https://www.masrikdahir.com/map/mx", id: "scroll_MEX" },
                { title: "United Kingdom", abv: "GBR", "image": "https://www.masrikdahir.com/Images/United Kingdom/Thumbnail/GBR.svg.png", url: "https://www.masrikdahir.com/map/gb", id: "scroll_GBR" },
                { title: "Australia", abv: "AUS", "image": "https://www.masrikdahir.com/Images/Australia/Thumbnail/AUS.svg.png", url: "https://www.masrikdahir.com/map/au", id: "scroll_AUS" },
                { title: "Germany", abv: "DEU", "image": "https://www.masrikdahir.com/Images/Germany/Thumbnail/DEU.svg.png", url: "https://www.masrikdahir.com/map/de", id: "scroll_DEU" },
                { title: "France", abv: "FRA", "image": "https://www.masrikdahir.com/Images/France/Thumbnail/FRA.svg.png", url: "https://www.masrikdahir.com/map/fr", id: "scroll_FRA" },
                { title: "Japan", abv: "JPN", "image": "https://www.masrikdahir.com/Images/Japan/Thumbnail/JPN.svg.png", url: "https://www.masrikdahir.com/map/jp", id: "scroll_JPN" },
                { title: "India", abv: "IND", "image": "https://www.masrikdahir.com/Images/India/Thumbnail/IND.svg.png", url: "https://www.masrikdahir.com/map/in", id: "scroll_IND" },
                { title: "Brazil", abv: "BRA", "image": "https://www.masrikdahir.com/Images/Brazil/Thumbnail/BRA.svg.png", url: "https://www.masrikdahir.com/map/br", id: "scroll_BRA" },
                { title: "Italy", abv: "ITA", "image": "https://www.masrikdahir.com/Images/Italy/Thumbnail/ITA.svg.png", url: "https://www.masrikdahir.com/map/it", id: "scroll_ITA" },
                { title: "Spain", abv: "ESP", "image": "https://www.masrikdahir.com/Images/Spain/Thumbnail/ESP.svg.png", url: "https://www.masrikdahir.com/map/es", id: "scroll_ESP" },
                { title: "Russia", abv: "RUS", "image": "https://www.masrikdahir.com/Images/Russia/Thumbnail/RUS.svg.png", url: "https://www.masrikdahir.com/map/ru", id: "scroll_RUS" },
                { title: "South Africa", abv: "ZAF", "image": "https://www.masrikdahir.com/Images/South Africa/Thumbnail/ZAF.svg.png", url: "https://www.masrikdahir.com/map/za", id: "scroll_ZAF" },
                { title: "Argentina", abv: "ARG", "image": "https://www.masrikdahir.com/Images/Argentina/Thumbnail/ARG.svg.png", url: "https://www.masrikdahir.com/map/ar", id: "scroll_ARG" },
                { title: "Nigeria", abv: "NGA", "image": "https://www.masrikdahir.com/Images/Nigeria/Thumbnail/NGA.svg.png", url: "https://www.masrikdahir.com/map/ng", id: "scroll_NGA" },
                { title: "Egypt", abv: "EGY", "image": "https://www.masrikdahir.com/Images/Egypt/Thumbnail/EGY.svg.png", url: "https://www.masrikdahir.com/map/eg", id: "scroll_EGY" },
                { title: "Philippines", abv: "PHL", "image": "https://www.masrikdahir.com/Images/Philippines/Thumbnail/PHL.svg.png", url: "https://www.masrikdahir.com/map/ph", id: "scroll_PHL" },
                { title: "Vietnam", abv: "VNM", "image": "https://www.masrikdahir.com/Images/Vietnam/Thumbnail/VNM.svg.png", url: "https://www.masrikdahir.com/map/vn", id: "scroll_VNM" },
                { title: "Turkey", abv: "TUR", "image": "https://www.masrikdahir.com/Images/Turkey/Thumbnail/TUR.svg.png", url: "https://www.masrikdahir.com/map/tr", id: "scroll_TUR" },
                { title: "Iran", abv: "IRN", "image": "https://www.masrikdahir.com/Images/Iran/Thumbnail/IRN.svg.png", url: "https://www.masrikdahir.com/map/ir", id: "scroll_IRN" },
                { title: "Thailand", abv: "THA", "image": "https://www.masrikdahir.com/Images/Thailand/Thumbnail/THA.svg.png", url: "https://www.masrikdahir.com/map/th", id: "scroll_THA" },
                { title: "Colombia", abv: "COL", "image": "https://www.masrikdahir.com/Images/Colombia/Thumbnail/COL.svg.png", url: "https://www.masrikdahir.com/map/co", id: "scroll_COL" },
                { title: "Indonesia", abv: "IDN", "image": "https://www.masrikdahir.com/Images/Indonesia/Thumbnail/IDN.svg.png", url: "https://www.masrikdahir.com/map/id", id: "scroll_IDN" },
                { title: "Pakistan", abv: "PAK", "image": "https://www.masrikdahir.com/Images/Pakistan/Thumbnail/PAK.svg.png", url: "https://www.masrikdahir.com/map/pk", id: "scroll_PAK" },
                { title: "Russia", abv: "RUS", "image": "https://www.masrikdahir.com/Images/Russia/Thumbnail/RUS.svg.png", url: "https://www.masrikdahir.com/map/ru", id: "scroll_RUS" },
                { title: "Mexico", abv: "MEX", "image": "https://www.masrikdahir.com/Images/Mexico/Thumbnail/MEX.svg.png", url: "https://www.masrikdahir.com/map/mx", id: "scroll_MEX" },
                { title: "Ukraine", abv: "UKR", "image": "https://www.masrikdahir.com/Images/Ukraine/Thumbnail/UKR.svg.png", url: "https://www.masrikdahir.com/map/ua", id: "scroll_UKR" },
                { title: "Iraq", abv: "IRQ", "image": "https://www.masrikdahir.com/Images/Iraq/Thumbnail/IRQ.svg.png", url: "https://www.masrikdahir.com/map/iq", id: "scroll_IRQ" },
                { title: "Afghanistan", abv: "AFG", "image": "https://www.masrikdahir.com/Images/Afghanistan/Thumbnail/AFG.svg.png", url: "https://www.masrikdahir.com/map/af", id: "scroll_AFG" },
                { title: "Saudi Arabia", abv: "SAU", "image": "https://www.masrikdahir.com/Images/Saudi Arabia/Thumbnail/SAU.svg.png", url: "https://www.masrikdahir.com/map/sa", id: "scroll_SAU" },
                { title: "Malaysia", abv: "MYS", "image": "https://www.masrikdahir.com/Images/Malaysia/Thumbnail/MYS.svg.png", url: "https://www.masrikdahir.com/map/my", id: "scroll_MYS" },
                { title: "Kazakhstan", abv: "KAZ", "image": "https://www.masrikdahir.com/Images/Kazakhstan/Thumbnail/KAZ.svg.png", url: "https://www.masrikdahir.com/map/kz", id: "scroll_KAZ" },
                { title: "Sudan", abv: "SDN", "image": "https://www.masrikdahir.com/Images/Sudan/Thumbnail/SDN.svg.png", url: "https://www.masrikdahir.com/map/sd", id: "scroll_SDN" },
                { title: "Angola", abv: "AGO", "image": "https://www.masrikdahir.com/Images/Angola/Thumbnail/AGO.svg.png", url: "https://www.masrikdahir.com/map/ao", id: "scroll_AGO" },
                { title: "Peru", abv: "PER", "image": "https://www.masrikdahir.com/Images/Peru/Thumbnail/PER.svg.png", url: "https://www.masrikdahir.com/map/pe", id: "scroll_PER" },
                { title: "Uzbekistan", abv: "UZB", "image": "https://www.masrikdahir.com/Images/Uzbekistan/Thumbnail/UZB.svg.png", url: "https://www.masrikdahir.com/map/uz", id: "scroll_UZB" },
                { title: "Saudi Arabia", abv: "SAU", "image": "https://www.masrikdahir.com/Images/Saudi Arabia/Thumbnail/SAU.svg.png", url: "https://www.masrikdahir.com/map/sa", id: "scroll_SAU" },
                { title: "Nepal", abv: "NPL", "image": "https://www.masrikdahir.com/Images/Nepal/Thumbnail/NPL.svg.png", url: "https://www.masrikdahir.com/map/np", id: "scroll_NPL" },
                { title: "Venezuela", abv: "VEN", "image": "https://www.masrikdahir.com/Images/Venezuela/Thumbnail/VEN.svg.png", url: "https://www.masrikdahir.com/map/ve", id: "scroll_VEN" },
                { title: "Madagascar", abv: "MDG", "image": "https://www.masrikdahir.com/Images/Madagascar/Thumbnail/MDG.svg.png", url: "https://www.masrikdahir.com/map/mg", id: "scroll_MDG" },
                { title: "Cameroon", abv: "CMR", "image": "https://www.masrikdahir.com/Images/Cameroon/Thumbnail/CMR.svg.png", url: "https://www.masrikdahir.com/map/cm", id: "scroll_CMR" },
                { title: "Côte d'Ivoire", abv: "CIV", "image": "https://www.masrikdahir.com/Images/Cote d'Ivoire/Thumbnail/CIV.svg.png", url: "https://www.masrikdahir.com/map/ci", id: "scroll_CIV" },
                { title: "North Korea", abv: "PRK", "image": "https://www.masrikdahir.com/Images/North Korea/Thumbnail/PRK.svg.png", url: "https://www.masrikdahir.com/map/kp", id: "scroll_PRK" },
                { title: "South Korea", abv: "KOR", "image": "https://www.masrikdahir.com/Images/South Korea/Thumbnail/KOR.svg.png", url: "https://www.masrikdahir.com/map/kr", id: "scroll_KOR" },
                { title: "Mali", abv: "MLI", "image": "https://www.masrikdahir.com/Images/Mali/Thumbnail/MLI.svg.png", url: "https://www.masrikdahir.com/map/ml", id: "scroll_MLI" },
                { title: "Romania", abv: "ROU", "image": "https://www.masrikdahir.com/Images/Romania/Thumbnail/ROU.svg.png", url: "https://www.masrikdahir.com/map/ro", id: "scroll_ROU" },
                { title: "Belarus", abv: "BLR", "image": "https://www.masrikdahir.com/Images/Belarus/Thumbnail/BLR.svg.png", url: "https://www.masrikdahir.com/map/by", id: "scroll_BLR" },
                { title: "Syria", abv: "SYR", "image": "https://www.masrikdahir.com/Images/Syria/Thumbnail/SYR.svg.png", url: "https://www.masrikdahir.com/map/sy", id: "scroll_SYR" },
                { title: "Burkina Faso", abv: "BFA", "image": "https://www.masrikdahir.com/Images/Burkina Faso/Thumbnail/BFA.svg.png", url: "https://www.masrikdahir.com/map/bf", id: "scroll_BFA" },
                { title: "Kazakhstan", abv: "KAZ", "image": "https://www.masrikdahir.com/Images/Kazakhstan/Thumbnail/KAZ.svg.png", url: "https://www.masrikdahir.com/map/kz", id: "scroll_KAZ" },
                { title: "Papua New Guinea", abv: "PNG", "image": "https://www.masrikdahir.com/Images/Papua New Guinea/Thumbnail/PNG.svg.png", url: "https://www.masrikdahir.com/map/pg", id: "scroll_PNG" },
                { title: "Honduras", abv: "HND", "image": "https://www.masrikdahir.com/Images/Honduras/Thumbnail/HND.svg.png", url: "https://www.masrikdahir.com/map/hn", id: "scroll_HND" },
                { title: "Zimbabwe", abv: "ZWE", "image": "https://www.masrikdahir.com/Images/Zimbabwe/Thumbnail/ZWE.svg.png", url: "https://www.masrikdahir.com/map/zw", id: "scroll_ZWE" },
                { title: "Portugal", abv: "PRT", "image": "https://www.masrikdahir.com/Images/Portugal/Thumbnail/PRT.svg.png", url: "https://www.masrikdahir.com/map/pt", id: "scroll_PRT" },
                { title: "Czech Republic", abv: "CZE", "image": "https://www.masrikdahir.com/Images/Czech Republic/Thumbnail/CZE.svg.png", url: "https://www.masrikdahir.com/map/cz", id: "scroll_CZE" },
                { title: "Greece", abv: "GRC", "image": "https://www.masrikdahir.com/Images/Greece/Thumbnail/GRC.svg.png", url: "https://www.masrikdahir.com/map/gr", id: "scroll_GRC" },
                { title: "Slovakia", abv: "SVK", "image": "https://www.masrikdahir.com/Images/Slovakia/Thumbnail/SVK.svg.png", url: "https://www.masrikdahir.com/map/sk", id: "scroll_SVK" },
                { title: "Finland", abv: "FIN", "image": "https://www.masrikdahir.com/Images/Finland/Thumbnail/FIN.svg.png", url: "https://www.masrikdahir.com/map/fi", id: "scroll_FIN" },
                { title: "Sweden", abv: "SWE", "image": "https://www.masrikdahir.com/Images/Sweden/Thumbnail/SWE.svg.png", url: "https://www.masrikdahir.com/map/se", id: "scroll_SWE" },
                { title: "Norway", abv: "NOR", "image": "https://www.masrikdahir.com/Images/Norway/Thumbnail/NOR.svg.png", url: "https://www.masrikdahir.com/map/no", id: "scroll_NOR" },
                { title: "Denmark", abv: "DNK", "image": "https://www.masrikdahir.com/Images/Denmark/Thumbnail/DNK.svg.png", url: "https://www.masrikdahir.com/map/dk", id: "scroll_DNK" },
                { title: "Ireland", abv: "IRL", "image": "https://www.masrikdahir.com/Images/Ireland/Thumbnail/IRL.svg.png", url: "https://www.masrikdahir.com/map/ie", id: "scroll_IRL" },
                { title: "Austria", abv: "AUT", "image": "https://www.masrikdahir.com/Images/Austria/Thumbnail/AUT.svg.png", url: "https://www.masrikdahir.com/map/at", id: "scroll_AUT" },
                { title: "Switzerland", abv: "CHE", "image": "https://www.masrikdahir.com/Images/Switzerland/Thumbnail/CHE.svg.png", url: "https://www.masrikdahir.com/map/ch", id: "scroll_CHE" },
                { title: "Belgium", abv: "BEL", "image": "https://www.masrikdahir.com/Images/Belgium/Thumbnail/BEL.svg.png", url: "https://www.masrikdahir.com/map/be", id: "scroll_BEL" },
                { title: "Hungary", abv: "HUN", "image": "https://www.masrikdahir.com/Images/Hungary/Thumbnail/HUN.svg.png", url: "https://www.masrikdahir.com/map/hu", id: "scroll_HUN" },
                { title: "Bulgaria", abv: "BGR", "image": "https://www.masrikdahir.com/Images/Bulgaria/Thumbnail/BGR.svg.png", url: "https://www.masrikdahir.com/map/bg", id: "scroll_BGR" },
                { title: "Slovenia", abv: "SVN", "image": "https://www.masrikdahir.com/Images/Slovenia/Thumbnail/SVN.svg.png", url: "https://www.masrikdahir.com/map/si", id: "scroll_SVN" },
                { title: "Croatia", abv: "HRV", "image": "https://www.masrikdahir.com/Images/Croatia/Thumbnail/HRV.svg.png", url: "https://www.masrikdahir.com/map/hr", id: "scroll_HRV" },
                { title: "Lithuania", abv: "LTU", "image": "https://www.masrikdahir.com/Images/Lithuania/Thumbnail/LTU.svg.png", url: "https://www.masrikdahir.com/map/lt", id: "scroll_LTU" },
                { title: "Latvia", abv: "LVA", "image": "https://www.masrikdahir.com/Images/Latvia/Thumbnail/LVA.svg.png", url: "https://www.masrikdahir.com/map/lv", id: "scroll_LVA" },
                { title: "Estonia", abv: "EST", "image": "https://www.masrikdahir.com/Images/Estonia/Thumbnail/EST.svg.png", url: "https://www.masrikdahir.com/map/ee", id: "scroll_EST" },
                { title: "Malta", abv: "MLT", "image": "https://www.masrikdahir.com/Images/Malta/Thumbnail/MLT.svg.png", url: "https://www.masrikdahir.com/map/mt", id: "scroll_MLT" },
                { title: "Cyprus", abv: "CYP", "image": "https://www.masrikdahir.com/Images/Cyprus/Thumbnail/CYP.svg.png", url: "https://www.masrikdahir.com/map/cy", id: "scroll_CYP" },
                { title: "Iceland", abv: "ISL", "image": "https://www.masrikdahir.com/Images/Iceland/Thumbnail/ISL.svg.png", url: "https://www.masrikdahir.com/map/is", id: "scroll_ISL" },
                { title: "Luxembourg", abv: "LUX", "image": "https://www.masrikdahir.com/Images/Luxembourg/Thumbnail/LUX.svg.png", url: "https://www.masrikdahir.com/map/lu", id: "scroll_LUX" },
                { title: "Monaco", abv: "MCO", "image": "https://www.masrikdahir.com/Images/Monaco/Thumbnail/MCO.svg.png", url: "https://www.masrikdahir.com/map/mc", id: "scroll_MCO" },
                { title: "San Marino", abv: "SMR", "image": "https://www.masrikdahir.com/Images/San Marino/Thumbnail/SMR.svg.png", url: "https://www.masrikdahir.com/map/sm", id: "scroll_SMR" },
                { title: "Andorra", abv: "AND", "image": "https://www.masrikdahir.com/Images/Andorra/Thumbnail/AND.svg.png", url: "https://www.masrikdahir.com/map/ad", id: "scroll_AND" },
                { title: "Liechtenstein", abv: "LIE", "image": "https://www.masrikdahir.com/Images/Liechtenstein/Thumbnail/LIE.svg.png", url: "https://www.masrikdahir.com/map/li", id: "scroll_LIE" },
                { title: "Vatican City", abv: "VAT", "image": "https://www.masrikdahir.com/Images/Vatican City/Thumbnail/VAT.svg.png", url: "https://www.masrikdahir.com/map/va", id: "scroll_VAT" },
                { title: "Bhutan", abv: "BTN", "image": "https://www.masrikdahir.com/Images/Bhutan/Thumbnail/BTN.svg.png", url: "https://www.masrikdahir.com/map/bt", id: "scroll_BTN" },
                { title: "Brunei", abv: "BRN", "image": "https://www.masrikdahir.com/Images/Brunei/Thumbnail/BRN.svg.png", url: "https://www.masrikdahir.com/map/bn", id: "scroll_BRN" },
                { title: "Maldives", abv: "MDV", "image": "https://www.masrikdahir.com/Images/Maldives/Thumbnail/MDV.svg.png", url: "https://www.masrikdahir.com/map/mv", id: "scroll_MDV" },
                { title: "Seychelles", abv: "SYC", "image": "https://www.masrikdahir.com/Images/Seychelles/Thumbnail/SYC.svg.png", url: "https://www.masrikdahir.com/map/sc", id: "scroll_SYC" },
                { title: "Comoros", abv: "COM", "image": "https://www.masrikdahir.com/Images/Comoros/Thumbnail/COM.svg.png", url: "https://www.masrikdahir.com/map/km", id: "scroll_COM" },
                { title: "Djibouti", abv: "DJI", "image": "https://www.masrikdahir.com/Images/Djibouti/Thumbnail/DJI.svg.png", url: "https://www.masrikdahir.com/map/dj", id: "scroll_DJI" },
                { title: "Eswatini", abv: "SWZ", "image": "https://www.masrikdahir.com/Images/Eswatini/Thumbnail/SWZ.svg.png", url: "https://www.masrikdahir.com/map/sz", id: "scroll_SWZ" },
                { title: "Mauritius", abv: "MUS", "image": "https://www.masrikdahir.com/Images/Mauritius/Thumbnail/MUS.svg.png", url: "https://www.masrikdahir.com/map/mu", id: "scroll_MUS" },
                { title: "Gabon", abv: "GAB", "image": "https://www.masrikdahir.com/Images/Gabon/Thumbnail/GAB.svg.png", url: "https://www.masrikdahir.com/map/ga", id: "scroll_GAB" },
                { title: "Equatorial Guinea", abv: "GNQ", "image": "https://www.masrikdahir.com/Images/Equatorial Guinea/Thumbnail/GNQ.svg.png", url: "https://www.masrikdahir.com/map/gq", id: "scroll_GNQ" },
                { title: "Sao Tome and Principe", abv: "STP", "image": "https://www.masrikdahir.com/Images/Sao Tome and Principe/Thumbnail/STP.svg.png", url: "https://www.masrikdahir.com/map/st", id: "scroll_STP" },
                { title: "Tanzania", abv: "TZA", "image": "https://www.masrikdahir.com/Images/Tanzania/Thumbnail/TZA.svg.png", url: "https://www.masrikdahir.com/map/tz", id: "scroll_TZA" },
                { title: "Ghana", abv: "GHA", "image": "https://www.masrikdahir.com/Images/Ghana/Thumbnail/GHA.svg.png", url: "https://www.masrikdahir.com/map/gh", id: "scroll_GHA" },
                { title: "Zambia", abv: "ZMB", "image": "https://www.masrikdahir.com/Images/Zambia/Thumbnail/ZMB.svg.png", url: "https://www.masrikdahir.com/map/zm", id: "scroll_ZMB" },
                { title: "Nigeria", abv: "NGA", "image": "https://www.masrikdahir.com/Images/Nigeria/Thumbnail/NGA.svg.png", url: "https://www.masrikdahir.com/map/ng", id: "scroll_NGA" },
                { title: "Anguilla", abv: "AIA", "image": "https://www.masrikdahir.com/Images/Anguilla/Thumbnail/AIA.svg.png", url: "https://www.masrikdahir.com/map/ai", id: "scroll_AIA" },
                { title: "Bahamas", abv: "BHS", "image": "https://www.masrikdahir.com/Images/Bahamas/Thumbnail/BHS.svg.png", url: "https://www.masrikdahir.com/map/bs", id: "scroll_BHS" },
                { title: "Jamaica", abv: "JAM", "image": "https://www.masrikdahir.com/Images/Jamaica/Thumbnail/JAM.svg.png", url: "https://www.masrikdahir.com/map/jm", id: "scroll_JAM" },
                { title: "Puerto Rico", abv: "PRI", "image": "https://www.masrikdahir.com/Images/Puerto Rico/Thumbnail/PRI.svg.png", url: "https://www.masrikdahir.com/map/pr", id: "scroll_PRI" },
                { title: "Cayman Islands", abv: "CYM", "image": "https://www.masrikdahir.com/Images/Cayman Islands/Thumbnail/CYM.svg.png", url: "https://www.masrikdahir.com/map/ky", id: "scroll_CYM" },
                { title: "Barbados", abv: "BRB", "image": "https://www.masrikdahir.com/Images/Barbados/Thumbnail/BRB.svg.png", url: "https://www.masrikdahir.com/map/bb", id: "scroll_BRB" },
                { title: "Saint Lucia", abv: "LCA", "image": "https://www.masrikdahir.com/Images/Saint Lucia/Thumbnail/LCA.svg.png", url: "https://www.masrikdahir.com/map/lc", id: "scroll_LCA" },
                { title: "Dominican Republic", abv: "DOM", "image": "https://www.masrikdahir.com/Images/Dominican Republic/Thumbnail/DOM.svg.png", url: "https://www.masrikdahir.com/map/do", id: "scroll_DOM" },
                { title: "Grenada", abv: "GRD", "image": "https://www.masrikdahir.com/Images/Grenada/Thumbnail/GRD.svg.png", url: "https://www.masrikdahir.com/map/gd", id: "scroll_GRD" },
                { title: "Trinidad and Tobago", abv: "TTO", "image": "https://www.masrikdahir.com/Images/Trinidad and Tobago/Thumbnail/TTO.svg.png", url: "https://www.masrikdahir.com/map/tt", id: "scroll_TTO" },
                { title: "Curacao", abv: "CUW", "image": "https://www.masrikdahir.com/Images/Curacao/Thumbnail/CUW.svg.png", url: "https://www.masrikdahir.com/map/cw", id: "scroll_CUW" },
                { title: "Sint Maarten", abv: "SXM", "image": "https://www.masrikdahir.com/Images/Sint Maarten/Thumbnail/SXM.svg.png", url: "https://www.masrikdahir.com/map/sx", id: "scroll_SXM" },
                { title: "Saint Kitts and Nevis", abv: "KNA", "image": "https://www.masrikdahir.com/Images/Saint Kitts and Nevis/Thumbnail/KNA.svg.png", url: "https://www.masrikdahir.com/map/kn", id: "scroll_KNA" },
                { title: "Saint Vincent and the Grenadines", abv: "VCT", "image": "https://www.masrikdahir.com/Images/Saint Vincent and the Grenadines/Thumbnail/VCT.svg.png", url: "https://www.masrikdahir.com/map/vc", id: "scroll_VCT" }

            ]
        };
    },
    computed: {
        resultQuery() {
            let filteredResults = this.searchQuery
                ? this.resources.filter((item) => {
                    return this.searchQuery.toLowerCase().split(' ').every(v =>
                        item.title.toLowerCase().includes(v)
                    );
                })
                : this.resources;

            // Return only the first 10 items
            return filteredResults.slice(0, 3);
        }
    },
    mounted() {
        this.$nextTick(() => {
            window.addEventListener('resize', this.onResize);
        });
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.onResize);
    },
    methods: {
        scrollToSection(sectionId) {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        },
        toggleBox() {
            this.button_to_activate_box = !this.button_to_activate_box;

            if (this.button_text === "show") {
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
        modelStyle(slide) {
            if (slide === 'middle') {
                return { 'left': `${this.middle}px` };
            } else if (slide === 'middle2') {
                return { 'left': `${this.middle2}px` };
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
                    title:"Home",
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
Vue.createApp(app_country).mount('#app_country')
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













