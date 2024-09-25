import { BlobReader, Entry, TextWriter, ZipReader } from "@zip.js/zip.js";
import Papa from "papaparse";

export enum RouteType {
    BRT = "BRT",
    Mikrotrans = "Mikrotrans",
    Integrasi = "Angkutan Umum Integrasi",
    Rusun = "Rusun",
    Royaltrans = "Royaltrans",
    Transjabodetabek = "Transjabodetabek",
    BusWisata = "Bus Wisata",
}

export async function getRawData() {
    const response = await fetch("/assets/file_gtfs.zip");
    const blob = await response.blob();
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
        const text = await entry.getData!(writer);
        return Papa.parse(text, {
            header: true,
        });
    };

    const [
        routesRawDataResult,
        stopsRawDataResult,
        shapesRawDataResult,
        tripsRawDataResult,
        stopTimesRawDataResult,
    ] = await Promise.all([
        getFileRawData("routes.txt"),
        getFileRawData("stops.txt"),
        getFileRawData("shapes.txt"),
        getFileRawData("trips.txt"),
        getFileRawData("stop_times.txt"),
    ]);

    if (routesRawDataResult.errors) {
        console.error(routesRawDataResult.errors);
    }
    const routesRawData = routesRawDataResult.data as Array<RouteRawData>;

    if (stopsRawDataResult.errors) {
        console.error(stopsRawDataResult.errors);
    }
    const stopsRawData = stopsRawDataResult.data.map(
        (stop: any) =>
            ({
                stop_lat: parseFloat(stop.stop_lat),
                stop_lon: parseFloat(stop.stop_lon),
                ...stop,
            }) as StopRawData,
    );

    if (shapesRawDataResult.errors) {
        console.error(shapesRawDataResult.errors);
    }
    const shapesRawData = shapesRawDataResult.data.map(
        (shape: any) =>
            ({
                shape_pt_lat: parseFloat(shape.shape_pt_lat),
                shape_pt_lon: parseFloat(shape.shape_pt_lon),
                shape_pt_sequence: parseInt(shape.shape_pt_sequence),
                ...shape,
            }) as ShapeRawData,
    );

    if (tripsRawDataResult.errors) {
        console.error(tripsRawDataResult.errors);
    }
    const tripsRawData = tripsRawDataResult.data as Array<TripRawData>;

    if (stopTimesRawDataResult.errors) {
        console.error(stopTimesRawDataResult.errors);
    }
    const stopTimesRawData =
        stopTimesRawDataResult.data as Array<StopTimeRawData>;

    await zipReader.close();

    return {
        routesRawData,
        stopsRawData,
        shapesRawData,
        tripsRawData,
        stopTimesRawData,
    };
}

export type RouteRawData = {
    route_id: string;
    agency_id: string;
    route_short_name: string;
    route_long_name: string;
    route_desc: RouteType;
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
    direction_id: string;
    shape_id: string;
    trip_short_name: string;
};

export type StopTimeRawData = {
    trip_id: string;
    stop_id: string;
};
