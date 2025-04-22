import { loadTransjakartaTransportMode } from "@/data/transport-source-static/transjakarta";
import { ZipReader } from "@zip.js/zip.js";
import { Detail } from "./Detail";
import fs from "fs";

type Props = {
    params: Promise<{ slug: string }>
  };

export default async function TransjakartaBusDetails(
    {
        params,
      }: Props
) {
    const {slug} = await params;

    return <Detail slug={slug} />
}

export const dynamicParams = false;
export async function generateStaticParams() {
    const blob = fs.readFileSync(
      "public/assets/transport-data/file_gtfs.zip",
    );
    const reader = new ReadableStream({
      start(controller) {
        controller.enqueue(blob);
        controller.close();
      },
    });
    const zipReader = new ZipReader(reader);

    const modes = await loadTransjakartaTransportMode(zipReader);
    const mode = modes[0];
    return Object.keys(mode.routes).map((routeId) => ({
      slug: routeId,
    }));
  }