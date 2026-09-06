import { NextResponse } from "next/server";
import {
  isShowcaseRepo,
  mapRepoToProject,
  PORTFOLIO_TOPIC,
  type GitHubRepo,
} from "@/lib/github-projects";

/** Repos change rarely; an hour keeps the showcase fresh without hammering the API. */
const REVALIDATE_SECONDS = 3600;

export async function GET() {
  const username = process.env.GITHUB_USERNAME || "janmej0y";

  try {
    const token = process.env.GITHUB_TOKEN;

    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    // The token only raises the rate limit here - public repos read fine without it.
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`,
      { headers, next: { revalidate: REVALIDATE_SECONDS } },
    );

    if (!response.ok) {
      return NextResponse.json(
        { success: false, username, projects: [], message: "Unable to fetch GitHub repositories." },
        { status: 502 },
      );
    }

    const repos = (await response.json()) as GitHubRepo[];
    if (!Array.isArray(repos)) {
      return NextResponse.json(
        { success: false, username, projects: [], message: "Unexpected GitHub response." },
        { status: 502 },
      );
    }

    const projects = repos.filter(isShowcaseRepo).map(mapRepoToProject);

    return NextResponse.json({
      success: true,
      username,
      topic: PORTFOLIO_TOPIC,
      count: projects.length,
      projects,
    });
  } catch {
    return NextResponse.json(
      { success: false, username, projects: [], message: "Unable to fetch GitHub repositories." },
      { status: 500 },
    );
  }
}
