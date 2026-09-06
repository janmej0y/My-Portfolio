export type NavItem = {
  id: string;
  label: string;
};

export type EducationItem = {
  degree: string;
  institute: string;
  year: string;
  score: string;
};

export type ExperienceItem = {
  role: string;
  company: string;
  employmentType: string;
  period: string;
  location: string;
  description: string;
  skills: string[];
};

export type ProjectCategory = "all" | "web" | "app" | "tools";

export type Project = {
  key: string;
  category: Exclude<ProjectCategory, "all">;
  title: string;
  image: string;
  shortDescription: string;
  longDescription: string;
  resultLine?: string;
  tech: string[];
  liveUrl?: string;
  githubUrl: string;
  highlights?: string[];
  architecture?: string;
  screenshots?: string[];
  metrics?: string[];
};

export type Skill = {
  name: string;
  icon: string;
  invert?: boolean;
  /** Self-rated working proficiency, 0-100. Drives the meter bars in the arsenal. */
  level: number;
  /** One-line note on how the tool is actually used. */
  note: string;
};

export type SkillGroup = {
  /** Stable id used for tab selection and deep links. */
  id: string;
  title: string;
  /** Short line describing what this domain covers. */
  summary: string;
  /** Two-word label shown on the rail, e.g. "Interface Layer". */
  kicker: string;
  /** Tailwind-ish accent token used for gradients and glows in this group. */
  accent: string;
  items: Skill[];
};

export type Certification = {
  title: string;
  description: string;
  icon: string;
};

export type ContactCard = {
  title: string;
  value: string;
  href: string;
  cta: string;
};

export type CaseStudy = {
  slug: string;
  title: string;
  role: string;
  period: string;
  summary: string;
  challenge: string;
  approach: string[];
  impact: string[];
  stack: string[];
  link?: string;
};

export type TrustMetric = {
  label: string;
  value: string;
  note?: string;
};

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
};
