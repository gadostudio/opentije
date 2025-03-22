import { TransportModeLoader } from ".";
import { BlobReader, Entry, TextWriter, ZipReader } from "@zip.js/zip.js";
import Papa from "papaparse";
import { TransjakartaMode } from "../transport-mode/transjakarta";
import { RouteType } from "../consumer";
import { Route, Stop } from "../transport-mode";
import { DefaultMap } from "../../utils/container";
import { BusStop, BusTrip, TripRaw } from "../transport-data";

export const loadTransjakartaTransportMode: TransportModeLoader = async () => {
    const response = await fetch("/assets/transport-data/file_gtfs.zip");
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

    const tj = new TransjakartaMode();
    tj.stops = stopsRawData.map((stop) => {
        return new Stop(stop.stop_id, stop.stop_name, "bus-stop", {
            latitude: stop.stop_lat,
            longitude: stop.stop_lon,
        });
    });
    tj.routes = stopsRawData.map((stop) => {
        return new Stop(stop.stop_id, stop.stop_name, "bus-stop", {
            latitude: stop.stop_lat,
            longitude: stop.stop_lon,
        });
    });

    // Populate trips and shapes
    const rawShapes = new DefaultMap<string, Array<ShapeRawData>>(() => []);
    for (const shapeRawData of shapesRawData) {
        rawShapes.get(shapeRawData.shape_id).push(shapeRawData);
    }

    for (const shapes of rawShapes.values()) {
        shapes.sort((shape) => shape.shape_pt_sequence);
    }

    // Map trips to routes
    const tripsRaw = new DefaultMap<string, Array<TripRaw>>(() => []);
    const tripIdToRouteId: Record<string, string> = {};
    for (const tripRawData of tripsRawData) {
        tripsRaw.get(tripRawData.route_id).push({
            tripId: tripRawData.trip_id,
            shapes: rawShapes.get(tripRawData.shape_id),
        });
        tripIdToRouteId[tripRawData.trip_id] = tripRawData.route_id;
    }

    const tripStopIds = new DefaultMap<string, Set<string>>(() => new Set());
    const routesServedByStop = new DefaultMap<string, Set<string>>(
        () => new Set(),
    );
    for (const stopTime of stopTimesRawData) {
        tripStopIds.get(stopTime.trip_id).add(stopTime.stop_id);
        routesServedByStop
            .get(stopTime.stop_id)
            .add(tripIdToRouteId[stopTime.trip_id]);
    }

    const routes: Record<string, Route> = {};
    for (const routeRawData of routesRawData) {
        if (!routeRawData.agency_id) {
            continue;
        }

        const routeStops: Array<Stop> = [];

        const trips: Array<BusTrip> = [];
        for (const tripRaw of tripsRaw.get(routeRawData.route_id)) {
            const trip = new BusTrip(tripRaw.tripId, tripRaw.shapes);
            trips.push(trip);

            const stopIds = tripStopIds.get(trip.id);
            // TODO populate stops
        }

        const route = new Route(
            routeRawData.route_id,
            routeRawData.route_long_name,
            routeRawData.route_id,
            routeRawData.route_color,
        );
        route.stopIds = routeStops.map((stop) => stop.id);

        routes[routeRawData.route_id] = route;
    }

    tj.routes = routes;

    return [tj];
};

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
