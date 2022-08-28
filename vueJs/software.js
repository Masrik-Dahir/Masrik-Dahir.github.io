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
                    title:"Fraud Model",
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
                    uri_github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",
                    uri_windows:"",
                    uri_android:"",
                    uri_apple:"",
                    uri_web:"web/re.html",
                    uri:"web/re.html"
                },
                {
                    title:"Stock Market",
                    des:"PHP Server: Building financial model and charts for ETFs, Mutual Funds, Cryptocurrencies, and Options ",
                    uri_github:"https://github.com/Masrik-Dahir/DATABASE_database",
                    uri_windows:"",
                    uri_android:"",
                    uri_apple:"",
                    uri_web:"http://cmsc508.com/~nguyenvt35/508-project-nguyenvt35-dahirma/PHP/index.php",
                    uri:"http://cmsc508.com/~nguyenvt35/508-project-nguyenvt35-dahirma/PHP/index.php"
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
            searchQuery: null,
            resources:[
                {
                    title:"United States of America",
                },
                {
                    title:"Bangladesh",
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