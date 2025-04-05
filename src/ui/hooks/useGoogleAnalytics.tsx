// @ts-nocheck

import { useLocation } from "@solidjs/router";
import { createEffect, onMount } from "solid-js";

export const useGoogleAnalytics = () => {
    // Initialize GA4 script on mount (client-side only)
    onMount(() => {
        if (typeof window !== "undefined") {
            const script1 = document.createElement("script");
            script1.async = true;
            script1.src =
                "https://www.googletagmanager.com/gtag/js?id=G-K4V5W7HYZE";
            document.head.appendChild(script1);
        }
    });

    // Track page views on route changes
    const location = useLocation();
    createEffect(() => {
        if (typeof window !== "undefined") {
            window.dataLayer = window.dataLayer || [];
            function gtag() {
                dataLayer.push(arguments);
            }
            gtag("js", new Date());
            gtag("config", "G-K4V5W7HYZE");

            window.gtag("config", "G-K4V5W7HYZE", {
                page_path: location.pathname + location.search,
            });
        }
    });
};
