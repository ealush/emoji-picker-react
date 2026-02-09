"use client";

import { useEffect, useState } from "react";

interface StatsData {
  downloads: string;
  stars: string;
  version: string;
}

const DEFAULT_STATS: StatsData = {
  downloads: "2.2M/mo",
  stars: "1.4k",
  version: "4.x",
};

async function fetchNpmData(): Promise<{ downloads: string; version: string }> {
  try {
    const [downloadsRes, registryRes] = await Promise.all([
      fetch(
        "https://api.npmjs.org/downloads/point/last-month/emoji-picker-react",
      ),
      fetch("https://registry.npmjs.org/emoji-picker-react/latest"),
    ]);

    const downloadsData = await downloadsRes.json();
    const registryData = await registryRes.json();

    const downloads = downloadsData.downloads;
    let formattedDownloads: string;
    if (downloads >= 1000000) {
      formattedDownloads = `${(downloads / 1000000).toFixed(1)}M`;
    } else if (downloads >= 1000) {
      formattedDownloads = `${Math.round(downloads / 1000)}k`;
    } else {
      formattedDownloads = downloads.toString();
    }

    return {
      downloads: formattedDownloads,
      version: registryData.version || "4.x",
    };
  } catch {
    return { downloads: "2.2M", version: DEFAULT_STATS.version };
  }
}

async function fetchGitHubStars(): Promise<string> {
  try {
    const res = await fetch(
      "https://api.github.com/repos/ealush/emoji-picker-react",
    );
    const data = await res.json();
    const stars = data.stargazers_count;
    if (stars >= 1000) {
      return `${(stars / 1000).toFixed(1)}k`;
    }
    return stars.toString();
  } catch {
    return DEFAULT_STATS.stars;
  }
}

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

export function Stats({ className }: { className?: string }) {
  const [stats, setStats] = useState<StatsData>(DEFAULT_STATS);

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
