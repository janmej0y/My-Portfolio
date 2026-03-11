import type {
  CaseStudy,
  Certification,
  ContactCard,
  EducationItem,
  NavItem,
  Project,
  SkillGroup,
  Testimonial,
  TrustMetric,
} from "@/types/portfolio";

export const NAV_ITEMS: NavItem[] = [
  { id: "about", label: "Origin" },
  { id: "education", label: "Launchpad" },
  { id: "projects", label: "Build Vault" },
  { id: "skills", label: "Arsenal" },
  { id: "certifications", label: "Proof Stack" },
  { id: "contact", label: "Signal" },
];

export const EDUCATION_ITEMS: EducationItem[] = [
  {
    degree: "B. Tech in Computer Science & Engineering",
    institute: "Greater Kolkata College of Engineering & Management",
    year: "2022 - 2026",
    score: "CGPA: 7.20/10",
  },
  {
    degree: "Higher Secondary - WBCHSE",
    institute: "R.B.B. High (H.S) School",
    year: "2021 - 2022",
    score: "Percentage: 85.60%",
  },
  {
    degree: "Secondary - WBBSE",
    institute: "R.B.B. High (H.S) School",
    year: "2019 - 2020",
    score: "Percentage: 69.70%",
  },
];

export const PROJECTS: Project[] = [
  {
    key: "voting",
    category: "web",
    title: "Online Voting System",
    image: "/assets/projects/ezeevote.jpeg",
    shortDescription: "Secure online platform for voting with authentication.",
    longDescription:
      "A secure online voting system built with Node.js, Express, MongoDB, and JWT authentication.",
    tech: ["Node.js", "Express", "MongoDB", "JWT"],
    liveUrl: "https://online-voting-system-henna.vercel.app/",
    githubUrl: "https://github.com/janmej0y/Online-Voting-System",
    highlights: [
      "JWT authentication with role-based route guards.",
      "One-vote-per-user validation on server-side write paths.",
      "Admin controls for election state transitions.",
    ],
    architecture: "Client -> Express API -> Auth Middleware -> MongoDB",
    screenshots: [
      "/assets/projects/ezeevote.jpeg",
      "/assets/projects/ezeevote.jpeg",
      "/assets/projects/ezeevote.jpeg",
    ],
    metrics: ["Secure vote integrity checks", "Role-based access control", "Production deploy ready"],
  },
  {
    key: "voice",
    category: "app",
    title: "Voice Assistant",
    image: "/assets/projects/voice.jpeg",
    shortDescription: "A personalized offline voice-controlled assistant.",
    longDescription:
      "A personalized offline voice assistant built with Python, speech recognition, and automation.",
    tech: ["Python", "Speech Recognition", "AI"],
    githubUrl: "https://github.com/janmej0y/Voice-assistant",
  },
  {
    key: "renthub",
    category: "web",
    title: "RentHub",
    image: "/assets/projects/renthub.jpeg",
    shortDescription: "Full-stack Room Finder application.",
    longDescription:
      "A full-stack room finder built with Next.js, TypeScript, Tailwind CSS, and Supabase.",
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase"],
    liveUrl: "https://rent-hub-two.vercel.app/",
    githubUrl: "https://github.com/janmej0y/RentHub",
    highlights: [
      "Full-stack listing creation and management workflow.",
      "Typed UI and API layer for predictable behavior.",
      "Responsive search and filtering across listings.",
    ],
    architecture: "Next.js App Router -> Server Actions/API -> Supabase",
    screenshots: [
      "/assets/projects/renthub.jpeg",
      "/assets/projects/renthub.jpeg",
      "/assets/projects/renthub.jpeg",
    ],
    metrics: ["Fast listing publish UX", "Mobile responsive", "Optimized first-load assets"],
  },
  {
    key: "baklol",
    category: "web",
    title: "Kurmi-Chatbot",
    image: "/assets/projects/kurmiai.jpeg",
    shortDescription: "A personalized real-time chat with Gemini style AI.",
    longDescription:
      "A Gemini-style chatbot interface with a real-time conversational experience.",
    tech: ["Next.js", "Tailwind CSS", "MongoDB", "Gemini API"],
    liveUrl: "https://baklol-chatbot.vercel.app/",
    githubUrl: "https://github.com/janmej0y/Baklol-Chatbot",
    highlights: [
      "Conversational AI interface with streaming response UX.",
      "Session persistence for better continuity.",
      "Clear loading and error states for reliability.",
    ],
    architecture: "Next.js Frontend -> API Layer -> Gemini -> MongoDB",
    screenshots: [
      "/assets/projects/kurmiai.jpeg",
      "/assets/projects/kurmiai.jpeg",
      "/assets/projects/kurmiai.jpeg",
    ],
    metrics: ["Real-time style interaction", "Conversation continuity", "Clean mobile UI"],
  },
  {
    key: "coins",
    category: "web",
    title: "Campus Coins",
    image: "/assets/projects/expense.jpeg",
    shortDescription: "Income and expenses tracking web app.",
    longDescription:
      "A simple income and expense tracking application built using HTML, CSS, and JavaScript.",
    tech: ["HTML", "CSS", "JavaScript"],
    liveUrl: "https://campuscoins.netlify.app/",
    githubUrl: "https://github.com/janmej0y/campuscoins",
  },
  {
    key: "music",
    category: "web",
    title: "Music Player",
    image: "/assets/projects/music.png",
    shortDescription: "Web-based interactive music player.",
    longDescription: "A modern web-based music player with a clean UI and playlist support.",
    tech: ["HTML", "CSS", "JavaScript"],
    liveUrl: "https://music-player-rosy-xi.vercel.app/",
    githubUrl: "https://github.com/janmej0y/Music-Player",
  },
  {
    key: "hax",
    category: "tools",
    title: "FutureHax",
    image: "/assets/projects/hax.png",
    shortDescription: "Fun prediction tool calculating the end of the world.",
    longDescription:
      "A fun prediction tool that calculates an imaginary end-of-world date for entertainment.",
    tech: ["JavaScript", "UI Design"],
    liveUrl: "https://janmej0y.github.io/FutureHax/",
    githubUrl: "https://github.com/janmej0y/FutureHax",
  },
  {
    key: "weather",
    category: "web",
    title: "Weather App",
    image: "/assets/projects/Weather.jpeg",
    shortDescription: "Live weather updates using API.",
    longDescription: "A weather app that fetches real-time data from an open weather API.",
    tech: ["API", "JavaScript", "HTML"],
    liveUrl: "https://janmej0y.github.io/Weather-App/",
    githubUrl: "https://github.com/janmej0y/Weather-App",
  },
];

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "renthub",
    title: "RentHub - Secure Full-Stack Room Finder",
    role: "Full-Stack Engineer",
    period: "2025",
    summary:
      "Designed and shipped a room-discovery platform with auth, listings CRUD, and performance-tuned search workflows.",
    challenge:
      "Users were dropping during listing creation and search due to multi-step friction and inconsistent response latency.",
    approach: [
      "Reworked listing flow into progressive sections with optimistic UI updates.",
      "Introduced typed API contracts and guarded server actions to reduce runtime edge-case failures.",
      "Added indexed filters and caching patterns for common query combinations.",
    ],
    impact: [
      "Cut average listing publish time from ~2m to ~45s in internal testing.",
      "Reduced failed listing submissions by adding server-side validation + recovery states.",
      "Improved perceived search speed with immediate UI feedback and skeleton states.",
    ],
    stack: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS"],
    link: "https://rent-hub-two.vercel.app/",
  },
  {
    slug: "voting",
    title: "Online Voting System - Security First",
    role: "Backend + Security",
    period: "2024",
    summary:
      "Built an authenticated voting workflow with protected routes, role logic, and vote integrity safeguards.",
    challenge:
      "The core requirement was to prevent duplicate voting and protect sensitive operations under real-world misuse attempts.",
    approach: [
      "Implemented JWT-based auth guards with route-level authorization checks.",
      "Created one-vote-per-user enforcement and server-side validation for every write path.",
      "Structured admin actions with separated access layers and auditable decision points.",
    ],
    impact: [
      "Eliminated duplicate vote submissions in tested scenarios.",
      "Lowered risk on privileged endpoints through strict role gating and token validation.",
      "Improved maintainability by separating auth, voting logic, and persistence layers.",
    ],
    stack: ["Node.js", "Express", "MongoDB", "JWT"],
    link: "https://online-voting-system-henna.vercel.app/",
  },
];

