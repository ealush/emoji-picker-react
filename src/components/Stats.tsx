"use client";

import { useEffect, useState } from "react";

interface StatsData {
  downloads: string;
  stars: string;
  version: string;
}

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
    return { downloads: "1M+", version: "4.x" };
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
    return "2k+";
  }
}

export function useNpmVersion() {
  const [version, setVersion] = useState<string>("—");

  useEffect(() => {
    fetch("https://registry.npmjs.org/emoji-picker-react/latest")
      .then((res) => res.json())
      .then((data) => setVersion(data.version || "4.x"))
      .catch(() => setVersion("4.x"));
  }, []);

  return version;
}

export function Stats({ className }: { className?: string }) {
  const [stats, setStats] = useState<StatsData>({
    downloads: "—",
    stars: "—",
    version: "—",
  });

  useEffect(() => {
    Promise.all([fetchNpmData(), fetchGitHubStars()]).then(
      ([npmData, stars]) => {
        setStats({
          downloads: npmData.downloads + "/mo",
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
