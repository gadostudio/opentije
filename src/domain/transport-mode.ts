import { Feature, MultiLineString, Point, Position } from "geojson";
import { Coordinate } from "./location";
import { jakartaCoordinate } from "@/data/constants";
import { ShapeRawData } from "./gtfs";
import { TransjakartaRouteType } from "@/data/transport-source-static/transjakarta";

export enum ModeType {
  Bus = "Bus",
  Train = "Train",
}

// Categories for modes
export const busCategories = () => ({
  Transjakarta: Object.values(TransjakartaRouteType),
});
export const trainCategories = () => [
  "Commuterline",
  "LRT Jakarta",
  "MRT Jakarta",
  "LRT Jabodebek",
];
export const transportCategories = () => ({
  [ModeType.Bus]: busCategories(),
  [ModeType.Train]: trainCategories(),
});

export abstract class TransportMode {
  abstract name: string;
  abstract type: ModeType;

  stops: Array<Stop> = [];
  routes: Record<string, Route> = {};

  get stopsSourceId() {
    return `source:stops:${this.name}`;
  }
  get routesSourceId() {
    return `source:routes:${this.name}`;
  }
  get stopsLayerId() {
    return `source:stops:${this.name}`;
  }
  get routesLayerId() {
    return `source:routes:${this.name}`;
  }

  init() {
    for (const route of Object.values(this.routes)) {
      route.mode = this;

      for (const stop of route.stops) {
        stop.servedRoutes.push(route);
      }
    }
  }
}

export class Trip {
  id: string = "";
  shapes: Array<ShapeRawData> = [];
  directionId: number = -1;

  get shapeCoordinates(): Array<Position> {
    return this.shapes.map((shape) => [shape.shape_pt_lon, shape.shape_pt_lat]);
  }
}

export class Route {
  mode!: TransportMode;
  fullName: string = "";
  color: string = "";
  id: string = "";
  shortName: string = "";
  stops: Array<Stop> = [];
  type: ModeType = ModeType.Bus;
  trips: Array<Trip> = [];
  // Hacks for filtering
  label: string = "";

  get geoJson(): Feature<MultiLineString> {
    const routeShapes = this.trips.map((trip) => trip.shapeCoordinates);
    return {
      type: "Feature",
      geometry: {
        type: "MultiLineString",
        coordinates: routeShapes,
      },
      properties: {
        name: this.fullName,
        color: `#${this.color}`,
        routeId: this.id,
      },
    };
  }
}

export enum StopType {
  BusStop,
  Halte,
  Station,
}

export class Stop {
  id: string = "";
  parentId: string = "";
  name: string = "";
  type: StopType = StopType.BusStop;
  coordinate: Coordinate = jakartaCoordinate;
  servedRoutes: Array<Route> = [];

  get geoJson(): Feature<Point> {
    return {
      type: "Feature",
      properties: {
        id: this.id,
        name: this.name,
        type: this.type,
        color: "#000000",
        servedRouteIds: this.servedRoutes.map((route) => route.id),
      },
      geometry: {
        type: "Point",
        coordinates: [this.coordinate.longitude, this.coordinate.latitude],
      },
    };
  }
}
