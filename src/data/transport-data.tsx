import {
    Accessor,
    createContext,
    createEffect,
    createSignal,
    onMount,
    ParentComponent,
    useContext,
} from "solid-js";
import { Point, Feature, MultiLineString, Position } from "geojson";
import { Result } from "../utils/result";
import { RouteRawData, RouteType, ShapeRawData } from "./consumer";
import { DefaultMap } from "../utils/container";
import { Stop } from "./transport-mode";

export class BusTrip {
    constructor(
        public id: string,
        public shapes: Array<ShapeRawData>,
    ) {}

    get shapeCoordinates(): Array<Position> {
        return this.shapes.map((shape) => [
            shape.shape_pt_lon,
            shape.shape_pt_lat,
        ]);
    }
}

export class BusStop {
    public servedRouteIds: Array<string>;

    constructor(
        public id: string,
        public name: string,
        public latitude: number,
        public longitude: number,
        _servedRouteIds: Set<string>,
    ) {
        this.servedRouteIds = Array.from(_servedRouteIds);
    }

    get geoJson(): Feature<Point> {
        return {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [this.longitude, this.latitude],
            },
            properties: {
                color: "#FF0000",
                id: this.id,
                name: this.name,
            },
        };
    }
}

export class BusRoute {
    id: string;
    fullName: string;
    color: string;
    type: RouteType;

    constructor(
        rawData: RouteRawData,
        public stops: Array<BusStop>,
        public trips: Array<BusTrip>,
    ) {
        this.color = rawData.route_color;
        this.fullName = rawData.route_long_name;
        this.id = rawData.route_id;
        this.type = rawData.route_desc;
    }

    routeToGeoJson = (): Feature<MultiLineString> => {
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
    };
}

export type TripRaw = {
    tripId: string;
    shapes: Array<ShapeRawData>;
};

export class TJDataSource {
    constructor(
        private routes: Record<string, BusRoute>,
        private stops: Record<string, BusStop>,
    ) {}

    getRouteIds = (): Set<string> => {
        return new Set(Object.keys(this.routes));
    };

    getRoutes = (query: string, routeTypes: Set<string>): Array<BusRoute> => {
        const routes = Object.values(this.routes);

        return routes.filter((route) => {
            let match = true;
            if (query !== "") {
                const idMatch = route.id.toLowerCase().includes(query);
                const nameMatch = route.fullName.toLowerCase().includes(query);
                match = idMatch || nameMatch;
            }

            if (routeTypes.size > 0) {
                match = match && routeTypes.has(route.type);
            }
            return match;
        });
    };

    getRoute = (id: string): BusRoute => {
        return this.routes[id];
    };

    getStop = (id: string): BusStop => {
        return this.stops[id];
    };

    getStops = (routeId: string | null = null): Array<BusStop> => {
        if (routeId !== null) {
            return this.routes[routeId].stops;
        }

        return Object.values(this.stops);
    };
}

export type GeoData = {
    busStops: Array<BusStop>;
    busRoutes: Array<BusRoute>;
    selectedRoutes: Array<BusRoute>;
};

export type Filter = {
    query: string;
    selectedRouteIds: Set<string>;
    selectedRouteTypes: Set<RouteType>;
};

export type PopOverBusStop = {
    type: "stop";
    stop: Stop;
};
export type PopOverState = PopOverBusStop | null;
