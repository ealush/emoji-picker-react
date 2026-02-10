import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Script from "next/script";

const GA_TRACKING_ID = "G-EQXC5ZDCX8";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${GA_TRACKING_ID}');
        `}
      </Script>
      <Component {...pageProps} />
    </>
  );
}
