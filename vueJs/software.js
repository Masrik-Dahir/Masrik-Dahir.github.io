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
            windowHeight: window.innerHeight,
            windowWidth: window.innerWidth,
            searchQuery: null,
            resources:[
                {
                    title:"Henrico County Equity Ambassador",
                    des:"",
                    uri:"https://henrico.us/",
                    img:"https://d30tgmewtclfrp.cloudfront.net/henrico.webp",
                    uri_2:"",
                    img_2:"",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"

                },
                {
                    title: "Henrico County Engineering Scholar",
                    des: "",
                    uri: "https://henrico.us/",
                    img: "https://d30tgmewtclfrp.cloudfront.net/henrico.webp",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"

                },
                {
                    title: "Altria Scholar",
                    des: "",
                    uri: "https://www.altria.com/en",
                    img: "https://d30tgmewtclfrp.cloudfront.net/altria.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"

                },
                {
                    title: "Summa Cum Laude",
                    des: "",
                    uri: "https://rar.vcu.edu/graduation/",
                    img: "https://d30tgmewtclfrp.cloudfront.net/summacumlaude.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"

                },
                {
                    title: "iCubed Scholar",
                    des: "",
                    uri: "https://icubed.vcu.edu/",
                    img: "https://d30tgmewtclfrp.cloudfront.net/icubed%20(1).png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"

                },
                {
                    title: "Deans List",
                    des: "",
                    uri: "https://egr.vcu.edu/current-students/deans-list/",
                    img: "https://d30tgmewtclfrp.cloudfront.net/deanslistlogo.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"

                },
                {
                    title: "Superintendent’s Scholar",
                    des: "",
                    uri: "https://henricoschools.us/division-leadership-team/",
                    img: "https://d30tgmewtclfrp.cloudfront.net/henrico.webp",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"

                },
                {
                    title: "CarMax Entrepreneur Scholar",
                    des: "",
                    uri: "https://www.carmax.com/",
                    img: "https://d30tgmewtclfrp.cloudfront.net/carmax.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"

                },
                {
                    title: "Susanne and Sam Dibert STEM Scholar",
                    des: "",
                    uri: "https://www.swagelok.com/",
                    img: "https://d30tgmewtclfrp.cloudfront.net/swagelok.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"

                },
                {
                    title: "Greater Richmond Relocation Center Scholar",
                    des: "",
                    uri: "http://richmondrelo.org/",
                    img: "https://d30tgmewtclfrp.cloudfront.net/grrc.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Harrison-Labouisse Memorial Scholar",
                    des: "",
                    uri: "https://www.cfrichmond.org/Apply-for-a-Scholarship/View-All-Scholarships?s=Harrison-Labouisse-Mayo+Memorial+Scholarship",
                    img: "https://d30tgmewtclfrp.cloudfront.net/Me66Jxa.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Bachelors of Science (Hons.)",
                    des: "",
                    uri_2: "",
                    img_2: "",
                    uri: "https://egr.vcu.edu/",
                    img: "https://d30tgmewtclfrp.cloudfront.net/vcu_ram.png",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Masters of Science",
                    des: "",
                    uri: "https://egr.vcu.edu/",
                    img: "https://d30tgmewtclfrp.cloudfront.net/vcu_ram.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "AWS Certified Solutions Architect",
                    des: "",
                    uri: "https://www.credly.com/badges/12749f5b-e7fc-460d-a317-60a1ebc976fe/public_url",
                    img: "https://d30tgmewtclfrp.cloudfront.net/aws-certified-solutions-architect-associate.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "AWS Certified Developer",
                    des: "",
                    uri: "https://www.credly.com/badges/4ea74952-8783-44af-9425-119b2434bf38/public_url",
                    img: "https://d30tgmewtclfrp.cloudfront.net/acd.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "AWS Cloud practitioner",
                    des: "",
                    uri: "https://www.credly.com/badges/17619069-ea55-49da-bf46-ac605180477d/public_url",
                    img: "https://d30tgmewtclfrp.cloudfront.net/aws-certified-cloud-practitioner.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Databricks Fundamentals",
                    des: "",
                    uri: "https://credentials.databricks.com/3fc5d768-443c-40fa-828c-fedadb94ba5e#gs.fsb476",
                    img: "https://d30tgmewtclfrp.cloudfront.net/databricksfundamental.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Databricks Generative AI Fundamentals",
                    des: "",
                    uri: "https://credentials.databricks.com/65a906a0-cddf-4ef7-92d6-e4c8a35b8c97#gs.f0jlz6",
                    img: "https://d30tgmewtclfrp.cloudfront.net/databricksgenerativeai.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Postman API Fundamentals Student Expert",
                    des: "",
                    uri: "https://badgr.com/public/assertions/6VeZHynPSSCsqE6RQIA0_A?identity__email=masrikdahir@gmail.com",
                    img: "https://d30tgmewtclfrp.cloudfront.net/pafse.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "HackerRank Problem Solving Intermediate",
                    des: "",
                    uri: "https://www.hackerrank.com/certificates/5af21130d688",
                    img: "https://d30tgmewtclfrp.cloudfront.net/Problem%20Solving%20(Intermediate)%20Certificate.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "HackerRank Problem Solving Basic",
                    des: "",
                    uri: "https://www.hackerrank.com/certificates/0a8a402e77b1/",
                    img: "https://d30tgmewtclfrp.cloudfront.net/Problem%20Solving%20(Basic)%20Certificate.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "HackerRank Python Basic",
                    des: "",
                    uri: "https://www.hackerrank.com/certificates/4e15d1f36815",
                    img: "https://d30tgmewtclfrp.cloudfront.net/Python%20(Basic)%20Certificate.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Paper: Cronus",
                    des: "",
                    uri: "https://www.masrikdahir.com/pdf/Cronus_An_Automated_Feedback_Tool_for_Concept_Maps.pdf",
                    img: "https://d30tgmewtclfrp.cloudfront.net/ieee.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Paper: ClaimChain",
                    des: "",
                    uri: "https://www.masrikdahir.com/pdf/ClaimChain.pdf",
                    img: "https://d30tgmewtclfrp.cloudfront.net/ieee.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Poster: Cronus",
                    des: "",
                    uri: "https://www.masrikdahir.com/pdf/CronusPoster.pdf",
                    img: "https://d30tgmewtclfrp.cloudfront.net/vcu_ram.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Poster: ClaimChain",
                    des: "",
                    uri: "https://www.masrikdahir.com/pdf/NewClaimchainPoster.pdf",
                    img: "https://d30tgmewtclfrp.cloudfront.net/University-of-Missouri-Logo.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Poster: Security Operations Center",
                    des: "",
                    uri: "https://www.masrikdahir.com/pdf/CS%2023-318_Poster.pdf",
                    img: "https://d30tgmewtclfrp.cloudfront.net/vcu_ram.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Poster: Ram-pantries",
                    des: "",
                    uri: "https://www.masrikdahir.com/pdf/VCU_Health_Research.pdf",
                    img: "https://d30tgmewtclfrp.cloudfront.net/vcu_ram.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Essay: The Last Basketball Game",
                    des: "",
                    uri: "https://www.masrikdahir.com/pdf/The%20Hearing%202019-2020.pdf",
                    img: "https://d30tgmewtclfrp.cloudfront.net/Daco_6097739.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Accepted in George Mason",
                    des: "",
                    uri: "https://d30tgmewtclfrp.cloudfront.net/Admission/George Mason.jpg",
                    img: "https://d30tgmewtclfrp.cloudfront.net/George_Mason_University_logo.svg.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Accepted in Virginia Tech",
                    des: "",
                    uri: "https://d30tgmewtclfrp.cloudfront.net/Admission/Virginia Tech.jpg",
                    img: "https://d30tgmewtclfrp.cloudfront.net/Virginia-Tech-Logo.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Accepted in George Washington",
                    des: "",
                    uri: "https://d30tgmewtclfrp.cloudfront.net/Admission/George Washington University.jpg",
                    img: "https://d30tgmewtclfrp.cloudfront.net/George_Washington_Athletics_logo.svg.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Accepted in Rensselaer",
                    des: "",
                    uri: "https://d30tgmewtclfrp.cloudfront.net/Admission/Rensselaer.jpg",
                    img: "https://d30tgmewtclfrp.cloudfront.net/Rensselaer_at_Hartford_Seal.svg.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Accepted in Purdue",
                    des: "",
                    uri: "https://d30tgmewtclfrp.cloudfront.net/Admission/Purdue.jpg",
                    img: "https://d30tgmewtclfrp.cloudfront.net/purdue.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Accepted in University of Maryland",
                    des: "",
                    uri: "https://d30tgmewtclfrp.cloudfront.net/Admission/University of Maryland.jpg",
                    img: "https://d30tgmewtclfrp.cloudfront.net/University_of_Maryland_seal.svg.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "University of Richmond",
                    des: "",
                    uri: "https://d30tgmewtclfrp.cloudfront.net/Admission/University of Richmond.jpg",
                    img: "https://d30tgmewtclfrp.cloudfront.net/university-of-richmond-logo-C721BEBDD6-seeklogo.com.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Accepted in James Madison University",
                    des: "",
                    uri: "https://d30tgmewtclfrp.cloudfront.net/Admission/James Madison University Engineering.jpg",
                    img: "https://d30tgmewtclfrp.cloudfront.net/James-Madison-Dukes-Logo-2002.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Accepted in University of Vermont",
                    des: "",
                    uri: "https://d30tgmewtclfrp.cloudfront.net/Admission/University of Vermont Honors College.jpg",
                    img: "https://d30tgmewtclfrp.cloudfront.net/Vermont_Catamounts_logo.svg.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Accepted in University of Iowa",
                    des: "",
                    uri: "https://d30tgmewtclfrp.cloudfront.net/Admission/University of Iowa.jpg",
                    img: "https://d30tgmewtclfrp.cloudfront.net/iowa_hawkeyes_logo_wordmark_2019_sportslogosnet-8297.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Accepted in University of PittsBurgh",
                    des: "",
                    uri: "https://d30tgmewtclfrp.cloudfront.net/Admission/University of Pittsburgh.jpg",
                    img: "https://d30tgmewtclfrp.cloudfront.net/University_of_Pittsburgh_seal.svg.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Accepted in Michigan State University",
                    des: "",
                    uri: "https://d30tgmewtclfrp.cloudfront.net/Admission/Michigan State University.jpg",
                    img: "https://d30tgmewtclfrp.cloudfront.net/Michigan-State-University-Logo.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Accepted in York College",
                    des: "",
                    uri: "https://d30tgmewtclfrp.cloudfront.net/Admission/York University.jpg",
                    img: "https://d30tgmewtclfrp.cloudfront.net/york college.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Accepted in Roanoke University",
                    des: "",
                    uri: "https://d30tgmewtclfrp.cloudfront.net/Admission/Roanoke College.jpg",
                    img: "https://d30tgmewtclfrp.cloudfront.net/RoanokeCollegeWordmark.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },




                {
                    title: "Trustee Award: Roanoke University",
                    des: "",
                    uri: "https://d30tgmewtclfrp.cloudfront.net/Admission/Roanoke University Scholarship.jpg",
                    img: "https://d30tgmewtclfrp.cloudfront.net/RoanokeCollegeWordmark.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Presidential Scholarship: University of PittsBurgh",
                    des: "",
                    uri: "https://d30tgmewtclfrp.cloudfront.net/Admission/University of PittsBurgh Presidential Scholarship.jpg",
                    img: "https://d30tgmewtclfrp.cloudfront.net/University_of_Pittsburgh_seal.svg.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Presidential Scholarship: York College",
                    des: "",
                    uri: "https://d30tgmewtclfrp.cloudfront.net/Admission/York University Scholarship.jpg",
                    img: "https://d30tgmewtclfrp.cloudfront.net/york%20college.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Clark Scholarship: Virginia Tech",
                    des: "",
                    uri: "https://d30tgmewtclfrp.cloudfront.net/Admission/Virginia Tech Scholarship.jpg",
                    img: "https://d30tgmewtclfrp.cloudfront.net/Virginia-Tech-Logo.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
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
                { title: "United States", abv: "USA", image: "https://d30tgmewtclfrp.cloudfront.net/United States/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/united-states", id: "scroll_USA" },
                { title: "Canada", abv: "CAN", image: "https://d30tgmewtclfrp.cloudfront.net/Canada/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/canada", id: "scroll_CAN" },
                { title: "Bangladesh", abv: "BGD", image: "https://d30tgmewtclfrp.cloudfront.net/Bangladesh/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/bangladesh", id: "scroll_BGD" },
                { title: "Afghanistan", abv: "AFG", image: "https://d30tgmewtclfrp.cloudfront.net/Afghanistan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/afghanistan", id: "scroll_AFG" },
                { title: "Albania", abv: "ALB", image: "https://d30tgmewtclfrp.cloudfront.net/Albania/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/albania", id: "scroll_ALB" },
                { title: "Algeria", abv: "DZA", image: "https://d30tgmewtclfrp.cloudfront.net/Algeria/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/algeria", id: "scroll_DZA" },
                { title: "Andorra", abv: "AND", image: "https://d30tgmewtclfrp.cloudfront.net/Andorra/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/andorra", id: "scroll_AND" },
                { title: "Angola", abv: "AGO", image: "https://d30tgmewtclfrp.cloudfront.net/Angola/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/angola", id: "scroll_AGO" },
                { title: "Antigua & Deps", abv: "ATG", image: "https://d30tgmewtclfrp.cloudfront.net/Antigua & Deps/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/antigua-and-deps", id: "scroll_ATG" },
                { title: "Argentina", abv: "ARG", image: "https://d30tgmewtclfrp.cloudfront.net/Argentina/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/argentina", id: "scroll_ARG" },
                { title: "Armenia", abv: "ARM", image: "https://d30tgmewtclfrp.cloudfront.net/Armenia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/armenia", id: "scroll_ARM" },
                { title: "Australia", abv: "AUS", image: "https://d30tgmewtclfrp.cloudfront.net/Australia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/australia", id: "scroll_AUS" },
                { title: "Austria", abv: "AUT", image: "https://d30tgmewtclfrp.cloudfront.net/Austria/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/austria", id: "scroll_AUT" },
                { title: "Azerbaijan", abv: "AZE", image: "https://d30tgmewtclfrp.cloudfront.net/Azerbaijan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/azerbaijan", id: "scroll_AZE" },
                { title: "Bahamas", abv: "BHS", image: "https://d30tgmewtclfrp.cloudfront.net/Bahamas/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/bahamas", id: "scroll_BHS" },
                { title: "Bahrain", abv: "BHR", image: "https://d30tgmewtclfrp.cloudfront.net/Bahrain/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/bahrain", id: "scroll_BHR" },
                { title: "Barbados", abv: "BRB", image: "https://d30tgmewtclfrp.cloudfront.net/Barbados/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/barbados", id: "scroll_BRB" },
                { title: "Belarus", abv: "BLR", image: "https://d30tgmewtclfrp.cloudfront.net/Belarus/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/belarus", id: "scroll_BLR" },
                { title: "Belgium", abv: "BEL", image: "https://d30tgmewtclfrp.cloudfront.net/Belgium/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/belgium", id: "scroll_BEL" },
                { title: "Belize", abv: "BLZ", image: "https://d30tgmewtclfrp.cloudfront.net/Belize/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/belize", id: "scroll_BLZ" },
                { title: "Benin", abv: "BEN", image: "https://d30tgmewtclfrp.cloudfront.net/Benin/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/benin", id: "scroll_BEN" },
                { title: "Bhutan", abv: "BTN", image: "https://d30tgmewtclfrp.cloudfront.net/Bhutan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/bhutan", id: "scroll_BTN" },
                { title: "Bolivia", abv: "BOL", image: "https://d30tgmewtclfrp.cloudfront.net/Bolivia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/bolivia", id: "scroll_BOL" },
                { title: "Bosnia Herzegovina", abv: "BIH", image: "https://d30tgmewtclfrp.cloudfront.net/Bosnia Herzegovina/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/bosnia-herzegovina", id: "scroll_BIH" },
                { title: "Botswana", abv: "BWA", image: "https://d30tgmewtclfrp.cloudfront.net/Botswana/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/botswana", id: "scroll_BWA" },
                { title: "Brazil", abv: "BRA", image: "https://d30tgmewtclfrp.cloudfront.net/Brazil/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/brazil", id: "scroll_BRA" },
                { title: "Brunei", abv: "BRN", image: "https://d30tgmewtclfrp.cloudfront.net/Brunei/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/brunei", id: "scroll_BRN" },
                { title: "Bulgaria", abv: "BGR", image: "https://d30tgmewtclfrp.cloudfront.net/Bulgaria/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/bulgaria", id: "scroll_BGR" },
                { title: "Burkina", abv: "BFA", image: "https://d30tgmewtclfrp.cloudfront.net/Burkina/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/burkina", id: "scroll_BFA" },
                { title: "Burundi", abv: "BDI", image: "https://d30tgmewtclfrp.cloudfront.net/Burundi/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/burundi", id: "scroll_BDI" },
                { title: "Cambodia", abv: "KHM", image: "https://d30tgmewtclfrp.cloudfront.net/Cambodia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/cambodia", id: "scroll_KHM" },
                { title: "Cameroon", abv: "CMR", image: "https://d30tgmewtclfrp.cloudfront.net/Cameroon/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/cameroon", id: "scroll_CMR" },
                { title: "Cape Verde", abv: "CPV", image: "https://d30tgmewtclfrp.cloudfront.net/Cape Verde/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/cape-verde", id: "scroll_CPV" },
                { title: "Central African Republic", abv: "CAF", image: "https://d30tgmewtclfrp.cloudfront.net/Central African Republic/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/central-african-republic", id: "scroll_CAF" },
                { title: "Chad", abv: "TCD", image: "https://d30tgmewtclfrp.cloudfront.net/Chad/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/chad", id: "scroll_TCD" },
                { title: "Chile", abv: "CHL", image: "https://d30tgmewtclfrp.cloudfront.net/Chile/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/chile", id: "scroll_CHL" },
                { title: "China", abv: "CHN", image: "https://d30tgmewtclfrp.cloudfront.net/China/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/china", id: "scroll_CHN" },
                { title: "Colombia", abv: "COL", image: "https://d30tgmewtclfrp.cloudfront.net/Colombia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/colombia", id: "scroll_COL" },
                { title: "Comoros", abv: "COM", image: "https://d30tgmewtclfrp.cloudfront.net/Comoros/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/comoros", id: "scroll_COM" },
                { title: "Congo", abv: "COG", image: "https://d30tgmewtclfrp.cloudfront.net/Congo/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/congo", id: "scroll_COG" },
                { title: "Democratic Republic of Congo", abv: "COD", image: "https://d30tgmewtclfrp.cloudfront.net/Democratic Republic of Congo/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/congo-democratic-republic", id: "scroll_COD" },
                { title: "Costa Rica", abv: "CRI", image: "https://d30tgmewtclfrp.cloudfront.net/Costa Rica/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/costa-rica", id: "scroll_CRI" },
                { title: "Croatia", abv: "HRV", image: "https://d30tgmewtclfrp.cloudfront.net/Croatia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/croatia", id: "scroll_HRV" },
                { title: "Cuba", abv: "CUB", image: "https://d30tgmewtclfrp.cloudfront.net/Cuba/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/cuba", id: "scroll_CUB" },
                { title: "Cyprus", abv: "CYP", image: "https://d30tgmewtclfrp.cloudfront.net/Cyprus/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/cyprus", id: "scroll_CYP" },
                { title: "Czech Republic", abv: "CZE", image: "https://d30tgmewtclfrp.cloudfront.net/Czech Republic/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/czech-republic", id: "scroll_CZE" },
                { title: "Denmark", abv: "DNK", image: "https://d30tgmewtclfrp.cloudfront.net/Denmark/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/denmark", id: "scroll_DNK" },
                { title: "Djibouti", abv: "DJI", image: "https://d30tgmewtclfrp.cloudfront.net/Djibouti/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/djibouti", id: "scroll_DJI" },
                { title: "Dominica", abv: "DMA", image: "https://d30tgmewtclfrp.cloudfront.net/Dominica/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/dominica", id: "scroll_DMA" },
                { title: "Dominican Republic", abv: "DOM", image: "https://d30tgmewtclfrp.cloudfront.net/Dominican Republic/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/dominican-republic", id: "scroll_DOM" },
                { title: "East Timor", abv: "TLS", image: "https://d30tgmewtclfrp.cloudfront.net/East Timor/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/east-timor", id: "scroll_TLS" },
                { title: "Ecuador", abv: "ECU", image: "https://d30tgmewtclfrp.cloudfront.net/Ecuador/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/ecuador", id: "scroll_ECU" },
                { title: "Egypt", abv: "EGY", image: "https://d30tgmewtclfrp.cloudfront.net/Egypt/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/egypt", id: "scroll_EGY" },
                { title: "El Salvador", abv: "SLV", image: "https://d30tgmewtclfrp.cloudfront.net/El Salvador/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/el-salvador", id: "scroll_SLV" },
                { title: "Equatorial Guinea", abv: "GNQ", image: "https://d30tgmewtclfrp.cloudfront.net/Equatorial Guinea/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/equatorial-guinea", id: "scroll_GNQ" },
                { title: "Eritrea", abv: "ERI", image: "https://d30tgmewtclfrp.cloudfront.net/Eritrea/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/eritrea", id: "scroll_ERI" },
                { title: "Estonia", abv: "EST", image: "https://d30tgmewtclfrp.cloudfront.net/Estonia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/estonia", id: "scroll_EST" },
                { title: "Ethiopia", abv: "ETH", image: "https://d30tgmewtclfrp.cloudfront.net/Ethiopia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/ethiopia", id: "scroll_ETH" },
                { title: "Fiji", abv: "FJI", image: "https://d30tgmewtclfrp.cloudfront.net/Fiji/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/fiji", id: "scroll_FJI" },
                { title: "Finland", abv: "FIN", image: "https://d30tgmewtclfrp.cloudfront.net/Finland/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/finland", id: "scroll_FIN" },
                { title: "France", abv: "FRA", image: "https://d30tgmewtclfrp.cloudfront.net/France/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/france", id: "scroll_FRA" },
                { title: "Gabon", abv: "GAB", image: "https://d30tgmewtclfrp.cloudfront.net/Gabon/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/gabon", id: "scroll_GAB" },
                { title: "Gambia", abv: "GMB", image: "https://d30tgmewtclfrp.cloudfront.net/Gambia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/gambia", id: "scroll_GMB" },
                { title: "Georgia", abv: "GEO", image: "https://d30tgmewtclfrp.cloudfront.net/Georgia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/georgia", id: "scroll_GEO" },
                { title: "Germany", abv: "DEU", image: "https://d30tgmewtclfrp.cloudfront.net/Germany/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/germany", id: "scroll_DEU" },
                { title: "Ghana", abv: "GHA", image: "https://d30tgmewtclfrp.cloudfront.net/Ghana/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/ghana", id: "scroll_GHA" },
                { title: "Greece", abv: "GRC", image: "https://d30tgmewtclfrp.cloudfront.net/Greece/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/greece", id: "scroll_GRC" },
                { title: "Grenada", abv: "GRD", image: "https://d30tgmewtclfrp.cloudfront.net/Grenada/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/grenada", id: "scroll_GRD" },
                { title: "Guatemala", abv: "GTM", image: "https://d30tgmewtclfrp.cloudfront.net/Guatemala/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/guatemala", id: "scroll_GTM" },
                { title: "Guinea", abv: "GIN", image: "https://d30tgmewtclfrp.cloudfront.net/Guinea/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/guinea", id: "scroll_GIN" },
                { title: "Guinea Bissau", abv: "GNB", image: "https://d30tgmewtclfrp.cloudfront.net/Guinea Bissau/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/guinea-bissau", id: "scroll_GNB" },
                { title: "Guyana", abv: "GUY", image: "https://d30tgmewtclfrp.cloudfront.net/Guyana/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/guyana", id: "scroll_GUY" },
                { title: "Haiti", abv: "HTI", image: "https://d30tgmewtclfrp.cloudfront.net/Haiti/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/haiti", id: "scroll_HTI" },
                { title: "Honduras", abv: "HND", image: "https://d30tgmewtclfrp.cloudfront.net/Honduras/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/honduras", id: "scroll_HND" },
                { title: "Hungary", abv: "HUN", image: "https://d30tgmewtclfrp.cloudfront.net/Hungary/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/hungary", id: "scroll_HUN" },
                { title: "Iceland", abv: "ISL", image: "https://d30tgmewtclfrp.cloudfront.net/Iceland/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/iceland", id: "scroll_ISL" },
                { title: "India", abv: "IND", image: "https://d30tgmewtclfrp.cloudfront.net/India/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/india", id: "scroll_IND" },
                { title: "Indonesia", abv: "IDN", image: "https://d30tgmewtclfrp.cloudfront.net/Indonesia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/indonesia", id: "scroll_IDN" },
                { title: "Iran", abv: "IRN", image: "https://d30tgmewtclfrp.cloudfront.net/Iran/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/iran", id: "scroll_IRN" },
                { title: "Iraq", abv: "IRQ", image: "https://d30tgmewtclfrp.cloudfront.net/Iraq/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/iraq", id: "scroll_IRQ" },
                { title: "Ireland", abv: "IRL", image: "https://d30tgmewtclfrp.cloudfront.net/Ireland/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/ireland-republic", id: "scroll_IRL" },
                { title: "Israel", abv: "ISR", image: "https://d30tgmewtclfrp.cloudfront.net/Israel/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/israel", id: "scroll_ISR" },
                { title: "Italy", abv: "ITA", image: "https://d30tgmewtclfrp.cloudfront.net/Italy/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/italy", id: "scroll_ITA" },
                { title: "Ivory Coast", abv: "CIV", image: "https://d30tgmewtclfrp.cloudfront.net/Ivory Coast/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/ivory-coast", id: "scroll_CIV" },
                { title: "Jamaica", abv: "JAM", image: "https://d30tgmewtclfrp.cloudfront.net/Jamaica/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/jamaica", id: "scroll_JAM" },
                { title: "Japan", abv: "JPN", image: "https://d30tgmewtclfrp.cloudfront.net/Japan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/japan", id: "scroll_JPN" },
                { title: "Jordan", abv: "JOR", image: "https://d30tgmewtclfrp.cloudfront.net/Jordan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/jordan", id: "scroll_JOR" },
                { title: "Kazakhstan", abv: "KAZ", image: "https://d30tgmewtclfrp.cloudfront.net/Kazakhstan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/kazakhstan", id: "scroll_KAZ" },
                { title: "Kenya", abv: "KEN", image: "https://d30tgmewtclfrp.cloudfront.net/Kenya/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/kenya", id: "scroll_KEN" },
                { title: "Kiribati", abv: "KIR", image: "https://d30tgmewtclfrp.cloudfront.net/Kiribati/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/kiribati", id: "scroll_KIR" },
                { title: "North Korea", abv: "PRK", image: "https://d30tgmewtclfrp.cloudfront.net/North Korea/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/korea-north", id: "scroll_PRK" },
                { title: "South Korea", abv: "KOR", image: "https://d30tgmewtclfrp.cloudfront.net/South Korea/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/korea-south", id: "scroll_KOR" },
                { title: "Kosovo", abv: "XKX", image: "https://d30tgmewtclfrp.cloudfront.net/Kosovo/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/kosovo", id: "scroll_XKX" },
                { title: "Kuwait", abv: "KWT", image: "https://d30tgmewtclfrp.cloudfront.net/Kuwait/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/kuwait", id: "scroll_KWT" },
                { title: "Kyrgyzstan", abv: "KGZ", image: "https://d30tgmewtclfrp.cloudfront.net/Kyrgyzstan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/kyrgyzstan", id: "scroll_KGZ" },
                { title: "Laos", abv: "LAO", image: "https://d30tgmewtclfrp.cloudfront.net/Laos/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/laos", id: "scroll_LAO" },
                { title: "Latvia", abv: "LVA", image: "https://d30tgmewtclfrp.cloudfront.net/Latvia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/latvia", id: "scroll_LVA" },
                { title: "Lebanon", abv: "LBN", image: "https://d30tgmewtclfrp.cloudfront.net/Lebanon/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/lebanon", id: "scroll_LBN" },
                { title: "Lesotho", abv: "LSO", image: "https://d30tgmewtclfrp.cloudfront.net/Lesotho/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/lesotho", id: "scroll_LSO" },
                { title: "Liberia", abv: "LBR", image: "https://d30tgmewtclfrp.cloudfront.net/Liberia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/liberia", id: "scroll_LBR" },
                { title: "Libya", abv: "LBY", image: "https://d30tgmewtclfrp.cloudfront.net/Libya/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/libya", id: "scroll_LBY" },
                { title: "Liechtenstein", abv: "LIE", image: "https://d30tgmewtclfrp.cloudfront.net/Liechtenstein/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/liechtenstein", id: "scroll_LIE" },
                { title: "Lithuania", abv: "LTU", image: "https://d30tgmewtclfrp.cloudfront.net/Lithuania/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/lithuania", id: "scroll_LTU" },
                { title: "Luxembourg", abv: "LUX", image: "https://d30tgmewtclfrp.cloudfront.net/Luxembourg/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/luxembourg", id: "scroll_LUX" },
                { title: "Madagascar", abv: "MDG", image: "https://d30tgmewtclfrp.cloudfront.net/Madagascar/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/madagascar", id: "scroll_MDG" },
                { title: "Malawi", abv: "MWI", image: "https://d30tgmewtclfrp.cloudfront.net/Malawi/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/malawi", id: "scroll_MWI" },
                { title: "Malaysia", abv: "MYS", image: "https://d30tgmewtclfrp.cloudfront.net/Malaysia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/malaysia", id: "scroll_MYS" },
                { title: "Maldives", abv: "MDV", image: "https://d30tgmewtclfrp.cloudfront.net/Maldives/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/maldives", id: "scroll_MDV" },
                { title: "Mali", abv: "MLI", image: "https://d30tgmewtclfrp.cloudfront.net/Mali/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/mali", id: "scroll_MLI" },
                { title: "Malta", abv: "MLT", image: "https://d30tgmewtclfrp.cloudfront.net/Malta/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/malta", id: "scroll_MLT" },
                { title: "Marshall Islands", abv: "MHL", image: "https://d30tgmewtclfrp.cloudfront.net/Marshall Islands/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/marshall-islands", id: "scroll_MHL" },
                { title: "Mauritania", abv: "MRT", image: "https://d30tgmewtclfrp.cloudfront.net/Mauritania/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/mauritania", id: "scroll_MRT" },
                { title: "Mauritius", abv: "MUS", image: "https://d30tgmewtclfrp.cloudfront.net/Mauritius/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/mauritius", id: "scroll_MUS" },
                { title: "Mexico", abv: "MEX", image: "https://d30tgmewtclfrp.cloudfront.net/Mexico/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/mexico", id: "scroll_MEX" },
                { title: "Micronesia", abv: "FSM", image: "https://d30tgmewtclfrp.cloudfront.net/Micronesia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/micronesia", id: "scroll_FSM" },
                { title: "Moldova", abv: "MDA", image: "https://d30tgmewtclfrp.cloudfront.net/Moldova/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/moldova", id: "scroll_MDA" },
                { title: "Monaco", abv: "MCO", image: "https://d30tgmewtclfrp.cloudfront.net/Monaco/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/monaco", id: "scroll_MCO" },
                { title: "Mongolia", abv: "MNG", image: "https://d30tgmewtclfrp.cloudfront.net/Mongolia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/mongolia", id: "scroll_MNG" },
                { title: "Montenegro", abv: "MNE", image: "https://d30tgmewtclfrp.cloudfront.net/Montenegro/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/montenegro", id: "scroll_MNE" },
                { title: "Morocco", abv: "MAR", image: "https://d30tgmewtclfrp.cloudfront.net/Morocco/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/morocco", id: "scroll_MAR" },
                { title: "Mozambique", abv: "MOZ", image: "https://d30tgmewtclfrp.cloudfront.net/Mozambique/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/mozambique", id: "scroll_MOZ" },
                { title: "Myanmar", abv: "MMR", image: "https://d30tgmewtclfrp.cloudfront.net/Myanmar/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/myanmar", id: "scroll_MMR" },
                { title: "Namibia", abv: "NAM", image: "https://d30tgmewtclfrp.cloudfront.net/Namibia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/namibia", id: "scroll_NAM" },
                { title: "Nauru", abv: "NRU", image: "https://d30tgmewtclfrp.cloudfront.net/Nauru/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/nauru", id: "scroll_NRU" },
                { title: "Nepal", abv: "NPL", image: "https://d30tgmewtclfrp.cloudfront.net/Nepal/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/nepal", id: "scroll_NPL" },
                { title: "Netherlands", abv: "NLD", image: "https://d30tgmewtclfrp.cloudfront.net/Netherlands/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/netherlands", id: "scroll_NLD" },
                { title: "New Zealand", abv: "NZL", image: "https://d30tgmewtclfrp.cloudfront.net/New Zealand/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/new-zealand", id: "scroll_NZL" },
                { title: "Nicaragua", abv: "NIC", image: "https://d30tgmewtclfrp.cloudfront.net/Nicaragua/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/nicaragua", id: "scroll_NIC" },
                { title: "Niger", abv: "NER", image: "https://d30tgmewtclfrp.cloudfront.net/Niger/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/niger", id: "scroll_NER" },
                { title: "Nigeria", abv: "NGA", image: "https://d30tgmewtclfrp.cloudfront.net/Nigeria/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/nigeria", id: "scroll_NGA" },
                { title: "North Macedonia", abv: "MKD", image: "https://d30tgmewtclfrp.cloudfront.net/North Macedonia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/north-macedonia", id: "scroll_MKD" },
                { title: "Norway", abv: "NOR", image: "https://d30tgmewtclfrp.cloudfront.net/Norway/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/norway", id: "scroll_NOR" },
                { title: "Oman", abv: "OMN", image: "https://d30tgmewtclfrp.cloudfront.net/Oman/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/oman", id: "scroll_OMN" },
                { title: "Pakistan", abv: "PAK", image: "https://d30tgmewtclfrp.cloudfront.net/Pakistan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/pakistan", id: "scroll_PAK" },
                { title: "Palau", abv: "PLW", image: "https://d30tgmewtclfrp.cloudfront.net/Palau/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/palau", id: "scroll_PLW" },
                { title: "Panama", abv: "PAN", image: "https://d30tgmewtclfrp.cloudfront.net/Panama/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/panama", id: "scroll_PAN" },
                { title: "Papua New Guinea", abv: "PNG", image: "https://d30tgmewtclfrp.cloudfront.net/Papua New Guinea/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/papua-new-guinea", id: "scroll_PNG" },
                { title: "Paraguay", abv: "PRY", image: "https://d30tgmewtclfrp.cloudfront.net/Paraguay/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/paraguay", id: "scroll_PRY" },
                { title: "Peru", abv: "PER", image: "https://d30tgmewtclfrp.cloudfront.net/Peru/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/peru", id: "scroll_PER" },
                { title: "Philippines", abv: "PHL", image: "https://d30tgmewtclfrp.cloudfront.net/Philippines/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/philippines", id: "scroll_PHL" },
                { title: "Poland", abv: "POL", image: "https://d30tgmewtclfrp.cloudfront.net/Poland/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/poland", id: "scroll_POL" },
                { title: "Portugal", abv: "PRT", image: "https://d30tgmewtclfrp.cloudfront.net/Portugal/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/portugal", id: "scroll_PRT" },
                { title: "Qatar", abv: "QAT", image: "https://d30tgmewtclfrp.cloudfront.net/Qatar/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/qatar", id: "scroll_QAT" },
                { title: "Romania", abv: "ROU", image: "https://d30tgmewtclfrp.cloudfront.net/Romania/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/romania", id: "scroll_ROU" },
                { title: "Russia", abv: "RUS", image: "https://d30tgmewtclfrp.cloudfront.net/Russia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/russia", id: "scroll_RUS" },
                { title: "Rwanda", abv: "RWA", image: "https://d30tgmewtclfrp.cloudfront.net/Rwanda/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/rwanda", id: "scroll_RWA" },
                { title: "Saint Kitts and Nevis", abv: "KNA", image: "https://d30tgmewtclfrp.cloudfront.net/Saint Kitts and Nevis/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/saint-kitts-and-nevis", id: "scroll_KNA" },
                { title: "Saint Lucia", abv: "LCA", image: "https://d30tgmewtclfrp.cloudfront.net/Saint Lucia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/saint-lucia", id: "scroll_LCA" },
                { title: "Saint Vincent and the Grenadines", abv: "VCT", image: "https://d30tgmewtclfrp.cloudfront.net/Saint Vincent and the Grenadines/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/saint-vincent-and-the-grenadines", id: "scroll_VCT" },
                { title: "Samoa", abv: "WSM", image: "https://d30tgmewtclfrp.cloudfront.net/Samoa/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/samoa", id: "scroll_WSM" },
                { title: "San Marino", abv: "SMR", image: "https://d30tgmewtclfrp.cloudfront.net/San Marino/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/san-marino", id: "scroll_SMR" },
                { title: "Sao Tome and Principe", abv: "STP", image: "https://d30tgmewtclfrp.cloudfront.net/Sao Tome and Principe/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/sao-tome-and-principe", id: "scroll_STP" },
                { title: "Saudi Arabia", abv: "SAU", image: "https://d30tgmewtclfrp.cloudfront.net/Saudi Arabia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/saudi-arabia", id: "scroll_SAU" },
                { title: "Senegal", abv: "SEN", image: "https://d30tgmewtclfrp.cloudfront.net/Senegal/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/senegal", id: "scroll_SEN" },
                { title: "Serbia", abv: "SRB", image: "https://d30tgmewtclfrp.cloudfront.net/Serbia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/serbia", id: "scroll_SRB" },
                { title: "Seychelles", abv: "SYC", image: "https://d30tgmewtclfrp.cloudfront.net/Seychelles/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/seychelles", id: "scroll_SYC" },
                { title: "Sierra Leone", abv: "SLE", image: "https://d30tgmewtclfrp.cloudfront.net/Sierra Leone/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/sierra-leone", id: "scroll_SLE" },
                { title: "Singapore", abv: "SGP", image: "https://d30tgmewtclfrp.cloudfront.net/Singapore/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/singapore", id: "scroll_SGP" },
                { title: "Slovakia", abv: "SVK", image: "https://d30tgmewtclfrp.cloudfront.net/Slovakia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/slovakia", id: "scroll_SVK" },
                { title: "Slovenia", abv: "SVN", image: "https://d30tgmewtclfrp.cloudfront.net/Slovenia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/slovenia", id: "scroll_SVN" },
                { title: "Solomon Islands", abv: "SLB", image: "https://d30tgmewtclfrp.cloudfront.net/Solomon Islands/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/solomon-islands", id: "scroll_SLB" },
                { title: "Somalia", abv: "SOM", image: "https://d30tgmewtclfrp.cloudfront.net/Somalia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/somalia", id: "scroll_SOM" },
                { title: "South Africa", abv: "ZAF", image: "https://d30tgmewtclfrp.cloudfront.net/South Africa/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/south-africa", id: "scroll_ZAF" },
                { title: "South Sudan", abv: "SSD", image: "https://d30tgmewtclfrp.cloudfront.net/South Sudan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/south-sudan", id: "scroll_SSD" },
                { title: "Spain", abv: "ESP", image: "https://d30tgmewtclfrp.cloudfront.net/Spain/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/spain", id: "scroll_ESP" },
                { title: "Sri Lanka", abv: "LKA", image: "https://d30tgmewtclfrp.cloudfront.net/Sri Lanka/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/sri-lanka", id: "scroll_LKA" },
                { title: "Sudan", abv: "SDN", image: "https://d30tgmewtclfrp.cloudfront.net/Sudan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/sudan", id: "scroll_SDN" },
                { title: "Suriname", abv: "SUR", image: "https://d30tgmewtclfrp.cloudfront.net/Suriname/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/suriname", id: "scroll_SUR" },
                { title: "Sweden", abv: "SWE", image: "https://d30tgmewtclfrp.cloudfront.net/Sweden/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/sweden", id: "scroll_SWE" },
                { title: "Switzerland", abv: "CHE", image: "https://d30tgmewtclfrp.cloudfront.net/Switzerland/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/switzerland", id: "scroll_CHE" },
                { title: "Syria", abv: "SYR", image: "https://d30tgmewtclfrp.cloudfront.net/Syria/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/syria", id: "scroll_SYR" },
                { title: "Taiwan", abv: "TWN", image: "https://d30tgmewtclfrp.cloudfront.net/Taiwan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/taiwan", id: "scroll_TWN" },
                { title: "Tajikistan", abv: "TJK", image: "https://d30tgmewtclfrp.cloudfront.net/Tajikistan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/tajikistan", id: "scroll_TJK" },
                { title: "Tanzania", abv: "TZA", image: "https://d30tgmewtclfrp.cloudfront.net/Tanzania/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/tanzania", id: "scroll_TZA" },
                { title: "Thailand", abv: "THA", image: "https://d30tgmewtclfrp.cloudfront.net/Thailand/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/thailand", id: "scroll_THA" },
                { title: "Timor Leste", abv: "TLS", image: "https://d30tgmewtclfrp.cloudfront.net/Timor Leste/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/timor-leste", id: "scroll_TLS" },
                { title: "Togo", abv: "TGO", image: "https://d30tgmewtclfrp.cloudfront.net/Togo/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/togo", id: "scroll_TGO" },
                { title: "Tonga", abv: "TON", image: "https://d30tgmewtclfrp.cloudfront.net/Tonga/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/tonga", id: "scroll_TON" },
                { title: "Trinidad and Tobago", abv: "TTO", image: "https://d30tgmewtclfrp.cloudfront.net/Trinidad and Tobago/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/trinidad-and-tobago", id: "scroll_TTO" },
                { title: "Tunisia", abv: "TUN", image: "https://d30tgmewtclfrp.cloudfront.net/Tunisia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/tunisia", id: "scroll_TUN" },
                { title: "Turkey", abv: "TUR", image: "https://d30tgmewtclfrp.cloudfront.net/Turkey/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/turkey", id: "scroll_TUR" },
                { title: "Turkmenistan", abv: "TKM", image: "https://d30tgmewtclfrp.cloudfront.net/Turkmenistan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/turkmenistan", id: "scroll_TKM" },
                { title: "Tuvalu", abv: "TUV", image: "https://d30tgmewtclfrp.cloudfront.net/Tuvalu/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/tuvalu", id: "scroll_TUV" },
                { title: "Uganda", abv: "UGA", image: "https://d30tgmewtclfrp.cloudfront.net/Uganda/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/uganda", id: "scroll_UGA" },
                { title: "Ukraine", abv: "UKR", image: "https://d30tgmewtclfrp.cloudfront.net/Ukraine/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/ukraine", id: "scroll_UKR" },
                { title: "United Arab Emirates", abv: "ARE", image: "https://d30tgmewtclfrp.cloudfront.net/United Arab Emirates/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/united-arab-emirates", id: "scroll_ARE" },
                { title: "United Kingdom", abv: "GBR", image: "https://d30tgmewtclfrp.cloudfront.net/United Kingdom/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/united-kingdom", id: "scroll_GBR" },
                { title: "Uruguay", abv: "URY", image: "https://d30tgmewtclfrp.cloudfront.net/Uruguay/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/uruguay", id: "scroll_URY" },
                { title: "Uzbekistan", abv: "UZB", image: "https://d30tgmewtclfrp.cloudfront.net/Uzbekistan/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/uzbekistan", id: "scroll_UZB" },
                { title: "Vanuatu", abv: "VUT", image: "https://d30tgmewtclfrp.cloudfront.net/Vanuatu/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/vanuatu", id: "scroll_VUT" },
                { title: "Vatican City", abv: "VAT", image: "https://d30tgmewtclfrp.cloudfront.net/Vatican City/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/vatican-city", id: "scroll_VAT" },
                { title: "Venezuela", abv: "VEN", image: "https://d30tgmewtclfrp.cloudfront.net/Venezuela/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/venezuela", id: "scroll_VEN" },
                { title: "Vietnam", abv: "VNM", image: "https://d30tgmewtclfrp.cloudfront.net/Vietnam/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/vietnam", id: "scroll_VNM" },
                { title: "Yemen", abv: "YEM", image: "https://d30tgmewtclfrp.cloudfront.net/Yemen/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/yemen", id: "scroll_YEM" },
                { title: "Zambia", abv: "ZMB", image: "https://d30tgmewtclfrp.cloudfront.net/Zambia/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/zambia", id: "scroll_ZMB" },
                { title: "Zimbabwe", abv: "ZWE", image: "https://d30tgmewtclfrp.cloudfront.net/Zimbabwe/Thumbnail/img.png", url: "https://www.masrikdahir.com/map/zimbabwe", id: "scroll_ZWE" }

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
                    title: "California",
                    abv: "FL",
                    image: "https://d30tgmewtclfrp.cloudfront.net/California/Thumbnail/img.png",
                    url: "https://www.masrikdahir.com/map/ca"
                },
                {
                    title: "Nevada",
                    abv: "FL",
                    image: "https://d30tgmewtclfrp.cloudfront.net/Nevada/Thumbnail/img.png",
                    url: "https://www.masrikdahir.com/map/nv"
                },
                {
                    title: "Arizona",
                    abv: "FL",
                    image: "https://d30tgmewtclfrp.cloudfront.net/Arizona/Thumbnail/img.png",
                    url: "https://www.masrikdahir.com/map/az"
                },
                {
                    title:"Virginia",
                    abv:"VA",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Virginia/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/va",
                },
                {
                    title:"New York",
                    abv:"NY",
                    image:"https://d30tgmewtclfrp.cloudfront.net/New York/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/ny",
                },
                {
                    title:"Maine",
                    abv:"ME",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Maine/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/me",
                },
                {
                    title:"Kentucky",
                    abv:"KY",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Kentucky/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/ky",
                },
                {
                    title:"Vermont",
                    abv:"VT",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Vermont/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/vt",
                },
                {
                    title:"New Hampshire",
                    abv:"WH",
                    image:"https://d30tgmewtclfrp.cloudfront.net/New Hampshire/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/nh",
                },

                {
                    title:"Massachusetts",
                    abv:"MA",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Massachusetts/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/ma",
                },
                {
                    title:"Connecticut",
                    abv:"CT",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Connecticut/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/ct",
                },
                {
                    title:"New Jersey",
                    abv:"NJ",
                    image:"https://d30tgmewtclfrp.cloudfront.net/New Jersey/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/nj",
                },
                {
                    title:"West Virginia",
                    abv:"WV",
                    image:"https://d30tgmewtclfrp.cloudfront.net/West Virginia/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/wv",
                },
                {
                    title:"Maryland",
                    abv:"MD",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Maryland/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/md",
                },
                {
                    title:"Delaware",
                    abv:"DE",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Delaware/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/de",
                },
                {
                    title:"North Carolina",
                    abv:"NC",
                    image:"https://d30tgmewtclfrp.cloudfront.net/North Carolina/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/nc",
                },
                {
                    title:"Indiana",
                    abv:"IN",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Indiana/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/in",
                },
                {
                    title:"Tennessee",
                    abv:"TN",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Tennessee/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/tn",
                },
                {
                    title:"Washington DC",
                    abv:"DC",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Washington DC/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/dc",
                },
                {
                    title:"Pennsylvania",
                    abv:"PA",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Pennsylvania/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/pa",
                },
                {
                    title:"South Carolina",
                    abv:"SC",
                    image:"https://d30tgmewtclfrp.cloudfront.net/South Carolina/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/sc",
                },
                {
                    title:"Georgia",
                    abv:"GA",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Georgia/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/ga",
                },
                {
                    title:"Alabama",
                    abv:"AL",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Alabama/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/al",
                },
                {
                    title:"Ohio",
                    abv:"OH",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Ohio/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/oh",
                },
                {
                    title:"Michigan",
                    abv:"MI",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Michigan/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/mi",
                },
                {
                    title:"Wisconsin",
                    abv:"WI",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Wisconsin/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/wi",
                },
                {
                    title:"Illinois",
                    abv:"IL",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Illinois/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/il",
                },
                {
                    title:"Iowa",
                    abv:"IA",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Iowa/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/ia",
                },
                {
                    title:"Missouri",
                    abv:"MO",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Missouri/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/mo",
                },
                {
                    title:"Arkansas",
                    abv:"AR",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Arkansas/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/ar",
                },
                {
                    title:"Louisiana",
                    abv:"LA",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Louisiana/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/la",
                },
                {
                    title:"Mississippi",
                    abv:"MS",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Mississippi/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/ms",
                },
                {
                    title:"Texas",
                    abv:"TX",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Texas/Thumbnail/img.png",
                    url:"https://www.masrikdahir.com/map/tx",
                },
                {
                    title: "Kansas",
                    abv: "KS",
                    image: "https://d30tgmewtclfrp.cloudfront.net/Kansas/Thumbnail/img.png",
                    url: "https://www.masrikdahir.com/map/ks"
                },
                {
                    title: "South Dakota",
                    abv: "SD",
                    image: "https://d30tgmewtclfrp.cloudfront.net/South Dakota/Thumbnail/img.png",
                    url: "https://www.masrikdahir.com/map/sd"
                },
                {
                    title: "Wyoming",
                    abv: "WY",
                    image: "https://d30tgmewtclfrp.cloudfront.net/Wyoming/Thumbnail/img.png",
                    url: "https://www.masrikdahir.com/map/wy"
                },
                {
                    title: "Colorado",
                    abv: "CO",
                    image: "https://d30tgmewtclfrp.cloudfront.net/Colorado/Thumbnail/img.png",
                    url: "https://www.masrikdahir.com/map/co"
                },
                {
                    title: "Utah",
                    abv: "UT",
                    image: "https://d30tgmewtclfrp.cloudfront.net/Utah/Thumbnail/img.png",
                    url: "https://www.masrikdahir.com/map/ut"
                },
                {
                    title: "Nebraska",
                    abv: "NE",
                    image: "https://d30tgmewtclfrp.cloudfront.net/Nebraska/Thumbnail/img.png",
                    url: "https://www.masrikdahir.com/map/ne"
                },
                {
                    title: "Montana",
                    abv: "MT",
                    image: "https://d30tgmewtclfrp.cloudfront.net/Montana/Thumbnail/img.png",
                    url: "https://www.masrikdahir.com/map/mt"
                },
                {
                    title: "Minnesota",
                    abv: "MN",
                    image: "https://d30tgmewtclfrp.cloudfront.net/Minnesota/Thumbnail/img.png",
                    url: "https://www.masrikdahir.com/map/mn"
                },
                {
                    title: "North Dakota",
                    abv: "ND",
                    image: "https://d30tgmewtclfrp.cloudfront.net/North Dakota/Thumbnail/img.png",
                    url: "https://www.masrikdahir.com/map/nd"
                },
                {
                    title: "Idaho",
                    abv: "ID",
                    image: "https://d30tgmewtclfrp.cloudfront.net/Idaho/Thumbnail/img.png",
                    url: "https://www.masrikdahir.com/map/id"
                },
                {
                    title: "Rhode Island",
                    abv: "RI",
                    image: "https://d30tgmewtclfrp.cloudfront.net/Rhode Island/Thumbnail/img.png",
                    url: "https://www.masrikdahir.com/map/ri"
                },
                {
                    title: "Florida",
                    abv: "FL",
                    image: "https://d30tgmewtclfrp.cloudfront.net/Florida/Thumbnail/img.png",
                    url: "https://www.masrikdahir.com/map/fl"
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



const app_pic_can = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
                {
                    title:"Ontario ",
                    abv:"ON",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Ontario/Thumbnail/img.png",
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
                    image:"https://d30tgmewtclfrp.cloudfront.net/England/Thumbnail/GB-ENG.svg.png",
                    url:"",
                },
                {
                    title:"Wales",
                    abv:"WLS",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Wales/Thumbnail/GB-WLS.svg.png",
                    url:"",
                },
                {
                    title:"Northern Ireland",
                    abv:"NIR",
                    image:"https://d30tgmewtclfrp.cloudfront.net/North Ireland/Thumbnail/GB-NIR.svg.png",
                    url:"",
                },
                {
                    title:"Scotland",
                    abv:"SCT",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Scotland/Thumbnail/GB-SCT.svg.png",
                    url:"",
                },
                {
                    title:"Ireland",
                    abv:"IRL",
                    image:"https://d30tgmewtclfrp.cloudfront.net/Ireland/Thumbnail/IRL.svg.png",
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


const app_pic_bangladesh = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
                // {
                //     title:"Dhaka",
                //     abv:"DAC",
                //     image:"https://d30tgmewtclfrp.cloudfront.net/Bangladesh/Dhaka/Thumbnail/img.png",
                //     url:"",
                // },
                // {
                //     title:"Sylhet",
                //     abv:"ZYL",
                //     image:"https://d30tgmewtclfrp.cloudfront.net/Bangladesh/Sylhet/Thumbnail/img.png",
                //     url:"",
                // },
                // {
                //     title:"Chittagong",
                //     abv:"CGP",
                //     image:"https://d30tgmewtclfrp.cloudfront.net/Bangladesh/Chittagong/Thumbnail/img.png",
                //     url:"",
                // },
                // {
                //     title:"Khulna",
                //     abv:"KHL",
                //     image:"https://d30tgmewtclfrp.cloudfront.net/Bangladesh/Dhaka/Thumbnail/img.png",
                //     url:"",
                // },
                // {
                //     title:"Barisal",
                //     abv:"BZL",
                //     image:"https://d30tgmewtclfrp.cloudfront.net/Bangladesh/Khulna/Thumbnail/img.png",
                //     url:"",
                // },
                // {
                //     title:"Rajshahi",
                //     abv:"RJH",
                //     image:"https://d30tgmewtclfrp.cloudfront.net/Bangladesh/Rajshahi/Thumbnail/img.png",
                //     url:"",
                // },
                // {
                //     title:"Rangpur",
                //     abv:"RAU",
                //     image:"https://d30tgmewtclfrp.cloudfront.net/Bangladesh/Rangpur/Thumbnail/img.png",
                //     url:"",
                // }
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

const app_pic_northern_asia = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[

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

const app_pic_southern_asia = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
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

const app_pic_eastern_asia = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
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

const app_pic_central_asia = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
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

const app_pic_south_eastern_asia = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
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

const app_pic_middle_east = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
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

const app_pic_central_america = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
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

const app_pic_caribbean_america = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
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

const app_pic_south_america = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
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

const app_pic_western_europe = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
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

const app_pic_eastern_europe = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
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

const app_pic_southern_europe = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
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

const app_pic_northern_europe = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
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

const app_pic_northern_africa = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
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

const app_pic_western_africa = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
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

const app_pic_eastern_africa = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
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

const app_pic_central_africa = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
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

const app_pic_southern_africa = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
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

const app_pic_australia = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
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

const app_pic_new_zealand = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
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


Vue.createApp(app_software).mount('#app_software')
Vue.createApp(app_milestone).mount('#app_milestone')
Vue.createApp(app_map).mount('#app_map')
Vue.createApp(app_country).mount('#app_country')
Vue.createApp(app_pic).mount('#app_pic')
Vue.createApp(app_pic_can).mount('#app_pic_can')
Vue.createApp(app_pic_gbr).mount('#app_pic_gbr')
Vue.createApp(app_pic_bangladesh).mount('#app_pic_bangladesh')
Vue.createApp(app_pic_northern_asia).mount('#app_pic_northern_asia')
Vue.createApp(app_pic_southern_asia).mount('#app_pic_southern_asia')
Vue.createApp(app_pic_eastern_asia).mount('#app_pic_eastern_asia')
Vue.createApp(app_pic_central_asia).mount('#app_pic_central_asia')
Vue.createApp(app_pic_south_eastern_asia).mount('#app_pic_south_eastern_asia')
Vue.createApp(app_pic_middle_east).mount('#app_pic_middle_east')
Vue.createApp(app_pic_central_america).mount('#app_pic_central_america')
Vue.createApp(app_pic_caribbean_america).mount('#app_pic_caribbean_america')
Vue.createApp(app_pic_south_america).mount('#app_pic_south_america')
Vue.createApp(app_pic_western_europe).mount('#app_pic_western_europe')
Vue.createApp(app_pic_eastern_europe).mount('#app_pic_eastern_europe')
Vue.createApp(app_pic_southern_europe).mount('#app_pic_southern_europe')
Vue.createApp(app_pic_northern_europe).mount('#app_pic_northern_europe')
Vue.createApp(app_pic_northern_africa).mount('#app_pic_northern_africa')
Vue.createApp(app_pic_western_africa).mount('#app_pic_western_africa')
Vue.createApp(app_pic_eastern_africa).mount('#app_pic_eastern_africa')
Vue.createApp(app_pic_central_africa).mount('#app_pic_central_africa')
Vue.createApp(app_pic_southern_africa).mount('#app_pic_southern_africa')
Vue.createApp(app_pic_australia).mount('#app_pic_australia')
Vue.createApp(app_pic_new_zealand).mount('#app_pic_new_zealand')





function createStateComponent(stateName, stateAbbreviation, numImages = 10) {
    return {
        name: `app_${stateAbbreviation.toLowerCase()}`, // Component name
        data() {
            // Generate resources array dynamically based on numImages
            let resources = [];
            for (let i = 1; i <= numImages; i++) {
                resources.push({
                    title: `${i}`,
                    url: `https://d30tgmewtclfrp.cloudfront.net/${stateName}/${i}.jpg`, // Adjust folder and file name as per your structure
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
                return this.resultQuery.slice(0, Math.min(this.resultQuery.length, 30));
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
        const response = await fetch('https://d30tgmewtclfrp.cloudfront.net/Json/image.json');
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













