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
import { RouteRawData, TransjakartaRouteType, ShapeRawData } from "./consumer";
import { DefaultMap } from "../utils/container";
import { Stop } from "./transport-mode";

export type TripRaw = {
    tripId: string;
    shapes: Array<ShapeRawData>;
};

export type GeoData = {
    busStops: Array<BusStop>;
    busRoutes: Array<BusRoute>;
    selectedRoutes: Array<BusRoute>;
};

export type Filter = {
    query: string;
    selectedRouteIds: Set<string>;
    selectedRouteTypes: Set<TransjakartaRouteType>;
};

export type PopOverBusStop = {
    type: "stop";
    stop: Stop;
};
export type PopOverState = PopOverBusStop | null;
