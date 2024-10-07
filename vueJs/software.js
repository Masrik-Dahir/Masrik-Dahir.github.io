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

const app_milestone = {
    data() {
        return {
            searchQuery: null,
            resources:[
                {
                    title:"Henrico County Equity Ambassador",
                    des:"",
                    uri:"https://henrico.us/",
                    img:"https://www.masrikdahir.com/Images/henrico.webp",
                    uri_2:"",
                    img_2:"",
                    style: "width: 1vw; min-width: 120px"

                },
                {
                    title: "Henrico County Engineering Scholar",
                    des: "",
                    uri: "https://henrico.us/",
                    img: "https://www.masrikdahir.com/Images/henrico.webp",
                    uri_2: "https://www.vcu.edu/",
                    img_2: "https://www.masrikdahir.com/Images/vcu_ram.png",
                    style: "width: 1vw; min-width: 120px"

                },
                {
                    title: "Altria Scholar",
                    des: "",
                    uri: "https://www.altria.com/en",
                    img: "https://www.masrikdahir.com/Images/altria.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: 120px"

                },
                {
                    title: "Summa Cum Laude",
                    des: "",
                    uri: "https://rar.vcu.edu/graduation/",
                    img: "https://www.masrikdahir.com/Images/summacumlaude.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: 120px"

                },
                {
                    title: "iCubed Scholar",
                    des: "",
                    uri: "https://icubed.vcu.edu/",
                    img: "https://www.masrikdahir.com/Images/icubed%20(1).png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: 120px"

                },
                {
                    title: "Deans List",
                    des: "",
                    uri: "https://henrico.us/",
                    img: "https://www.masrikdahir.com/Images/deanslistlogo.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: 120px"

                },
                {
                    title: "Superintendent’s Scholar",
                    des: "",
                    uri: "https://henricoschools.us/division-leadership-team/",
                    img: "https://www.masrikdahir.com/Images/henrico.webp",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: 120px"

                },
                {
                    title: "CarMax Scholar",
                    des: "",
                    uri: "https://www.carmax.com/",
                    img: "https://www.masrikdahir.com/Images/carmax.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: 120px"

                },
                {
                    title: "Susanne and Sam Dibert STEM Scholar",
                    des: "",
                    uri: "https://www.swagelok.com/",
                    img: "https://www.masrikdahir.com/Images/swagelok.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: 120px"

                },
                {
                    title: "GRRC Scholar",
                    des: "",
                    uri: "http://richmondrelo.org/",
                    img: "./Images/grrc.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: 280px"
                },
                {
                    title: "Harrison-Labouisse Memorial Scholar",
                    des: "",
                    uri: "https://www.cfrichmond.org/Apply-for-a-Scholarship/View-All-Scholarships?s=Harrison-Labouisse-Mayo+Memorial+Scholarship",
                    img: "./Images/Me66Jxa.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: 100px"
                },
                {
                    title: "Bachelors of Science (Hons.)",
                    des: "",
                    uri_2: "https://egr.vcu.edu/",
                    img_2: "./Images/CS-icon-01.png",
                    uri: "https://www.vcu.edu/",
                    img: "https://www.masrikdahir.com/Images/vcu_ram.png",
                    style: "width: 1vw; min-width: 120px"
                },
                {
                    title: "Masters of Science (Hons.)",
                    des: "",
                    uri: "https://www.vcu.edu/",
                    img: "https://www.masrikdahir.com/Images/vcu_ram.png",
                    uri_2: "https://egr.vcu.edu/",
                    img_2: "https://www.masrikdahir.com/Images/ai.png",
                    style: "width: 1vw; min-width: 120px"
                }
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
            windowHeight: window.innerHeight,
            windowWidth: window.innerWidth,
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources: [
                { title: "United States", abv: "USA", image: "https://www.masrikdahir.com/Images/United States/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/united-states", id: "scroll_USA" },
                { title: "Canada", abv: "CAN", image: "https://www.masrikdahir.com/Images/Canada/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/canada", id: "scroll_CAN" },
                { title: "Bangladesh", abv: "BGD", image: "https://www.masrikdahir.com/Images/Bangladesh/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/bangladesh", id: "scroll_BGD" },
                { title: "Afghanistan", abv: "AFG", image: "https://www.masrikdahir.com/Images/Afghanistan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/afghanistan", id: "scroll_AFG" },
                { title: "Albania", abv: "ALB", image: "https://www.masrikdahir.com/Images/Albania/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/albania", id: "scroll_ALB" },
                { title: "Algeria", abv: "DZA", image: "https://www.masrikdahir.com/Images/Algeria/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/algeria", id: "scroll_DZA" },
                { title: "Andorra", abv: "AND", image: "https://www.masrikdahir.com/Images/Andorra/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/andorra", id: "scroll_AND" },
                { title: "Angola", abv: "AGO", image: "https://www.masrikdahir.com/Images/Angola/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/angola", id: "scroll_AGO" },
                { title: "Antigua & Deps", abv: "ATG", image: "https://www.masrikdahir.com/Images/Antigua & Deps/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/antigua-and-deps", id: "scroll_ATG" },
                { title: "Argentina", abv: "ARG", image: "https://www.masrikdahir.com/Images/Argentina/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/argentina", id: "scroll_ARG" },
                { title: "Armenia", abv: "ARM", image: "https://www.masrikdahir.com/Images/Armenia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/armenia", id: "scroll_ARM" },
                { title: "Australia", abv: "AUS", image: "https://www.masrikdahir.com/Images/Australia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/australia", id: "scroll_AUS" },
                { title: "Austria", abv: "AUT", image: "https://www.masrikdahir.com/Images/Austria/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/austria", id: "scroll_AUT" },
                { title: "Azerbaijan", abv: "AZE", image: "https://www.masrikdahir.com/Images/Azerbaijan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/azerbaijan", id: "scroll_AZE" },
                { title: "Bahamas", abv: "BHS", image: "https://www.masrikdahir.com/Images/Bahamas/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/bahamas", id: "scroll_BHS" },
                { title: "Bahrain", abv: "BHR", image: "https://www.masrikdahir.com/Images/Bahrain/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/bahrain", id: "scroll_BHR" },
                { title: "Barbados", abv: "BRB", image: "https://www.masrikdahir.com/Images/Barbados/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/barbados", id: "scroll_BRB" },
                { title: "Belarus", abv: "BLR", image: "https://www.masrikdahir.com/Images/Belarus/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/belarus", id: "scroll_BLR" },
                { title: "Belgium", abv: "BEL", image: "https://www.masrikdahir.com/Images/Belgium/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/belgium", id: "scroll_BEL" },
                { title: "Belize", abv: "BLZ", image: "https://www.masrikdahir.com/Images/Belize/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/belize", id: "scroll_BLZ" },
                { title: "Benin", abv: "BEN", image: "https://www.masrikdahir.com/Images/Benin/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/benin", id: "scroll_BEN" },
                { title: "Bhutan", abv: "BTN", image: "https://www.masrikdahir.com/Images/Bhutan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/bhutan", id: "scroll_BTN" },
                { title: "Bolivia", abv: "BOL", image: "https://www.masrikdahir.com/Images/Bolivia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/bolivia", id: "scroll_BOL" },
                { title: "Bosnia Herzegovina", abv: "BIH", image: "https://www.masrikdahir.com/Images/Bosnia Herzegovina/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/bosnia-herzegovina", id: "scroll_BIH" },
                { title: "Botswana", abv: "BWA", image: "https://www.masrikdahir.com/Images/Botswana/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/botswana", id: "scroll_BWA" },
                { title: "Brazil", abv: "BRA", image: "https://www.masrikdahir.com/Images/Brazil/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/brazil", id: "scroll_BRA" },
                { title: "Brunei", abv: "BRN", image: "https://www.masrikdahir.com/Images/Brunei/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/brunei", id: "scroll_BRN" },
                { title: "Bulgaria", abv: "BGR", image: "https://www.masrikdahir.com/Images/Bulgaria/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/bulgaria", id: "scroll_BGR" },
                { title: "Burkina", abv: "BFA", image: "https://www.masrikdahir.com/Images/Burkina/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/burkina", id: "scroll_BFA" },
                { title: "Burundi", abv: "BDI", image: "https://www.masrikdahir.com/Images/Burundi/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/burundi", id: "scroll_BDI" },
                { title: "Cambodia", abv: "KHM", image: "https://www.masrikdahir.com/Images/Cambodia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/cambodia", id: "scroll_KHM" },
                { title: "Cameroon", abv: "CMR", image: "https://www.masrikdahir.com/Images/Cameroon/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/cameroon", id: "scroll_CMR" },
                { title: "Cape Verde", abv: "CPV", image: "https://www.masrikdahir.com/Images/Cape Verde/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/cape-verde", id: "scroll_CPV" },
                { title: "Central African Republic", abv: "CAF", image: "https://www.masrikdahir.com/Images/Central African Republic/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/central-african-republic", id: "scroll_CAF" },
                { title: "Chad", abv: "TCD", image: "https://www.masrikdahir.com/Images/Chad/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/chad", id: "scroll_TCD" },
                { title: "Chile", abv: "CHL", image: "https://www.masrikdahir.com/Images/Chile/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/chile", id: "scroll_CHL" },
                { title: "China", abv: "CHN", image: "https://www.masrikdahir.com/Images/China/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/china", id: "scroll_CHN" },
                { title: "Colombia", abv: "COL", image: "https://www.masrikdahir.com/Images/Colombia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/colombia", id: "scroll_COL" },
                { title: "Comoros", abv: "COM", image: "https://www.masrikdahir.com/Images/Comoros/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/comoros", id: "scroll_COM" },
                { title: "Congo", abv: "COG", image: "https://www.masrikdahir.com/Images/Congo/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/congo", id: "scroll_COG" },
                { title: "Democratic Republic of Congo", abv: "COD", image: "https://www.masrikdahir.com/Images/Democratic Republic of Congo/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/congo-democratic-republic", id: "scroll_COD" },
                { title: "Costa Rica", abv: "CRI", image: "https://www.masrikdahir.com/Images/Costa Rica/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/costa-rica", id: "scroll_CRI" },
                { title: "Croatia", abv: "HRV", image: "https://www.masrikdahir.com/Images/Croatia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/croatia", id: "scroll_HRV" },
                { title: "Cuba", abv: "CUB", image: "https://www.masrikdahir.com/Images/Cuba/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/cuba", id: "scroll_CUB" },
                { title: "Cyprus", abv: "CYP", image: "https://www.masrikdahir.com/Images/Cyprus/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/cyprus", id: "scroll_CYP" },
                { title: "Czech Republic", abv: "CZE", image: "https://www.masrikdahir.com/Images/Czech Republic/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/czech-republic", id: "scroll_CZE" },
                { title: "Denmark", abv: "DNK", image: "https://www.masrikdahir.com/Images/Denmark/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/denmark", id: "scroll_DNK" },
                { title: "Djibouti", abv: "DJI", image: "https://www.masrikdahir.com/Images/Djibouti/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/djibouti", id: "scroll_DJI" },
                { title: "Dominica", abv: "DMA", image: "https://www.masrikdahir.com/Images/Dominica/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/dominica", id: "scroll_DMA" },
                { title: "Dominican Republic", abv: "DOM", image: "https://www.masrikdahir.com/Images/Dominican Republic/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/dominican-republic", id: "scroll_DOM" },
                { title: "East Timor", abv: "TLS", image: "https://www.masrikdahir.com/Images/East Timor/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/east-timor", id: "scroll_TLS" },
                { title: "Ecuador", abv: "ECU", image: "https://www.masrikdahir.com/Images/Ecuador/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/ecuador", id: "scroll_ECU" },
                { title: "Egypt", abv: "EGY", image: "https://www.masrikdahir.com/Images/Egypt/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/egypt", id: "scroll_EGY" },
                { title: "El Salvador", abv: "SLV", image: "https://www.masrikdahir.com/Images/El Salvador/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/el-salvador", id: "scroll_SLV" },
                { title: "Equatorial Guinea", abv: "GNQ", image: "https://www.masrikdahir.com/Images/Equatorial Guinea/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/equatorial-guinea", id: "scroll_GNQ" },
                { title: "Eritrea", abv: "ERI", image: "https://www.masrikdahir.com/Images/Eritrea/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/eritrea", id: "scroll_ERI" },
                { title: "Estonia", abv: "EST", image: "https://www.masrikdahir.com/Images/Estonia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/estonia", id: "scroll_EST" },
                { title: "Ethiopia", abv: "ETH", image: "https://www.masrikdahir.com/Images/Ethiopia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/ethiopia", id: "scroll_ETH" },
                { title: "Fiji", abv: "FJI", image: "https://www.masrikdahir.com/Images/Fiji/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/fiji", id: "scroll_FJI" },
                { title: "Finland", abv: "FIN", image: "https://www.masrikdahir.com/Images/Finland/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/finland", id: "scroll_FIN" },
                { title: "France", abv: "FRA", image: "https://www.masrikdahir.com/Images/France/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/france", id: "scroll_FRA" },
                { title: "Gabon", abv: "GAB", image: "https://www.masrikdahir.com/Images/Gabon/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/gabon", id: "scroll_GAB" },
                { title: "Gambia", abv: "GMB", image: "https://www.masrikdahir.com/Images/Gambia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/gambia", id: "scroll_GMB" },
                { title: "Georgia", abv: "GEO", image: "https://www.masrikdahir.com/Images/Georgia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/georgia", id: "scroll_GEO" },
                { title: "Germany", abv: "DEU", image: "https://www.masrikdahir.com/Images/Germany/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/germany", id: "scroll_DEU" },
                { title: "Ghana", abv: "GHA", image: "https://www.masrikdahir.com/Images/Ghana/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/ghana", id: "scroll_GHA" },
                { title: "Greece", abv: "GRC", image: "https://www.masrikdahir.com/Images/Greece/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/greece", id: "scroll_GRC" },
                { title: "Grenada", abv: "GRD", image: "https://www.masrikdahir.com/Images/Grenada/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/grenada", id: "scroll_GRD" },
                { title: "Guatemala", abv: "GTM", image: "https://www.masrikdahir.com/Images/Guatemala/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/guatemala", id: "scroll_GTM" },
                { title: "Guinea", abv: "GIN", image: "https://www.masrikdahir.com/Images/Guinea/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/guinea", id: "scroll_GIN" },
                { title: "Guinea Bissau", abv: "GNB", image: "https://www.masrikdahir.com/Images/Guinea Bissau/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/guinea-bissau", id: "scroll_GNB" },
                { title: "Guyana", abv: "GUY", image: "https://www.masrikdahir.com/Images/Guyana/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/guyana", id: "scroll_GUY" },
                { title: "Haiti", abv: "HTI", image: "https://www.masrikdahir.com/Images/Haiti/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/haiti", id: "scroll_HTI" },
                { title: "Honduras", abv: "HND", image: "https://www.masrikdahir.com/Images/Honduras/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/honduras", id: "scroll_HND" },
                { title: "Hungary", abv: "HUN", image: "https://www.masrikdahir.com/Images/Hungary/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/hungary", id: "scroll_HUN" },
                { title: "Iceland", abv: "ISL", image: "https://www.masrikdahir.com/Images/Iceland/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/iceland", id: "scroll_ISL" },
                { title: "India", abv: "IND", image: "https://www.masrikdahir.com/Images/India/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/india", id: "scroll_IND" },
                { title: "Indonesia", abv: "IDN", image: "https://www.masrikdahir.com/Images/Indonesia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/indonesia", id: "scroll_IDN" },
                { title: "Iran", abv: "IRN", image: "https://www.masrikdahir.com/Images/Iran/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/iran", id: "scroll_IRN" },
                { title: "Iraq", abv: "IRQ", image: "https://www.masrikdahir.com/Images/Iraq/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/iraq", id: "scroll_IRQ" },
                { title: "Ireland", abv: "IRL", image: "https://www.masrikdahir.com/Images/Ireland/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/ireland-republic", id: "scroll_IRL" },
                { title: "Israel", abv: "ISR", image: "https://www.masrikdahir.com/Images/Israel/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/israel", id: "scroll_ISR" },
                { title: "Italy", abv: "ITA", image: "https://www.masrikdahir.com/Images/Italy/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/italy", id: "scroll_ITA" },
                { title: "Ivory Coast", abv: "CIV", image: "https://www.masrikdahir.com/Images/Ivory Coast/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/ivory-coast", id: "scroll_CIV" },
                { title: "Jamaica", abv: "JAM", image: "https://www.masrikdahir.com/Images/Jamaica/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/jamaica", id: "scroll_JAM" },
                { title: "Japan", abv: "JPN", image: "https://www.masrikdahir.com/Images/Japan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/japan", id: "scroll_JPN" },
                { title: "Jordan", abv: "JOR", image: "https://www.masrikdahir.com/Images/Jordan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/jordan", id: "scroll_JOR" },
                { title: "Kazakhstan", abv: "KAZ", image: "https://www.masrikdahir.com/Images/Kazakhstan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/kazakhstan", id: "scroll_KAZ" },
                { title: "Kenya", abv: "KEN", image: "https://www.masrikdahir.com/Images/Kenya/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/kenya", id: "scroll_KEN" },
                { title: "Kiribati", abv: "KIR", image: "https://www.masrikdahir.com/Images/Kiribati/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/kiribati", id: "scroll_KIR" },
                { title: "North Korea", abv: "PRK", image: "https://www.masrikdahir.com/Images/North Korea/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/korea-north", id: "scroll_PRK" },
                { title: "South Korea", abv: "KOR", image: "https://www.masrikdahir.com/Images/South Korea/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/korea-south", id: "scroll_KOR" },
                { title: "Kosovo", abv: "XKX", image: "https://www.masrikdahir.com/Images/Kosovo/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/kosovo", id: "scroll_XKX" },
                { title: "Kuwait", abv: "KWT", image: "https://www.masrikdahir.com/Images/Kuwait/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/kuwait", id: "scroll_KWT" },
                { title: "Kyrgyzstan", abv: "KGZ", image: "https://www.masrikdahir.com/Images/Kyrgyzstan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/kyrgyzstan", id: "scroll_KGZ" },
                { title: "Laos", abv: "LAO", image: "https://www.masrikdahir.com/Images/Laos/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/laos", id: "scroll_LAO" },
                { title: "Latvia", abv: "LVA", image: "https://www.masrikdahir.com/Images/Latvia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/latvia", id: "scroll_LVA" },
                { title: "Lebanon", abv: "LBN", image: "https://www.masrikdahir.com/Images/Lebanon/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/lebanon", id: "scroll_LBN" },
                { title: "Lesotho", abv: "LSO", image: "https://www.masrikdahir.com/Images/Lesotho/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/lesotho", id: "scroll_LSO" },
                { title: "Liberia", abv: "LBR", image: "https://www.masrikdahir.com/Images/Liberia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/liberia", id: "scroll_LBR" },
                { title: "Libya", abv: "LBY", image: "https://www.masrikdahir.com/Images/Libya/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/libya", id: "scroll_LBY" },
                { title: "Liechtenstein", abv: "LIE", image: "https://www.masrikdahir.com/Images/Liechtenstein/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/liechtenstein", id: "scroll_LIE" },
                { title: "Lithuania", abv: "LTU", image: "https://www.masrikdahir.com/Images/Lithuania/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/lithuania", id: "scroll_LTU" },
                { title: "Luxembourg", abv: "LUX", image: "https://www.masrikdahir.com/Images/Luxembourg/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/luxembourg", id: "scroll_LUX" },
                { title: "Madagascar", abv: "MDG", image: "https://www.masrikdahir.com/Images/Madagascar/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/madagascar", id: "scroll_MDG" },
                { title: "Malawi", abv: "MWI", image: "https://www.masrikdahir.com/Images/Malawi/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/malawi", id: "scroll_MWI" },
                { title: "Malaysia", abv: "MYS", image: "https://www.masrikdahir.com/Images/Malaysia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/malaysia", id: "scroll_MYS" },
                { title: "Maldives", abv: "MDV", image: "https://www.masrikdahir.com/Images/Maldives/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/maldives", id: "scroll_MDV" },
                { title: "Mali", abv: "MLI", image: "https://www.masrikdahir.com/Images/Mali/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/mali", id: "scroll_MLI" },
                { title: "Malta", abv: "MLT", image: "https://www.masrikdahir.com/Images/Malta/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/malta", id: "scroll_MLT" },
                { title: "Marshall Islands", abv: "MHL", image: "https://www.masrikdahir.com/Images/Marshall Islands/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/marshall-islands", id: "scroll_MHL" },
                { title: "Mauritania", abv: "MRT", image: "https://www.masrikdahir.com/Images/Mauritania/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/mauritania", id: "scroll_MRT" },
                { title: "Mauritius", abv: "MUS", image: "https://www.masrikdahir.com/Images/Mauritius/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/mauritius", id: "scroll_MUS" },
                { title: "Mexico", abv: "MEX", image: "https://www.masrikdahir.com/Images/Mexico/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/mexico", id: "scroll_MEX" },
                { title: "Micronesia", abv: "FSM", image: "https://www.masrikdahir.com/Images/Micronesia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/micronesia", id: "scroll_FSM" },
                { title: "Moldova", abv: "MDA", image: "https://www.masrikdahir.com/Images/Moldova/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/moldova", id: "scroll_MDA" },
                { title: "Monaco", abv: "MCO", image: "https://www.masrikdahir.com/Images/Monaco/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/monaco", id: "scroll_MCO" },
                { title: "Mongolia", abv: "MNG", image: "https://www.masrikdahir.com/Images/Mongolia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/mongolia", id: "scroll_MNG" },
                { title: "Montenegro", abv: "MNE", image: "https://www.masrikdahir.com/Images/Montenegro/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/montenegro", id: "scroll_MNE" },
                { title: "Morocco", abv: "MAR", image: "https://www.masrikdahir.com/Images/Morocco/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/morocco", id: "scroll_MAR" },
                { title: "Mozambique", abv: "MOZ", image: "https://www.masrikdahir.com/Images/Mozambique/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/mozambique", id: "scroll_MOZ" },
                { title: "Myanmar", abv: "MMR", image: "https://www.masrikdahir.com/Images/Myanmar/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/myanmar", id: "scroll_MMR" },
                { title: "Namibia", abv: "NAM", image: "https://www.masrikdahir.com/Images/Namibia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/namibia", id: "scroll_NAM" },
                { title: "Nauru", abv: "NRU", image: "https://www.masrikdahir.com/Images/Nauru/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/nauru", id: "scroll_NRU" },
                { title: "Nepal", abv: "NPL", image: "https://www.masrikdahir.com/Images/Nepal/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/nepal", id: "scroll_NPL" },
                { title: "Netherlands", abv: "NLD", image: "https://www.masrikdahir.com/Images/Netherlands/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/netherlands", id: "scroll_NLD" },
                { title: "New Zealand", abv: "NZL", image: "https://www.masrikdahir.com/Images/New Zealand/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/new-zealand", id: "scroll_NZL" },
                { title: "Nicaragua", abv: "NIC", image: "https://www.masrikdahir.com/Images/Nicaragua/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/nicaragua", id: "scroll_NIC" },
                { title: "Niger", abv: "NER", image: "https://www.masrikdahir.com/Images/Niger/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/niger", id: "scroll_NER" },
                { title: "Nigeria", abv: "NGA", image: "https://www.masrikdahir.com/Images/Nigeria/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/nigeria", id: "scroll_NGA" },
                { title: "North Macedonia", abv: "MKD", image: "https://www.masrikdahir.com/Images/North Macedonia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/north-macedonia", id: "scroll_MKD" },
                { title: "Norway", abv: "NOR", image: "https://www.masrikdahir.com/Images/Norway/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/norway", id: "scroll_NOR" },
                { title: "Oman", abv: "OMN", image: "https://www.masrikdahir.com/Images/Oman/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/oman", id: "scroll_OMN" },
                { title: "Pakistan", abv: "PAK", image: "https://www.masrikdahir.com/Images/Pakistan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/pakistan", id: "scroll_PAK" },
                { title: "Palau", abv: "PLW", image: "https://www.masrikdahir.com/Images/Palau/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/palau", id: "scroll_PLW" },
                { title: "Panama", abv: "PAN", image: "https://www.masrikdahir.com/Images/Panama/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/panama", id: "scroll_PAN" },
                { title: "Papua New Guinea", abv: "PNG", image: "https://www.masrikdahir.com/Images/Papua New Guinea/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/papua-new-guinea", id: "scroll_PNG" },
                { title: "Paraguay", abv: "PRY", image: "https://www.masrikdahir.com/Images/Paraguay/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/paraguay", id: "scroll_PRY" },
                { title: "Peru", abv: "PER", image: "https://www.masrikdahir.com/Images/Peru/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/peru", id: "scroll_PER" },
                { title: "Philippines", abv: "PHL", image: "https://www.masrikdahir.com/Images/Philippines/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/philippines", id: "scroll_PHL" },
                { title: "Poland", abv: "POL", image: "https://www.masrikdahir.com/Images/Poland/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/poland", id: "scroll_POL" },
                { title: "Portugal", abv: "PRT", image: "https://www.masrikdahir.com/Images/Portugal/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/portugal", id: "scroll_PRT" },
                { title: "Qatar", abv: "QAT", image: "https://www.masrikdahir.com/Images/Qatar/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/qatar", id: "scroll_QAT" },
                { title: "Romania", abv: "ROU", image: "https://www.masrikdahir.com/Images/Romania/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/romania", id: "scroll_ROU" },
                { title: "Russia", abv: "RUS", image: "https://www.masrikdahir.com/Images/Russia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/russia", id: "scroll_RUS" },
                { title: "Rwanda", abv: "RWA", image: "https://www.masrikdahir.com/Images/Rwanda/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/rwanda", id: "scroll_RWA" },
                { title: "Saint Kitts and Nevis", abv: "KNA", image: "https://www.masrikdahir.com/Images/Saint Kitts and Nevis/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/saint-kitts-and-nevis", id: "scroll_KNA" },
                { title: "Saint Lucia", abv: "LCA", image: "https://www.masrikdahir.com/Images/Saint Lucia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/saint-lucia", id: "scroll_LCA" },
                { title: "Saint Vincent and the Grenadines", abv: "VCT", image: "https://www.masrikdahir.com/Images/Saint Vincent and the Grenadines/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/saint-vincent-and-the-grenadines", id: "scroll_VCT" },
                { title: "Samoa", abv: "WSM", image: "https://www.masrikdahir.com/Images/Samoa/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/samoa", id: "scroll_WSM" },
                { title: "San Marino", abv: "SMR", image: "https://www.masrikdahir.com/Images/San Marino/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/san-marino", id: "scroll_SMR" },
                { title: "Sao Tome and Principe", abv: "STP", image: "https://www.masrikdahir.com/Images/Sao Tome and Principe/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/sao-tome-and-principe", id: "scroll_STP" },
                { title: "Saudi Arabia", abv: "SAU", image: "https://www.masrikdahir.com/Images/Saudi Arabia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/saudi-arabia", id: "scroll_SAU" },
                { title: "Senegal", abv: "SEN", image: "https://www.masrikdahir.com/Images/Senegal/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/senegal", id: "scroll_SEN" },
                { title: "Serbia", abv: "SRB", image: "https://www.masrikdahir.com/Images/Serbia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/serbia", id: "scroll_SRB" },
                { title: "Seychelles", abv: "SYC", image: "https://www.masrikdahir.com/Images/Seychelles/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/seychelles", id: "scroll_SYC" },
                { title: "Sierra Leone", abv: "SLE", image: "https://www.masrikdahir.com/Images/Sierra Leone/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/sierra-leone", id: "scroll_SLE" },
                { title: "Singapore", abv: "SGP", image: "https://www.masrikdahir.com/Images/Singapore/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/singapore", id: "scroll_SGP" },
                { title: "Slovakia", abv: "SVK", image: "https://www.masrikdahir.com/Images/Slovakia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/slovakia", id: "scroll_SVK" },
                { title: "Slovenia", abv: "SVN", image: "https://www.masrikdahir.com/Images/Slovenia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/slovenia", id: "scroll_SVN" },
                { title: "Solomon Islands", abv: "SLB", image: "https://www.masrikdahir.com/Images/Solomon Islands/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/solomon-islands", id: "scroll_SLB" },
                { title: "Somalia", abv: "SOM", image: "https://www.masrikdahir.com/Images/Somalia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/somalia", id: "scroll_SOM" },
                { title: "South Africa", abv: "ZAF", image: "https://www.masrikdahir.com/Images/South Africa/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/south-africa", id: "scroll_ZAF" },
                { title: "South Sudan", abv: "SSD", image: "https://www.masrikdahir.com/Images/South Sudan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/south-sudan", id: "scroll_SSD" },
                { title: "Spain", abv: "ESP", image: "https://www.masrikdahir.com/Images/Spain/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/spain", id: "scroll_ESP" },
                { title: "Sri Lanka", abv: "LKA", image: "https://www.masrikdahir.com/Images/Sri Lanka/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/sri-lanka", id: "scroll_LKA" },
                { title: "Sudan", abv: "SDN", image: "https://www.masrikdahir.com/Images/Sudan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/sudan", id: "scroll_SDN" },
                { title: "Suriname", abv: "SUR", image: "https://www.masrikdahir.com/Images/Suriname/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/suriname", id: "scroll_SUR" },
                { title: "Sweden", abv: "SWE", image: "https://www.masrikdahir.com/Images/Sweden/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/sweden", id: "scroll_SWE" },
                { title: "Switzerland", abv: "CHE", image: "https://www.masrikdahir.com/Images/Switzerland/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/switzerland", id: "scroll_CHE" },
                { title: "Syria", abv: "SYR", image: "https://www.masrikdahir.com/Images/Syria/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/syria", id: "scroll_SYR" },
                { title: "Taiwan", abv: "TWN", image: "https://www.masrikdahir.com/Images/Taiwan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/taiwan", id: "scroll_TWN" },
                { title: "Tajikistan", abv: "TJK", image: "https://www.masrikdahir.com/Images/Tajikistan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/tajikistan", id: "scroll_TJK" },
                { title: "Tanzania", abv: "TZA", image: "https://www.masrikdahir.com/Images/Tanzania/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/tanzania", id: "scroll_TZA" },
                { title: "Thailand", abv: "THA", image: "https://www.masrikdahir.com/Images/Thailand/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/thailand", id: "scroll_THA" },
                { title: "Timor Leste", abv: "TLS", image: "https://www.masrikdahir.com/Images/Timor Leste/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/timor-leste", id: "scroll_TLS" },
                { title: "Togo", abv: "TGO", image: "https://www.masrikdahir.com/Images/Togo/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/togo", id: "scroll_TGO" },
                { title: "Tonga", abv: "TON", image: "https://www.masrikdahir.com/Images/Tonga/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/tonga", id: "scroll_TON" },
                { title: "Trinidad and Tobago", abv: "TTO", image: "https://www.masrikdahir.com/Images/Trinidad and Tobago/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/trinidad-and-tobago", id: "scroll_TTO" },
                { title: "Tunisia", abv: "TUN", image: "https://www.masrikdahir.com/Images/Tunisia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/tunisia", id: "scroll_TUN" },
                { title: "Turkey", abv: "TUR", image: "https://www.masrikdahir.com/Images/Turkey/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/turkey", id: "scroll_TUR" },
                { title: "Turkmenistan", abv: "TKM", image: "https://www.masrikdahir.com/Images/Turkmenistan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/turkmenistan", id: "scroll_TKM" },
                { title: "Tuvalu", abv: "TUV", image: "https://www.masrikdahir.com/Images/Tuvalu/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/tuvalu", id: "scroll_TUV" },
                { title: "Uganda", abv: "UGA", image: "https://www.masrikdahir.com/Images/Uganda/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/uganda", id: "scroll_UGA" },
                { title: "Ukraine", abv: "UKR", image: "https://www.masrikdahir.com/Images/Ukraine/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/ukraine", id: "scroll_UKR" },
                { title: "United Arab Emirates", abv: "ARE", image: "https://www.masrikdahir.com/Images/United Arab Emirates/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/united-arab-emirates", id: "scroll_ARE" },
                { title: "United Kingdom", abv: "GBR", image: "https://www.masrikdahir.com/Images/United Kingdom/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/united-kingdom", id: "scroll_GBR" },
                { title: "Uruguay", abv: "URY", image: "https://www.masrikdahir.com/Images/Uruguay/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/uruguay", id: "scroll_URY" },
                { title: "Uzbekistan", abv: "UZB", image: "https://www.masrikdahir.com/Images/Uzbekistan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/uzbekistan", id: "scroll_UZB" },
                { title: "Vanuatu", abv: "VUT", image: "https://www.masrikdahir.com/Images/Vanuatu/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/vanuatu", id: "scroll_VUT" },
                { title: "Vatican City", abv: "VAT", image: "https://www.masrikdahir.com/Images/Vatican City/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/vatican-city", id: "scroll_VAT" },
                { title: "Venezuela", abv: "VEN", image: "https://www.masrikdahir.com/Images/Venezuela/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/venezuela", id: "scroll_VEN" },
                { title: "Vietnam", abv: "VNM", image: "https://www.masrikdahir.com/Images/Vietnam/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/vietnam", id: "scroll_VNM" },
                { title: "Yemen", abv: "YEM", image: "https://www.masrikdahir.com/Images/Yemen/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/yemen", id: "scroll_YEM" },
                { title: "Zambia", abv: "ZMB", image: "https://www.masrikdahir.com/Images/Zambia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/zambia", id: "scroll_ZMB" },
                { title: "Zimbabwe", abv: "ZWE", image: "https://www.masrikdahir.com/Images/Zimbabwe/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/zimbabwe", id: "scroll_ZWE" }

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
            console.log(parseInt(this.windowWidth/150))
            return filteredResults.slice(0, Math.min(parseInt(this.windowWidth/150), 20));
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
        onResize() {
            this.windowHeight = window.innerHeight;
            this.windowWidth = window.innerWidth;
            this.middle = (window.innerWidth - 1000) / 2;
            this.middle2 = (window.innerWidth - 50) / 2;
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
                    title:"Milestone",
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
Vue.createApp(app_milestone).mount('#app_milestone')
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













