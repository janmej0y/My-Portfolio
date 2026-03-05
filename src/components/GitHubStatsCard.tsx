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

  useEffect(() => {
    let mounted = true;

    fetch("/api/github-stats")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
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

      {loading ? <p className="mt-3 text-sm text-white/60">Loading stats...</p> : null}
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

      {!loading && !error && stats ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {rows.map((row) => (
            <div key={row.label} className="rounded-lg border border-white/10 bg-black/25 px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">{row.label}</p>
              <p className="mt-1 text-sm font-semibold text-white">{row.value.toLocaleString()}</p>
            </div>
          ))}
        </div>
      ) : null}
    </motion.aside>
  );
}
