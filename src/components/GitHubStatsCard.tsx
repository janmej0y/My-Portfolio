"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { DURATIONS, EASE_STANDARD } from "@/lib/motion";

type Stats = {
  username: string;
  commits: number;
  prs: number;
  issues: number;
  repos: number;
  followers: number;
  stars: number;
};

export default function GitHubStatsCard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Kept apart from `stats` so the fallback link still works when the fetch fails.
  const [username, setUsername] = useState("janmej0y");

  useEffect(() => {
    let mounted = true;

    fetch("/api/github-stats")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (data?.username) setUsername(data.username);
        if (!data?.success) {
          setError(data?.message || "Unable to load GitHub stats.");
          return;
        }
        setStats({
          username: data.username,
          commits: data.commits,
          prs: data.prs,
          issues: data.issues,
          repos: data.repos,
          followers: data.followers,
          stars: data.stars,
        });
      })
      .catch(() => {
        if (!mounted) return;
        setError("Unable to load GitHub stats.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const rows = stats
    ? [
        { label: "Commits", value: stats.commits },
        { label: "PRs", value: stats.prs },
        { label: "Issues", value: stats.issues },
        { label: "Repos", value: stats.repos },
        { label: "Stars", value: stats.stars },
        { label: "Followers", value: stats.followers },
      ]
    : [];

  return (
    <motion.aside
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATIONS.base, ease: EASE_STANDARD }}
      className="surface rounded-2xl p-4 md:p-5"
    >
      <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/80">GitHub Activity</p>
      {stats?.username ? (
        <a
          href={`https://github.com/${stats.username}`}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-block text-sm text-white/85 hover:text-white"
        >
          @{stats.username}
        </a>
      ) : null}

      {loading ? (
        <div className="mt-4 grid grid-cols-2 gap-2" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="gh-skeleton h-[46px] rounded-lg border border-white/10" />
          ))}
        </div>
      ) : null}

      {/* A missing token or rate limit should not surface as an error in the hero -
          fall back to a plain link so the card still reads as intentional. */}
      {!loading && error ? (
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white"
        >
          View profile on GitHub
          <span aria-hidden="true">&rarr;</span>
        </a>
      ) : null}

      {!loading && !error && stats ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {rows.map((row, index) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.35, ease: EASE_STANDARD }}
              className="rounded-lg border border-white/10 bg-black/25 px-3 py-2"
            >
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">{row.label}</p>
              <p className="mt-1 text-sm font-semibold text-white">{row.value.toLocaleString()}</p>
            </motion.div>
          ))}
        </div>
      ) : null}
    </motion.aside>
  );
}
