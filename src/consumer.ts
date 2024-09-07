import {BlobReader, Entry, TextWriter, ZipReader} from "@zip.js/zip.js";
import Papa from "papaparse";

export class DefaultDict<T, Q> extends Map<T, Q> {
    defaultFactory: () => Q
    constructor(defaultFactory: () => Q) {
      super()
      this.defaultFactory = defaultFactory
    }
    get(name: T): Q {
      if (this.has(name)) {
        return super.get(name)!
      } else {
        const value = this.defaultFactory()
        this.set(name, value)
        return value
      }
    }
  }

export async function getRawData() {
    const response = await fetch('/assets/file_gtfs.zip');
    const blob = await response.blob()
    const reader = new BlobReader(blob);
    const zipReader = new ZipReader(reader);

    const fileEntries: Record<string, Entry> = {};
    const entries = await zipReader.getEntries();
    for (const entry of entries) {
        fileEntries[entry.filename] = entry;
    }

    const getFileRawData = async (filename: string) => {
        const entry = fileEntries[filename];
        const writer = new TextWriter();
        const text = await entry.getData(writer);
        return Papa.parse(text, {
            header: true,
        });
    };
    
    const [routesRawData, stopsRawData, shapesRawData, tripsRawData] = await Promise.all([
        getFileRawData('routes.txt'),
        getFileRawData('stops.txt'),
        getFileRawData('shapes.txt'),
        getFileRawData('trips.txt'),
    ]);

    if (routesRawData.error) {
        console.error(routesRawData.error);
    }
    
    if (stopsRawData.error) {
        console.error(stopsRawData.error);
    }
    
    if (shapesRawData.error) {
        console.error(shapesRawData.error);
    }
    
    if (tripsRawData.error) {
        console.error(tripsRawData.error);
    }

    await zipReader.close();

    return {
        routesRawData: routesRawData.data as Array<RouteRawData>,
        stopsRawData: stopsRawData.data as Array<StopRawData>,
        shapesRawData: shapesRawData.data as Array<ShapeRawData>,
        tripsRawData: tripsRawData.data as Array<TripRawData>,
    };
}

export type RouteRawData = {
    id: string;
    agency_id: string;
    route_short_name: string;
    route_long_name: string;
    route_desc: string;
    route_color: string;
    route_text_color: string;
};

export type StopRawData = {
    stop_id: string;
    stop_name: string;
    stop_lat: number;
    stop_lon: number;
    zone_id: any;
    location_type: any;
    wheelchair_boarding: any;
};

export type ShapeRawData = {
    shape_id: string;
    shape_pt_lat: number;
    shape_pt_lon: number;
    shape_pt_sequence: number;
};

export type TripRawData = {
    route_id: string;
    service_id: string;
    trip_id: string;
    trip_headsign: string;
    direction_id: number;
    shape_id: string;
    trip_short_name: string;
};
