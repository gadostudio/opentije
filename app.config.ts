import { defineConfig } from "@solidjs/start/config";
import { withSentry } from "@sentry/solidstart";

export default defineConfig(
    withSentry(
        {
            ssr: false,
            server: {
                prerender: {
                    crawlLinks: true,
                },
                compatibilityDate: "2025-03-30",
            },
        },
        {
            org: "shaderboi",
            project: "opentije",
            authToken: process.env.SENTRY_AUTH_TOKEN ?? "",
        },
    ),
);
