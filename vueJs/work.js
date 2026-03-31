/**
 * work.js - Vue data and template bindings for the Career page.
 *
 * Mounts to #app_work. Each entry in the jobs array renders as a card
 * with title, dates, company logo, badge icons, and bullet points.
 *
 * Requires: Vue 3, default.js (for shared Vue app utilities)
 */
var app_work = Vue.createApp({
    data: function () {
        return {
            windowWidth: window.innerWidth,
            jobs: [
                {
                    title: "Software Engineer",
                    dateStart: "Jan 2025",
                    dateEnd: "",
                    isPresent: true,
                    companyName: "Capital One Financial Corporation",
                    companyUrl: "https://www.capitalone.com/",
                    companyText: "",
                    logoUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/capitalone.png",
                    logoStyle: "float: left; vertical-align: middle; margin: 5px; width: calc(1vw + 100px); margin-left: calc(0% + -20px)",
                    badges: [],
                    bullets: [
                        "Designed and implemented a scalable, event-driven microservices architecture on AWS to automate detection of expired IAM and ACM certificates across all Capital One accounts. Utilized decoupled Lambda functions orchestrated via SQS queues: one function aggregated multi-account metadata and published to SQS; a second function concurrently consumed messages to identify expired certificates and relay findings to a downstream SQS queue, which triggered a final Lambda function to persist results in DynamoDB for centralized auditing and compliance reporting",
                        "Led the migration of secrets for business applications (BACERTIFICATECATALOG, BAACMAUTOMATION, BATLSCERTMANAGER) to AWS Secrets Manager in compliance with ETB-1943. Transitioned from unmanaged to managed secrets, automating secret lifecycle management and eliminating operational overhead and run-the-engine work",
                        "Developed and integrated live dependency tests for business applications (BACERTIFICATECATALOG, BATLSCERTMANAGER) in accordance with CTB5 standards. Migrated test framework from Puppeteer to Playwright, improving CI/CD reliability, reducing flakiness, accelerating build times, and resolving long-standing technical debt"
                    ]
                },
                {
                    title: "Software Engineer Associate",
                    dateStart: "Jul 2023",
                    dateEnd: "Dec 2024",
                    isPresent: false,
                    companyName: "CoStar Group",
                    companyUrl: "https://www.costar.com/",
                    companyText: "",
                    logoUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/costar.png",
                    logoStyle: "width: calc(1vw + 100px); margin-left: calc(0% + -20px)",
                    badges: [
                        { title: "AWS Solutions Architect", url: "https://www.credly.com/badges/12749f5b-e7fc-460d-a317-60a1ebc976fe/public_url", img: "https://d3dw5jtb3w1kgy.cloudfront.net/aws-certified-solutions-architect-associate.png" },
                        { title: "AWS Certified Developer", url: "https://www.credly.com/badges/4ea74952-8783-44af-9425-119b2434bf38/public_url", img: "https://d3dw5jtb3w1kgy.cloudfront.net/acd.png" },
                        { title: "Postman API Student Expert", url: "https://api.badgr.io/public/assertions/6VeZHynPSSCsqE6RQIA0_A?identity__email=masrikdahir%40gmail.com", img: "https://d3dw5jtb3w1kgy.cloudfront.net/pafse.png" },
                        { title: "Databricks Generative AI Fundamentals", url: "https://credentials.databricks.com/65a906a0-cddf-4ef7-92d6-e4c8a35b8c97#gs.fi80df", img: "https://d3dw5jtb3w1kgy.cloudfront.net/databricksgenerativeai.png" },
                        { title: "Databricks Fundamentals", url: "https://credentials.databricks.com/3fc5d768-443c-40fa-828c-fedadb94ba5e#gs.f0fbn2", img: "https://d3dw5jtb3w1kgy.cloudfront.net/databricksfundamental.png" }
                    ],
                    bullets: [
                        "C#, .NET, .NET Framework, Entity Framework, ASP.NET, ASP.NET Core, NUnit",
                        "TypeScript, React, REST APIs with .NET and C#, Microsoft SQL Server",
                        "AWS: DynamoDB, EKS, Lambda, Athena, SQS, SNS, S3, Fargate, EC2, IAM, Terraform, DataBrew, Glue",
                        "Datadog, Alteryx, Databricks",
                        "Built dynamic and generic processes to handle ETL jobs",
                        "Separation of concerns, microservice API, storage and memory management via throttling and threading, dynamic workflow for plans with conditional branching",
                        "Built File Sync to transfer files between SFTP, FTP, UNC, and S3 with configurable chunking, decompression, throttling, and file structure",
                        "Built Dynamic Message Transmitter to transmit messages to and from SQS, SNS, and Apache Kafka",
                        "Used Kubernetes to scale microservice APIs, implemented Redis Cache on API routes to reduce latency",
                        "Built Stage Athena to copy data streams from Athena to Microsoft SQL Server and PostgreSQL (schema conversion &amp; data insertion)",
                        "Built Step Function Invoker to monitor step function steps and paths",
                        'Built pipelines and processes for school and tenant data: <a href="https://www.homes.com/" target="_blank">Homes.com</a>, <a href="https://www.apartments.com/" target="_blank">Apartments.com</a>, <a href="https://www.costar.com/" target="_blank">Costar.com</a>, and <a href="https://www.loopnet.com/" target="_blank">Loopnet.com</a>',
                        "Built frontend architecture to display residential and commercial data"
                    ]
                },
                {
                    title: "Software Engineer Intern",
                    dateStart: "May 2022",
                    dateEnd: "Jun 2023",
                    isPresent: false,
                    companyName: "Capital One Financial Corporation",
                    companyUrl: "https://www.capitalone.com/",
                    companyText: "",
                    logoUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/capitalone.png",
                    logoStyle: "float: left; vertical-align: middle; margin: 5px; width: calc(1vw + 100px); margin-left: calc(0% + -20px)",
                    badges: [
                        { title: "AWS Cloud Practitioner", url: "https://www.credly.com/badges/d5fb9b8a-3519-4480-bd92-ab5d066ce8d8", img: "https://d3dw5jtb3w1kgy.cloudfront.net/aws-certified-cloud-practitioner.png" },
                        { title: "Digital Thinking", url: "https://www.credly.com/badges/8b7e822d-0fbd-488c-a4a2-576f45132df1", img: "https://d3dw5jtb3w1kgy.cloudfront.net/idt.png" },
                        { title: "The Art of the Pitch", url: "https://www.credly.com/badges/428e687d-68fa-4ced-b123-2399275d921d", img: "https://d3dw5jtb3w1kgy.cloudfront.net/taop.png" },
                        { title: "Business Model Canvas", url: "https://www.credly.com/badges/87a2accc-5b8c-42a9-a923-c4e191881f86", img: "https://d3dw5jtb3w1kgy.cloudfront.net/itbmc.png" }
                    ],
                    bullets: [
                        "Node.Js: NVM, HTTP API, Fastify, DynamoDB, NPM, Yarn;",
                        "Vue.Js: Vue CLI, database;",
                        "AWS: IAM roles, EC2 instances, S3 buckets and policy, ASGs, ALB, Lambda functions, Node API",
                        "UI Designing, Full Stack development, Agile development, REST API Call, Content and Performance Testing, building API endpoint, cache and content management, JIRA board, Postman",
                        "Introduced a new caching entry to a Partner API for holding a list of capabilities",
                        "Created resource layer to enable new endpoints and performed Content and Performance Testing",
                        "Added a feature to visualize a preview of email communication sent to capital one customers",
                        "Used agile development with JIRA Board to collaborate with the team; Created a UI for a Spring Boot application",
                        "Maintained, committed, and resolved issues in message-preview repository"
                    ]
                },
                {
                    title: "Virginia Cyber Navigator",
                    dateStart: "May 2022",
                    dateEnd: "Aug 2022",
                    isPresent: false,
                    companyName: "Virginia Department of Elections",
                    companyUrl: "https://www.elections.virginia.gov/",
                    companyText: "",
                    logoUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/dept-of-elections-logo.png",
                    logoStyle: "width: calc(1vw + 200px); margin-left: calc(0% + -20px)",
                    badges: [],
                    bullets: [
                        "Worked closely with Roanoke County and Virginia Department of Election",
                        "Incident Response, Access Management Policy, Business Impact Analysis",
                        "Inventory and Database Security"
                    ]
                },
                {
                    title: "Undergrad Researcher",
                    dateStart: "Aug 2021",
                    dateEnd: "May 2022",
                    isPresent: false,
                    companyName: "VCU iCubed",
                    companyUrl: "https://cbds.vcu.edu/",
                    companyText: "",
                    logoUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/life.png",
                    logoStyle: "width: calc(1vw + 100px); min-width: 210px; margin-left: calc(0% + -25px)",
                    badges: [
                        { title: "Presentation of Research", url: "https://www.credly.com/badges/3444641a-9f4a-41ab-8ff2-e978d642acb5/public_url", img: "https://d3dw5jtb3w1kgy.cloudfront.net/por.png" }
                    ],
                    bullets: [
                        "Built and coded automated Rampantries (food cart at VCU Monroe Park Campus); and",
                        "Used Raspberry pi to receive data and save it in the Cloud storage."
                    ]
                },
                {
                    title: "Web Developer",
                    dateStart: "Jun 2021",
                    dateEnd: "Jan 2022",
                    isPresent: false,
                    companyName: "VCU School of Pharmacy",
                    companyUrl: "https://pharmacy.vcu.edu/",
                    companyText: "",
                    logoUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/sop.png",
                    logoStyle: "width: calc(1vw + 100px); min-width: 210px; margin-left: calc(0% + -25px)",
                    badges: [],
                    bullets: [
                        "Manage VCU School of Pharmacy's website and multiple lab websites; and",
                        "Utilize the Terminal 4 content management system",
                        "Worked with Compass framework, WordPress, and cPanel",
                        "HTML, CSS, JavaScript, PHP, JQuery, AngularJS",
                        "Firmware troubleshoot and update"
                    ]
                },
                {
                    title: "AT&amp;T Summer Learning Academy Extern",
                    dateStart: "May 2021",
                    dateEnd: "Sep 2021",
                    isPresent: false,
                    companyName: "AT&T Inc.",
                    companyUrl: "https://www.att.com/",
                    companyText: "",
                    logoUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/att.png",
                    logoStyle: "width: calc(1vw + 40px); min-width: 100px; margin-left: calc(0% + -20px)",
                    badges: [
                        { title: "AT&T Academy Extern", url: "https://www.credly.com/badges/d388f220-d5f2-44d8-8cee-7f2892d45f97/public_url", img: "https://d3dw5jtb3w1kgy.cloudfront.net/badge_att.png" }
                    ],
                    bullets: [
                        "5G and Edge Technology, Artificial Intelligence, Business Ethics, Cable Routing Basics, etc.",
                        "Participated and contributed in live events"
                    ]
                },
                {
                    title: "Research Fellow",
                    dateStart: "Jun 2021",
                    dateEnd: "Jul 2021",
                    isPresent: false,
                    companyName: "VIMAN Lab, Mizzou Engineering",
                    companyUrl: "https://engineering.missouri.edu/",
                    companyText: "",
                    logoUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/mu.jpg",
                    logoStyle: "width: calc(1vw + 100px); min-width: 210px; margin-left: calc(0% + -20px)",
                    badges: [],
                    bullets: [
                        "Developed a secured system in blockchain to process insurance claims and prevent fraudulent claims and cyber-attacks i.e. Sybil attack, 50% attack, Timestamp manipulation, Malware, and Malicious code injection;",
                        "Web Development, Angular Framework, Typescript, Hyperledger Composer. MySQL, Big Data Analysis; and",
                        "Firebase, AWS Services, Hadoop HDFS, Blockchain Technology, Formal Verification of System, Attack Scenarios.",
                        '<a href="https://www.nsf.gov/" target="_blank">NSF</a> funded'
                    ]
                },
                {
                    title: "Cyber Security Analyst",
                    dateStart: "Feb 2021",
                    dateEnd: "Jun 2021",
                    isPresent: false,
                    companyName: "Civilian Cyber LLC",
                    companyUrl: "https://civiliancyber.com/",
                    companyText: "Civilian Cyber",
                    logoUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/civiliancyber.png",
                    logoStyle: "width: calc(1vw + 50px); min-width: 50px; margin-left: calc(0% + -20px)",
                    badges: [],
                    bullets: [
                        "Working on Joomla, Moodle framework; Administering databases; Integrating plug-ins: Community Builder, Joomdle; and",
                        "Developed advanced automation capable of providing feedback based on user's performance; and",
                        "Penetration Tests."
                    ]
                },
                {
                    title: "Undergrad Researcher",
                    dateStart: "Jun 2020",
                    dateEnd: "May 2022",
                    isPresent: false,
                    companyName: "SAFE Lab, VCU Engineering",
                    companyUrl: "https://safe.lab.vcu.edu/",
                    companyText: " SAFE Lab",
                    logoUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/safelab.JPG",
                    logoStyle: "width: calc(1vw + 50px); min-width: 70px; margin-left: calc(0% + -20px)",
                    badges: [],
                    bullets: [
                        "Researched in concept map files comparison and analysis using the algorithm; and",
                        "Computer Programs: CmapTools, PyCharm; Programming Language: Python; Libraries: Nltk, Graphviz, XML, Natural Language Processing.",
                        "---",
                        "Creating a Graphical User Interface (GUI) that allows the memory of a virtual machine to manipulate the memory contents (demonstrate malware intrusion), Virtual Machine Introspection; and",
                        "Programming Language: C, Python; Libvmi library, Volatility library, GUI Libraries (i.e., PyQT5)."
                    ]
                },
                {
                    title: "Undergrad Researcher",
                    dateStart: "Jan 2021",
                    dateEnd: "Sep 2021",
                    isPresent: false,
                    companyName: "RamSec Lab, VCU Engineering",
                    companyUrl: "http://www.people.vcu.edu/~cfung/lab.html",
                    companyText: "RamSec: Cybersecurity Lab",
                    logoUrl: "https://d3dw5jtb3w1kgy.cloudfront.net/vcu.png",
                    logoStyle: "width: calc(1vw + 40px); min-width: 50px; margin-left: calc(0% + -20px)",
                    badges: [],
                    bullets: [
                        "Studying the existing models (IP Trackback Technique, Packet Market Technique, Entropy Variation, Signature-based detection, Anomaly Detection) to prevent DDoS attacks; and",
                        "Researching the server CPU loads in Syn Flood attack using Quic and TCP packets."
                    ]
                }
            ]
        };
    },
    mounted: function () {
        window.addEventListener("resize", this.onResize);
    },
    beforeUnmount: function () {
        window.removeEventListener("resize", this.onResize);
    },
    methods: {
        onResize: function () {
            this.windowWidth = window.innerWidth;
        }
    }
});

app_work.mount("#app_work");
