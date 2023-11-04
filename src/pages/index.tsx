import Head from "next/head";

import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import dynamic from "next/dynamic";
import Link from "next/link";
const PickerDemo = dynamic(() => import("../components/PickerDemo"), {
  ssr: false,
});
const RandomEmoji = dynamic(() => import("../components/RandomEmoji"), {
  ssr: false,
});

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Head>
        <title>emoji-picker-react</title>
        <meta name="description" content="The Emoji Picker for React." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <header className={styles.headerRow}>
          <Link href={"https://github.com/ealush/emoji-picker-react"}>
            github.com/ealush/emoji-picker-react
            <RandomEmoji />
          </Link>
        </header>

        <PickerDemo />

        <footer className={styles.footerRow}>
          <p>The emoji picker for React.</p>
          <p>
            Brought to you with ❤️ by{" "}
            <Link href="https://ealush.com">ealush</Link>.
          </p>
        </footer>
      </main>
    </>
  );
}
