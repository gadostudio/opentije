import { ShapeRawData } from "@/domain/gtfs";
import { Coordinate } from "@/domain/location";
import { ModeType, Route, Stop } from "@/domain/transport-mode";
import { Feature, MultiLineString, Point, Position } from "geojson";

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
        if (stop.servedRoutes.includes(route)) continue;
        stop.servedRoutes.push(route);
      }
    }
  }
}

export class Trip {
  id: string = "";
  shapes: Array<ShapeRawData> = [];

  get shapeCoordinates(): Array<Position> {
    return this.shapes.map((shape) => [shape.shape_pt_lon, shape.shape_pt_lat]);
  }
}

export enum StopType {
  BusStop,
  Halte,
  Station,
}
