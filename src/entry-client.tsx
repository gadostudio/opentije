import * as Sentry from "@sentry/solidstart";
import "maplibre-gl/dist/maplibre-gl.css";
import { mount, StartClient } from "@solidjs/start/client";

Sentry.init({
    dsn: "https://d4ba9f9684d934411263c5c01df523e6@o878144.ingest.us.sentry.io/4509083036942336",
});

mount(() => <StartClient />, document.getElementById("app")!);
