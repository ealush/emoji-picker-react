import Link from "next/link";
import styles from "@/styles/Home.module.css";
import pkg from "../../package.json";

export function Footer() {
  const version = pkg.dependencies["emoji-picker-react"].replace("^", "");

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLinks}>
          <Link
            href="https://github.com/ealush/emoji-picker-react"
            className={styles.footerLink}
            target="_blank"
          >
            GitHub
          </Link>
          <Link
            href="https://www.npmjs.com/package/emoji-picker-react"
            className={styles.footerLink}
            target="_blank"
          >
            npm
          </Link>
          <Link
            href="https://github.com/ealush/emoji-picker-react/issues"
            className={styles.footerLink}
            target="_blank"
          >
            Issues
          </Link>
        </div>
        <p className={styles.footerCredit}>
          v{version} · Made by{" "}
          <Link href="https://ealush.com" target="_blank">
            @ealush
          </Link>
        </p>
      </div>
    </footer>
  );
}
