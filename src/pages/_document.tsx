import { GTAG } from "@/components/GTag";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
        <GTAG />
      </body>
    </Html>
  );
}
