export interface StatsData {
  downloads: string;
  stars: string;
  version: string;
}

export const DEFAULT_STATS: StatsData = {
  downloads: "2.2M/mo",
  stars: "1.4k",
  version: "4.x",
};

export async function fetchNpmData(): Promise<{
  downloads: string;
  version: string;
}> {
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
      version: registryData.version || DEFAULT_STATS.version,
    };
  } catch {
    return { downloads: "2.2M", version: DEFAULT_STATS.version };
  }
}

export async function fetchGitHubStars(): Promise<string> {
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
