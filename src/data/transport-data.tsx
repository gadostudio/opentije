import { Point, Feature, MultiLineString, Position } from "geojson";
import {
    RouteRawData,
    TransjakartaRouteType,
    ShapeRawData,
} from "./transport-source/transjakarta";
import { ModeType, Stop } from "./transport-mode";

export const busCategories = {
    Transjakarta: Object.values(TransjakartaRouteType),
};
export const trainCategories = [
    "Commuterline",
    "LRT Jakarta",
    "MRT Jakarta",
    "LRT Jabodebek",
];
export const transportCategories = {
    [ModeType.Bus]: busCategories,
    [ModeType.Train]: trainCategories,
};

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
