import { Coordinate } from "../../common/coordinate";

export abstract class TransportMode {
    abstract name: string;

    stops: Array<Stop> = [];
    routes: Record<string, Route> = {};
};

export class Route {
    name: string;
    routeIds: Array<string> = [];

    constructor(name: string) {
        this.name = name;
    }
};

type StopType = 'bus-stop' | 'halte' | 'station';

export class Stop {
    id: string;
    name: string;
    type: StopType;
    coordinate: Coordinate;

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
};

