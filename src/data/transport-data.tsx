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
import { getRawData, RouteRawData, RouteType, ShapeRawData } from "./tj/gtfs";
import { DefaultMap } from "../utils/container";

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
        if (routeTypes.size === 0) return routes;
        return routes.filter((route) => {
            if (!routeTypes.has(route.type)) {
                return false;
            }

            const idMatch = route.id.toLowerCase().includes(query);
            const nameMatch = route.fullName.toLowerCase().includes(query);
            return idMatch || nameMatch;
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

export type TransportData = {
    tjDataSource: Accessor<Result<TJDataSource>>;
    geoData: Accessor<GeoData>;
    filter: Accessor<Filter>;

    rightPopover: Accessor<PopOverState | null>;
    closeRightPopover: () => void;
    setSelectedBusStop: (id: string) => void;

    setQuery: (query: string) => void;

    setSelectedRouteTypes: (routeId: RouteType, selected: boolean) => void;
    clearSelectedRouteTypes: () => void;

    setSelectedRouteId: (routeId: string, selected: boolean) => void;
    selectedRouteIds: Accessor<Set<string>>;
};

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
    type: "bus_stop";
    busStop: BusStop;
};
export type PopOverState = PopOverBusStop | null;

export const TransportDataContext = createContext<TransportData>();

export const useTransportData = () => useContext(TransportDataContext)!;

export const TransportDataProvider: ParentComponent = (props) => {
    const [tjData, setTjData] = createSignal<Result<TJDataSource>>({
        type: "loading",
    });
    const [rightPopover, setRightPopover] = createSignal<PopOverState>(null, {
        equals: false,
    });
    const [geoData, setGeoData] = createSignal<GeoData>({
        busStops: [],
        busRoutes: [],
        selectedRoutes: [],
    });
    const [filter, setFilter] = createSignal<Filter>({
        query: "",
        selectedRouteIds: new Set(),
        selectedRouteTypes: new Set(),
    });

    onMount(async () => {
        // Load route data
        const {
            routesRawData,
            stopsRawData,
            tripsRawData,
            shapesRawData,
            stopTimesRawData,
        } = await getRawData();

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

        const tripStopIds = new DefaultMap<string, Set<string>>(
            () => new Set(),
        );
        const routesServedByStop = new DefaultMap<string, Set<string>>(
            () => new Set(),
        );
        for (const stopTime of stopTimesRawData) {
            tripStopIds.get(stopTime.trip_id).add(stopTime.stop_id);
            routesServedByStop
                .get(stopTime.stop_id)
                .add(tripIdToRouteId[stopTime.trip_id]);
        }

        const stopsMap: Record<string, BusStop> = {};
        for (const stopRawData of stopsRawData) {
            const stop = new BusStop(
                stopRawData.stop_id,
                stopRawData.stop_name,
                stopRawData.stop_lat,
                stopRawData.stop_lon,
                routesServedByStop.get(stopRawData.stop_id),
            );
            stopsMap[stop.id] = stop;
        }

        const routes: Record<string, BusRoute> = {};
        for (const routeRawData of routesRawData) {
            if (!routeRawData.agency_id) {
                continue;
            }

            const routeStops: Array<BusStop> = [];

            const trips: Array<BusTrip> = [];
            for (const tripRaw of tripsRaw.get(routeRawData.route_id)) {
                const trip = new BusTrip(tripRaw.tripId, tripRaw.shapes);
                trips.push(trip);

                const stopIds = tripStopIds.get(trip.id);
                for (const stopId of stopIds) {
                    const stop = stopsMap[stopId];
                    routeStops.push(stop);
                }
            }

            routes[routeRawData.route_id] = new BusRoute(
                routeRawData,
                routeStops,
                trips,
            );
        }

        setTjData({
            type: "success",
            data: new TJDataSource(routes, stopsMap),
        });
    });

    createEffect(() => {
        const data = tjData().data;
        if (data === undefined) return;

        const { query, selectedRouteTypes, selectedRouteIds } = filter();

        const busStops: Array<BusStop> = [];
        if (selectedRouteIds.size > 0) {
            for (const routeId of selectedRouteIds) {
                const route = data.getRoute(routeId);
                busStops.push(...route.stops);
            }
        } else {
            busStops.push(...data.getStops());
        }

        const busRoutes = data.getRoutes(query, selectedRouteTypes);
        const selectedRoutes = [];
        for (const routeId of selectedRouteIds) {
            const route = data.getRoute(routeId);
            selectedRoutes.push(route);
        }
        setGeoData({
            busStops,
            selectedRoutes,
            busRoutes,
        });
    });

    const controller: TransportData = {
        tjDataSource: tjData,
        geoData,
        filter,
        rightPopover,
        setSelectedBusStop: (id: string) => {
            const data = tjData().data;
            if (data === undefined) return;

            setRightPopover(() => ({
                type: "bus_stop",
                busStop: data.getStop(id),
            }));
        },
        closeRightPopover: () => {
            setRightPopover(() => null);
        },
        setQuery: (query: string) =>
            setFilter((prev) => ({
                ...prev,
                query,
            })),
        setSelectedRouteId: (routeId: string, selected: boolean) =>
            setFilter((prev) => {
                const selectedRouteIds = new Set(prev.selectedRouteIds);
                if (selected) {
                    selectedRouteIds.add(routeId);
                } else {
                    selectedRouteIds.delete(routeId);
                }
                return {
                    ...prev,
                    selectedRouteIds,
                };
            }),
        setSelectedRouteTypes: (routeType: RouteType, selected: boolean) =>
            setFilter((prev) => {
                const selectedRouteTypes = new Set(prev.selectedRouteTypes);
                if (selected) {
                    selectedRouteTypes.add(routeType);
                } else {
                    selectedRouteTypes.delete(routeType);
                }
                return {
                    ...prev,
                    selectedRouteTypes,
                };
            }),
        clearSelectedRouteTypes: () =>
            setFilter((prev) => ({
                ...prev,
                selectedRouteTypes: new Set(),
            })),
        selectedRouteIds: () => filter().selectedRouteIds,
    };
    return (
        <TransportDataContext.Provider value={controller}>
            {props.children}
        </TransportDataContext.Provider>
    );
};
