"use client";

import { useRouter } from "next/router";
import { useEffect } from "react";

export const useGoogleAnalytics = () => {
  function gtag(...args: Array<any>) {
    if (!window) return;

    // @ts-ignore
    if (!window.dataLayer) {
      // @ts-ignore
      window.dataLayer = [];
    }
    // @ts-ignore
    window.dataLayer.push(args);
  }

  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=G-K4V5W7HYZE";
    document.head.appendChild(script);

    gtag("js", new Date());
    gtag("config", "G-K4V5W7HYZE");
  }, []);

  // Track page views on route changes
  const router = useRouter();
  useEffect(() => {
    if (window === undefined) return;

    gtag("config", "G-K4V5W7HYZE", {
      page_path: router.pathname + location.search,
    });
  }, [router]);
};
