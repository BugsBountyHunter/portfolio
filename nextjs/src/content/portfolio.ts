export const portfolio = {
  profile: {
    name: "Ahmed Saber",
    title: "Senior Software Engineer",
    location: "Cairo, Egypt",
    summary:
      "I’m Ahmed Saber, a full-stack engineer with 6+ years of experience turning complex logistics, fintech, ERP, and security challenges into scalable software.",
  },
  links: {
    email: "mailto:developersaber@gmail.com",
    github: "https://github.com/DEV-A7med",
    linkedin: "https://www.linkedin.com/in/ahmed-saber-1b549ab4/",
  },
  metrics: [
    { value: "6+", label: "Years engineering products" },
    { value: "4", label: "Business domains" },
    { value: "3", label: "Modern frontend platforms" },
    { value: "20–30%", label: "Estimated AI productivity lift" },
  ],
  roles: [
    {
      company: "Madar — Obeikan Digital Solutions",
      title: "Senior Software Engineer",
      period: "2024 — Present",
      domain: "Logistics",
      mode: "Hybrid",
      description:
        "Building technology for freight coordination, shipment tracking, and delivery optimization while improving supply-chain visibility across Obeikan Digital Solutions.",
    },
    {
      company: "T-Vencubator",
      title: "Senior Software Engineer",
      period: "2023 — 2024",
      domain: "FinTech",
      mode: "Hybrid",
      description:
        "Designed payment microservices, integrated external adapters and communication protocols, and championed AI-assisted code review, testing, and documentation.",
    },
    {
      company: "Digital Roots GTC",
      title: "Full-stack Engineer",
      period: "2021 — 2023",
      domain: "ERP",
      mode: "Remote",
      description:
        "Delivered Node.js and NestJS services, Angular and React interfaces, Odoo ERP customizations, Electron desktop tools, and integrity-focused legacy migrations.",
    },
    {
      company: "Softlock",
      title: "Software Engineer",
      period: "2019 — 2020",
      domain: "Security",
      mode: "Onsite",
      description:
        "Built certificate-based login systems and cryptographic SDKs, plus management interfaces for OTP, FIDO2, Java Card, smart-card, and USB-token devices.",
    },
  ],
  capabilities: [
    {
      label: "Backend systems",
      headline: "Services built for scale and clarity.",
      tags: ["Node.js", "NestJS", "Express", "Microservices", "RabbitMQ"],
    },
    {
      label: "Product interfaces",
      headline: "Fast, focused experiences across platforms.",
      tags: ["React", "Angular", "Electron", "TypeScript"],
    },
    {
      label: "Data & infrastructure",
      headline: "Reliable foundations for demanding workflows.",
      tags: ["PostgreSQL", "MongoDB", "Redis", "AWS", "Kubernetes"],
    },
    {
      label: "Engineering practice",
      headline: "Clean delivery with automation built in.",
      tags: ["CI/CD", "Jest", "ELK", "Datadog", "AI tooling"],
    },
  ],
  education: {
    degree: "Computer Science",
    institution: "Higher Technological Institute (HTI)",
    period: "2015 — 2019",
  },
  languages: "Native Arabic speaker with fluent professional English.",
} as const;

export type Portfolio = typeof portfolio;
