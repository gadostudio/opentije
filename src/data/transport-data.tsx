import {
    Accessor,
    Component,
    createContext,
    createSignal,
    onMount,
    ParentComponent,
    ParentProps,
    Setter,
    useContext,
} from "solid-js";
import { Result } from "../utils/result";
import { getRawData, RouteRawData, RouteType, ShapeRawData } from "./consumer";
import { DefaultMap } from "../utils/container";

export class BusTrip {
    constructor(public shapes: Array<ShapeRawData>) {}
}

export class BusStop {
    constructor(
        public name: string,
        public latitude: number,
        public longitude: number,
    ) {}

    asGeoJson = () => {
        return {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [this.longitude, this.latitude],
            },
            properties: {
                color: "#FF0000",
            },
        };
    };
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
}

export type TripRaw = {
    routeId: string;
    shapes: Array<ShapeRawData>;
};

export class TJ {
    constructor(
        private routes: Record<string, BusRoute>,
        private stops: Array<BusStop>,
    ) {}

    getRouteIds = (): Array<string> => {
        return Object.keys(this.routes);
    };

    getRoutes = (): Array<BusRoute> => {
        return Object.values(this.routes);
    };

    getRoute = (routeId: string): BusRoute => {
        return this.routes[routeId];
    };

    getBusStops = (routeId: string | null = null): Array<BusStop> => {
        if (routeId !== null) {
            return this.routes[routeId].stops;
        }

        return this.stops;
    };
}

export type TransportData = {
    tjResult: Accessor<Result<TJ>>;
    tj: Accessor<TJ>;
};

export const TransportDataContext = createContext<TransportData>();

export const useTransportData = () => useContext(TransportDataContext)!;

export const TransportDataProvider: ParentComponent = (props) => {
    const [tjResult, setTjResult] = createSignal<Result<TJ>>({
        type: "loading",
    });

    onMount(async () => {
        // Load route data
        const { routesRawData, stopsRawData, tripsRawData, shapesRawData } =
            await getRawData();

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
        for (const tripRawData of tripsRawData) {
            tripsRaw.get(tripRawData.route_id).push({
                routeId: tripRawData.trip_id,
                shapes: rawShapes.get(tripRawData.shape_id),
            });
        }

        const stops: Array<BusStop> = [];
        for (const stopRawData of stopsRawData) {
            const stop = new BusStop(
                stopRawData.stop_name,
                stopRawData.stop_lat,
                stopRawData.stop_lon,
            );
            stops.push(stop);
        }

        const routes: Record<string, BusRoute> = {};
        for (const routeRawData of routesRawData) {
            if (!routeRawData.agency_id) {
                continue;
            }

            const routeStops: Array<BusStop> = [];

            const trips: Array<BusTrip> = [];
            for (const tripRaw of tripsRaw.get(routeRawData.route_id)) {
                const trip = new BusTrip(tripRaw.shapes);
                trips.push(trip);
            }

            routes[routeRawData.route_id] = new BusRoute(
                routeRawData,
                routeStops,
                trips,
            );
        }

        setTjResult({
            type: "success",
            data: new TJ(routes, stops),
        });
    });

    const controller: TransportData = {
        tjResult,
        tj: () => tjResult().data!,
    };
    return (
        <TransportDataContext.Provider value={controller}>
            {props.children}
        </TransportDataContext.Provider>
    );
};
