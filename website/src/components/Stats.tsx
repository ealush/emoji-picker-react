"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_STATS,
  fetchGitHubStars,
  fetchNpmData,
  type StatsData,
} from "@/lib/stats";

export function useNpmVersion() {
  const [data, setData] = useState<{ version: string; publishedAt: string }>({
    version: "—",
    publishedAt: "",
  });

  useEffect(() => {
    fetch("https://registry.npmjs.org/emoji-picker-react")
      .then((res) => res.json())
      .then((pkg) => {
        const latestVersion = pkg["dist-tags"]?.latest || "4.x";
        const publishDate = pkg.time?.[latestVersion];

        let formattedDate = "";
        if (publishDate) {
          const date = new Date(publishDate);
          formattedDate = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        }

        setData({
          version: latestVersion,
          publishedAt: formattedDate ? `Updated ${formattedDate}` : "",
        });
      })
      .catch(() => setData({ version: "4.x", publishedAt: "" }));
  }, []);

  return data;
}

export function Stats({
  className,
  initialStats,
}: {
  className?: string;
  initialStats?: StatsData;
}) {
  const [stats, setStats] = useState<StatsData>(
    initialStats ?? DEFAULT_STATS,
  );

  useEffect(() => {
    Promise.all([fetchNpmData(), fetchGitHubStars()]).then(
      ([npmData, stars]) => {
        setStats({
          downloads: `${npmData.downloads}/mo`,
          stars,
          version: npmData.version,
        });
      },
    );
  }, []);

  return (
    <div className={className}>
      <StatItem value={stats.downloads} label="npm downloads" />
      <StatItem value={stats.stars} label="GitHub stars" />
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "0.8125rem",
          color: "var(--foreground-muted)",
          marginTop: "0.125rem",
        }}
      >
        {label}
      </div>
    </div>
  );
}
