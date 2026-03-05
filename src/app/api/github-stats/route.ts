import { NextResponse } from "next/server";

type GraphQLResponse = {
  data?: {
    user?: {
      followers?: { totalCount?: number };
      repositories?: {
        totalCount?: number;
        nodes?: Array<{ stargazerCount?: number }>;
      };
      contributionsCollection?: {
        totalCommitContributions?: number;
        totalPullRequestContributions?: number;
        totalIssueContributions?: number;
      };
    };
  };
  errors?: Array<{ message?: string }>;
};

export async function GET() {
  try {
    const username = process.env.GITHUB_USERNAME || "janmej0y";
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      return NextResponse.json({ success: false, message: "GitHub token not configured." }, { status: 500 });
    }

    const query = `
      query($login: String!) {
        user(login: $login) {
          followers { totalCount }
          repositories(ownerAffiliations: OWNER, isFork: false, first: 100) {
            totalCount
            nodes { stargazerCount }
          }
          contributionsCollection {
            totalCommitContributions
            totalPullRequestContributions
            totalIssueContributions
          }
        }
      }
    `;

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables: { login: username } }),
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, message: "Unable to fetch GitHub stats." }, { status: 502 });
    }

    const json = (await response.json()) as GraphQLResponse;
    if (json.errors?.length) {
      return NextResponse.json({ success: false, message: json.errors[0]?.message || "GitHub API error." }, { status: 502 });
    }

    const user = json.data?.user;
    const stars = (user?.repositories?.nodes ?? []).reduce((sum, repo) => sum + (repo.stargazerCount ?? 0), 0);

    return NextResponse.json({
      success: true,
      username,
      commits: user?.contributionsCollection?.totalCommitContributions ?? 0,
      prs: user?.contributionsCollection?.totalPullRequestContributions ?? 0,
      issues: user?.contributionsCollection?.totalIssueContributions ?? 0,
      repos: user?.repositories?.totalCount ?? 0,
      followers: user?.followers?.totalCount ?? 0,
      stars,
    });
  } catch {
    return NextResponse.json({ success: false, message: "Unable to fetch GitHub stats." }, { status: 500 });
  }
}
