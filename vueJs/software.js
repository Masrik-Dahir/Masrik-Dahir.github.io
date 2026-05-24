const { createApp, ref } = Vue

const app_software = {
    data() {
        return {
            searchQuery: null,
            activeTab: 'all',
            resources:[
                {
                    title:"AwsUtil",
                    des:"Multi-language AWS SDK wrapper library — Python, C#, Go, Java, Rust, TypeScript, Ruby — with full async parity, structured errors, and Pydantic models",
                    category:"library",
                    uri_github:"https://github.com/Masrik-Dahir/aws-util-python",
                    uri_windows:"",
                    uri_android:"",
                    uri_apple:"",
                    uri_web:"library/awsutil",
                    uri:"library/awsutil",
                    hosts:["aws","python","pypi","npm","nuget","maven","crates","rubygems","go"],
                    hostLinks:{aws:"",python:"",pypi:"library/awsutil/python",npm:"library/awsutil/typescript",nuget:"library/awsutil/csharp",maven:"library/awsutil/java",crates:"library/awsutil/rust",rubygems:"library/awsutil/ruby",go:"library/awsutil/go"}
                },
                {
                    title:"Cronus",
                    des:"Comparing and Contrasting Concept Maps, Algorithmic Grading",
                    category:"library",
                    uri_github:"https://github.com/Masrik-Dahir/Cronus",
                    uri_windows:"",
                    uri_android:"",
                    uri_apple:"",
                    uri_web:"software/cronus",
                    uri:"software/cronus",
                    hosts:["github","research","python","graph"],
                    hostLinks:{github:"https://github.com/Masrik-Dahir/Cronus",research:"",python:"",graph:""}
                },
                {
                    title:"Video Downloader",
                    des:"Download any video files from a web url, convert video to audio, YouTube video downloader",
                    category:"app",
                    uri_github:"https://github.com/Masrik-Dahir/Downloader",
                    uri_windows:"https://github.com/Masrik-Dahir/Downloader/releases/latest",
                    uri_android:"",
                    uri_apple:"",
                    uri_web:"software/video-downloader",
                    uri:"software/video-downloader",
                    hosts:["github","python","windows"],
                    hostLinks:{github:"https://github.com/Masrik-Dahir/Downloader",python:"",windows:"https://github.com/Masrik-Dahir/Downloader/releases/latest"}
                },
                {
                    title:"Fraud Detection Model",
                    des:"A threat modeling of attacks realizable in ClaimChain through attack trees, red flags identified by National Insurance Crime Bureau and use Machine Learning models to detect fraudulent activities with significant accuracy",
                    category:"app",
                    uri_github:"https://github.com/Masrik-Dahir/Fraud-Model",
                    uri_windows:"",
                    uri_android:"",
                    uri_apple:"",
                    uri_web:"software/fraud-model",
                    uri:"software/fraud-model",
                    hosts:["github","research","ml","security"],
                    hostLinks:{github:"https://github.com/Masrik-Dahir/Fraud-Model",research:"",ml:"",security:""}
                },
                {
                    title:"DDoS Penetration Testing Tool",
                    des:"A penetration testing tool to conduct DDoS attack in Application layer and Transport layer",
                    category:"app",
                    uri_github:"https://github.com/Masrik-Dahir/DDoS_interface",
                    uri_windows:"https://github.com/Masrik-Dahir/DDoS-interface/releases/latest",
                    uri_android:"",
                    uri_apple:"",
                    uri_web:"software/ddos-tool",
                    uri:"software/ddos-tool",
                    hosts:["github","python","security","windows"],
                    hostLinks:{github:"https://github.com/Masrik-Dahir/DDoS_interface",python:"",security:"",windows:"https://github.com/Masrik-Dahir/DDoS-interface/releases/latest"}
                },
                {
                    title:"Password Manager",
                    des:"Encrypt, decrypt files and folders and hash matches (md5, sha1, sha224, sha256, sha384, sha512) to check file integrity, password manager",
                    category:"app",
                    uri_github:"https://github.com/Masrik-Dahir/Encryption-decryption-interface",
                    uri_windows:"https://github.com/Masrik-Dahir/Encryption-decryption-interface/releases/latest",
                    uri_android:"",
                    uri_apple:"",
                    uri_web:"software/password-manager",
                    uri:"software/password-manager",
                    hosts:["github","python","security","windows"],
                    hostLinks:{github:"https://github.com/Masrik-Dahir/Encryption-decryption-interface",python:"",security:"",windows:"https://github.com/Masrik-Dahir/Encryption-decryption-interface/releases/latest"}
                },
                {
                    title:"PDF Interface",
                    des:"Merge, split, rotate, watermark, and convert PDF files",
                    category:"app",
                    uri_github:"https://github.com/Masrik-Dahir/Pdf_interface",
                    uri_windows:"",
                    uri_android:"",
                    uri_apple:"",
                    uri_web:"software/pdf-interface",
                    uri:"software/pdf-interface",
                    hosts:["github","python"],
                    hostLinks:{github:"https://github.com/Masrik-Dahir/Pdf_interface",python:""}
                },
                {
                    title:"Formats",
                    des:"OCR, Bar code, and QR code scanner, text to speech",
                    category:"app",
                    uri_github:"https://github.com/Masrik-Dahir/Formats",
                    uri_windows:"",
                    uri_android:"https://github.com/Masrik-Dahir/Formats/releases/latest",
                    uri_apple:"",
                    uri_web:"software/formats",
                    uri:"software/formats",
                    hosts:["github","java","android"],
                    hostLinks:{github:"https://github.com/Masrik-Dahir/Formats",java:"",android:"https://github.com/Masrik-Dahir/Formats/releases/latest"}
                },
                {
                    title:"Automata",
                    des:"Converts the regex to NFA, DFA, Minimum-DFA; converts CFG to LL Grammar and CNF",
                    category:"app",
                    uri_github:"https://github.com/Masrik-Dahir/Automation",
                    uri_windows:"",
                    uri_android:"https://github.com/Masrik-Dahir/Automation/releases/latest",
                    uri_apple:"",
                    uri_web:"software/automata",
                    uri:"software/automata",
                    hosts:["github","java","android"],
                    hostLinks:{github:"https://github.com/Masrik-Dahir/Automation",java:"",android:"https://github.com/Masrik-Dahir/Automation/releases/latest"}
                },
                {
                    title:"Universal Calculator",
                    des:"Basic Calculator, Scientific Calculator, Bitwise Calculator (i.e., decimal, binary, hexadecimal), Unit Calculator (i.e., Any types of unit in all standards), Binary operations (i.e., 1's complement, 2's complement)",
                    category:"app",
                    uri_github:"https://github.com/Masrik-Dahir/Universal-calculator",
                    uri_windows:"",
                    uri_android:"https://github.com/Masrik-Dahir/Universal-calculator/releases/latest",
                    uri_apple:"",
                    uri_web:"software/universal-calculator",
                    uri:"software/universal-calculator",
                    hosts:["github","java","android"],
                    hostLinks:{github:"https://github.com/Masrik-Dahir/Universal-calculator",java:"",android:"https://github.com/Masrik-Dahir/Universal-calculator/releases/latest"}
                },
                {
                    title:"Real Estate Analyzer",
                    des:"Mortgage Analysis, Cash Flow Analysis",
                    category:"app",
                    uri_github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",
                    uri_windows:"",
                    uri_android:"",
                    uri_apple:"",
                    uri_web:"web/re",
                    uri:"web/re",
                    hosts:["github","web","javascript","finance"],
                    hostLinks:{github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",web:"web/re",javascript:"",finance:""}
                },
                {
                    title:"Real Estate Pro (9 more tools)",
                    des:"Rent-vs-Buy, affordability, rental cash-flow & ROI, closing cost, LTV, cash-out refi, property tax by state, moving cost, down-payment & PMI optimizer",
                    category:"app",
                    uri_github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",
                    uri_windows:"", uri_android:"", uri_apple:"",
                    uri_web:"web/re2", uri:"web/re2",
                    hosts:["github","web","javascript","finance"],
                    hostLinks:{github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",web:"web/re2",javascript:"",finance:""}
                },
                {
                    title:"Personal Finance Calculators",
                    des:"10-in-1: budget planner, net worth, savings goal, emergency fund, COL comparison, subscriptions, inflation, salary↔hourly, take-home, latte factor",
                    category:"app",
                    uri_github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",
                    uri_windows:"", uri_android:"", uri_apple:"",
                    uri_web:"web/budget", uri:"web/budget",
                    hosts:["github","web","javascript","finance"],
                    hostLinks:{github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",web:"web/budget",javascript:"",finance:""}
                },
                {
                    title:"Loans & Debt Calculators",
                    des:"10-in-1: mortgage amortization, early payoff, auto loan, student loan, snowball vs avalanche, consolidation, refinance break-even, affordability, IO vs amortizing, APR↔APY",
                    category:"app",
                    uri_github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",
                    uri_windows:"", uri_android:"", uri_apple:"",
                    uri_web:"web/loans", uri:"web/loans",
                    hosts:["github","web","javascript","finance"],
                    hostLinks:{github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",web:"web/loans",javascript:"",finance:""}
                },
                {
                    title:"Investing & Retirement Calculators",
                    des:"12-in-1: compound interest, retirement projector, FIRE, DCA, allocation donut, DRIP, Roth vs Traditional, Rule of 72, position size, crypto P/L, annuity, fee drag",
                    category:"app",
                    uri_github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",
                    uri_windows:"", uri_android:"", uri_apple:"",
                    uri_web:"web/invest", uri:"web/invest",
                    hosts:["github","web","javascript","finance"],
                    hostLinks:{github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",web:"web/invest",javascript:"",finance:""}
                },
                {
                    title:"Tax Calculators",
                    des:"6-in-1: federal bracket visualizer, freelance/self-employment, sales tax, capital gains, W-4 withholding, bill+tip+tax splitter",
                    category:"app",
                    uri_github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",
                    uri_windows:"", uri_android:"", uri_apple:"",
                    uri_web:"web/taxes", uri:"web/taxes",
                    hosts:["github","web","javascript","finance"],
                    hostLinks:{github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",web:"web/taxes",javascript:"",finance:""}
                },
                {
                    title:"Health & Fitness Calculators",
                    des:"11-in-1: BMI/body-fat, TDEE/BMR, macros, weight-loss timeline, water intake, heart-rate zones, pace predictor, 1RM, due date, sleep cycles, steps converter",
                    category:"app",
                    uri_github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",
                    uri_windows:"", uri_android:"", uri_apple:"",
                    uri_web:"web/health", uri:"web/health",
                    hosts:["github","web","javascript","health"],
                    hostLinks:{github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",web:"web/health",javascript:"",health:""}
                },
                {
                    title:"Food & Nutrition Calculators",
                    des:"7-in-1: recipe scaler, cooking measurement converter, coffee brew ratio, BAC estimator, meal-prep cost, baking pan-size converter, caffeine tracker",
                    category:"app",
                    uri_github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",
                    uri_windows:"", uri_android:"", uri_apple:"",
                    uri_web:"web/food", uri:"web/food",
                    hosts:["github","web","javascript","food"],
                    hostLinks:{github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",web:"web/food",javascript:"",food:""}
                },
                {
                    title:"Home & DIY Calculators",
                    des:"9-in-1: paint quantity, tile/flooring, wallpaper, concrete/mulch volume, appliance electricity cost, solar payback, renovation budget, lawn coverage, plant spacing",
                    category:"app",
                    uri_github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",
                    uri_windows:"", uri_android:"", uri_apple:"",
                    uri_web:"web/home", uri:"web/home",
                    hosts:["github","web","javascript","home"],
                    hostLinks:{github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",web:"web/home",javascript:"",home:""}
                },
                {
                    title:"Automotive & Travel Calculators",
                    des:"9-in-1: trip fuel cost, EV charging, lease vs buy, true cost of ownership, road trip planner, currency converter, time zones, points/miles value, country tip",
                    category:"app",
                    uri_github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",
                    uri_windows:"", uri_android:"", uri_apple:"",
                    uri_web:"web/auto", uri:"web/auto",
                    hosts:["github","web","javascript","travel"],
                    hostLinks:{github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",web:"web/auto",javascript:"",travel:""}
                },
                {
                    title:"Productivity & Work Calculators",
                    des:"7-in-1: exact age + birthday countdown, date difference, freelance rate, project quote, Pomodoro planner, reading time, meeting cost",
                    category:"app",
                    uri_github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",
                    uri_windows:"", uri_android:"", uri_apple:"",
                    uri_web:"web/work", uri:"web/work",
                    hosts:["github","web","javascript","productivity"],
                    hostLinks:{github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",web:"web/work",javascript:"",productivity:""}
                },
                {
                    title:"Education & Career Calculators",
                    des:"5-in-1: GPA + grade-needed predictor, raise impact, job offer comparison, student budget, typing speed (WPM)",
                    category:"app",
                    uri_github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",
                    uri_windows:"", uri_android:"", uri_apple:"",
                    uri_web:"web/edu", uri:"web/edu",
                    hosts:["github","web","javascript","education"],
                    hostLinks:{github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",web:"web/edu",javascript:"",education:""}
                },
                {
                    title:"Lifestyle & Misc Calculators",
                    des:"5-in-1: wedding/event budget, pet age + lifetime cost, who-owes-whom splitter, gift planner, carbon footprint",
                    category:"app",
                    uri_github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",
                    uri_windows:"", uri_android:"", uri_apple:"",
                    uri_web:"web/life", uri:"web/life",
                    hosts:["github","web","javascript","lifestyle"],
                    hostLinks:{github:"https://github.com/Masrik-Dahir/Masrik-Dahir.github.io/tree/master/web",web:"web/life",javascript:"",lifestyle:""}
                },
                {
                    title:"Stock Market",
                    des:"PHP Server: Building financial model and charts for ETFs, Mutual Funds, Cryptocurrencies, and Options",
                    category:"app",
                    uri_github:"https://github.com/Masrik-Dahir/DATABASE_database",
                    uri_windows:"",
                    uri_android:"",
                    uri_apple:"",
                    uri_web:"software/stock-market",
                    uri:"software/stock-market",
                    hosts:["github","php","database","finance"],
                    hostLinks:{github:"https://github.com/Masrik-Dahir/DATABASE_database",php:"",database:"",finance:""}
                },
                {
                    title:"Employee Management System",
                    des:"NodeJS Server: CRUD Functionalities for employees",
                    category:"app",
                    uri_github:"https://github.com/Masrik-Dahir/Fastify_server",
                    uri_windows:"",
                    uri_android:"",
                    uri_apple:"",
                    uri_web:"software/employee-management",
                    uri:"software/employee-management",
                    hosts:["github","nodejs","database"],
                    hostLinks:{github:"https://github.com/Masrik-Dahir/Fastify_server",nodejs:"",database:""}
                },
            ]
        };
    },
    computed: {
        resultQuery(){
            var filtered = this.resources;
            if (this.activeTab !== 'all') {
                filtered = filtered.filter(item => item.category === this.activeTab);
            }
            if(this.searchQuery){
                filtered = filtered.filter((item)=>{
                    return this.searchQuery.toLowerCase().split(' ').every(v => item.title.toLowerCase().includes(v) || item.des.toLowerCase().includes(v))
                });
            }
            return filtered;
        },
        tabCounts() {
            var counts = { all: this.resources.length, library: 0, app: 0 };
            for (var i = 0; i < this.resources.length; i++) {
                counts[this.resources[i].category]++;
            }
            return counts;
        }
    },
    methods: {
        setTab(tab) { this.activeTab = tab; },
        hostUrl(item, host) {
            if (item.hostLinks && item.hostLinks[host]) return item.hostLinks[host];
            return '';
        },
        hostIcon(host) {
            var map = {
                pypi:         '<i class="fas fa-code" style="color:#3776ab"></i>',
                npm:          '<i class="fas fa-cube" style="color:#cb3837"></i>',
                nuget:        '<i class="fas fa-gem" style="color:#004880"></i>',
                maven:        '<i class="fas fa-coffee" style="color:#c71a36"></i>',
                crates:       '<i class="fas fa-cog" style="color:#dea584"></i>',
                rubygems:     '<i class="fas fa-gem" style="color:#e9573f"></i>',
                go:           '<i class="fas fa-terminal" style="color:#00add8"></i>',
                github:       '<i class="fab fa-github" style="color:#24292e"></i>',
                windows:      '<i class="fab fa-windows" style="color:#0078d4"></i>',
                android:      '<i class="fab fa-android" style="color:#3ddc84"></i>',
                apple:        '<i class="fab fa-apple" style="color:#555"></i>',
                web:          '<i class="fas fa-globe" style="color:#475569"></i>',
                research:     '<i class="fas fa-flask" style="color:#8b5cf6"></i>',
                python:       '<i class="fab fa-python" style="color:#3776ab"></i>',
                java:         '<i class="fab fa-java" style="color:#007396"></i>',
                javascript:   '<i class="fab fa-js" style="color:#f7df1e"></i>',
                nodejs:       '<i class="fab fa-node-js" style="color:#339933"></i>',
                php:          '<i class="fab fa-php" style="color:#777bb4"></i>',
                aws:          '<i class="fab fa-aws" style="color:#ff9900"></i>',
                database:     '<i class="fas fa-database" style="color:#336791"></i>',
                ml:           '<i class="fas fa-chart-line" style="color:#ff6f00"></i>',
                security:     '<i class="fas fa-shield-alt" style="color:#d32f2f"></i>',
                graph:        '<i class="fas fa-project-diagram" style="color:#0288d1"></i>',
                finance:      '<i class="fas fa-chart-bar" style="color:#2e7d32"></i>',
                /* Formula-page topical tags */
                health:       '<i class="fas fa-heartbeat" style="color:#e53e3e"></i>',
                food:         '<i class="fas fa-utensils" style="color:#dd6b20"></i>',
                home:         '<i class="fas fa-home" style="color:#2b6cb0"></i>',
                travel:       '<i class="fas fa-plane" style="color:#0ea5e9"></i>',
                productivity: '<i class="fas fa-tasks" style="color:#6366f1"></i>',
                education:    '<i class="fas fa-graduation-cap" style="color:#7c3aed"></i>',
                lifestyle:    '<i class="fas fa-star" style="color:#ec4899"></i>'
            };
            return map[host] || '<i class="fas fa-tag" style="color:#9ca3af"></i>';
        },
        hostLabel(host) {
            var map = {
                pypi:'PyPI', npm:'npm', nuget:'NuGet', maven:'Maven',
                crates:'Crates.io', rubygems:'RubyGems', go:'Go Pkg',
                github:'GitHub', windows:'Windows', android:'Android',
                apple:'App Store', web:'Web',
                research:'Research', python:'Python', java:'Java', javascript:'JavaScript',
                nodejs:'Node.js', php:'PHP', aws:'AWS',
                database:'Database', ml:'Machine Learning', security:'Security',
                graph:'Graph Theory', finance:'Finance',
                health:'Health', food:'Food', home:'Home', travel:'Travel',
                productivity:'Productivity', education:'Education', lifestyle:'Lifestyle'
            };
            return map[host] || host.charAt(0).toUpperCase() + host.slice(1);
        },
        categoryIcon(cat) {
            if (cat === 'library') return '<i class="fas fa-cubes"></i>';
            if (cat === 'app') return '<i class="fas fa-rocket"></i>';
            return '';
        },
        goToDoc(e, item) {
            if (e.target.closest('a')) return;
            if (item.uri_web) window.location.href = item.uri_web;
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
                    img:"https://d3dw5jtb3w1kgy.cloudfront.net/henrico.webp",
                    uri_2:"",
                    img_2:"",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"

                },
                {
                    title: "Henrico County Engineering Scholar",
                    des: "",
                    uri: "https://henrico.us/",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/henrico.webp",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"

                },
                {
                    title: "Altria Scholar",
                    des: "",
                    uri: "https://www.altria.com/en",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/altria.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"

                },
                {
                    title: "Summa Cum Laude",
                    des: "",
                    uri: "https://rar.vcu.edu/graduation/",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/summacumlaude.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"

                },
                {
                    title: "iCubed Scholar",
                    des: "",
                    uri: "https://icubed.vcu.edu/",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/icubed%20(1).png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"

                },
                {
                    title: "Deans List",
                    des: "",
                    uri: "https://egr.vcu.edu/current-students/deans-list/",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/deanslistlogo.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"

                },
                {
                    title: "Superintendent’s Scholar",
                    des: "",
                    uri: "https://henricoschools.us/division-leadership-team/",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/henrico.webp",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"

                },
                {
                    title: "CarMax Entrepreneur Scholar",
                    des: "",
                    uri: "https://www.carmax.com/",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/carmax.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"

                },
                {
                    title: "Susanne and Sam Dibert STEM Scholar",
                    des: "",
                    uri: "https://www.swagelok.com/",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/swagelok.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"

                },
                {
                    title: "Greater Richmond Relocation Center Scholar",
                    des: "",
                    uri: "http://richmondrelo.org/",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/grrc.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Harrison-Labouisse Memorial Scholar",
                    des: "",
                    uri: "https://www.cfrichmond.org/Apply-for-a-Scholarship/View-All-Scholarships?s=Harrison-Labouisse-Mayo+Memorial+Scholarship",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/Me66Jxa.png",
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
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/vcu_ram.png",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Masters of Science",
                    des: "",
                    uri: "https://egr.vcu.edu/",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/vcu_ram.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "AWS Certified Solutions Architect",
                    des: "",
                    uri: "https://www.credly.com/badges/12749f5b-e7fc-460d-a317-60a1ebc976fe/public_url",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/aws-certified-solutions-architect-associate.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "AWS Certified Developer",
                    des: "",
                    uri: "https://www.credly.com/badges/4ea74952-8783-44af-9425-119b2434bf38/public_url",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/acd.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "AWS Cloud practitioner",
                    des: "",
                    uri: "https://www.credly.com/badges/17619069-ea55-49da-bf46-ac605180477d/public_url",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/aws-certified-cloud-practitioner.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Databricks Fundamentals",
                    des: "",
                    uri: "https://credentials.databricks.com/3fc5d768-443c-40fa-828c-fedadb94ba5e#gs.fsb476",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/databricksfundamental.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Databricks Generative AI Fundamentals",
                    des: "",
                    uri: "https://credentials.databricks.com/65a906a0-cddf-4ef7-92d6-e4c8a35b8c97#gs.f0jlz6",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/databricksgenerativeai.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Postman API Fundamentals Student Expert",
                    des: "",
                    uri: "https://badgr.com/public/assertions/6VeZHynPSSCsqE6RQIA0_A?identity__email=masrikdahir@gmail.com",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/pafse.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "HackerRank Problem Solving Intermediate",
                    des: "",
                    uri: "https://www.hackerrank.com/certificates/5af21130d688",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/Problem%20Solving%20(Intermediate)%20Certificate.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "HackerRank Problem Solving Basic",
                    des: "",
                    uri: "https://www.hackerrank.com/certificates/0a8a402e77b1/",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/Problem%20Solving%20(Basic)%20Certificate.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "HackerRank Python Basic",
                    des: "",
                    uri: "https://www.hackerrank.com/certificates/4e15d1f36815",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/Python%20(Basic)%20Certificate.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Paper: Cronus",
                    des: "",
                    uri: "https://www.masrikdahir.com/pdf/Cronus_An_Automated_Feedback_Tool_for_Concept_Maps.pdf",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/ieee.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Paper: ClaimChain",
                    des: "",
                    uri: "https://www.masrikdahir.com/pdf/ClaimChain.pdf",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/ieee.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Poster: Cronus",
                    des: "",
                    uri: "https://www.masrikdahir.com/pdf/CronusPoster.pdf",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/vcu_ram.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Poster: ClaimChain",
                    des: "",
                    uri: "https://www.masrikdahir.com/pdf/NewClaimchainPoster.pdf",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/University-of-Missouri-Logo.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Poster: Security Operations Center",
                    des: "",
                    uri: "https://www.masrikdahir.com/pdf/CS%2023-318_Poster.pdf",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/vcu_ram.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Poster: Ram-pantries",
                    des: "",
                    uri: "https://www.masrikdahir.com/pdf/VCU_Health_Research.pdf",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/vcu_ram.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Essay: The Last Basketball Game",
                    des: "",
                    uri: "https://www.masrikdahir.com/pdf/The%20Hearing%202019-2020.pdf",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/Daco_6097739.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Accepted in George Mason",
                    des: "",
                    uri: "https://d3dw5jtb3w1kgy.cloudfront.net/Admission/George Mason.jpg",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/George_Mason_University_logo.svg.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Accepted in Virginia Tech",
                    des: "",
                    uri: "https://d3dw5jtb3w1kgy.cloudfront.net/Admission/Virginia Tech.jpg",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/Virginia-Tech-Logo.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Accepted in George Washington",
                    des: "",
                    uri: "https://d3dw5jtb3w1kgy.cloudfront.net/Admission/George Washington University.jpg",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/George_Washington_Athletics_logo.svg.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Accepted in Rensselaer",
                    des: "",
                    uri: "https://d3dw5jtb3w1kgy.cloudfront.net/Admission/Rensselaer.jpg",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/Rensselaer_at_Hartford_Seal.svg.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Accepted in Purdue",
                    des: "",
                    uri: "https://d3dw5jtb3w1kgy.cloudfront.net/Admission/Purdue.jpg",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/purdue.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Accepted in University of Maryland",
                    des: "",
                    uri: "https://d3dw5jtb3w1kgy.cloudfront.net/Admission/University of Maryland.jpg",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/University_of_Maryland_seal.svg.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "University of Richmond",
                    des: "",
                    uri: "https://d3dw5jtb3w1kgy.cloudfront.net/Admission/University of Richmond.jpg",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/university-of-richmond-logo-C721BEBDD6-seeklogo.com.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Accepted in James Madison University",
                    des: "",
                    uri: "https://d3dw5jtb3w1kgy.cloudfront.net/Admission/James Madison University Engineering.jpg",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/James-Madison-Dukes-Logo-2002.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Accepted in University of Vermont",
                    des: "",
                    uri: "https://d3dw5jtb3w1kgy.cloudfront.net/Admission/University of Vermont Honors College.jpg",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/Vermont_Catamounts_logo.svg.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Accepted in University of Iowa",
                    des: "",
                    uri: "https://d3dw5jtb3w1kgy.cloudfront.net/Admission/University of Iowa.jpg",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/iowa_hawkeyes_logo_wordmark_2019_sportslogosnet-8297.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Accepted in University of PittsBurgh",
                    des: "",
                    uri: "https://d3dw5jtb3w1kgy.cloudfront.net/Admission/University of Pittsburgh.jpg",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/University_of_Pittsburgh_seal.svg.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Accepted in Michigan State University",
                    des: "",
                    uri: "https://d3dw5jtb3w1kgy.cloudfront.net/Admission/Michigan State University.jpg",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/Michigan-State-University-Logo.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Accepted in York College",
                    des: "",
                    uri: "https://d3dw5jtb3w1kgy.cloudfront.net/Admission/York University.jpg",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/york college.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Accepted in Roanoke University",
                    des: "",
                    uri: "https://d3dw5jtb3w1kgy.cloudfront.net/Admission/Roanoke College.jpg",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/RoanokeCollegeWordmark.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },




                {
                    title: "Trustee Award: Roanoke University",
                    des: "",
                    uri: "https://d3dw5jtb3w1kgy.cloudfront.net/Admission/Roanoke University Scholarship.jpg",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/RoanokeCollegeWordmark.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Presidential Scholarship: University of PittsBurgh",
                    des: "",
                    uri: "https://d3dw5jtb3w1kgy.cloudfront.net/Admission/University of PittsBurgh Presidential Scholarship.jpg",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/University_of_Pittsburgh_seal.svg.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Presidential Scholarship: York College",
                    des: "",
                    uri: "https://d3dw5jtb3w1kgy.cloudfront.net/Admission/York University Scholarship.jpg",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/york%20college.png",
                    uri_2: "",
                    img_2: "",
                    style: "width: 1vw; min-width: calc(70px + 0.7vw)"
                },
                {
                    title: "Clark Scholarship: Virginia Tech",
                    des: "",
                    uri: "https://d3dw5jtb3w1kgy.cloudfront.net/Admission/Virginia Tech Scholarship.jpg",
                    img: "https://d3dw5jtb3w1kgy.cloudfront.net/Virginia-Tech-Logo.png",
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
                { title: "United States", abv: "USA", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/United States/img.png", url: "https://www.masrikdahir.com/map", id: "scroll_USA" },
                { title: "Canada", abv: "CAN", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Canada/img.png", url: "https://www.masrikdahir.com/map/northamerica", id: "scroll_CAN" },
                { title: "Bangladesh", abv: "BGD", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Bangladesh/img.png", url: "https://www.masrikdahir.com/map/asia", id: "scroll_BGD" },
                { title: "Afghanistan", abv: "AFG", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Afghanistan/img.png", url: "https://www.masrikdahir.com/map/afg", id: "scroll_AFG" },
                { title: "Albania", abv: "ALB", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Albania/img.png", url: "https://www.masrikdahir.com/map/alb", id: "scroll_ALB" },
                { title: "Algeria", abv: "DZA", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Algeria/img.png", url: "https://www.masrikdahir.com/map/dza", id: "scroll_DZA" },
                { title: "Andorra", abv: "AND", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Andorra/img.png", url: "https://www.masrikdahir.com/map/and", id: "scroll_AND" },
                { title: "Angola", abv: "AGO", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Angola/img.png", url: "https://www.masrikdahir.com/map/ago", id: "scroll_AGO" },
                { title: "Antigua & Deps", abv: "ATG", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Antigua & Deps/img.png", url: "https://www.masrikdahir.com/map/atg", id: "scroll_ATG" },
                { title: "Argentina", abv: "ARG", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Argentina/img.png", url: "https://www.masrikdahir.com/map/arg", id: "scroll_ARG" },
                { title: "Armenia", abv: "ARM", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Armenia/img.png", url: "https://www.masrikdahir.com/map/arm", id: "scroll_ARM" },
                { title: "Australia", abv: "AUS", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Australia/img.png", url: "https://www.masrikdahir.com/map/australia", id: "scroll_AUS" },
                { title: "Austria", abv: "AUT", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Austria/img.png", url: "https://www.masrikdahir.com/map/aut", id: "scroll_AUT" },
                { title: "Azerbaijan", abv: "AZE", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Azerbaijan/img.png", url: "https://www.masrikdahir.com/map/aze", id: "scroll_AZE" },
                { title: "Bahamas", abv: "BHS", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Bahamas/img.png", url: "https://www.masrikdahir.com/map/bhs", id: "scroll_BHS" },
                { title: "Bahrain", abv: "BHR", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Bahrain/img.png", url: "https://www.masrikdahir.com/map/bhr", id: "scroll_BHR" },
                { title: "Barbados", abv: "BRB", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Barbados/img.png", url: "https://www.masrikdahir.com/map/brb", id: "scroll_BRB" },
                { title: "Belarus", abv: "BLR", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Belarus/img.png", url: "https://www.masrikdahir.com/map/blr", id: "scroll_BLR" },
                { title: "Belgium", abv: "BEL", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Belgium/img.png", url: "https://www.masrikdahir.com/map/bel", id: "scroll_BEL" },
                { title: "Belize", abv: "BLZ", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Belize/img.png", url: "https://www.masrikdahir.com/map/blz", id: "scroll_BLZ" },
                { title: "Benin", abv: "BEN", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Benin/img.png", url: "https://www.masrikdahir.com/map/ben", id: "scroll_BEN" },
                { title: "Bhutan", abv: "BTN", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Bhutan/img.png", url: "https://www.masrikdahir.com/map/btn", id: "scroll_BTN" },
                { title: "Bolivia", abv: "BOL", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Bolivia/img.png", url: "https://www.masrikdahir.com/map/bol", id: "scroll_BOL" },
                { title: "Bosnia Herzegovina", abv: "BIH", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Bosnia Herzegovina/img.png", url: "https://www.masrikdahir.com/map/bih", id: "scroll_BIH" },
                { title: "Botswana", abv: "BWA", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Botswana/img.png", url: "https://www.masrikdahir.com/map/bwa", id: "scroll_BWA" },
                { title: "Brazil", abv: "BRA", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Brazil/img.png", url: "https://www.masrikdahir.com/map/bra", id: "scroll_BRA" },
                { title: "Brunei", abv: "BRN", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Brunei/img.png", url: "https://www.masrikdahir.com/map/brn", id: "scroll_BRN" },
                { title: "Bulgaria", abv: "BGR", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Bulgaria/img.png", url: "https://www.masrikdahir.com/map/bgr", id: "scroll_BGR" },
                { title: "Burkina", abv: "BFA", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Burkina/img.png", url: "https://www.masrikdahir.com/map/bfa", id: "scroll_BFA" },
                { title: "Burundi", abv: "BDI", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Burundi/img.png", url: "https://www.masrikdahir.com/map/bdi", id: "scroll_BDI" },
                { title: "Cambodia", abv: "KHM", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Cambodia/img.png", url: "https://www.masrikdahir.com/map/khm", id: "scroll_KHM" },
                { title: "Cameroon", abv: "CMR", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Cameroon/img.png", url: "https://www.masrikdahir.com/map/cmr", id: "scroll_CMR" },
                { title: "Cape Verde", abv: "CPV", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Cape Verde/img.png", url: "https://www.masrikdahir.com/map/cpv", id: "scroll_CPV" },
                { title: "Central African Republic", abv: "CAF", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Central African Republic/img.png", url: "https://www.masrikdahir.com/map/caf", id: "scroll_CAF" },
                { title: "Chad", abv: "TCD", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Chad/img.png", url: "https://www.masrikdahir.com/map/tcd", id: "scroll_TCD" },
                { title: "Chile", abv: "CHL", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Chile/img.png", url: "https://www.masrikdahir.com/map/chl", id: "scroll_CHL" },
                { title: "China", abv: "CHN", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/China/img.png", url: "https://www.masrikdahir.com/map/chn", id: "scroll_CHN" },
                { title: "Colombia", abv: "COL", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Colombia/img.png", url: "https://www.masrikdahir.com/map/col", id: "scroll_COL" },
                { title: "Comoros", abv: "COM", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Comoros/img.png", url: "https://www.masrikdahir.com/map/com", id: "scroll_COM" },
                { title: "Congo", abv: "COG", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Congo/img.png", url: "https://www.masrikdahir.com/map/cog", id: "scroll_COG" },
                { title: "Democratic Republic of Congo", abv: "COD", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Democratic Republic of Congo/img.png", url: "https://www.masrikdahir.com/map/cod", id: "scroll_COD" },
                { title: "Costa Rica", abv: "CRI", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Costa Rica/img.png", url: "https://www.masrikdahir.com/map/cri", id: "scroll_CRI" },
                { title: "Croatia", abv: "HRV", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Croatia/img.png", url: "https://www.masrikdahir.com/map/hrv", id: "scroll_HRV" },
                { title: "Cuba", abv: "CUB", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Cuba/img.png", url: "https://www.masrikdahir.com/map/cub", id: "scroll_CUB" },
                { title: "Cyprus", abv: "CYP", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Cyprus/img.png", url: "https://www.masrikdahir.com/map/cyp", id: "scroll_CYP" },
                { title: "Czech Republic", abv: "CZE", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Czech Republic/img.png", url: "https://www.masrikdahir.com/map/cze", id: "scroll_CZE" },
                { title: "Denmark", abv: "DNK", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Denmark/img.png", url: "https://www.masrikdahir.com/map/dnk", id: "scroll_DNK" },
                { title: "Djibouti", abv: "DJI", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Djibouti/img.png", url: "https://www.masrikdahir.com/map/dji", id: "scroll_DJI" },
                { title: "Dominica", abv: "DMA", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Dominica/img.png", url: "https://www.masrikdahir.com/map/dma", id: "scroll_DMA" },
                { title: "Dominican Republic", abv: "DOM", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Dominican Republic/img.png", url: "https://www.masrikdahir.com/map/dom", id: "scroll_DOM" },
                { title: "East Timor", abv: "TLS", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/East Timor/img.png", url: "https://www.masrikdahir.com/map/tls", id: "scroll_TLS" },
                { title: "Ecuador", abv: "ECU", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Ecuador/img.png", url: "https://www.masrikdahir.com/map/ecu", id: "scroll_ECU" },
                { title: "Egypt", abv: "EGY", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Egypt/img.png", url: "https://www.masrikdahir.com/map/egy", id: "scroll_EGY" },
                { title: "El Salvador", abv: "SLV", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/El Salvador/img.png", url: "https://www.masrikdahir.com/map/slv", id: "scroll_SLV" },
                { title: "Equatorial Guinea", abv: "GNQ", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Equatorial Guinea/img.png", url: "https://www.masrikdahir.com/map/gnq", id: "scroll_GNQ" },
                { title: "Eritrea", abv: "ERI", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Eritrea/img.png", url: "https://www.masrikdahir.com/map/eri", id: "scroll_ERI" },
                { title: "Estonia", abv: "EST", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Estonia/img.png", url: "https://www.masrikdahir.com/map/est", id: "scroll_EST" },
                { title: "Ethiopia", abv: "ETH", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Ethiopia/img.png", url: "https://www.masrikdahir.com/map/eth", id: "scroll_ETH" },
                { title: "Fiji", abv: "FJI", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Fiji/img.png", url: "https://www.masrikdahir.com/map/fji", id: "scroll_FJI" },
                { title: "Finland", abv: "FIN", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Finland/img.png", url: "https://www.masrikdahir.com/map/fin", id: "scroll_FIN" },
                { title: "France", abv: "FRA", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/France/img.png", url: "https://www.masrikdahir.com/map/fra", id: "scroll_FRA" },
                { title: "Gabon", abv: "GAB", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Gabon/img.png", url: "https://www.masrikdahir.com/map/gab", id: "scroll_GAB" },
                { title: "Gambia", abv: "GMB", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Gambia/img.png", url: "https://www.masrikdahir.com/map/gmb", id: "scroll_GMB" },
                { title: "Georgia", abv: "GEO", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Georgia/img.png", url: "https://www.masrikdahir.com/map/geo", id: "scroll_GEO" },
                { title: "Germany", abv: "DEU", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Germany/img.png", url: "https://www.masrikdahir.com/map/deu", id: "scroll_DEU" },
                { title: "Ghana", abv: "GHA", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Ghana/img.png", url: "https://www.masrikdahir.com/map/gha", id: "scroll_GHA" },
                { title: "Greece", abv: "GRC", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Greece/img.png", url: "https://www.masrikdahir.com/map/grc", id: "scroll_GRC" },
                { title: "Grenada", abv: "GRD", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Grenada/img.png", url: "https://www.masrikdahir.com/map/grd", id: "scroll_GRD" },
                { title: "Guatemala", abv: "GTM", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Guatemala/img.png", url: "https://www.masrikdahir.com/map/gtm", id: "scroll_GTM" },
                { title: "Guinea", abv: "GIN", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Guinea/img.png", url: "https://www.masrikdahir.com/map/gin", id: "scroll_GIN" },
                { title: "Guinea Bissau", abv: "GNB", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Guinea Bissau/img.png", url: "https://www.masrikdahir.com/map/gnb", id: "scroll_GNB" },
                { title: "Guyana", abv: "GUY", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Guyana/img.png", url: "https://www.masrikdahir.com/map/guy", id: "scroll_GUY" },
                { title: "Haiti", abv: "HTI", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Haiti/img.png", url: "https://www.masrikdahir.com/map/hti", id: "scroll_HTI" },
                { title: "Honduras", abv: "HND", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Honduras/img.png", url: "https://www.masrikdahir.com/map/hnd", id: "scroll_HND" },
                { title: "Hungary", abv: "HUN", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Hungary/img.png", url: "https://www.masrikdahir.com/map/hun", id: "scroll_HUN" },
                { title: "Iceland", abv: "ISL", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Iceland/img.png", url: "https://www.masrikdahir.com/map/isl", id: "scroll_ISL" },
                { title: "India", abv: "IND", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/India/img.png", url: "https://www.masrikdahir.com/map/ind", id: "scroll_IND" },
                { title: "Indonesia", abv: "IDN", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Indonesia/img.png", url: "https://www.masrikdahir.com/map/idn", id: "scroll_IDN" },
                { title: "Iran", abv: "IRN", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Iran/img.png", url: "https://www.masrikdahir.com/map/irn", id: "scroll_IRN" },
                { title: "Iraq", abv: "IRQ", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Iraq/img.png", url: "https://www.masrikdahir.com/map/irq", id: "scroll_IRQ" },
                { title: "Ireland", abv: "IRL", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Ireland/img.png", url: "https://www.masrikdahir.com/map/irl", id: "scroll_IRL" },
                { title: "Israel", abv: "ISR", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Israel/img.png", url: "https://www.masrikdahir.com/map/isr", id: "scroll_ISR" },
                { title: "Italy", abv: "ITA", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Italy/img.png", url: "https://www.masrikdahir.com/map/ita", id: "scroll_ITA" },
                { title: "Ivory Coast", abv: "CIV", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Ivory Coast/img.png", url: "https://www.masrikdahir.com/map/civ", id: "scroll_CIV" },
                { title: "Jamaica", abv: "JAM", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Jamaica/img.png", url: "https://www.masrikdahir.com/map/jam", id: "scroll_JAM" },
                { title: "Japan", abv: "JPN", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Japan/img.png", url: "https://www.masrikdahir.com/map/jpn", id: "scroll_JPN" },
                { title: "Jordan", abv: "JOR", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Jordan/img.png", url: "https://www.masrikdahir.com/map/jor", id: "scroll_JOR" },
                { title: "Kazakhstan", abv: "KAZ", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Kazakhstan/img.png", url: "https://www.masrikdahir.com/map/kaz", id: "scroll_KAZ" },
                { title: "Kenya", abv: "KEN", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Kenya/img.png", url: "https://www.masrikdahir.com/map/ken", id: "scroll_KEN" },
                { title: "Kiribati", abv: "KIR", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Kiribati/img.png", url: "https://www.masrikdahir.com/map/kir", id: "scroll_KIR" },
                { title: "North Korea", abv: "PRK", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/North Korea/img.png", url: "https://www.masrikdahir.com/map/prk", id: "scroll_PRK" },
                { title: "South Korea", abv: "KOR", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/South Korea/img.png", url: "https://www.masrikdahir.com/map/kor", id: "scroll_KOR" },
                { title: "Kosovo", abv: "XKX", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Kosovo/img.png", url: "https://www.masrikdahir.com/map/xkx", id: "scroll_XKX" },
                { title: "Kuwait", abv: "KWT", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Kuwait/img.png", url: "https://www.masrikdahir.com/map/kwt", id: "scroll_KWT" },
                { title: "Kyrgyzstan", abv: "KGZ", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Kyrgyzstan/img.png", url: "https://www.masrikdahir.com/map/kgz", id: "scroll_KGZ" },
                { title: "Laos", abv: "LAO", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Laos/img.png", url: "https://www.masrikdahir.com/map/lao", id: "scroll_LAO" },
                { title: "Latvia", abv: "LVA", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Latvia/img.png", url: "https://www.masrikdahir.com/map/lva", id: "scroll_LVA" },
                { title: "Lebanon", abv: "LBN", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Lebanon/img.png", url: "https://www.masrikdahir.com/map/lbn", id: "scroll_LBN" },
                { title: "Lesotho", abv: "LSO", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Lesotho/img.png", url: "https://www.masrikdahir.com/map/lso", id: "scroll_LSO" },
                { title: "Liberia", abv: "LBR", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Liberia/img.png", url: "https://www.masrikdahir.com/map/lbr", id: "scroll_LBR" },
                { title: "Libya", abv: "LBY", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Libya/img.png", url: "https://www.masrikdahir.com/map/lby", id: "scroll_LBY" },
                { title: "Liechtenstein", abv: "LIE", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Liechtenstein/img.png", url: "https://www.masrikdahir.com/map/lie", id: "scroll_LIE" },
                { title: "Lithuania", abv: "LTU", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Lithuania/img.png", url: "https://www.masrikdahir.com/map/ltu", id: "scroll_LTU" },
                { title: "Luxembourg", abv: "LUX", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Luxembourg/img.png", url: "https://www.masrikdahir.com/map/lux", id: "scroll_LUX" },
                { title: "Madagascar", abv: "MDG", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Madagascar/img.png", url: "https://www.masrikdahir.com/map/mdg", id: "scroll_MDG" },
                { title: "Malawi", abv: "MWI", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Malawi/img.png", url: "https://www.masrikdahir.com/map/mwi", id: "scroll_MWI" },
                { title: "Malaysia", abv: "MYS", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Malaysia/img.png", url: "https://www.masrikdahir.com/map/mys", id: "scroll_MYS" },
                { title: "Maldives", abv: "MDV", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Maldives/img.png", url: "https://www.masrikdahir.com/map/mdv", id: "scroll_MDV" },
                { title: "Mali", abv: "MLI", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Mali/img.png", url: "https://www.masrikdahir.com/map/mli", id: "scroll_MLI" },
                { title: "Malta", abv: "MLT", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Malta/img.png", url: "https://www.masrikdahir.com/map/mlt", id: "scroll_MLT" },
                { title: "Marshall Islands", abv: "MHL", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Marshall Islands/img.png", url: "https://www.masrikdahir.com/map/mhl", id: "scroll_MHL" },
                { title: "Mauritania", abv: "MRT", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Mauritania/img.png", url: "https://www.masrikdahir.com/map/mrt", id: "scroll_MRT" },
                { title: "Mauritius", abv: "MUS", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Mauritius/img.png", url: "https://www.masrikdahir.com/map/mus", id: "scroll_MUS" },
                { title: "Mexico", abv: "MEX", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Mexico/img.png", url: "https://www.masrikdahir.com/map/mex", id: "scroll_MEX" },
                { title: "Micronesia", abv: "FSM", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Micronesia/img.png", url: "https://www.masrikdahir.com/map/fsm", id: "scroll_FSM" },
                { title: "Moldova", abv: "MDA", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Moldova/img.png", url: "https://www.masrikdahir.com/map/mda", id: "scroll_MDA" },
                { title: "Monaco", abv: "MCO", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Monaco/img.png", url: "https://www.masrikdahir.com/map/mco", id: "scroll_MCO" },
                { title: "Mongolia", abv: "MNG", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Mongolia/img.png", url: "https://www.masrikdahir.com/map/mng", id: "scroll_MNG" },
                { title: "Montenegro", abv: "MNE", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Montenegro/img.png", url: "https://www.masrikdahir.com/map/mne", id: "scroll_MNE" },
                { title: "Morocco", abv: "MAR", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Morocco/img.png", url: "https://www.masrikdahir.com/map/mar", id: "scroll_MAR" },
                { title: "Mozambique", abv: "MOZ", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Mozambique/img.png", url: "https://www.masrikdahir.com/map/moz", id: "scroll_MOZ" },
                { title: "Myanmar", abv: "MMR", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Myanmar/img.png", url: "https://www.masrikdahir.com/map/mmr", id: "scroll_MMR" },
                { title: "Namibia", abv: "NAM", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Namibia/img.png", url: "https://www.masrikdahir.com/map/nam", id: "scroll_NAM" },
                { title: "Nauru", abv: "NRU", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Nauru/img.png", url: "https://www.masrikdahir.com/map/nru", id: "scroll_NRU" },
                { title: "Nepal", abv: "NPL", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Nepal/img.png", url: "https://www.masrikdahir.com/map/npl", id: "scroll_NPL" },
                { title: "Netherlands", abv: "NLD", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Netherlands/img.png", url: "https://www.masrikdahir.com/map/nld", id: "scroll_NLD" },
                { title: "New Zealand", abv: "NZL", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/New Zealand/img.png", url: "https://www.masrikdahir.com/map/australia", id: "scroll_NZL" },
                { title: "Nicaragua", abv: "NIC", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Nicaragua/img.png", url: "https://www.masrikdahir.com/map/nic", id: "scroll_NIC" },
                { title: "Niger", abv: "NER", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Niger/img.png", url: "https://www.masrikdahir.com/map/ner", id: "scroll_NER" },
                { title: "Nigeria", abv: "NGA", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Nigeria/img.png", url: "https://www.masrikdahir.com/map/nga", id: "scroll_NGA" },
                { title: "North Macedonia", abv: "MKD", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/North Macedonia/img.png", url: "https://www.masrikdahir.com/map/mkd", id: "scroll_MKD" },
                { title: "Norway", abv: "NOR", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Norway/img.png", url: "https://www.masrikdahir.com/map/nor", id: "scroll_NOR" },
                { title: "Oman", abv: "OMN", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Oman/img.png", url: "https://www.masrikdahir.com/map/omn", id: "scroll_OMN" },
                { title: "Pakistan", abv: "PAK", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Pakistan/img.png", url: "https://www.masrikdahir.com/map/pak", id: "scroll_PAK" },
                { title: "Palau", abv: "PLW", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Palau/img.png", url: "https://www.masrikdahir.com/map/plw", id: "scroll_PLW" },
                { title: "Panama", abv: "PAN", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Panama/img.png", url: "https://www.masrikdahir.com/map/pan", id: "scroll_PAN" },
                { title: "Papua New Guinea", abv: "PNG", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Papua New Guinea/img.png", url: "https://www.masrikdahir.com/map/png", id: "scroll_PNG" },
                { title: "Paraguay", abv: "PRY", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Paraguay/img.png", url: "https://www.masrikdahir.com/map/pry", id: "scroll_PRY" },
                { title: "Peru", abv: "PER", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Peru/img.png", url: "https://www.masrikdahir.com/map/per", id: "scroll_PER" },
                { title: "Philippines", abv: "PHL", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Philippines/img.png", url: "https://www.masrikdahir.com/map/phl", id: "scroll_PHL" },
                { title: "Poland", abv: "POL", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Poland/img.png", url: "https://www.masrikdahir.com/map/pol", id: "scroll_POL" },
                { title: "Portugal", abv: "PRT", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Portugal/img.png", url: "https://www.masrikdahir.com/map/prt", id: "scroll_PRT" },
                { title: "Qatar", abv: "QAT", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Qatar/img.png", url: "https://www.masrikdahir.com/map/qat", id: "scroll_QAT" },
                { title: "Romania", abv: "ROU", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Romania/img.png", url: "https://www.masrikdahir.com/map/rou", id: "scroll_ROU" },
                { title: "Russia", abv: "RUS", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Russia/img.png", url: "https://www.masrikdahir.com/map/rus", id: "scroll_RUS" },
                { title: "Rwanda", abv: "RWA", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Rwanda/img.png", url: "https://www.masrikdahir.com/map/rwa", id: "scroll_RWA" },
                { title: "Saint Kitts and Nevis", abv: "KNA", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Saint Kitts and Nevis/img.png", url: "https://www.masrikdahir.com/map/kna", id: "scroll_KNA" },
                { title: "Saint Lucia", abv: "LCA", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Saint Lucia/img.png", url: "https://www.masrikdahir.com/map/lca", id: "scroll_LCA" },
                { title: "Saint Vincent and the Grenadines", abv: "VCT", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Saint Vincent and the Grenadines/img.png", url: "https://www.masrikdahir.com/map/vct", id: "scroll_VCT" },
                { title: "Samoa", abv: "WSM", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Samoa/img.png", url: "https://www.masrikdahir.com/map/wsm", id: "scroll_WSM" },
                { title: "San Marino", abv: "SMR", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/San Marino/img.png", url: "https://www.masrikdahir.com/map/smr", id: "scroll_SMR" },
                { title: "Sao Tome and Principe", abv: "STP", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Sao Tome and Principe/img.png", url: "https://www.masrikdahir.com/map/stp", id: "scroll_STP" },
                { title: "Saudi Arabia", abv: "SAU", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Saudi Arabia/img.png", url: "https://www.masrikdahir.com/map/sau", id: "scroll_SAU" },
                { title: "Senegal", abv: "SEN", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Senegal/img.png", url: "https://www.masrikdahir.com/map/sen", id: "scroll_SEN" },
                { title: "Serbia", abv: "SRB", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Serbia/img.png", url: "https://www.masrikdahir.com/map/srb", id: "scroll_SRB" },
                { title: "Seychelles", abv: "SYC", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Seychelles/img.png", url: "https://www.masrikdahir.com/map/syc", id: "scroll_SYC" },
                { title: "Sierra Leone", abv: "SLE", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Sierra Leone/img.png", url: "https://www.masrikdahir.com/map/sle", id: "scroll_SLE" },
                { title: "Singapore", abv: "SGP", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Singapore/img.png", url: "https://www.masrikdahir.com/map/sgp", id: "scroll_SGP" },
                { title: "Slovakia", abv: "SVK", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Slovakia/img.png", url: "https://www.masrikdahir.com/map/svk", id: "scroll_SVK" },
                { title: "Slovenia", abv: "SVN", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Slovenia/img.png", url: "https://www.masrikdahir.com/map/svn", id: "scroll_SVN" },
                { title: "Solomon Islands", abv: "SLB", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Solomon Islands/img.png", url: "https://www.masrikdahir.com/map/slb", id: "scroll_SLB" },
                { title: "Somalia", abv: "SOM", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Somalia/img.png", url: "https://www.masrikdahir.com/map/som", id: "scroll_SOM" },
                { title: "South Africa", abv: "ZAF", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/South Africa/img.png", url: "https://www.masrikdahir.com/map/zaf", id: "scroll_ZAF" },
                { title: "South Sudan", abv: "SSD", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/South Sudan/img.png", url: "https://www.masrikdahir.com/map/ssd", id: "scroll_SSD" },
                { title: "Spain", abv: "ESP", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Spain/img.png", url: "https://www.masrikdahir.com/map/esp", id: "scroll_ESP" },
                { title: "Sri Lanka", abv: "LKA", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Sri Lanka/img.png", url: "https://www.masrikdahir.com/map/lka", id: "scroll_LKA" },
                { title: "Sudan", abv: "SDN", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Sudan/img.png", url: "https://www.masrikdahir.com/map/sdn", id: "scroll_SDN" },
                { title: "Suriname", abv: "SUR", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Suriname/img.png", url: "https://www.masrikdahir.com/map/sur", id: "scroll_SUR" },
                { title: "Sweden", abv: "SWE", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Sweden/img.png", url: "https://www.masrikdahir.com/map/swe", id: "scroll_SWE" },
                { title: "Switzerland", abv: "CHE", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Switzerland/img.png", url: "https://www.masrikdahir.com/map/che", id: "scroll_CHE" },
                { title: "Syria", abv: "SYR", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Syria/img.png", url: "https://www.masrikdahir.com/map/syr", id: "scroll_SYR" },
                { title: "Taiwan", abv: "TWN", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Taiwan/img.png", url: "https://www.masrikdahir.com/map/twn", id: "scroll_TWN" },
                { title: "Tajikistan", abv: "TJK", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Tajikistan/img.png", url: "https://www.masrikdahir.com/map/tjk", id: "scroll_TJK" },
                { title: "Tanzania", abv: "TZA", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Tanzania/img.png", url: "https://www.masrikdahir.com/map/tza", id: "scroll_TZA" },
                { title: "Thailand", abv: "THA", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Thailand/img.png", url: "https://www.masrikdahir.com/map/tha", id: "scroll_THA" },
                { title: "Timor Leste", abv: "TLS", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Timor Leste/img.png", url: "https://www.masrikdahir.com/map/tls", id: "scroll_TLS" },
                { title: "Togo", abv: "TGO", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Togo/img.png", url: "https://www.masrikdahir.com/map/tgo", id: "scroll_TGO" },
                { title: "Tonga", abv: "TON", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Tonga/img.png", url: "https://www.masrikdahir.com/map/ton", id: "scroll_TON" },
                { title: "Trinidad and Tobago", abv: "TTO", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Trinidad and Tobago/img.png", url: "https://www.masrikdahir.com/map/tto", id: "scroll_TTO" },
                { title: "Tunisia", abv: "TUN", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Tunisia/img.png", url: "https://www.masrikdahir.com/map/tun", id: "scroll_TUN" },
                { title: "Turkey", abv: "TUR", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Turkey/img.png", url: "https://www.masrikdahir.com/map/tur", id: "scroll_TUR" },
                { title: "Turkmenistan", abv: "TKM", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Turkmenistan/img.png", url: "https://www.masrikdahir.com/map/tkm", id: "scroll_TKM" },
                { title: "Tuvalu", abv: "TUV", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Tuvalu/img.png", url: "https://www.masrikdahir.com/map/tuv", id: "scroll_TUV" },
                { title: "Uganda", abv: "UGA", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Uganda/img.png", url: "https://www.masrikdahir.com/map/uga", id: "scroll_UGA" },
                { title: "Ukraine", abv: "UKR", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Ukraine/img.png", url: "https://www.masrikdahir.com/map/ukr", id: "scroll_UKR" },
                { title: "United Arab Emirates", abv: "ARE", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/United Arab Emirates/img.png", url: "https://www.masrikdahir.com/map/are", id: "scroll_ARE" },
                { title: "United Kingdom", abv: "GBR", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/United Kingdom/img.png", url: "https://www.masrikdahir.com/map/gbr", id: "scroll_GBR" },
                { title: "Uruguay", abv: "URY", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Uruguay/img.png", url: "https://www.masrikdahir.com/map/ury", id: "scroll_URY" },
                { title: "Uzbekistan", abv: "UZB", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Uzbekistan/img.png", url: "https://www.masrikdahir.com/map/uzb", id: "scroll_UZB" },
                { title: "Vanuatu", abv: "VUT", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Vanuatu/img.png", url: "https://www.masrikdahir.com/map/vut", id: "scroll_VUT" },
                { title: "Vatican City", abv: "VAT", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Vatican City/img.png", url: "https://www.masrikdahir.com/map/vat", id: "scroll_VAT" },
                { title: "Venezuela", abv: "VEN", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Venezuela/img.png", url: "https://www.masrikdahir.com/map/ven", id: "scroll_VEN" },
                { title: "Vietnam", abv: "VNM", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Vietnam/img.png", url: "https://www.masrikdahir.com/map/vnm", id: "scroll_VNM" },
                { title: "Yemen", abv: "YEM", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Yemen/img.png", url: "https://www.masrikdahir.com/map/yem", id: "scroll_YEM" },
                { title: "Zambia", abv: "ZMB", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Zambia/img.png", url: "https://www.masrikdahir.com/map/zmb", id: "scroll_ZMB" },
                { title: "Zimbabwe", abv: "ZWE", image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Zimbabwe/img.png", url: "https://www.masrikdahir.com/map/zwe", id: "scroll_ZWE" }

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
        scrollToSection(sectionId, fallbackUrl) {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            } else if (fallbackUrl) {
                window.location.href = fallbackUrl;
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
                    abv: "CA",
                    image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/California/img.png",
                    url: "https://www.masrikdahir.com/map/ca"
                },
                {
                    title: "Nevada",
                    abv: "NV",
                    image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Nevada/img.png",
                    url: "https://www.masrikdahir.com/map/nv"
                },
                {
                    title: "Arizona",
                    abv: "AZ",
                    image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Arizona/img.png",
                    url: "https://www.masrikdahir.com/map/az"
                },
                {
                    title:"Virginia",
                    abv:"VA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Virginia/img.png",
                    url:"https://www.masrikdahir.com/map/va",
                },
                {
                    title:"New York",
                    abv:"NY",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/New York/img.png",
                    url:"https://www.masrikdahir.com/map/ny",
                },
                {
                    title:"Maine",
                    abv:"ME",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Maine/img.png",
                    url:"https://www.masrikdahir.com/map/me",
                },
                {
                    title:"Kentucky",
                    abv:"KY",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Kentucky/img.png",
                    url:"https://www.masrikdahir.com/map/ky",
                },
                {
                    title:"Vermont",
                    abv:"VT",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Vermont/img.png",
                    url:"https://www.masrikdahir.com/map/vt",
                },
                {
                    title:"New Hampshire",
                    abv:"NH",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/New Hampshire/img.png",
                    url:"https://www.masrikdahir.com/map/nh",
                },

                {
                    title:"Massachusetts",
                    abv:"MA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Massachusetts/img.png",
                    url:"https://www.masrikdahir.com/map/ma",
                },
                {
                    title:"Connecticut",
                    abv:"CT",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Connecticut/img.png",
                    url:"https://www.masrikdahir.com/map/ct",
                },
                {
                    title:"New Jersey",
                    abv:"NJ",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/New Jersey/img.png",
                    url:"https://www.masrikdahir.com/map/nj",
                },
                {
                    title:"West Virginia",
                    abv:"WV",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/West Virginia/img.png",
                    url:"https://www.masrikdahir.com/map/wv",
                },
                {
                    title:"Maryland",
                    abv:"MD",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Maryland/img.png",
                    url:"https://www.masrikdahir.com/map/md",
                },
                {
                    title:"Delaware",
                    abv:"DE",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Delaware/img.png",
                    url:"https://www.masrikdahir.com/map/de",
                },
                {
                    title:"North Carolina",
                    abv:"NC",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/North Carolina/img.png",
                    url:"https://www.masrikdahir.com/map/nc",
                },
                {
                    title:"Indiana",
                    abv:"IN",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Indiana/img.png",
                    url:"https://www.masrikdahir.com/map/in",
                },
                {
                    title:"Tennessee",
                    abv:"TN",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Tennessee/img.png",
                    url:"https://www.masrikdahir.com/map/tn",
                },
                {
                    title:"Washington DC",
                    abv:"DC",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Washington DC/img.png",
                    url:"https://www.masrikdahir.com/map/dc",
                },
                {
                    title:"Pennsylvania",
                    abv:"PA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Pennsylvania/img.png",
                    url:"https://www.masrikdahir.com/map/pa",
                },
                {
                    title:"South Carolina",
                    abv:"SC",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/South Carolina/img.png",
                    url:"https://www.masrikdahir.com/map/sc",
                },
                {
                    title:"Georgia",
                    abv:"GA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Georgia/img.png",
                    url:"https://www.masrikdahir.com/map/ga",
                },
                {
                    title:"Alabama",
                    abv:"AL",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Alabama/img.png",
                    url:"https://www.masrikdahir.com/map/al",
                },
                {
                    title:"Ohio",
                    abv:"OH",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Ohio/img.png",
                    url:"https://www.masrikdahir.com/map/oh",
                },
                {
                    title:"Michigan",
                    abv:"MI",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Michigan/img.png",
                    url:"https://www.masrikdahir.com/map/mi",
                },
                {
                    title:"Wisconsin",
                    abv:"WI",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Wisconsin/img.png",
                    url:"https://www.masrikdahir.com/map/wi",
                },
                {
                    title:"Illinois",
                    abv:"IL",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Illinois/img.png",
                    url:"https://www.masrikdahir.com/map/il",
                },
                {
                    title:"Iowa",
                    abv:"IA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Iowa/img.png",
                    url:"https://www.masrikdahir.com/map/ia",
                },
                {
                    title:"Missouri",
                    abv:"MO",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Missouri/img.png",
                    url:"https://www.masrikdahir.com/map/mo",
                },
                {
                    title:"Arkansas",
                    abv:"AR",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Arkansas/img.png",
                    url:"https://www.masrikdahir.com/map/ar",
                },
                {
                    title:"Louisiana",
                    abv:"LA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Louisiana/img.png",
                    url:"https://www.masrikdahir.com/map/la",
                },
                {
                    title:"Mississippi",
                    abv:"MS",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Mississippi/img.png",
                    url:"https://www.masrikdahir.com/map/ms",
                },
                {
                    title:"Texas",
                    abv:"TX",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Texas/img.png",
                    url:"https://www.masrikdahir.com/map/tx",
                },
                {
                    title: "Kansas",
                    abv: "KS",
                    image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Kansas/img.png",
                    url: "https://www.masrikdahir.com/map/ks"
                },
                {
                    title: "South Dakota",
                    abv: "SD",
                    image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/South Dakota/img.png",
                    url: "https://www.masrikdahir.com/map/sd"
                },
                {
                    title: "Wyoming",
                    abv: "WY",
                    image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Wyoming/img.png",
                    url: "https://www.masrikdahir.com/map/wy"
                },
                {
                    title: "Colorado",
                    abv: "CO",
                    image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Colorado/img.png",
                    url: "https://www.masrikdahir.com/map/co"
                },
                {
                    title: "Utah",
                    abv: "UT",
                    image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Utah/img.png",
                    url: "https://www.masrikdahir.com/map/ut"
                },
                {
                    title: "Nebraska",
                    abv: "NE",
                    image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Nebraska/img.png",
                    url: "https://www.masrikdahir.com/map/ne"
                },
                {
                    title: "Montana",
                    abv: "MT",
                    image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Montana/img.png",
                    url: "https://www.masrikdahir.com/map/mt"
                },
                {
                    title: "Minnesota",
                    abv: "MN",
                    image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Minnesota/img.png",
                    url: "https://www.masrikdahir.com/map/mn"
                },
                {
                    title: "North Dakota",
                    abv: "ND",
                    image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/North Dakota/img.png",
                    url: "https://www.masrikdahir.com/map/nd"
                },
                {
                    title: "Idaho",
                    abv: "ID",
                    image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Idaho/img.png",
                    url: "https://www.masrikdahir.com/map/id"
                },
                {
                    title: "Rhode Island",
                    abv: "RI",
                    image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Rhode Island/img.png",
                    url: "https://www.masrikdahir.com/map/ri"
                },
                {
                    title: "Florida",
                    abv: "FL",
                    image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Florida/img.png",
                    url: "https://www.masrikdahir.com/map/fl"
                },
                {
                    title: "Alaska",
                    abv: "AK",
                    image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Alaska/img.png",
                    url: "https://www.masrikdahir.com/map/ak"
                },
                {
                    title: "Hawaii",
                    abv: "HI",
                    image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Hawaii/img.png",
                    url: "https://www.masrikdahir.com/map/hi"
                },
                {
                    title: "Washington",
                    abv: "WA",
                    image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Washington/img.png",
                    url: "https://www.masrikdahir.com/map/wash"
                },
                {
                    title: "Oregon",
                    abv: "OR",
                    image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Oregon/img.png",
                    url: "https://www.masrikdahir.com/map/or"
                },
                {
                    title: "New Mexico",
                    abv: "NM",
                    image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/New Mexico/img.png",
                    url: "https://www.masrikdahir.com/map/nm"
                },
                {
                    title: "Oklahoma",
                    abv: "OK",
                    image: "https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Oklahoma/img.png",
                    url: "https://www.masrikdahir.com/map/ok"
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
                    title:"Ontario",
                    abv:"ON",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Ontario/img.png",
                    url:"https://www.masrikdahir.com/map/on",
                },
                {
                    title:"Alberta",
                    abv:"AB",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Alberta/img.png",
                    url:"https://www.masrikdahir.com/map/ab",
                },
                {
                    title:"British Columbia",
                    abv:"BC",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/British Columbia/img.png",
                    url:"https://www.masrikdahir.com/map/bc",
                },
                {
                    title:"Manitoba",
                    abv:"MB",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Manitoba/img.png",
                    url:"https://www.masrikdahir.com/map/mb",
                },
                {
                    title:"New Brunswick",
                    abv:"NB",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/New Brunswick/img.png",
                    url:"https://www.masrikdahir.com/map/nb",
                },
                {
                    title:"Newfoundland and Labrador",
                    abv:"NL",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Newfoundland and Labrador/img.png",
                    url:"https://www.masrikdahir.com/map/nl",
                },
                {
                    title:"Nova Scotia",
                    abv:"NS",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Nova Scotia/img.png",
                    url:"https://www.masrikdahir.com/map/ns",
                },
                {
                    title:"Northwest Territories",
                    abv:"NT",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Northwest Territories/img.png",
                    url:"https://www.masrikdahir.com/map/nt",
                },
                {
                    title:"Nunavut",
                    abv:"NU",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Nunavut/img.png",
                    url:"https://www.masrikdahir.com/map/nu",
                },
                {
                    title:"Prince Edward Island",
                    abv:"PE",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Prince Edward Island/img.png",
                    url:"https://www.masrikdahir.com/map/pe",
                },
                {
                    title:"Quebec",
                    abv:"QC",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Quebec/img.png",
                    url:"https://www.masrikdahir.com/map/qc",
                },
                {
                    title:"Saskatchewan",
                    abv:"SK",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Saskatchewan/img.png",
                    url:"https://www.masrikdahir.com/map/sk",
                },
                {
                    title:"Yukon",
                    abv:"YT",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Yukon/img.png",
                    url:"https://www.masrikdahir.com/map/yt",
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
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/England/img.png",
                    url:"",
                },
                {
                    title:"Wales",
                    abv:"WLS",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Wales/img.png",
                    url:"",
                },
                {
                    title:"Northern Ireland",
                    abv:"NIR",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Northern Ireland/img.png",
                    url:"",
                },
                {
                    title:"Scotland",
                    abv:"SCT",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Scotland/img.png",
                    url:"",
                },
                {
                    title:"Ireland",
                    abv:"IRL",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Ireland/img.png",
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
                {
                    title:"Barisal",
                    abv:"BAR",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Barisal/img.png",
                    url:"https://www.masrikdahir.com/map/bar",
                },
                {
                    title:"Chittagong",
                    abv:"CTG",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Chittagong/img.png",
                    url:"https://www.masrikdahir.com/map/ctg",
                },
                {
                    title:"Dhaka",
                    abv:"DHK",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Dhaka/img.png",
                    url:"https://www.masrikdahir.com/map/dhk",
                },
                {
                    title:"Khulna",
                    abv:"KHL",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Khulna/img.png",
                    url:"https://www.masrikdahir.com/map/khl",
                },
                {
                    title:"Rajshahi",
                    abv:"RAJ",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Rajshahi/img.png",
                    url:"https://www.masrikdahir.com/map/raj",
                },
                {
                    title:"Rangpur",
                    abv:"RPR",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Rangpur/img.png",
                    url:"https://www.masrikdahir.com/map/rpr",
                },
                {
                    title:"Sylhet",
                    abv:"SYL",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Sylhet/img.png",
                    url:"https://www.masrikdahir.com/map/syl",
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

const app_pic_northern_asia = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
                {
                    title:"Russia",
                    abv:"RUS",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Russia/img.png",
                    url:"https://www.masrikdahir.com/map/rus",
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

const app_pic_southern_asia = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
                {
                    title:"Bhutan",
                    abv:"BTN",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Bhutan/img.png",
                    url:"https://www.masrikdahir.com/map/btn",
                },
                {
                    title:"India",
                    abv:"IND",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/India/img.png",
                    url:"https://www.masrikdahir.com/map/ind",
                },
                {
                    title:"Maldives",
                    abv:"MDV",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Maldives/img.png",
                    url:"https://www.masrikdahir.com/map/mdv",
                },
                {
                    title:"Nepal",
                    abv:"NPL",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Nepal/img.png",
                    url:"https://www.masrikdahir.com/map/npl",
                },
                {
                    title:"Pakistan",
                    abv:"PAK",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Pakistan/img.png",
                    url:"https://www.masrikdahir.com/map/pak",
                },
                {
                    title:"Sri Lanka",
                    abv:"LKA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Sri Lanka/img.png",
                    url:"https://www.masrikdahir.com/map/lka",
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

const app_pic_eastern_asia = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
                {
                    title:"China",
                    abv:"CHN",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/China/img.png",
                    url:"https://www.masrikdahir.com/map/chn",
                },
                {
                    title:"Hong Kong",
                    abv:"HKG",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Hong Kong/img.png",
                    url:"https://www.masrikdahir.com/map/hkg",
                },
                {
                    title:"Japan",
                    abv:"JPN",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Japan/img.png",
                    url:"https://www.masrikdahir.com/map/jpn",
                },
                {
                    title:"Mongolia",
                    abv:"MNG",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Mongolia/img.png",
                    url:"https://www.masrikdahir.com/map/mng",
                },
                {
                    title:"North Korea",
                    abv:"PRK",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/North Korea/img.png",
                    url:"https://www.masrikdahir.com/map/prk",
                },
                {
                    title:"South Korea",
                    abv:"KOR",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/South Korea/img.png",
                    url:"https://www.masrikdahir.com/map/kor",
                },
                {
                    title:"Taiwan",
                    abv:"TWN",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Taiwan/img.png",
                    url:"https://www.masrikdahir.com/map/twn",
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

const app_pic_central_asia = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
                {
                    title:"Afghanistan",
                    abv:"AFG",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Afghanistan/img.png",
                    url:"https://www.masrikdahir.com/map/afg",
                },
                {
                    title:"Kazakhstan",
                    abv:"KAZ",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Kazakhstan/img.png",
                    url:"https://www.masrikdahir.com/map/kaz",
                },
                {
                    title:"Kyrgyzstan",
                    abv:"KGZ",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Kyrgyzstan/img.png",
                    url:"https://www.masrikdahir.com/map/kgz",
                },
                {
                    title:"Tajikistan",
                    abv:"TJK",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Tajikistan/img.png",
                    url:"https://www.masrikdahir.com/map/tjk",
                },
                {
                    title:"Turkmenistan",
                    abv:"TKM",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Turkmenistan/img.png",
                    url:"https://www.masrikdahir.com/map/tkm",
                },
                {
                    title:"Uzbekistan",
                    abv:"UZB",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Uzbekistan/img.png",
                    url:"https://www.masrikdahir.com/map/uzb",
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

const app_pic_south_eastern_asia = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
                {
                    title:"Brunei",
                    abv:"BRN",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Brunei/img.png",
                    url:"https://www.masrikdahir.com/map/brn",
                },
                {
                    title:"Cambodia",
                    abv:"KHM",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Cambodia/img.png",
                    url:"https://www.masrikdahir.com/map/khm",
                },
                {
                    title:"Indonesia",
                    abv:"IDN",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Indonesia/img.png",
                    url:"https://www.masrikdahir.com/map/idn",
                },
                {
                    title:"Laos",
                    abv:"LAO",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Laos/img.png",
                    url:"https://www.masrikdahir.com/map/lao",
                },
                {
                    title:"Malaysia",
                    abv:"MYS",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Malaysia/img.png",
                    url:"https://www.masrikdahir.com/map/mys",
                },
                {
                    title:"Myanmar",
                    abv:"MMR",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Myanmar/img.png",
                    url:"https://www.masrikdahir.com/map/mmr",
                },
                {
                    title:"Philippines",
                    abv:"PHL",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Philippines/img.png",
                    url:"https://www.masrikdahir.com/map/phl",
                },
                {
                    title:"Singapore",
                    abv:"SGP",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Singapore/img.png",
                    url:"https://www.masrikdahir.com/map/sgp",
                },
                {
                    title:"Thailand",
                    abv:"THA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Thailand/img.png",
                    url:"https://www.masrikdahir.com/map/tha",
                },
                {
                    title:"Timor-Leste",
                    abv:"TLS",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Timor-Leste/img.png",
                    url:"https://www.masrikdahir.com/map/tls",
                },
                {
                    title:"Vietnam",
                    abv:"VNM",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Vietnam/img.png",
                    url:"https://www.masrikdahir.com/map/vnm",
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

const app_pic_middle_east = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
                {
                    title:"Bahrain",
                    abv:"BHR",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Bahrain/img.png",
                    url:"https://www.masrikdahir.com/map/bhr",
                },
                {
                    title:"Iran",
                    abv:"IRN",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Iran/img.png",
                    url:"https://www.masrikdahir.com/map/irn",
                },
                {
                    title:"Iraq",
                    abv:"IRQ",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Iraq/img.png",
                    url:"https://www.masrikdahir.com/map/irq",
                },
                {
                    title:"Israel",
                    abv:"ISR",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Israel/img.png",
                    url:"https://www.masrikdahir.com/map/isr",
                },
                {
                    title:"Jordan",
                    abv:"JOR",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Jordan/img.png",
                    url:"https://www.masrikdahir.com/map/jor",
                },
                {
                    title:"Kuwait",
                    abv:"KWT",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Kuwait/img.png",
                    url:"https://www.masrikdahir.com/map/kwt",
                },
                {
                    title:"Lebanon",
                    abv:"LBN",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Lebanon/img.png",
                    url:"https://www.masrikdahir.com/map/lbn",
                },
                {
                    title:"Oman",
                    abv:"OMN",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Oman/img.png",
                    url:"https://www.masrikdahir.com/map/omn",
                },
                {
                    title:"Palestine",
                    abv:"PSE",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Palestine/img.png",
                    url:"https://www.masrikdahir.com/map/pse",
                },
                {
                    title:"Qatar",
                    abv:"QAT",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Qatar/img.png",
                    url:"https://www.masrikdahir.com/map/qat",
                },
                {
                    title:"Saudi Arabia",
                    abv:"SAU",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Saudi Arabia/img.png",
                    url:"https://www.masrikdahir.com/map/sau",
                },
                {
                    title:"Syria",
                    abv:"SYR",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Syria/img.png",
                    url:"https://www.masrikdahir.com/map/syr",
                },
                {
                    title:"United Arab Emirates",
                    abv:"ARE",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/United Arab Emirates/img.png",
                    url:"https://www.masrikdahir.com/map/are",
                },
                {
                    title:"Yemen",
                    abv:"YEM",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Yemen/img.png",
                    url:"https://www.masrikdahir.com/map/yem",
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

const app_pic_central_america = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
                {
                    title:"Belize",
                    abv:"BLZ",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Belize/img.png",
                    url:"https://www.masrikdahir.com/map/blz",
                },
                {
                    title:"Costa Rica",
                    abv:"CRI",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Costa Rica/img.png",
                    url:"https://www.masrikdahir.com/map/cri",
                },
                {
                    title:"El Salvador",
                    abv:"SLV",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/El Salvador/img.png",
                    url:"https://www.masrikdahir.com/map/slv",
                },
                {
                    title:"Guatemala",
                    abv:"GTM",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Guatemala/img.png",
                    url:"https://www.masrikdahir.com/map/gtm",
                },
                {
                    title:"Honduras",
                    abv:"HND",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Honduras/img.png",
                    url:"https://www.masrikdahir.com/map/hnd",
                },
                {
                    title:"Mexico",
                    abv:"MEX",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Mexico/img.png",
                    url:"https://www.masrikdahir.com/map/mex",
                },
                {
                    title:"Nicaragua",
                    abv:"NIC",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Nicaragua/img.png",
                    url:"https://www.masrikdahir.com/map/nic",
                },
                {
                    title:"Panama",
                    abv:"PAN",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Panama/img.png",
                    url:"https://www.masrikdahir.com/map/pan",
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

const app_pic_caribbean_america = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
                {
                    title:"Antigua and Barbuda",
                    abv:"ATG",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Antigua and Barbuda/img.png",
                    url:"https://www.masrikdahir.com/map/atg",
                },
                {
                    title:"Aruba",
                    abv:"ABW",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Aruba/img.png",
                    url:"https://www.masrikdahir.com/map/abw",
                },
                {
                    title:"Bahamas",
                    abv:"BHS",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Bahamas/img.png",
                    url:"https://www.masrikdahir.com/map/bhs",
                },
                {
                    title:"Barbados",
                    abv:"BRB",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Barbados/img.png",
                    url:"https://www.masrikdahir.com/map/brb",
                },
                {
                    title:"British Virgin Islands",
                    abv:"VGB",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/British Virgin Islands/img.png",
                    url:"https://www.masrikdahir.com/map/vgb",
                },
                {
                    title:"Cayman Islands",
                    abv:"CYM",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Cayman Islands/img.png",
                    url:"https://www.masrikdahir.com/map/cym",
                },
                {
                    title:"Cuba",
                    abv:"CUB",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Cuba/img.png",
                    url:"https://www.masrikdahir.com/map/cub",
                },
                {
                    title:"Curaçao",
                    abv:"CUW",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Curaçao/img.png",
                    url:"https://www.masrikdahir.com/map/cuw",
                },
                {
                    title:"Dominica",
                    abv:"DMA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Dominica/img.png",
                    url:"https://www.masrikdahir.com/map/dma",
                },
                {
                    title:"Dominican Republic",
                    abv:"DOM",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Dominican Republic/img.png",
                    url:"https://www.masrikdahir.com/map/dom",
                },
                {
                    title:"Grenada",
                    abv:"GRD",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Grenada/img.png",
                    url:"https://www.masrikdahir.com/map/grd",
                },
                {
                    title:"Guadeloupe",
                    abv:"GLP",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Guadeloupe/img.png",
                    url:"https://www.masrikdahir.com/map/glp",
                },
                {
                    title:"Haiti",
                    abv:"HTI",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Haiti/img.png",
                    url:"https://www.masrikdahir.com/map/hti",
                },
                {
                    title:"Jamaica",
                    abv:"JAM",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Jamaica/img.png",
                    url:"https://www.masrikdahir.com/map/jam",
                },
                {
                    title:"Martinique",
                    abv:"MTQ",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Martinique/img.png",
                    url:"https://www.masrikdahir.com/map/mtq",
                },
                {
                    title:"Montserrat",
                    abv:"MSR",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Montserrat/img.png",
                    url:"https://www.masrikdahir.com/map/msr",
                },
                {
                    title:"Puerto Rico",
                    abv:"PRI",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Puerto Rico/img.png",
                    url:"https://www.masrikdahir.com/map/pri",
                },
                {
                    title:"Saint Kitts and Nevis",
                    abv:"KNA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Saint Kitts and Nevis/img.png",
                    url:"https://www.masrikdahir.com/map/kna",
                },
                {
                    title:"Saint Lucia",
                    abv:"LCA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Saint Lucia/img.png",
                    url:"https://www.masrikdahir.com/map/lca",
                },
                {
                    title:"Saint Vincent and the Grenadines",
                    abv:"VCT",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Saint Vincent and the Grenadines/img.png",
                    url:"https://www.masrikdahir.com/map/vct",
                },
                {
                    title:"Sint Maarten",
                    abv:"SXM",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Sint Maarten/img.png",
                    url:"https://www.masrikdahir.com/map/sxm",
                },
                {
                    title:"Trinidad and Tobago",
                    abv:"TTO",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Trinidad and Tobago/img.png",
                    url:"https://www.masrikdahir.com/map/tto",
                },
                {
                    title:"Turks and Caicos Islands",
                    abv:"TCA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Turks and Caicos Islands/img.png",
                    url:"https://www.masrikdahir.com/map/tca",
                },
                {
                    title:"US Virgin Islands",
                    abv:"VIR",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/US Virgin Islands/img.png",
                    url:"https://www.masrikdahir.com/map/vir",
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

const app_pic_south_america = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
                {
                    title:"Argentina",
                    abv:"ARG",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Argentina/img.png",
                    url:"https://www.masrikdahir.com/map/arg",
                },
                {
                    title:"Bolivia",
                    abv:"BOL",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Bolivia/img.png",
                    url:"https://www.masrikdahir.com/map/bol",
                },
                {
                    title:"Brazil",
                    abv:"BRA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Brazil/img.png",
                    url:"https://www.masrikdahir.com/map/bra",
                },
                {
                    title:"Chile",
                    abv:"CHL",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Chile/img.png",
                    url:"https://www.masrikdahir.com/map/chl",
                },
                {
                    title:"Colombia",
                    abv:"COL",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Colombia/img.png",
                    url:"https://www.masrikdahir.com/map/col",
                },
                {
                    title:"Ecuador",
                    abv:"ECU",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Ecuador/img.png",
                    url:"https://www.masrikdahir.com/map/ecu",
                },
                {
                    title:"French Guiana",
                    abv:"GUF",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/French Guiana/img.png",
                    url:"https://www.masrikdahir.com/map/guf",
                },
                {
                    title:"Guyana",
                    abv:"GUY",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Guyana/img.png",
                    url:"https://www.masrikdahir.com/map/guy",
                },
                {
                    title:"Paraguay",
                    abv:"PRY",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Paraguay/img.png",
                    url:"https://www.masrikdahir.com/map/pry",
                },
                {
                    title:"Peru",
                    abv:"PER",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Peru/img.png",
                    url:"https://www.masrikdahir.com/map/per",
                },
                {
                    title:"Suriname",
                    abv:"SUR",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Suriname/img.png",
                    url:"https://www.masrikdahir.com/map/sur",
                },
                {
                    title:"Uruguay",
                    abv:"URY",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Uruguay/img.png",
                    url:"https://www.masrikdahir.com/map/ury",
                },
                {
                    title:"Venezuela",
                    abv:"VEN",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Venezuela/img.png",
                    url:"https://www.masrikdahir.com/map/ven",
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

const app_pic_western_europe = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
                {
                    title:"Austria",
                    abv:"AUT",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Austria/img.png",
                    url:"https://www.masrikdahir.com/map/aut",
                },
                {
                    title:"Belgium",
                    abv:"BEL",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Belgium/img.png",
                    url:"https://www.masrikdahir.com/map/bel",
                },
                {
                    title:"France",
                    abv:"FRA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/France/img.png",
                    url:"https://www.masrikdahir.com/map/fra",
                },
                {
                    title:"Germany",
                    abv:"DEU",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Germany/img.png",
                    url:"https://www.masrikdahir.com/map/deu",
                },
                {
                    title:"Ireland",
                    abv:"IRL",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Ireland/img.png",
                    url:"https://www.masrikdahir.com/map/irl",
                },
                {
                    title:"Liechtenstein",
                    abv:"LIE",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Liechtenstein/img.png",
                    url:"https://www.masrikdahir.com/map/lie",
                },
                {
                    title:"Luxembourg",
                    abv:"LUX",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Luxembourg/img.png",
                    url:"https://www.masrikdahir.com/map/lux",
                },
                {
                    title:"Monaco",
                    abv:"MCO",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Monaco/img.png",
                    url:"https://www.masrikdahir.com/map/mco",
                },
                {
                    title:"Netherlands",
                    abv:"NLD",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Netherlands/img.png",
                    url:"https://www.masrikdahir.com/map/nld",
                },
                {
                    title:"Switzerland",
                    abv:"CHE",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Switzerland/img.png",
                    url:"https://www.masrikdahir.com/map/che",
                },
                {
                    title:"United Kingdom",
                    abv:"GBR",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/United Kingdom/img.png",
                    url:"https://www.masrikdahir.com/map/gbr",
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

const app_pic_eastern_europe = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
                {
                    title:"Armenia",
                    abv:"ARM",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Armenia/img.png",
                    url:"https://www.masrikdahir.com/map/arm",
                },
                {
                    title:"Azerbaijan",
                    abv:"AZE",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Azerbaijan/img.png",
                    url:"https://www.masrikdahir.com/map/aze",
                },
                {
                    title:"Belarus",
                    abv:"BLR",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Belarus/img.png",
                    url:"https://www.masrikdahir.com/map/blr",
                },
                {
                    title:"Bulgaria",
                    abv:"BGR",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Bulgaria/img.png",
                    url:"https://www.masrikdahir.com/map/bgr",
                },
                {
                    title:"Czech Republic",
                    abv:"CZE",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Czech Republic/img.png",
                    url:"https://www.masrikdahir.com/map/cze",
                },
                {
                    title:"Hungary",
                    abv:"HUN",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Hungary/img.png",
                    url:"https://www.masrikdahir.com/map/hun",
                },
                {
                    title:"Kazakhstan",
                    abv:"KAZ",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Kazakhstan/img.png",
                    url:"https://www.masrikdahir.com/map/kaz",
                },
                {
                    title:"Lithuania",
                    abv:"LTU",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Lithuania/img.png",
                    url:"https://www.masrikdahir.com/map/ltu",
                },
                {
                    title:"Moldova",
                    abv:"MDA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Moldova/img.png",
                    url:"https://www.masrikdahir.com/map/mda",
                },
                {
                    title:"Poland",
                    abv:"POL",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Poland/img.png",
                    url:"https://www.masrikdahir.com/map/pol",
                },
                {
                    title:"Romania",
                    abv:"ROU",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Romania/img.png",
                    url:"https://www.masrikdahir.com/map/rou",
                },
                {
                    title:"Russia",
                    abv:"RUS",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Russia/img.png",
                    url:"https://www.masrikdahir.com/map/rus",
                },
                {
                    title:"Serbia",
                    abv:"SRB",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Serbia/img.png",
                    url:"https://www.masrikdahir.com/map/srb",
                },
                {
                    title:"Slovakia",
                    abv:"SVK",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Slovakia/img.png",
                    url:"https://www.masrikdahir.com/map/svk",
                },
                {
                    title:"Ukraine",
                    abv:"UKR",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Ukraine/img.png",
                    url:"https://www.masrikdahir.com/map/ukr",
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

const app_pic_southern_europe = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
                {
                    title:"Albania",
                    abv:"ALB",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Albania/img.png",
                    url:"https://www.masrikdahir.com/map/alb",
                },
                {
                    title:"Andorra",
                    abv:"AND",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Andorra/img.png",
                    url:"https://www.masrikdahir.com/map/and",
                },
                {
                    title:"Bosnia and Herzegovina",
                    abv:"BIH",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Bosnia and Herzegovina/img.png",
                    url:"https://www.masrikdahir.com/map/bih",
                },
                {
                    title:"Croatia",
                    abv:"HRV",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Croatia/img.png",
                    url:"https://www.masrikdahir.com/map/hrv",
                },
                {
                    title:"Cyprus",
                    abv:"CYP",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Cyprus/img.png",
                    url:"https://www.masrikdahir.com/map/cyp",
                },
                {
                    title:"Gibraltar",
                    abv:"GIB",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Gibraltar/img.png",
                    url:"https://www.masrikdahir.com/map/gib",
                },
                {
                    title:"Greece",
                    abv:"GRC",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Greece/img.png",
                    url:"https://www.masrikdahir.com/map/grc",
                },
                {
                    title:"Italy",
                    abv:"ITA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Italy/img.png",
                    url:"https://www.masrikdahir.com/map/ita",
                },
                {
                    title:"Kosovo",
                    abv:"XKX",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Kosovo/img.png",
                    url:"https://www.masrikdahir.com/map/xkx",
                },
                {
                    title:"Malta",
                    abv:"MLT",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Malta/img.png",
                    url:"https://www.masrikdahir.com/map/mlt",
                },
                {
                    title:"Montenegro",
                    abv:"MNE",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Montenegro/img.png",
                    url:"https://www.masrikdahir.com/map/mne",
                },
                {
                    title:"North Macedonia",
                    abv:"MKD",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/North Macedonia/img.png",
                    url:"https://www.masrikdahir.com/map/mkd",
                },
                {
                    title:"Portugal",
                    abv:"PRT",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Portugal/img.png",
                    url:"https://www.masrikdahir.com/map/prt",
                },
                {
                    title:"San Marino",
                    abv:"SMR",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/San Marino/img.png",
                    url:"https://www.masrikdahir.com/map/smr",
                },
                {
                    title:"Slovenia",
                    abv:"SVN",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Slovenia/img.png",
                    url:"https://www.masrikdahir.com/map/svn",
                },
                {
                    title:"Spain",
                    abv:"ESP",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Spain/img.png",
                    url:"https://www.masrikdahir.com/map/esp",
                },
                {
                    title:"Turkey",
                    abv:"TUR",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Turkey/img.png",
                    url:"https://www.masrikdahir.com/map/tur",
                },
                {
                    title:"Vatican City",
                    abv:"VAT",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Vatican City/img.png",
                    url:"https://www.masrikdahir.com/map/vat",
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

const app_pic_northern_europe = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
                {
                    title:"Denmark",
                    abv:"DNK",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Denmark/img.png",
                    url:"https://www.masrikdahir.com/map/dnk",
                },
                {
                    title:"Estonia",
                    abv:"EST",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Estonia/img.png",
                    url:"https://www.masrikdahir.com/map/est",
                },
                {
                    title:"Finland",
                    abv:"FIN",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Finland/img.png",
                    url:"https://www.masrikdahir.com/map/fin",
                },
                {
                    title:"Iceland",
                    abv:"ISL",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Iceland/img.png",
                    url:"https://www.masrikdahir.com/map/isl",
                },
                {
                    title:"Latvia",
                    abv:"LVA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Latvia/img.png",
                    url:"https://www.masrikdahir.com/map/lva",
                },
                {
                    title:"Norway",
                    abv:"NOR",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Norway/img.png",
                    url:"https://www.masrikdahir.com/map/nor",
                },
                {
                    title:"Sweden",
                    abv:"SWE",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Sweden/img.png",
                    url:"https://www.masrikdahir.com/map/swe",
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

const app_pic_northern_africa = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
                {
                    title:"Algeria",
                    abv:"DZA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Algeria/img.png",
                    url:"https://www.masrikdahir.com/map/dza",
                },
                {
                    title:"Egypt",
                    abv:"EGY",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Egypt/img.png",
                    url:"https://www.masrikdahir.com/map/egy",
                },
                {
                    title:"Libya",
                    abv:"LBY",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Libya/img.png",
                    url:"https://www.masrikdahir.com/map/lby",
                },
                {
                    title:"Morocco",
                    abv:"MAR",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Morocco/img.png",
                    url:"https://www.masrikdahir.com/map/mar",
                },
                {
                    title:"Sudan",
                    abv:"SDN",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Sudan/img.png",
                    url:"https://www.masrikdahir.com/map/sdn",
                },
                {
                    title:"Tunisia",
                    abv:"TUN",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Tunisia/img.png",
                    url:"https://www.masrikdahir.com/map/tun",
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

const app_pic_western_africa = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
                {
                    title:"Benin",
                    abv:"BEN",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Benin/img.png",
                    url:"https://www.masrikdahir.com/map/ben",
                },
                {
                    title:"Burkina Faso",
                    abv:"BFA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Burkina Faso/img.png",
                    url:"https://www.masrikdahir.com/map/bfa",
                },
                {
                    title:"Cape Verde",
                    abv:"CPV",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Cape Verde/img.png",
                    url:"https://www.masrikdahir.com/map/cpv",
                },
                {
                    title:"Côte d'Ivoire",
                    abv:"CIV",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Côte d'Ivoire/img.png",
                    url:"https://www.masrikdahir.com/map/civ",
                },
                {
                    title:"Gambia",
                    abv:"GMB",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Gambia/img.png",
                    url:"https://www.masrikdahir.com/map/gmb",
                },
                {
                    title:"Ghana",
                    abv:"GHA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Ghana/img.png",
                    url:"https://www.masrikdahir.com/map/gha",
                },
                {
                    title:"Guinea",
                    abv:"GIN",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Guinea/img.png",
                    url:"https://www.masrikdahir.com/map/gin",
                },
                {
                    title:"Guinea-Bissau",
                    abv:"GNB",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Guinea-Bissau/img.png",
                    url:"https://www.masrikdahir.com/map/gnb",
                },
                {
                    title:"Liberia",
                    abv:"LBR",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Liberia/img.png",
                    url:"https://www.masrikdahir.com/map/lbr",
                },
                {
                    title:"Mali",
                    abv:"MLI",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Mali/img.png",
                    url:"https://www.masrikdahir.com/map/mli",
                },
                {
                    title:"Mauritania",
                    abv:"MRT",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Mauritania/img.png",
                    url:"https://www.masrikdahir.com/map/mrt",
                },
                {
                    title:"Niger",
                    abv:"NER",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Niger/img.png",
                    url:"https://www.masrikdahir.com/map/ner",
                },
                {
                    title:"Nigeria",
                    abv:"NGA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Nigeria/img.png",
                    url:"https://www.masrikdahir.com/map/nga",
                },
                {
                    title:"Senegal",
                    abv:"SEN",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Senegal/img.png",
                    url:"https://www.masrikdahir.com/map/sen",
                },
                {
                    title:"Sierra Leone",
                    abv:"SLE",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Sierra Leone/img.png",
                    url:"https://www.masrikdahir.com/map/sle",
                },
                {
                    title:"Togo",
                    abv:"TGO",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Togo/img.png",
                    url:"https://www.masrikdahir.com/map/tgo",
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

const app_pic_eastern_africa = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
                {
                    title:"Burundi",
                    abv:"BDI",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Burundi/img.png",
                    url:"https://www.masrikdahir.com/map/bdi",
                },
                {
                    title:"Comoros",
                    abv:"COM",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Comoros/img.png",
                    url:"https://www.masrikdahir.com/map/com",
                },
                {
                    title:"Djibouti",
                    abv:"DJI",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Djibouti/img.png",
                    url:"https://www.masrikdahir.com/map/dji",
                },
                {
                    title:"Eritrea",
                    abv:"ERI",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Eritrea/img.png",
                    url:"https://www.masrikdahir.com/map/eri",
                },
                {
                    title:"Ethiopia",
                    abv:"ETH",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Ethiopia/img.png",
                    url:"https://www.masrikdahir.com/map/eth",
                },
                {
                    title:"Kenya",
                    abv:"KEN",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Kenya/img.png",
                    url:"https://www.masrikdahir.com/map/ken",
                },
                {
                    title:"Madagascar",
                    abv:"MDG",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Madagascar/img.png",
                    url:"https://www.masrikdahir.com/map/mdg",
                },
                {
                    title:"Malawi",
                    abv:"MWI",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Malawi/img.png",
                    url:"https://www.masrikdahir.com/map/mwi",
                },
                {
                    title:"Mauritius",
                    abv:"MUS",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Mauritius/img.png",
                    url:"https://www.masrikdahir.com/map/mus",
                },
                {
                    title:"Mozambique",
                    abv:"MOZ",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Mozambique/img.png",
                    url:"https://www.masrikdahir.com/map/moz",
                },
                {
                    title:"Rwanda",
                    abv:"RWA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Rwanda/img.png",
                    url:"https://www.masrikdahir.com/map/rwa",
                },
                {
                    title:"Seychelles",
                    abv:"SYC",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Seychelles/img.png",
                    url:"https://www.masrikdahir.com/map/syc",
                },
                {
                    title:"Somalia",
                    abv:"SOM",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Somalia/img.png",
                    url:"https://www.masrikdahir.com/map/som",
                },
                {
                    title:"South Sudan",
                    abv:"SSD",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/South Sudan/img.png",
                    url:"https://www.masrikdahir.com/map/ssd",
                },
                {
                    title:"Tanzania",
                    abv:"TZA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Tanzania/img.png",
                    url:"https://www.masrikdahir.com/map/tza",
                },
                {
                    title:"Uganda",
                    abv:"UGA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Uganda/img.png",
                    url:"https://www.masrikdahir.com/map/uga",
                },
                {
                    title:"Zambia",
                    abv:"ZMB",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Zambia/img.png",
                    url:"https://www.masrikdahir.com/map/zmb",
                },
                {
                    title:"Zimbabwe",
                    abv:"ZWE",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Zimbabwe/img.png",
                    url:"https://www.masrikdahir.com/map/zwe",
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

const app_pic_central_africa = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
                {
                    title:"Angola",
                    abv:"AGO",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Angola/img.png",
                    url:"https://www.masrikdahir.com/map/ago",
                },
                {
                    title:"Cameroon",
                    abv:"CMR",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Cameroon/img.png",
                    url:"https://www.masrikdahir.com/map/cmr",
                },
                {
                    title:"Central African Republic",
                    abv:"CAF",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Central African Republic/img.png",
                    url:"https://www.masrikdahir.com/map/caf",
                },
                {
                    title:"Chad",
                    abv:"TCD",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Chad/img.png",
                    url:"https://www.masrikdahir.com/map/tcd",
                },
                {
                    title:"Democratic Republic of Congo",
                    abv:"COD",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Democratic Republic of Congo/img.png",
                    url:"https://www.masrikdahir.com/map/cod",
                },
                {
                    title:"Equatorial Guinea",
                    abv:"GNQ",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Equatorial Guinea/img.png",
                    url:"https://www.masrikdahir.com/map/gnq",
                },
                {
                    title:"Gabon",
                    abv:"GAB",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Gabon/img.png",
                    url:"https://www.masrikdahir.com/map/gab",
                },
                {
                    title:"Republic of Congo",
                    abv:"COG",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Republic of Congo/img.png",
                    url:"https://www.masrikdahir.com/map/cog",
                },
                {
                    title:"Sao Tome and Principe",
                    abv:"STP",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Sao Tome and Principe/img.png",
                    url:"https://www.masrikdahir.com/map/stp",
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

const app_pic_southern_africa = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
                {
                    title:"Botswana",
                    abv:"BWA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Botswana/img.png",
                    url:"https://www.masrikdahir.com/map/bwa",
                },
                {
                    title:"Lesotho",
                    abv:"LSO",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Lesotho/img.png",
                    url:"https://www.masrikdahir.com/map/lso",
                },
                {
                    title:"Namibia",
                    abv:"NAM",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Namibia/img.png",
                    url:"https://www.masrikdahir.com/map/nam",
                },
                {
                    title:"South Africa",
                    abv:"ZAF",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/South Africa/img.png",
                    url:"https://www.masrikdahir.com/map/zaf",
                },
                {
                    title:"Eswatini",
                    abv:"SWZ",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Eswatini/img.png",
                    url:"https://www.masrikdahir.com/map/swz",
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

const app_pic_australia = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
                {
                    title:"Australian Capital Territory",
                    abv:"ACT",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Australian Capital Territory/img.png",
                    url:"https://www.masrikdahir.com/map/act",
                },
                {
                    title:"New South Wales",
                    abv:"NSW",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/New South Wales/img.png",
                    url:"https://www.masrikdahir.com/map/nsw",
                },
                {
                    title:"Northern Territory",
                    abv:"NTR",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Northern Territory/img.png",
                    url:"https://www.masrikdahir.com/map/ntr",
                },
                {
                    title:"Queensland",
                    abv:"QLD",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Queensland/img.png",
                    url:"https://www.masrikdahir.com/map/qld",
                },
                {
                    title:"South Australia",
                    abv:"SA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/South Australia/img.png",
                    url:"https://www.masrikdahir.com/map/sa",
                },
                {
                    title:"Tasmania",
                    abv:"TAS",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Tasmania/img.png",
                    url:"https://www.masrikdahir.com/map/tas",
                },
                {
                    title:"Victoria",
                    abv:"VIC",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Victoria/img.png",
                    url:"https://www.masrikdahir.com/map/vic",
                },
                {
                    title:"Western Australia",
                    abv:"WA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Western Australia/img.png",
                    url:"https://www.masrikdahir.com/map/wash",
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

const app_pic_new_zealand = {
    data() {
        return {
            showingPopupIndex: null, // Index of the currently shown popup
            searchQuery: null,
            resources:[
                {
                    title:"Auckland",
                    abv:"AKL",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Auckland/img.png",
                    url:"https://www.masrikdahir.com/map/akl",
                },
                {
                    title:"Bay of Plenty",
                    abv:"BOP",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Bay of Plenty/img.png",
                    url:"https://www.masrikdahir.com/map/bop",
                },
                {
                    title:"Canterbury",
                    abv:"CBY",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Canterbury/img.png",
                    url:"https://www.masrikdahir.com/map/cby",
                },
                {
                    title:"Chatham Islands Territory",
                    abv:"CIT",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Chatham Islands Territory/img.png",
                    url:"https://www.masrikdahir.com/map/cit",
                },
                {
                    title:"Gisborne",
                    abv:"GIS",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Gisborne/img.png",
                    url:"https://www.masrikdahir.com/map/gis",
                },
                {
                    title:"Hawke's Bay",
                    abv:"HKB",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Hawke's Bay/img.png",
                    url:"https://www.masrikdahir.com/map/hkb",
                },
                {
                    title:"Manawatu-Wanganui",
                    abv:"MWT",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Manawatu-Wanganui/img.png",
                    url:"https://www.masrikdahir.com/map/mwt",
                },
                {
                    title:"Marlborough",
                    abv:"MBH",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Marlborough/img.png",
                    url:"https://www.masrikdahir.com/map/mbh",
                },
                {
                    title:"Nelson",
                    abv:"NSN",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Nelson/img.png",
                    url:"https://www.masrikdahir.com/map/nsn",
                },
                {
                    title:"Northland",
                    abv:"NTL",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Northland/img.png",
                    url:"https://www.masrikdahir.com/map/ntl",
                },
                {
                    title:"Otago",
                    abv:"OTA",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Otago/img.png",
                    url:"https://www.masrikdahir.com/map/ota",
                },
                {
                    title:"Southland",
                    abv:"STL",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Southland/img.png",
                    url:"https://www.masrikdahir.com/map/stl",
                },
                {
                    title:"Taranaki",
                    abv:"TKI",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Taranaki/img.png",
                    url:"https://www.masrikdahir.com/map/tki",
                },
                {
                    title:"Tasman",
                    abv:"TSN",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Tasman/img.png",
                    url:"https://www.masrikdahir.com/map/tsn",
                },
                {
                    title:"Waikato",
                    abv:"WKO",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Waikato/img.png",
                    url:"https://www.masrikdahir.com/map/wko",
                },
                {
                    title:"Wellington",
                    abv:"WLG",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/Wellington/img.png",
                    url:"https://www.masrikdahir.com/map/wlg",
                },
                {
                    title:"West Coast",
                    abv:"WTC",
                    image:"https://d3dw5jtb3w1kgy.cloudfront.net/Thumbnail/West Coast/img.png",
                    url:"https://www.masrikdahir.com/map/wtc",
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


function safeMount(component, selector) {
    if (document.querySelector(selector)) {
        Vue.createApp(component).mount(selector);
    }
}

safeMount(app_software, '#app_software');
safeMount(app_milestone, '#app_milestone');
safeMount(app_map, '#app_map');
safeMount(app_country, '#app_country');
safeMount(app_pic, '#app_pic');
safeMount(app_pic_can, '#app_pic_can');
safeMount(app_pic_gbr, '#app_pic_gbr');
safeMount(app_pic_bangladesh, '#app_pic_bangladesh');
safeMount(app_pic_northern_asia, '#app_pic_northern_asia');
safeMount(app_pic_southern_asia, '#app_pic_southern_asia');
safeMount(app_pic_eastern_asia, '#app_pic_eastern_asia');
safeMount(app_pic_central_asia, '#app_pic_central_asia');
safeMount(app_pic_south_eastern_asia, '#app_pic_south_eastern_asia');
safeMount(app_pic_middle_east, '#app_pic_middle_east');
safeMount(app_pic_central_america, '#app_pic_central_america');
safeMount(app_pic_caribbean_america, '#app_pic_caribbean_america');
safeMount(app_pic_south_america, '#app_pic_south_america');
safeMount(app_pic_western_europe, '#app_pic_western_europe');
safeMount(app_pic_eastern_europe, '#app_pic_eastern_europe');
safeMount(app_pic_southern_europe, '#app_pic_southern_europe');
safeMount(app_pic_northern_europe, '#app_pic_northern_europe');
safeMount(app_pic_northern_africa, '#app_pic_northern_africa');
safeMount(app_pic_western_africa, '#app_pic_western_africa');
safeMount(app_pic_eastern_africa, '#app_pic_eastern_africa');
safeMount(app_pic_central_africa, '#app_pic_central_africa');
safeMount(app_pic_southern_africa, '#app_pic_southern_africa');
safeMount(app_pic_australia, '#app_pic_australia');
safeMount(app_pic_new_zealand, '#app_pic_new_zealand');





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

function safeMountApp(app, selector) {
    if (document.querySelector(selector)) app.mount(selector);
}

function mountVueInstances(images) {
    images.forEach(state => {
        const baseId = `app_${state.abbreviation.toLowerCase().replace(/\s+/g, '_')}`;

        safeMountApp(Vue.createApp(createStateComponent(state.name, state.abbreviation, state.numImages)), `#${baseId}`);
        safeMountApp(Vue.createApp(createStateComponent(state.name, state.abbreviation, state.numImages)), `#${baseId}_2`);
        safeMountApp(Vue.createApp(createStateComponent(state.name, state.abbreviation, state.numImages)), `#${baseId}_3`);
        safeMountApp(Vue.createApp(createStateComponent(state.name, state.abbreviation, state.numImages)), `.${baseId}`);
    });
}

fetchData().then(mountVueInstances);













