import { Accessor, createEffect } from "solid-js";
import { BusPosition } from "../../../data/tj/realtime";
import {
    GeoJSONSource,
    GeolocateControl,
    Map,
    NavigationControl,
} from "maplibre-gl";
import { MapDataSource, MapLayer } from "./map";
import { GeoJsonProperties, Geometry, Feature } from "geojson";
import { useTransportData } from "../../../data/transport-data";

export const installRealtimeBusLocation = (
    busPositions: Accessor<Array<BusPosition>>,
    libreMap: Accessor<Map | null>,
) => {
    const { selectedRouteIds } = useTransportData();

    createEffect(() => {
        const map = libreMap();
        if (map === null) return;

        map.addSource(MapDataSource.BusPositions, {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: [],
            },
        });
        map.addLayer({
            id: MapLayer.BusPositions,
            type: "circle",
            source: "opentije_bus_position",
            paint: {
                "circle-color": ["get", "color"],
                "circle-radius": 24,
            },
        });
        map.addLayer({
            id: MapLayer.BusPositionsLayer,
            type: "symbol",
            source: MapDataSource.BusPositions,
            paint: {
                "text-color": ["get", "labelColor"],
            },
            layout: {
                "text-field": ["get", "routeCode"],
                "text-font": ["Noto Sans Regular"],
                "text-variable-anchor": ["center"],
                "text-radial-offset": 0.5,
                "text-justify": "auto",
                "text-size": 12,
            },
        });
    });

    createEffect(() => {
        const map = libreMap();
        if (map === null) return;

        const busPositionSource = map.getSource(
            MapDataSource.BusPositions,
        ) as GeoJSONSource;

        let searchPredicate: (data: BusPosition) => boolean;
        if (selectedRouteIds().size > 0) {
            searchPredicate = (data) => selectedRouteIds().has(data.route_code);
        } else {
            searchPredicate = (data) => true;
        }

        const geoJsonData = busPositions()
            .filter(searchPredicate)
            .map((data) => {
                return {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [data.longitude, data.latitude],
                    },
                    properties: {
                        color: `#${data.route_color}`,
                        routeCode: data.route_code,
                        labelColor: `#${data.route_text_color}`,
                    },
                } as Feature<Geometry, GeoJsonProperties>;
            });

        busPositionSource.setData({
            type: "FeatureCollection",
            features: geoJsonData,
        });
    });
};
