import {
  RouteRawData,
  ShapeRawData,
  StopRawData,
  StopTimeRawData,
  TripRawData,
} from "@/domain/gtfs";
import { ModeType, Route, Stop, StopType, Trip } from "@/domain/transport-mode";
import { DefaultMap } from "@/utils/container";
import { BlobReader, Entry, TextWriter, ZipReader } from "@zip.js/zip.js";
import Papa from "papaparse";
import { TransportModeLoader } from ".";
import { TransjakartaMode } from "../transport-mode/transjakarta";

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

  // if (routesRawDataResult.errors) {
  //     console.error(routesRawDataResult.errors);
  // }
  const routesRawData = routesRawDataResult.data as Array<
    RouteRawData<TransjakartaRouteType>
  >;

  // if (stopsRawDataResult.errors) {
  //     console.error(stopsRawDataResult.errors);
  // }
  const stopsRawData = stopsRawDataResult.data.map(
    (stop: any) =>
      ({
        stop_lat: parseFloat(stop.stop_lat),
        stop_lon: parseFloat(stop.stop_lon),
        ...stop,
      }) as StopRawData,
  );

  // if (shapesRawDataResult.errors) {
  //     console.error(shapesRawDataResult.errors);
  // }
  const shapesRawData = shapesRawDataResult.data.map(
    (shape: any) =>
      ({
        shape_pt_lat: parseFloat(shape.shape_pt_lat),
        shape_pt_lon: parseFloat(shape.shape_pt_lon),
        shape_pt_sequence: parseInt(shape.shape_pt_sequence),
        ...shape,
      }) as ShapeRawData,
  );

  // if (tripsRawDataResult.errors) {
  //     console.error(tripsRawDataResult.errors);
  // }
  const tripsRawData = tripsRawDataResult.data as Array<TripRawData>;

  // if (stopTimesRawDataResult.errors) {
  //     console.error(stopTimesRawDataResult.errors);
  // }
  const stopTimesRawData =
    stopTimesRawDataResult.data as Array<StopTimeRawData>;

  await zipReader.close();

  const tj = new TransjakartaMode();
  tj.stops = stopsRawData
    .filter((rawStop) => rawStop.stop_id)
    .map((rawStop) => {
      const stop = new Stop();
      stop.id = rawStop.stop_id;
      stop.name = rawStop.stop_name;
      stop.type = StopType.BusStop;
      stop.coordinate = {
        latitude: rawStop.stop_lat,
        longitude: rawStop.stop_lon,
      };
      return stop;
    });

  const stops: Record<string, Stop> = {};
  for (const stop of tj.stops) {
    stops[stop.id] = stop;
  }

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
    // Skip "pengalihan" route
    if (stopTime.trip_id.match(/^[0-9]{1,2}\-P[0-9]+/)) {
      continue;
    }
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

    const route = new Route();
    route.id = routeRawData.route_id;
    route.fullName = routeRawData.route_long_name;
    route.shortName = routeRawData.route_id;
    route.color = routeRawData.route_color;
    route.type = ModeType.Bus;
    route.label = routeRawData.route_desc;

    const routeStops: Array<Stop> = [];

    const trips: Array<Trip> = [];
    for (const tripRaw of tripsRaw.get(routeRawData.route_id)) {
      // Skip "pengalihan" route
      if (tripRaw.tripId.match(/^[0-9]{1,2}\-P[0-9]+/)) {
        continue;
      }

      const trip = new Trip();
      trip.id = tripRaw.tripId;
      trip.shapes = tripRaw.shapes;
      trips.push(trip);

      const stopIds = tripStopIds.get(trip.id);
      for (const stopId of stopIds) {
        const stop = stops[stopId];
        routeStops.push(stop);
      }
    }
    route.stops = routeStops;
    route.trips = trips;

    routes[routeRawData.route_id] = route;
  }

  tj.routes = routes;

  return [tj];
};

export enum TransjakartaRouteType {
  BRT = "BRT",
  Mikrotrans = "Mikrotrans",
  Integrasi = "Angkutan Umum Integrasi",
  Rusun = "Rusun",
  Royaltrans = "Royaltrans",
  Transjabodetabek = "Transjabodetabek",
  BusWisata = "Bus Wisata",
}

export type TripRaw = {
  tripId: string;
  shapes: Array<ShapeRawData>;
};
