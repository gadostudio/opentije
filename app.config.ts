import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
    ssr: false,
    server: {
        prerender: {
            crawlLinks: true,
        },
        compatibilityDate: "2025-03-30",
    },
});
