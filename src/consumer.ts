import {BlobReader, Entry, TextWriter, ZipReader} from "@zip.js/zip.js";
import Papa from "papaparse";

export async function test() {
    const response = await fetch('/assets/file_gtfs.zip');
    const blob = await response.blob()
    const reader = new BlobReader(blob);
    const zipReader = new ZipReader(reader);

    const fileEntries: Record<string, Entry> = {};
    const entries = await zipReader.getEntries();
    for (const entry of entries) {
        fileEntries[entry.filename] = entry;
    }

    const routesWriter = new TextWriter();
    const routesEntry = fileEntries['routes.txt'];
    const routesText = await routesEntry.getData(routesWriter);
    const routes = Papa.parse(routesText, {
        header: true,
    });

    const stopsWriter = new TextWriter();
    const stopsEntry = fileEntries['stops.txt'];
    const stopsText = await stopsEntry.getData(stopsWriter);
    const stops = Papa.parse(stopsText, {
        header: true,
    });

    await zipReader.close();

    return {
        routes,
        stops,
    }
}
