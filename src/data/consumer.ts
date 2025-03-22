import { BlobReader, Entry, TextWriter, ZipReader } from "@zip.js/zip.js";
import Papa from "papaparse";

export enum RouteType {
    BRT = "BRT",
    Mikrotrans = "Mikrotrans",
    Integrasi = "Angkutan Umum Integrasi",
    Rusun = "Rusun",
    Royaltrans = "Royaltrans",
    Transjabodetabek = "Transjabodetabek",
    BusWisata = "Bus Wisata",
}

export type RouteRawData = {
    route_id: string;
    agency_id: string;
    route_short_name: string;
    route_long_name: string;
    route_desc: RouteType;
    route_color: string;
    route_text_color: string;
};

export type StopRawData = {
    stop_id: string;
    stop_name: string;
    stop_lat: number;
    stop_lon: number;
    zone_id: any;
    location_type: any;
    wheelchair_boarding: any;
};

export type ShapeRawData = {
    shape_id: string;
    shape_pt_lat: number;
    shape_pt_lon: number;
    shape_pt_sequence: number;
};

export type TripRawData = {
    route_id: string;
    service_id: string;
    trip_id: string;
    trip_headsign: string;
    direction_id: string;
    shape_id: string;
    trip_short_name: string;
};

export type StopTimeRawData = {
    trip_id: string;
    stop_id: string;
};
