export type Service = {
  slug: string;
  icon: "education" | "consultancy" | "advisory" | "marketing";
  title: string;
  short: string;
  hero: string;
  image: string;
  intro: string[];
  features: { title: string; body: string }[];
  process: { step: string; title: string; body: string }[];
  packages: { name: string; price: string; note: string; items: string[]; featured?: boolean }[];
  faqs: { q: string; a: string }[];
  stats: { v: string; l: string }[];
};

export const SERVICES: Service[] = [
  {
    slug: "forex-trading-education",
    icon: "education",
    title: "Forex Trading Education",
    short: "In-depth, practical training programs that equip individuals with the skills to navigate the foreign exchange market.",
    hero: "/images/about-hero.jpg",
    image: "/images/about.jpg",
    intro: [
      "Our flagship service. We provide structured, practical forex education designed to take a complete beginner all the way to consistent, rule-based execution — without hype, signals or shortcuts.",
      "Every program combines self-paced video modules with live market sessions, trade journaling and direct mentor feedback, so knowledge actually converts into skill.",
    ],
    features: [
      { title: "Structured curriculum", body: "Progressive modules covering fundamentals, supply & demand, price action and risk management." },
      { title: "Live market sessions", body: "Weekly breakdowns where mentors trade real setups and explain every decision in real time." },
      { title: "Trade journaling", body: "A guided journal template plus personal reviews that expose the habits costing you money." },
      { title: "Certification", body: "A GAMAT Fx Academy certificate issued on completion of any full program." },
      { title: "Lifetime access", body: "Keep your course materials forever, including all future updates and re-recordings." },
      { title: "Private community", body: "Ongoing peer and mentor support long after your cohort finishes." },
    ],
    process: [
      { step: "01", title: "Skill assessment", body: "A short call or form to place you at the right entry point — beginner, intermediate or advanced." },
      { step: "02", title: "Enroll & onboard", body: "Instant access to your course library, workbooks and the private student community." },
      { step: "03", title: "Learn & apply", body: "Work through modules at your pace, then join weekly live sessions to apply them in live markets." },
      { step: "04", title: "Review & certify", body: "Submit journals for mentor review, hit your consistency targets, and earn your certificate." },
    ],
    packages: [
      { name: "Self-Paced", price: "From ₦39,999", note: "Best for beginners", items: ["Full course library access", "Lifetime updates", "Community access", "Certificate on completion"] },
      { name: "Guided Cohort", price: "From ₦99,999", note: "Most popular", featured: true, items: ["Everything in Self-Paced", "Weekly live sessions", "Group Q&A with mentors", "Trade journal reviews"] },
      { name: "1-on-1 Mentorship", price: "From ₦249,999", note: "Fastest results", items: ["Everything in Guided Cohort", "Personal mentor assigned", "Weekly private reviews", "Custom trading plan"] },
    ],
    faqs: [
      { q: "Do I need experience to start?", a: "No. Our Forex Foundations track assumes zero prior knowledge and takes you from what a currency pair is through to placing your first managed trade." },
      { q: "Are classes online or physical?", a: "Both. All courses are available online with lifetime access, and we run physical cohorts at our Port Harcourt campus." },
      { q: "Do you sell signals?", a: "Never. We teach analysis so you can make your own decisions. We deliberately do not operate a paid signal service." },
    ],
    stats: [{ v: "4,000+", l: "Students trained" }, { v: "12", l: "Programs" }, { v: "4.9/5", l: "Average rating" }],
  },
  {
    slug: "academy-setup-consultancy",
    icon: "consultancy",
    title: "Trading Academy Setup & Management Consultancy",
    short: "We help entrepreneurs and institutions launch credible, compliant and profitable trading academies from the ground up.",
    hero: "/images/services.jpg",
    image: "/images/services.jpg",
    intro: [
      "Running a trading academy is a business, not just a classroom. We have built one from a small study circle into a multi-thousand-student institution — and we now help others do the same.",
      "From curriculum architecture to tutor recruitment, physical setup and operational systems, we partner with you end to end or advise on the specific gaps you need closed.",
    ],
    features: [
      { title: "Curriculum design", body: "Module maps, learning outcomes, assessments and delivery schedules built for real retention." },
      { title: "Infrastructure planning", body: "Classroom layout, trading floor setup, hardware specs, connectivity and platform selection." },
      { title: "Tutor recruitment & training", body: "Sourcing, vetting and training instructors who can actually teach, not just trade." },
      { title: "Operational strategy", body: "Enrollment funnels, pricing, student support workflows and retention systems." },
      { title: "Compliance guidance", body: "Positioning your messaging and disclaimers responsibly within educational boundaries." },
      { title: "Technology stack", body: "LMS selection, payment processing, community platforms and reporting dashboards." },
    ],
    process: [
      { step: "01", title: "Discovery & audit", body: "We map your goals, market, budget and any existing assets or gaps." },
      { step: "02", title: "Blueprint", body: "A written plan covering curriculum, infrastructure, staffing, pricing and timeline." },
      { step: "03", title: "Build & implement", body: "We execute in agreed milestones — or guide your team through each stage." },
      { step: "04", title: "Launch & optimise", body: "Go-live support, staff training and a 90-day optimisation window." },
    ],
    packages: [
      { name: "Advisory Sprint", price: "From ₦350,000", note: "2 weeks", items: ["Full business audit", "Written blueprint", "2 strategy sessions", "Vendor recommendations"] },
      { name: "Full Setup", price: "From ₦1,500,000", note: "8–12 weeks", featured: true, items: ["Everything in Advisory", "Curriculum built for you", "Tutor recruitment & training", "Systems implementation", "Launch support"] },
      { name: "Retained Management", price: "Custom", note: "Ongoing", items: ["Everything in Full Setup", "Monthly performance reviews", "Ongoing staff development", "Priority support line"] },
    ],
    faqs: [
      { q: "Do you work outside Nigeria?", a: "Yes. Advisory and curriculum work is delivered remotely, and we travel for physical setup engagements by arrangement." },
      { q: "Will you compete with us?", a: "No. We operate non-compete agreements within your defined market and territory for the duration of the engagement." },
      { q: "Can you just do the curriculum?", a: "Absolutely — our Advisory Sprint can be scoped to curriculum design only." },
    ],
    stats: [{ v: "6+", l: "Years operating" }, { v: "40K+", l: "Community built" }, { v: "100%", l: "Confidential" }],
  },
  {
    slug: "business-training-advisory",
    icon: "advisory",
    title: "Business Training & Advisory",
    short: "Tailored training programs and advisory services that strengthen financial literacy, business acumen and decision-making across teams.",
    hero: "/images/about.jpg",
    image: "/images/about.jpg",
    intro: [
      "Financial literacy is a business capability, not a personal hobby. We deliver corporate training that helps teams understand markets, currency exposure, risk and disciplined decision-making.",
      "Programs are built around your organisation's context — whether you are a finance team managing FX exposure, a startup building financial discipline, or a group investing in staff development.",
    ],
    features: [
      { title: "Corporate financial literacy", body: "Practical sessions on markets, currency risk, inflation and personal finance for staff." },
      { title: "FX exposure workshops", body: "How currency movement affects your margins — and the practical levers available to you." },
      { title: "Team workshops", body: "Half-day and full-day formats delivered on-site or virtually for groups of any size." },
      { title: "Executive advisory", body: "Confidential one-to-one sessions for founders and executives on market strategy." },
      { title: "Process documentation", body: "Turning ad-hoc financial decisions into documented, repeatable internal processes." },
      { title: "Impact reporting", body: "Pre and post assessments so you can measure what the training actually changed." },
    ],
    process: [
      { step: "01", title: "Needs analysis", body: "We interview stakeholders and survey participants to find the real capability gaps." },
      { step: "02", title: "Custom design", body: "A bespoke curriculum built around your industry, terminology and objectives." },
      { step: "03", title: "Delivery", body: "On-site or virtual sessions with practical exercises and real scenarios from your business." },
      { step: "04", title: "Measure & embed", body: "Post-training assessment, documentation handover and optional follow-up coaching." },
    ],
    packages: [
      { name: "Workshop", price: "From ₦250,000", note: "Half day", items: ["Up to 25 participants", "Custom slide deck", "Participant workbooks", "Q&A session"] },
      { name: "Training Program", price: "From ₦750,000", note: "4–6 weeks", featured: true, items: ["Multi-session curriculum", "Pre/post assessments", "Participant workbooks", "Impact report", "Certificates"] },
      { name: "Advisory Retainer", price: "Custom", note: "Ongoing", items: ["Monthly executive sessions", "Unlimited email advisory", "Quarterly strategy reviews", "Priority scheduling"] },
    ],
    faqs: [
      { q: "How many people can attend?", a: "Workshops run comfortably up to 25 participants. Larger groups are split into cohorts to keep sessions interactive." },
      { q: "Can you deliver virtually?", a: "Yes — all programs are available fully virtual, on-site, or as a hybrid across multiple offices." },
      { q: "Do participants get certificates?", a: "Yes, for multi-session training programs. Single workshops include attendance confirmation." },
    ],
    stats: [{ v: "25", l: "Max per cohort" }, { v: "Custom", l: "Every curriculum" }, { v: "On-site", l: "Or virtual" }],
  },
  {
    slug: "digital-marketing-tech-support",
    icon: "marketing",
    title: "Digital Marketing & Tech Support for Traders",
    short: "A strong online presence for traders, mentors and academies — from brand identity through to the systems that run your business.",
    hero: "/images/community.jpg",
    image: "/images/community.jpg",
    intro: [
      "Great traders often make invisible educators. If you are building a brand as a mentor, analyst or academy, the technology and marketing side quietly decides whether anyone ever finds you.",
      "We build and maintain the full stack — website, funnels, content strategy, community infrastructure and ongoing technical support — specifically for people in the trading education space.",
    ],
    features: [
      { title: "Website & funnel build", body: "Fast, credible sites with enrollment funnels, payment processing and analytics wired in." },
      { title: "Brand identity", body: "Logo, colour system, typography and templates that make you look like an institution." },
      { title: "Content strategy", body: "A repeatable content engine for YouTube, Instagram, X and Telegram that compounds." },
      { title: "Community setup", body: "Telegram and Discord architecture, moderation rules, bots and onboarding flows." },
      { title: "Course platform", body: "LMS selection and configuration so your students get a professional learning experience." },
      { title: "Ongoing tech support", body: "A retained support line for when something breaks the night before a launch." },
    ],
    process: [
      { step: "01", title: "Brand audit", body: "We review your current presence, positioning, funnel and technical setup." },
      { step: "02", title: "Strategy & design", body: "Messaging, visual direction and a technical architecture mapped to your goals." },
      { step: "03", title: "Build & launch", body: "We build the site, funnels, community and systems, then migrate and go live." },
      { step: "04", title: "Support & grow", body: "Ongoing maintenance, content support and iterative conversion improvements." },
    ],
    packages: [
      { name: "Starter Presence", price: "From ₦400,000", note: "3–4 weeks", items: ["Single-page pro website", "Brand basics", "Telegram setup", "Analytics install"] },
      { name: "Academy Stack", price: "From ₦1,200,000", note: "6–8 weeks", featured: true, items: ["Multi-page site + funnels", "Full brand identity", "LMS + payments setup", "Community architecture", "60 days support"] },
      { name: "Growth Retainer", price: "From ₦180,000/mo", note: "Ongoing", items: ["Unlimited small changes", "Monthly content strategy", "Conversion optimisation", "Priority tech support"] },
    ],
    faqs: [
      { q: "Do I own everything you build?", a: "Yes. All accounts, domains, code and creative assets are transferred to you at handover." },
      { q: "Can you work with my existing site?", a: "Yes — we frequently audit and improve existing sites rather than rebuilding from scratch." },
      { q: "What platforms do you use?", a: "We are platform-agnostic and recommend based on your budget, team and goals rather than defaulting to one stack." },
    ],
    stats: [{ v: "100%", l: "Asset ownership" }, { v: "60 days", l: "Launch support" }, { v: "Any", l: "Platform" }],
  },
];

export const getService = (slug: string) => SERVICES.find((s) => s.slug === slug);
