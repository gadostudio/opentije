import { Feature, MultiLineString, Point, Position } from "geojson";
import { Coordinate } from "../../common/coordinate";
import { ShapeRawData } from "../transport-source/transjakarta";

export enum TransportModeDataSourceType {
    Transjakarta = "transjakarta",
    Rails = "rails",
}

export enum ModeType {
    Bus = "bus",
    Train = "train",
}

export abstract class TransportMode {
    abstract name: string;
    abstract type: ModeType;

    stops: Array<Stop> = [];
    routes: Record<string, Route> = {};
}

export class Trip {
    id: string = "";
    shapes: Array<ShapeRawData> = [];

    get shapeCoordinates(): Array<Position> {
        return this.shapes.map((shape) => [
            shape.shape_pt_lon,
            shape.shape_pt_lat,
        ]);
    }
}

export class Route {
    fullName: string = "";
    color: string = "";
    id: string = "";
    shortName: string = "";
    stops: Array<Stop> = [];
    type: ModeType = ModeType.Bus;
    trips: Array<Trip> = [];

    get laneGeoJson(): Feature<MultiLineString> {
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
    name: string = "";
    type: StopType = StopType.BusStop;
    coordinate: Coordinate = { latitude: 0, longitude: 0 };
    servedRoutes: Array<Route> = [];

    get geoJson(): Feature<Point> {
        return {
            type: "Feature",
            properties: {
                id: this.id,
                name: this.name,
                type: this.type,
                color: "#000000",
            },
            geometry: {
                type: "Point",
                coordinates: [
                    this.coordinate.longitude,
                    this.coordinate.latitude,
                ],
            },
        };
    }
}
