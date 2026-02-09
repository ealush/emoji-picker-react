import { useEffect } from "react";
import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { Analytics } from "@vercel/analytics/react";
import Link from "next/link";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Stats, useNpmVersion } from "../components/Stats";
import {
  DEFAULT_STATS,
  fetchGitHubStars,
  fetchNpmData,
  type StatsData,
} from "@/lib/stats";
import { InstallSection } from "../components/InstallSection";
import { FloatingEmojis } from "../components/FloatingEmojis";
import PickerDemo from "../components/PickerDemo";
import { ReactionsSection } from "../components/ReactionsSection";

const inter = Inter({ subsets: ["latin"] });

interface HomeProps {
  initialStats: StatsData;
}

export default function Home({ initialStats }: HomeProps) {
  const { version, publishedAt } = useNpmVersion();

  // Scroll to top on initial load (prevents focus-related scroll jump)
  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <>
      <Head>
        <title>emoji-picker-react — The Emoji Picker for React</title>
        <meta
          name="description"
          content="A lightweight, customizable emoji picker component for React applications. TypeScript support, multiple themes, skin tones, and 1800+ emojis."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="emoji-picker-react" />
        <meta
          property="og:description"
          content="The most popular emoji picker component for React"
        />
        <meta property="og:type" content="website" />
      </Head>

      <main className={`${styles.main} ${inter.className}`}>
        <Header />

        {/* Hero Section */}
        <section className={styles.hero}>
          <FloatingEmojis />
          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <span className={styles.badgeVersion}>v{version}</span>
              {publishedAt && (
                <>
                  <span>—</span>
                  <span>{publishedAt}</span>
                </>
              )}
            </div>

            <h1 className={styles.heroTitle}>
              The emoji picker
              <br />
              for React
            </h1>

            <p className={styles.heroSubtitle}>
              Lightweight, customizable, and delightfully simple. Add emoji
              picking to your app in seconds with full TypeScript support.
            </p>

            <div className={styles.heroActions}>
              <a href="#playground" className={styles.primaryButton}>
                Try it out ↓
              </a>
              <Link
                href="https://github.com/ealush/emoji-picker-react"
                target="_blank"
                className={styles.secondaryButton}
              >
                View on GitHub
              </Link>
            </div>

            <Stats className={styles.stats} initialStats={initialStats} />
          </div>
        </section>

        {/* Playground Section */}
        <section id="playground" className={styles.playground}>
          <div className={styles.playgroundContent}>
            <h2 className={styles.sectionTitle}>Interactive Playground</h2>
            <p className={styles.sectionSubtitle}>
              Tweak the settings and see the magic happen in real-time
            </p>
            <PickerDemo />
          </div>
        </section>

        <ReactionsSection />

        <InstallSection />

        <Footer />
      </main>

      <Analytics />
    </>
  );
}

export async function getStaticProps() {
  try {
    const [npmData, stars] = await Promise.all([
      fetchNpmData(),
      fetchGitHubStars(),
    ]);

    return {
      props: {
        initialStats: {
          downloads: `${npmData.downloads}/mo`,
          stars,
          version: npmData.version,
        },
      },
      revalidate: 3600,
    };
  } catch {
    return {
      props: {
        initialStats: DEFAULT_STATS,
      },
      revalidate: 3600,
    };
  }
}
