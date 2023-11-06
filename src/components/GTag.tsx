import React, { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag: (...args: unknown[]) => void;
  }
}

export function GTAG() {
  const didMountRef = React.useRef(false);

  useEffect(() => {
    if (didMountRef.current) {
      return;
    }

    register();
    didMountRef.current = true;
  }, []);

  return (
    <script
      async
      src="https://www.googletagmanager.com/gtag/js?id=G-EQXC5ZDCX8"
    ></script>
  );
}

function register() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // @ts-ignore
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", "G-EQXC5ZDCX8");
}
