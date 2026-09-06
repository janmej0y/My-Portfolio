import type { Project, ProjectCategory } from "@/types/portfolio";

/** Repos must carry this GitHub topic to appear in the showcase. */
export const PORTFOLIO_TOPIC = "portfolio";

/** Placeholder used when a synced repo has no image of its own. */
export const SYNCED_FALLBACK_IMAGE = "/assets/projects/placeholder.svg";

/** The subset of the GitHub repo payload this module relies on. */
export type GitHubRepo = {
  name: string;
  full_name?: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  topics?: string[];
  language: string | null;
  fork?: boolean;
  archived?: boolean;
  private?: boolean;
  stargazers_count?: number;
  pushed_at?: string | null;
};

/** A Project that came from GitHub rather than the curated list. */
export type SyncedProject = Project & {
  source: "github";
  stars: number;
  pushedAt: string | null;
};

/**
 * Topics that describe the kind of app rather than its stack. Checked before
 * language so an explicit tag always beats the inferred default.
 */
const CATEGORY_TOPICS: Record<string, Exclude<ProjectCategory, "all">> = {
  web: "web",
  website: "web",
  webapp: "web",
  "web-app": "web",
  frontend: "web",
  fullstack: "web",
  app: "app",
  mobile: "app",
  android: "app",
  ios: "app",
  desktop: "app",
  tool: "tools",
  tools: "tools",
  cli: "tools",
  script: "tools",
  automation: "tools",
  library: "tools",
  security: "tools",
};

/** Languages that imply a browser project when no category topic is present. */
const WEB_LANGUAGES = new Set([
  "javascript",
  "typescript",
  "html",
  "css",
  "vue",
  "svelte",
  "astro",
  "php",
]);

/** Topic slugs mapped back to the display names used by the curated list. */
const TECH_LABELS: Record<string, string> = {
  nextjs: "Next.js",
  "next-js": "Next.js",
  react: "React",
  reactjs: "React",
  typescript: "TypeScript",
  javascript: "JavaScript",
  tailwind: "Tailwind CSS",
  tailwindcss: "Tailwind CSS",
  nodejs: "Node.js",
  node: "Node.js",
  express: "Express",
  expressjs: "Express",
  mongodb: "MongoDB",
  postgresql: "PostgreSQL",
  postgres: "PostgreSQL",
  mysql: "MySQL",
  redis: "Redis",
  supabase: "Supabase",
  firebase: "Firebase",
  prisma: "Prisma",
  python: "Python",
  django: "Django",
  flask: "Flask",
  java: "Java",
  php: "PHP",
  laravel: "Laravel",
  graphql: "GraphQL",
  docker: "Docker",
  jwt: "JWT",
  api: "REST APIs",
  ai: "AI",
  ml: "Machine Learning",
};

/** Topics that classify or tag rather than name a technology. */
const NON_TECH_TOPICS = new Set([PORTFOLIO_TOPIC, ...Object.keys(CATEGORY_TOPICS)]);

/**
 * "my-cool-repo" -> "My Cool Repo".
 *
 * Separators become spaces, but CamelCase is left intact: names like VampForge
 * and AuthSphere are product names, and splitting them ("Vamp Forge") reads as
 * a typo rather than a title.
 */
export function titleFromRepoName(name: string): string {
  return name
    .replace(/[-_]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((word) => (word === word.toLowerCase() ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");
}

function categoryFor(repo: GitHubRepo): Exclude<ProjectCategory, "all"> {
  for (const topic of repo.topics ?? []) {
    const mapped = CATEGORY_TOPICS[topic.toLowerCase()];
    if (mapped) return mapped;
  }
  // A homepage means it is deployed and browsable, which reads as a web project.
  if (repo.homepage) return "web";
  if (repo.language && WEB_LANGUAGES.has(repo.language.toLowerCase())) return "web";
  return "tools";
}

function techFor(repo: GitHubRepo): string[] {
  const tech: string[] = [];
  const seen = new Set<string>();

  const push = (label: string) => {
    const dedupeKey = label.toLowerCase();
    if (seen.has(dedupeKey)) return;
    seen.add(dedupeKey);
    tech.push(label);
  };

  if (repo.language) push(repo.language);

  for (const topic of repo.topics ?? []) {
    const key = topic.toLowerCase();
    if (NON_TECH_TOPICS.has(key)) continue;
    push(TECH_LABELS[key] ?? titleFromRepoName(topic));
  }

  return tech.slice(0, 6);
}

/** A homepage pointing back at the repo itself is not a live deployment. */
function liveUrlFor(repo: GitHubRepo): string | undefined {
  const homepage = repo.homepage?.trim();
  if (!homepage) return undefined;
  if (!/^https?:\/\//i.test(homepage)) return undefined;
  if (homepage.replace(/\/$/, "") === repo.html_url.replace(/\/$/, "")) return undefined;
  return homepage;
}

export function mapRepoToProject(repo: GitHubRepo): SyncedProject {
  const title = titleFromRepoName(repo.name);
  const description = repo.description?.trim() || `${title} - source on GitHub.`;
  const tech = techFor(repo);

  return {
    // Namespaced so a synced key can never collide with a curated one.
    key: `gh-${repo.name.toLowerCase()}`,
    category: categoryFor(repo),
    title,
    image: SYNCED_FALLBACK_IMAGE,
    shortDescription: description,
    longDescription: description,
    resultLine: tech.length ? `Built with ${tech.slice(0, 3).join(", ")}.` : undefined,
    tech,
    liveUrl: liveUrlFor(repo),
    githubUrl: repo.html_url,
    source: "github",
    stars: repo.stargazers_count ?? 0,
    pushedAt: repo.pushed_at ?? null,
  };
}

/** Excludes forks, archives, and anything missing the opt-in topic. */
export function isShowcaseRepo(repo: GitHubRepo): boolean {
  if (repo.fork || repo.archived || repo.private) return false;
  return (repo.topics ?? []).some((topic) => topic.toLowerCase() === PORTFOLIO_TOPIC);
}

/**
 * Curated entries always win: a hand-written project keeps its copy, images and
 * highlights even when the same repo also carries the portfolio topic.
 */
export function mergeProjects(curated: Project[], synced: SyncedProject[]): Project[] {
  const curatedRepoUrls = new Set(
    curated.map((project) => project.githubUrl?.toLowerCase().replace(/\/$/, "")).filter(Boolean),
  );
  const curatedKeys = new Set(curated.map((project) => project.key.toLowerCase()));

  const additions = synced
    .filter((project) => !curatedRepoUrls.has(project.githubUrl.toLowerCase().replace(/\/$/, "")))
    .filter((project) => !curatedKeys.has(project.key.toLowerCase()))
    .sort((a, b) => {
      const timeA = a.pushedAt ? Date.parse(a.pushedAt) : 0;
      const timeB = b.pushedAt ? Date.parse(b.pushedAt) : 0;
      if (timeB !== timeA) return timeB - timeA;
      return b.stars - a.stars;
    });

  return [...curated, ...additions];
}
