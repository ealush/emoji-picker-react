import { useEffect } from 'react';
import Head from 'next/head';
import { Inter, Fraunces } from 'next/font/google';
import styles from '@/styles/Home.module.css';
import Link from 'next/link';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Stats, useNpmVersion } from '../components/Stats';
import {
  DEFAULT_STATS,
  fetchGitHubStars,
  fetchNpmData,
  type StatsData,
} from '@/lib/stats';
import { InstallSection } from '../components/InstallSection';
import { FloatingEmojis } from '../components/FloatingEmojis';
import PickerDemo from '../components/PickerDemo';
import { DesignsSection } from '../components/DesignsSection';
import { ReactionsSection } from '../components/ReactionsSection';

const inter = Inter({ subsets: ['latin'] });
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['700', '800'],
  display: 'swap',
  variable: '--font-display',
});

interface HomeProps {
  initialStats: StatsData;
}

export default function Home({ initialStats }: HomeProps) {
  const { version, publishedAt } = useNpmVersion();
  useEffect(() => {
    document.documentElement.dataset.theme = 'switch-clay';
  }, []);

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
          content="React emoji picker: batteries included, or BYOD — bring your own design, design language and design library."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="./favicon.ico" />
        <meta property="og:title" content="emoji-picker-react" />
        <meta
          property="og:description"
          content="Emoji picker for React — batteries included, or bring your own design."
        />
        <meta property="og:type" content="website" />
        {/* Documentation for LLMs and AI assistants (https://llmstxt.org). */}
        <link
          rel="alternate"
          type="text/plain"
          title="llms.txt"
          href="./llms.txt"
        />
        <link
          rel="alternate"
          type="text/plain"
          title="llms-full.txt"
          href="./llms-full.txt"
        />
      </Head>

      <main
        className={`${styles.main} ${inter.className} ${fraunces.variable}`}
      >
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
              <strong>Batteries included</strong>: one component, no CSS import,
              no setup. Or <strong>BYOD — bring your own design</strong>, design
              language and design library: Tailwind, shadcn/ui, CSS Modules,
              Emotion, styled-components, MUI or plain CSS.
            </p>

            <div className={styles.heroActions}>
              <a href="#playground" className={styles.primaryButton}>
                Try it out ↓
              </a>
              <a href="#designs" className={styles.secondaryButton}>
                See 25 designs ↓
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

        <DesignsSection />

        <InstallSection />

        <Footer />
      </main>
    </>
  );
}

export async function getStaticProps() {
  // NOTE: `output: 'export'` (static export) does not support ISR, so there
  // is intentionally no `revalidate` here. Stats are baked in at build time;
  // the site rebuilds daily via the Website workflow when the picker moves.
  // `next export` was removed in Next 15; `next build` writes `out/` directly.
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
    };
  } catch {
    return {
      props: {
        initialStats: DEFAULT_STATS,
      },
    };
  }
}
