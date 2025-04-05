// @ts-nocheck

import { useLocation } from "@solidjs/router";
import { createEffect, onMount } from "solid-js";

export const useGoogleAnalytics = () => {
    function gtag() {
        if (!window.dataLayer) {
            window.dataLayer = [];
        }
        window.dataLayer.push(arguments);
    }

    // Initialize GA4 script on mount (client-side only)
    onMount(() => {
        if (window === undefined) return;

        const script = document.createElement("script");
        script.async = true;
        script.src = "https://www.googletagmanager.com/gtag/js?id=G-K4V5W7HYZE";
        document.head.appendChild(script);

        gtag("js", new Date());
        gtag("config", "G-K4V5W7HYZE");
    });

    // Track page views on route changes
    const location = useLocation();
    createEffect(() => {
        if (window === undefined) return;

        gtag("config", "G-K4V5W7HYZE", {
            page_path: location.pathname + location.search,
        });
    });
};
