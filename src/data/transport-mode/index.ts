import { Feature, Point } from "geojson";
import { Coordinate } from "../../common/coordinate";

export enum TransportModeType {
    Transjakarta = "Transjakarta",
    Rails = "Rails",
}

export abstract class TransportMode {
    abstract name: string;

    stops: Array<Stop> = [];
    routes: Record<string, Route> = {};
}

export class Route {
    fullName: string;
    color: string;
    id: string;
    shortName: string;
    stopIds: Array<string> = [];

    constructor(
        id: string,
        fullName: string,
        shortName: string,
        color: string,
    ) {
        this.fullName = fullName;
        this.id = id;
        this.color = color;
        this.shortName = shortName;
    }
}

type StopType = "bus-stop" | "halte" | "station";

export class Stop {
    id: string;
    name: string;
    type: StopType;
    coordinate: Coordinate;
    servedRoutes: Array<Route> = [];

    constructor(
        id: string,
        name: string,
        type: StopType,
        coordinate: Coordinate,
    ) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.coordinate = coordinate;
    }

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