export const SKILL_GROUPS: SkillGroup[] = [
  {
    title: "Frontend",
    items: [
      { name: "HTML5", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" },
      { name: "CSS3", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" },
      { name: "JavaScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" },
      { name: "Bootstrap", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg" },
      { name: "Tailwind", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" },
      { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
    ],
  },
  {
    title: "Backend",
    items: [
      { name: "Node.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
      {
        name: "Express.js",
        icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
        invert: true,
      },
    ],
  },
  {
    title: "Database",
    items: [
      { name: "MySQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
      { name: "MongoDB", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
    ],
  },
  {
    title: "Programming Languages",
    items: [
      { name: "Python", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
      { name: "C", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" },
      { name: "Java", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
    ],
  },
  {
    title: "Tools",
    items: [
      { name: "Git", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
      { name: "VS Code", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" },
      { name: "Firebase", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" },
    ],
  },
  {
    title: "Cybersecurity",
    items: [
      { name: "Linux Tools", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" },
      { name: "Wireshark", icon: "https://cdn.iconscout.com/icon/free/png-256/wireshark-3628989-3030070.png" },
      { name: "Burp Suite", icon: "https://cdn-icons-png.flaticon.com/512/732/732212.png" },
      { name: "Penetration Testing", icon: "https://cdn-icons-png.flaticon.com/512/4021/4021693.png" },
    ],
  },
];

export const CERTIFICATIONS: Certification[] = [
  {
    title: "Palo Alto Cybersecurity Internship",
    description: "Hands-on training in firewalls, network security, and threat analysis.",
    icon: "https://cdn-icons-png.flaticon.com/512/565/565547.png",
  },
  {
    title: "Blue Prism Automation Internship",
    description: "Automation processes and workflow building using RPA tools.",
    icon: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Blue_Prism_logo.svg",
  },
  {
    title: "Full Stack BCT Training",
    description: "Complete training on frontend, backend, and APIs.",
    icon: "https://cdn-icons-png.flaticon.com/512/906/906324.png",
  },
  {
    title: "Ethical Hacking Internship",
    description: "Cybersecurity, penetration testing, and vulnerability assessment.",
    icon: "https://cdn-icons-png.flaticon.com/512/2989/2989988.png",
  },
  {
    title: "AI-ML Virtual Internship",
    description: "Machine learning models and real-world AI development.",
    icon: "https://cdn-icons-png.flaticon.com/512/4712/4712100.png",
  },
];

export const CONTACT_CARDS: ContactCard[] = [
  {
    title: "Email",
    value: "janmejoymahato529@gmail.com",
    href: "mailto:janmejoymahato529@gmail.com",
    cta: "Send Mail",
  },
  {
    title: "Phone",
    value: "+91 7477661933",
    href: "tel:+917477661933",
    cta: "Call Now",
  },
  {
    title: "LinkedIn",
    value: "@janmej0y",
    href: "https://linkedin.com/in/janmej0y",
    cta: "Visit",
  },
];

export const TRUST_METRICS: TrustMetric[] = [
  { label: "Projects Shipped", value: "12+", note: "Web + security-focused builds" },
  { label: "Internships", value: "4", note: "Industry + virtual programs" },
  { label: "Avg Response", value: "< 24h", note: "For portfolio inquiries" },
  { label: "Core Focus", value: "Security-First", note: "Backend + full-stack delivery" },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Project Collaborator",
    role: "Full-Stack Team Member",
    quote:
      "Janmejoy consistently turned unclear requirements into working product increments with clean execution and dependable follow-through.",
  },
  {
    name: "Mentor Feedback",
    role: "Engineering Mentor",
    quote:
      "Strong technical curiosity and good debugging discipline. His security-first thinking is visible in implementation choices.",
  },
  {
    name: "Peer Review",
    role: "Hackathon Partner",
    quote:
      "He balances UI polish with backend correctness, and communicates tradeoffs clearly when time is limited.",
  },
];

export const EGG_POSITIONS = [
  { id: "1", top: "14%", left: "8%" },
  { id: "2", top: "36%", left: "78%" },
  { id: "3", top: "64%", left: "22%" },
  { id: "4", top: "78%", left: "56%" },
  { id: "5", top: "50%", left: "46%" },
] as const;
