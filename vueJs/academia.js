/**
 * academia.js - Vue data and template bindings for the Academia page.
 *
 * Mounts to #app_academia. Provides collapsible sections for degrees,
 * certifications, achievements, publications, and coursework.
 * Uses toggle(id)/isExpanded(id) methods with an expandedItems reactive object.
 *
 * Requires: Vue 3
 */
var app_academia = Vue.createApp({
    data: function () {
        return {
            expandedItems: {},
            degrees: [
                {
                    title: "Bachelor of Science (Hons.)",
                    id: "vcu_bachelor_of_science",
                    date: "May 2023",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/vcu_eng.png",
                    credentialUrl: "https://egr.vcu.edu/",
                    details: [
                        "<b>Institution:</b> Virginia Commonwealth University",
                        "<b>Major:</b> Software Engineering",
                        "<b>Minor:</b> Real Estate",
                        "<b>Cumulative GPA:</b> 3.9/4.0",
                        "<b>Programs:</b> Honors College, College of Engineering, Kornblau Real Estate Program, Accelerated Masters Program, VCU Entrepreneurship Academy"
                    ]
                },
                {
                    title: "Master of Science",
                    id: "vcu_master_of_science",
                    date: "May 2025",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/vcu_eng.png",
                    credentialUrl: "https://egr.vcu.edu/",
                    details: [
                        "<b>Institution:</b> Virginia Commonwealth University",
                        "<b>Area:</b> Software Engineering",
                        "<b>Cumulative GPA:</b> 4.0/4.0"
                    ]
                }
            ],
            certifications: [
                {
                    title: "AWS Certified Solutions Architect",
                    id: "cert_aws_sa",
                    date: "October 2024",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/aws-certified-solutions-architect-associate.png",
                    credentialUrl: "https://www.credly.com/badges/12749f5b-e7fc-460d-a317-60a1ebc976fe/public_url",
                    details: [
                        '<a href="https://aws.amazon.com/training/" target="_blank">Amazon Web Services</a>',
                        "Build secure and robust solutions using architectural design principles based on customer requirements",
                        "Design well-architected distributed systems that are scalable, resilient, efficient, and fault-tolerant.",
                        "<b>Issued:</b> October 31, 2024"
                    ]
                },
                {
                    title: "AWS Certified Developer",
                    id: "cert_aws_dev",
                    date: "August 2024",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/acd.png",
                    credentialUrl: "https://www.credly.com/badges/4ea74952-8783-44af-9425-119b2434bf38/public_url",
                    details: [
                        '<a href="https://aws.amazon.com/training/" target="_blank">Amazon Web Services</a>',
                        "Proficiency in writing applications with AWS service APIs, AWS CLI, and SDKs; using containers; and deploying with a CI/CD pipeline",
                        "Develop, deploy, and debug cloud-based applications that follow AWS best practices",
                        "<b>Issued:</b> August 22, 2024"
                    ]
                },
                {
                    title: "AWS Cloud Practitioner",
                    id: "cert_aws_cp",
                    date: "January 2023",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/aws-certified-cloud-practitioner.png",
                    credentialUrl: "https://www.credly.com/badges/d5fb9b8a-3519-4480-bd92-ab5d066ce8d8/public_url",
                    details: [
                        '<a href="https://aws.amazon.com/training/" target="_blank">Amazon Web Services</a>',
                        "Knowledge of core AWS services and use cases, billing and pricing models, security concepts, and how cloud impacts your business",
                        "<b>Issued:</b> January 08, 2023"
                    ]
                },
                {
                    title: "Databricks Fundamentals",
                    id: "cert_databricks",
                    date: "September 2024",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/databricksfundamental.png",
                    credentialUrl: "https://credentials.databricks.com/3fc5d768-443c-40fa-828c-fedadb94ba5e#gs.f0jij7",
                    details: [
                        '<a href="https://www.databricks.com/" target="_blank">Databricks</a>',
                        "Understanding of fundamental concepts related to Databricks Data Intelligence Platform",
                        "<b>Issued:</b> September 20, 2024"
                    ]
                },
                {
                    title: "Databricks Generative AI Fundamentals",
                    id: "cert_databricks_ai",
                    date: "September 2024",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/databricksgenerativeai.png",
                    credentialUrl: "https://credentials.databricks.com/65a906a0-cddf-4ef7-92d6-e4c8a35b8c97#gs.f0jlz6",
                    details: [
                        '<a href="https://www.databricks.com/" target="_blank">Databricks</a>',
                        "Fundamentals of the Databricks Generative AI accreditation",
                        "<b>Issued:</b> September 20, 2024"
                    ]
                },
                {
                    title: "Postman API Fundamentals Student Expert",
                    id: "cert_postman",
                    date: "September 2024",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/pafse.png",
                    credentialUrl: "https://api.badgr.io/public/assertions/6VeZHynPSSCsqE6RQIA0_A?identity__email=masrikdahir%40gmail.com",
                    details: [
                        '<a href="https://www.postman.com/" target="_blank">Postman</a>',
                        "Proficient in the essential skills required for consuming APIs in Postman and applications",
                        "<b>Issued:</b> Sep 19, 2024"
                    ]
                },
                {
                    title: "HackerRank SQL (Advanced)",
                    id: "cert_hr_sql",
                    date: "October 2024",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/sql_advanced%20certificate.png",
                    credentialUrl: "https://www.hackerrank.com/certificates/20c59721e6e7",
                    details: [
                        '<a href="https://www.hackerrank.com/" target="_blank">HackerRank</a>',
                        "Query optimization, data modeling, Indexing, window functions, and pivots in SQL",
                        "<b>Issued:</b> October 10, 2024"
                    ]
                },
                {
                    title: "HackerRank Software Engineer",
                    id: "cert_hr_se",
                    date: "October 2024",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/software_engineer%20certificate.png",
                    credentialUrl: "https://www.hackerrank.com/certificates/1566f94cf3c7",
                    details: [
                        '<a href="https://www.hackerrank.com/" target="_blank">HackerRank</a>',
                        "Problem solving, SQL, and REST API",
                        "<b>Issued:</b> October 11, 2024"
                    ]
                },
                {
                    title: "HackerRank Frontend Developer",
                    id: "cert_hr_fe",
                    date: "October 2024",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/frontend_developer_react%20certificate.png",
                    credentialUrl: "https://www.hackerrank.com/certificates/d0123fbe61f3",
                    details: [
                        '<a href="https://www.hackerrank.com/" target="_blank">HackerRank</a>',
                        "React, CSS, and JavaScript",
                        "<b>Issued:</b> October 11, 2024"
                    ]
                },
                {
                    title: "HackerRank Angular (Intermediate)",
                    id: "cert_hr_angular",
                    date: "October 2024",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/angular_intermediate%20certificate.png",
                    credentialUrl: "https://www.hackerrank.com/certificates/568be08b3514",
                    details: [
                        '<a href="https://www.hackerrank.com/" target="_blank">HackerRank</a>',
                        "Routing, NgModules, Observables for data transmission and event handling, Dependency Injections, and APIs",
                        "<b>Issued:</b> October 11, 2024"
                    ]
                },
                {
                    title: "HackerRank Go (Intermediate)",
                    id: "cert_hr_go",
                    date: "October 2024",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/golang_intermediate%20certificate.png",
                    credentialUrl: "https://www.hackerrank.com/certificates/bffe8be93fb9",
                    details: [
                        '<a href="https://www.hackerrank.com/" target="_blank">HackerRank</a>',
                        "Functions, pointers, file handling, building web services in Go and error handling",
                        "<b>Issued:</b> October 11, 2024"
                    ]
                },
                {
                    title: "HackerRank Javascript (Intermediate)",
                    id: "cert_hr_js",
                    date: "October 2024",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/javascript_intermediate%20certificate.png",
                    credentialUrl: "https://www.hackerrank.com/certificates/216c0cb409ef",
                    details: [
                        '<a href="https://www.hackerrank.com/" target="_blank">HackerRank</a>',
                        "Design Patterns, Memory management, concurrency model, and event loops, among others",
                        "<b>Issued:</b> October 11, 2024"
                    ]
                },
                {
                    title: "HackerRank R (Intermediate)",
                    id: "cert_hr_r",
                    date: "October 2024",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/r_intermediate%20certificate.png",
                    credentialUrl: "https://www.hackerrank.com/certificates/eb74ca4e3f5a",
                    details: [
                        '<a href="https://www.hackerrank.com/" target="_blank">HackerRank</a>',
                        "Conditional statements, loops, and functions, writing efficient and readable code, regular expressions in R, data structure manipulations, and times and dates",
                        "<b>Issued:</b> October 11, 2024"
                    ]
                },
                {
                    title: "HackerRank Node.js (Intermediate)",
                    id: "cert_hr_node",
                    date: "October 2024",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/nodejs_intermediate%20certificate.png",
                    credentialUrl: "https://www.hackerrank.com/certificates/082541e9663b",
                    details: [
                        '<a href="https://www.hackerrank.com/" target="_blank">HackerRank</a>',
                        "Topics of Data Structures (such as HashMaps, Stacks and Queues) and Algorithms (such as Optimal Solutions)",
                        "<b>Issued:</b> October 11, 2024"
                    ]
                },
                {
                    title: "HackerRank Rest API (Intermediate)",
                    id: "cert_hr_rest",
                    date: "October 2024",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/rest_api_intermediate%20certificate.png",
                    credentialUrl: "https://www.hackerrank.com/certificates/c8d2f0d9165a",
                    details: [
                        '<a href="https://www.hackerrank.com/" target="_blank">HackerRank</a>',
                        "Getting data from an API and process using parameters or paging",
                        "<b>Issued:</b> October 11, 2024"
                    ]
                },
                {
                    title: "HackerRank C# (Basic)",
                    id: "cert_hr_csharp",
                    date: "October 2024",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/c_sharp_basic%20certificate.png",
                    credentialUrl: "https://www.hackerrank.com/certificates/7ab02f58a5b3",
                    details: [
                        '<a href="https://www.hackerrank.com/" target="_blank">HackerRank</a>',
                        "Structure of C# programs, types, and Variables, basic OOP, Properties and Indexers, Collections, Exception handling, among others",
                        "<b>Issued:</b> October 13, 2024"
                    ]
                },
                {
                    title: "HackerRank CSS (Basic)",
                    id: "cert_hr_css",
                    date: "October 2024",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/css%20certificate.png",
                    credentialUrl: "https://www.hackerrank.com/certificates/cb15349075d3",
                    details: [
                        '<a href="https://www.hackerrank.com/" target="_blank">HackerRank</a>',
                        "Cascading and Inheritance, exploring text styling fundamentals, understanding the use of layouts in CSS, understand the boxing of elements in CSS, among others",
                        "<b>Issued:</b> October 13, 2024"
                    ]
                },
                {
                    title: "HackerRank Python (Basic)",
                    id: "cert_hr_py2",
                    date: "October 2024",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/python_basic%20certificate.png",
                    credentialUrl: "https://www.hackerrank.com/certificates/b84b56319ddc",
                    details: [
                        '<a href="https://www.hackerrank.com/" target="_blank">HackerRank</a>',
                        "Scalar Types, Operators and Control Flow, Strings, Collections and Iteration, Modularity, Objects and Types and Classes",
                        "<b>Issued:</b> October 11, 2024"
                    ]
                },
                {
                    title: "HackerRank JAVA (Basic)",
                    id: "cert_hr_java",
                    date: "October 2024",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/java_basic%20certificate.png",
                    credentialUrl: "https://www.hackerrank.com/certificates/4ac127ae0995",
                    details: [
                        '<a href="https://www.hackerrank.com/" target="_blank">HackerRank</a>',
                        "Classes, data structures, inheritance, exception handling, etc. You are expected to be proficient in either Java 7 or Java 8",
                        "<b>Issued:</b> October 11, 2024"
                    ]
                },
                {
                    title: "HackerRank Problem Solving (Intermediate)",
                    id: "cert_hr_ps_int",
                    date: "January 2022",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/Problem%20Solving%20(Intermediate)%20Certificate.png",
                    credentialUrl: "https://www.hackerrank.com/certificates/5af21130d688",
                    details: [
                        '<a href="https://www.hackerrank.com/" target="_blank">HackerRank</a>',
                        "Data Structures (such as HashMaps, Stacks and Queues) and Algorithms (such as Optimal Solutions)",
                        "<b>Issued:</b> January 23, 2022"
                    ]
                },
                {
                    title: "HackerRank Problem Solving (Basic)",
                    id: "cert_hr_ps_basic",
                    date: "January 2022",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/Problem%20Solving%20(Basic)%20Certificate.png",
                    credentialUrl: "https://www.hackerrank.com/certificates/0a8a402e77b1",
                    details: [
                        '<a href="https://www.hackerrank.com/" target="_blank">HackerRank</a>',
                        "Data Structures (such as Arrays, Strings) and Algorithms (such as Sorting and Searching)",
                        "<b>Issued:</b> January 22, 2022"
                    ]
                },
                {
                    title: "HackerRank Python (Basic)",
                    id: "cert_hr_py1",
                    date: "January 2022",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/Python%20(Basic)%20Certificate.png",
                    credentialUrl: "https://www.hackerrank.com/certificates/4e15d1f36815",
                    details: [
                        '<a href="https://www.hackerrank.com/" target="_blank">HackerRank</a>',
                        "Scalar Types, Operators and Control Flow, Strings, Collections and Iteration, Modularity, Objects and Types and Classes",
                        "<b>Issued:</b> January 22, 2022"
                    ]
                }
            ],
            achievements: [
                {
                    title: "Summa Cum Laude",
                    id: "ach_summa",
                    date: "May 2023",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/sumcamlause.jpg",
                    credentialUrl: "https://rar.vcu.edu/graduation/",
                    details: [
                        "<b>GPA: </b> 3.95"
                    ]
                },
                {
                    title: "Altria Scholar",
                    id: "ach_altria",
                    date: "August 2021",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/altria.png",
                    credentialUrl: "https://www.altria.com/en",
                    details: [
                        '<a href="https://www.altria.com/en" target="_blank">Altria Group, Inc.</a>',
                        "Entrepreneurship and Professional Networking Seminars",
                        "Business Idea Pitching",
                        "<b>Scholarship Grant: </b> $3500"
                    ]
                },
                {
                    title: "iCubed Scholar",
                    id: "ach_icubed",
                    date: "August 2021",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/icubed%20(1).png",
                    credentialUrl: "https://icubed.vcu.edu/",
                    details: [
                        "<b>Research Area:</b> iCubed Food Core",
                        "Research Paper Publication",
                        "Poster Presentation"
                    ]
                },
                {
                    title: "Dean's List",
                    id: "ach_deans",
                    date: "Every Semester",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/vcu_eng.png",
                    credentialUrl: "https://egr.vcu.edu/about/dean/",
                    details: [
                        "Fall 2020, Spring 2021, Fall 2021, Spring 2022",
                        "Receive above 3.5 GPA",
                        "Top 10% of the Class"
                    ]
                },
                {
                    title: "Honors Trivia Champion",
                    id: "ach_trivia",
                    date: "October 2020",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/honors.png",
                    credentialUrl: "https://honors.vcu.edu/",
                    details: [
                        "Hosted by Honors College",
                        "General Science, Social Science, and Math"
                    ]
                },
                {
                    title: "Superintendent's Scholar",
                    id: "ach_super",
                    date: "July 2020",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/henrico.jpg",
                    credentialUrl: "https://henricoschools.us/division-leadership-team/",
                    details: [
                        "High School Graduation, Henrico County Public Schools",
                        "Top 5% of Class of 2020"
                    ]
                },
                {
                    title: "Henrico County Engineering Scholar",
                    id: "ach_henrico",
                    date: "August 2020",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/henrico.jpg",
                    credentialUrl: "https://henrico.us/",
                    details: [
                        "<b>Scholarship Grant: </b> $40,000",
                        '<a href="https://thecollegecompanion.com/henrico-county-virginia-commonwealth-university-engineering-scholarship-program/" target="_blank">Henrico County</a>',
                        '<a href="https://egr.vcu.edu/admissions/scholarships/" target="_blank">Virginia Commonwealth University</a>'
                    ]
                },
                {
                    title: "CarMax Entrepreneur Scholar",
                    id: "ach_carmax",
                    date: "August 2020",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/carmax.png",
                    credentialUrl: "https://www.carmax.com/",
                    details: [
                        "<b>Scholarship Grant: </b> $2500",
                        '<a href="https://www.cfrichmond.org/Partnering-with-Us/For-Nonprofits/Awards-Scholarships/Search-by-Scholarship-Criteria/Results?s=CarMax-Rick+Sharp+Entrepreneur+Scholarship" target="_blank">CarMax</a>'
                    ]
                },
                {
                    title: "Susanne and Sam Dibert Scholar",
                    id: "ach_dibert",
                    date: "August 2020",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/swagelok.png",
                    credentialUrl: "https://www.swagelok.com/",
                    details: [
                        "<b>Scholarship Grant: </b> $2500",
                        '<a href="https://www.swagelok.com/" target="_blank">Swagelok</a>'
                    ]
                },
                {
                    title: "GRRC Award",
                    id: "ach_grrc",
                    date: "August 2020",
                    imageUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/grrc.png",
                    credentialUrl: "https://richmondrelo.org/",
                    details: [
                        "<b>Scholarship Grant: </b> $2500",
                        '<a href="https://richmondrelo.org/scholarships/" target="_blank">Greater Richmond Relocation Council</a>'
                    ]
                },
                {
                    title: "Harrison-Labouisse Memorial Scholar",
                    id: "ach_harrison",
                    date: "August 2020",
                    imageUrl: null,
                    credentialUrl: null,
                    details: [
                        "<b>Scholarship Grant: </b> $1500",
                        '<a href="https://www.cfrichmond.org/Apply-for-a-Scholarship/View-All-Scholarships?s=Harrison-Labouisse-Mayo+Memorial+Scholarship" target="_blank">Harrison-Labouisse Memorial</a>'
                    ]
                }
            ],
            publications: [
                {
                    title: "Cronus: An Automated Feedback Tool for Concept Maps",
                    id: "paper_cronus",
                    date: "2021",
                    type: "paper",
                    pdfUrl: "./pdf/Cronus_An_Automated_Feedback_Tool_for_Concept_Maps.pdf",
                    pdfIconUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/adobe-pdf-icon-logo-png-transparent.png",
                    details: [
                        '<b>M. A. Dahir</b>, S. A. Qasim and I. Ahmed, "Cronus: An Automated Feedback Tool for Concept Maps," in <i>IEEE Access</i>, vol. 9, pp. 119564-119577, 2021, doi: <a href="https://ieeexplore.ieee.org/document/9519627" target="_blank">10.1109/ACCESS.2021.3106509</a>.'
                    ]
                },
                {
                    title: "ClaimChain: Secure Blockchain Platform for Handling Insurance Claims Processing",
                    id: "paper_claimchain",
                    date: "2021",
                    type: "paper",
                    pdfUrl: "./pdf/ClaimChain.pdf",
                    pdfIconUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/adobe-pdf-icon-logo-png-transparent.png",
                    details: [
                        '<b>M. A. Dahir</b>, Naga Ramya Bhamidipati, et al., "ClaimChain: Secure Blockchain Platform for Handling Insurance Claims Processing," <i>2021 IEEE International Conference on Blockchain (Blockchain)</i>, 2021, pp. 55-64, doi: <a href="https://ieeexplore.ieee.org/document/9680598" target="_blank">10.1109/Blockchain53845.2021.00019</a>.'
                    ]
                },
                {
                    title: "Continuation of the VA Security Operations Center (SOC)",
                    id: "poster_soc",
                    date: "2023",
                    type: "poster",
                    pdfUrl: "./pdf/CS 23-318_Poster.pdf",
                    pdfIconUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/adobe-pdf-icon-logo-png-transparent.png",
                    details: [
                        '<b>M. A. Dahir</b>, N. Camacho, G. Attard, J. Watkins, "Continuation of the VA Security Operations Center (SOC)," VCU Capstone Design Expo, 2023.'
                    ]
                },
                {
                    title: "Facing Food Insecurity During COVID-19",
                    id: "poster_food",
                    date: "2022",
                    type: "poster",
                    pdfUrl: "./pdf/VCU_Health_Research.pdf",
                    pdfIconUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/adobe-pdf-icon-logo-png-transparent.png",
                    details: [
                        '<b>Dahir M</b>, Jones J, et al., "Facing Food Insecurity During COVID-19: The Emerging Case of Little Free Food Pantries," VCU Symposium for Undergraduate Research and Creativity, 2022.'
                    ]
                },
                {
                    title: "ClaimChain Poster",
                    id: "poster_claimchain",
                    date: "2021",
                    type: "poster",
                    pdfUrl: "./pdf/NewClaimchainPoster.pdf",
                    pdfIconUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/adobe-pdf-icon-logo-png-transparent.png",
                    details: [
                        '<b>Masrik Dahir</b>, Hank Stafford, Roshan Neupane, et al., "ClaimChain: Secure Blockchain Platform for Handling Insurance Claims Processing," MU Digital Library, University of Missouri, 2021. <a href="https://lnkd.in/ewvaniu" target="_blank">Umsystem.edu</a>'
                    ]
                },
                {
                    title: "Cronus Poster",
                    id: "poster_cronus",
                    date: "2021",
                    type: "poster",
                    pdfUrl: "./pdf/CronusPoster.pdf",
                    pdfIconUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/adobe-pdf-icon-logo-png-transparent.png",
                    details: [
                        '<b>M. A. Dahir</b>, S. A. Qasim and I. Ahmed, "Cronus: An Automated Feedback Tool for Concept Maps," VCU DURI Symposium, 2021.'
                    ]
                },
                {
                    title: "The Last Basketball Game",
                    id: "editor_basketball",
                    date: "2020",
                    type: "editor",
                    pdfUrl: "./pdf/The Hearing 2019-2020.pdf",
                    pdfIconUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/adobe-pdf-icon-logo-png-transparent.png",
                    details: [
                        '<b>Masrik Dahir</b>, et al., "The Last Basketball Game," <i>Hearing</i>, June 2020, pp. 28-29.'
                    ]
                },
                {
                    title: "ClaimChain Presentation",
                    id: "pres_claimchain",
                    date: "2021",
                    type: "presentation",
                    pdfUrl: "./pdf/ClaimChainPowerPoint.pdf",
                    pdfIconUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/adobe-pdf-icon-logo-png-transparent.png",
                    details: [
                        '<b>Masrik Dahir</b>, Hank Stafford, "ClaimChain: Secure Blockchain Platform for Handling Insurance Claims Processing," Undergraduate Research and Creative Achievements Forum, July 2021, University of Missouri, Columbia. Presentation.'
                    ]
                }
            ],
            courses_cs: [
                {
                    title: "Senior Project I (Capstone)",
                    id: "cs_cmsc451",
                    date: "Fall 2022",
                    details: [
                        "CMSC 441 & 451",
                        "Topics relevant to senior-level computer science students in support of the capstone project",
                        "Proposal writing; project planning and management; scheduling resources and budgeting",
                        "Write and revise a research paper on a technical topic associated with the project",
                        '<a href="https://github.com/VCU-CS-Capstone/CS-22-323-Federal-Reserve-Project" target="_blank">Github: Federal Reserve</a>',
                        '<a href="https://github.com/VCU-CS-Capstone/CS-23-318-Continuation-of-the-VA-Security-Operations-Center-SOC-.git" target="_blank">Github: VA SOC</a>'
                    ]
                },
                {
                    title: "Parallel Algorithms",
                    id: "cs_cmsc502",
                    date: "Fall 2022",
                    details: [
                        "CMSC 502",
                        "Software and hardware mechanisms for providing mutual exclusion in uniprocessor and multiprocessor environments",
                        "Architectural issues including pipeline design, superscalar computers, multiprocessors, memory systems",
                        "Design and uses of parallel algorithms to solve concurrency problems in a distributed environment",
                        '<a href="https://github.com/Masrik-Dahir/Parallal_algorithm" target="_blank">Github</a>'
                    ]
                },
                {
                    title: "Advanced Algorithms",
                    id: "cs_cmsc501",
                    date: "Fall 2022",
                    details: [
                        "CMSC 501",
                        "Advanced graph algorithms, advanced data structures, applied numerical algorithms, optimization methods, approximation methods for hard graph and string problems and computational geometry algorithms",
                        '<a href="https://github.com/Masrik-Dahir/Advanced_algorithm" target="_blank">Github</a>'
                    ]
                },
                {
                    title: "Election Security",
                    id: "cs_engr291",
                    date: "Spring 2022",
                    details: [
                        "ENGR 291",
                        "Risk assessment, security audits and security plans"
                    ]
                },
                {
                    title: "Data Communication and Networking",
                    id: "cs_cmsc440",
                    date: "Spring 2022",
                    details: [
                        "CMSC 440",
                        "Computer networking, focusing on the applications and protocols that run on the Internet",
                        "A top-down approach to the layered network architecture",
                        "The operation of applications such as the web, FTP, e-mail and DNS",
                        "Network security and wireless/mobile networking",
                        '<a href="https://github.com/Masrik-Dahir/Data_communication_and_networking" target="_blank">Github</a>'
                    ]
                },
                {
                    title: "Database Theory",
                    id: "cs_cmsc508",
                    date: "Spring 2022",
                    details: [
                        "CMSC 508",
                        "Design and implementation of relational database systems",
                        "Entity-relationship diagrams, relational algebra, normal forms and normalization",
                        "Introduction to SQL",
                        '<a href="https://github.com/Masrik-Dahir/DATABASE_database" target="_blank">Github</a>'
                    ]
                },
                {
                    title: "Computer & Network Security",
                    id: "cs_cmsc414",
                    date: "Spring 2022",
                    details: [
                        "CMSC 414",
                        "Best practices of computer systems and network security",
                        "Key topics include security architecture, cryptographic systems and security management tools",
                        '<a href="https://github.com/Masrik-Dahir/Computer-and-Network-Security" target="_blank">Github</a>'
                    ]
                },
                {
                    title: "Programming Language",
                    id: "cs_cmsc403",
                    date: "Spring 2022",
                    details: [
                        "CMSC 403",
                        "Formal definition of programming languages including specifications of syntax and semantics",
                        "List processing, string manipulation, data description and simulation languages",
                        '<a href="https://github.com/Masrik-Dahir/Programming-Language" target="_blank">Github</a>'
                    ]
                },
                {
                    title: "Introduction to Operating Systems",
                    id: "cs_cmsc312",
                    date: "Spring 2022",
                    details: [
                        "CMSC 312",
                        "Computer systems design, I/O processing, secondary memory organization, memory management and job scheduling",
                        '<a href="https://github.com/Masrik-Dahir/Operating-System" target="_blank">Github</a>'
                    ]
                },
                {
                    title: "Algorithm Analysis with Advanced Data Structure",
                    id: "cs_cmsc401",
                    date: "Fall 2021",
                    details: [
                        "CMSC 401",
                        "Multiple linked lists, height-balanced trees, B-trees, hashing and graph representation",
                        '<a href="https://github.com/Masrik-Dahir/Algorithm-Analysis-with-Advanced-Data-Structures" target="_blank">Github</a>'
                    ]
                },
                {
                    title: "Fundamentals Software Engineering",
                    id: "cs_cmsc355",
                    date: "Fall 2021",
                    details: [
                        "CMSC 355",
                        "Software development methodology, write specification and design documents, and develop a prototype",
                        '<a href="https://play.google.com/store/apps/details?id=com.masrik.automation" target="_blank">Android App</a>',
                        '<a href="https://github.com/Masrik-Dahir/xfigx-1.0.0" target="_blank">Github (C Application)</a>'
                    ]
                },
                {
                    title: "Computer Organization",
                    id: "cs_cmsc311",
                    date: "Fall 2021",
                    details: [
                        "CMSC 311",
                        "Elementary digital logic design, processor and arithmetic/logic unit design, data paths, memory hierarchy",
                        '<a href="https://github.com/Masrik-Dahir/Computer-Organization" target="_blank">Github</a>'
                    ]
                },
                {
                    title: "Introduction to Theory of Computation",
                    id: "cs_cmsc303",
                    date: "Fall 2021",
                    details: [
                        "CMSC 303",
                        "Complexity classes, grammars, automata, formal languages, Turing machines, computability",
                        '<a href="https://github.com/Masrik-Dahir/dfa" target="_blank">Github</a>'
                    ]
                },
                {
                    title: "Computer System",
                    id: "cs_cmsc257",
                    date: "Fall 2021",
                    details: [
                        "CMSC 257",
                        "UNIX essentials; system programming in C; machine-level representation; arrays and pointers; memory management; shell programming",
                        '<a href="https://github.com/Masrik-Dahir/Computer-System" target="_blank">Github</a>'
                    ]
                },
                {
                    title: "Discrete Mathematics",
                    id: "cs_cmsc302",
                    date: "Spring 2021",
                    details: [
                        "CMSC 302",
                        "Logic and proofs, sets, functions, sequences and sums, relations, graphs, trees, induction and recursion"
                    ]
                },
                {
                    title: "Data Structure and Object-Oriented Programming",
                    id: "cs_cmsc256",
                    date: "Spring 2021",
                    details: [
                        "CMSC 256",
                        "Bridge API, object-oriented design, inheritance, polymorphism, exceptions, linked lists, stacks, queues, binary trees, recursion",
                        '<a href="https://github.com/Masrik-Dahir/Data-Structures-and-Object-Oriented-Programming" target="_blank">Github</a>'
                    ]
                },
                {
                    title: "Introduction to Programming",
                    id: "cs_cmsc255",
                    date: "Fall 2020",
                    details: [
                        "CMSC 255",
                        "Fundamental Computing Skills, Object-oriented programming, Control structures, Methods, Arrays, Java",
                        '<a href="https://github.com/Masrik-Dahir/Introduction-to-JAVA" target="_blank">Github</a>'
                    ]
                }
            ],
            courses_math: [
                {
                    title: "Graphs and Algorithms",
                    id: "math_356",
                    date: "Spring 2021",
                    details: [
                        "MATH 356",
                        "Trees, colorings and matchings; Dijkstra's and Kruskal's algorithms"
                    ]
                },
                {
                    title: "Linear Algebra",
                    id: "math_310",
                    date: "Fall 2020",
                    details: [
                        "MATH 310",
                        "System of Linear Equation, Vector Space, Matrix operations, Determinant, Eigen vector and values"
                    ]
                },
                {
                    title: "Concepts of Statistics",
                    id: "math_stat212",
                    date: "Fall 2020",
                    details: [
                        "STAT 212 (Advanced Placement Exam)",
                        "Descriptive statistics, correlation and regression, probability, normal distributions"
                    ]
                },
                {
                    title: "Calculus with Analytical Geometry II",
                    id: "math_201",
                    date: "Spring 2020",
                    details: [
                        "MATH 201",
                        "Application of differentiation and integration, Infinite Series, selected topic in analytical geometry"
                    ]
                },
                {
                    title: "Calculus with Analytical Geometry I",
                    id: "math_200",
                    date: "Fall 2019",
                    details: [
                        "MATH 200",
                        "Limits, Derivatives, Differentials, Antiderivatives, Definite Integrals, Continuity"
                    ]
                },
                {
                    title: "Precalculus Mathematics",
                    id: "math_151",
                    date: "Spring 2019",
                    details: [
                        "MATH 151",
                        "Application of Algebra, Trigonometry, functions, transformations"
                    ]
                }
            ],
            courses_finance: [
                {
                    title: "Real Estate Finance & Capital Market",
                    id: "fin_fire435",
                    date: "Fall 2022",
                    details: [
                        "FIRE 435",
                        "Instruments, techniques and institutions of real estate finance",
                        "Financial modeling with various software programs"
                    ]
                },
                {
                    title: "Managing People-Organizations",
                    id: "fin_mgmt310",
                    date: "Summer 2022",
                    details: [
                        "MGMT 310",
                        "Clep Exam",
                        "Principles, practices and laws that govern the real estate enterprise"
                    ]
                },
                {
                    title: "Legal Environment of Business",
                    id: "fin_busn323",
                    date: "Summer 2022",
                    details: [
                        "BUSN 323",
                        "Clep Exam",
                        "Basic legal concepts applicable to business, contracts, employment relationships, sales"
                    ]
                },
                {
                    title: "Principle of Real Estate",
                    id: "fin_fire305",
                    date: "Spring 2022",
                    details: [
                        "FIRE 305",
                        "Principles, practices and laws that govern the real estate enterprise, including property rights"
                    ]
                }
            ]
        };
    },
    methods: {
        toggle: function (id) {
            this.expandedItems[id] = !this.expandedItems[id];
        },
        isExpanded: function (id) {
            return !!this.expandedItems[id];
        }
    }
});

app_academia.mount("#app_academia");
