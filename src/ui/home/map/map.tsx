import { Component, createEffect, createSignal, onMount } from "solid-js";
import { GeoJSONSource, GeolocateControl, Map, NavigationControl } from "maplibre-gl";
import { jakartaCoordinate } from "../../../constants";
import { useTransportData } from "../../../data/transport-data";

export const MapCanvas: Component = () => {
    const { geoData } = useTransportData();
    const [libreMap, setLibreMap] = createSignal<Map | null>(null);

    createEffect(() => {
        const map = libreMap();
        if (map === null) return;

        const busStopsSource = map.getSource(
            "opentije_bus_stops",
        ) as GeoJSONSource;
        busStopsSource.setData({
            type: "FeatureCollection",
            features: geoData().busStops.map((stop) => stop.asGeoJson()),
        });

        const busLanesSource = map.getSource(
            "opentije_bus_lanes",
        ) as GeoJSONSource;
        busLanesSource.setData({
            type: "FeatureCollection",
            features: geoData().selectedRoutes.map((route) =>
                route.routeToGeoJson(),
            ),
        });
    });

    onMount(() => {
        const map = new Map({
            container: "map",
            style: "/assets/style.json",
            center: [jakartaCoordinate.longitude, jakartaCoordinate.latitude],
            zoom: 12,
        });
        map.on("load", () => {
            map.addControl(
                new GeolocateControl({
                    positionOptions: {
                        enableHighAccuracy: true
                    },
                    trackUserLocation: true,
                    showAccuracyCircle: false,
                })
            );
            map.addControl(new NavigationControl());

            map.addSource("opentije_bus_stops", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: [],
                },
            });
            map.addLayer({
                id: "opentije_bus_stops",
                type: "circle",
                source: "opentije_bus_stops",
                paint: {
                    "circle-color": ["get", "color"],
                },
            });

            map.addSource("opentije_bus_lanes", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: [],
                },
            });
            map.addLayer({
                id: "opentije_bus_lanes",
                type: "line",
                source: "opentije_bus_lanes",
                paint: {
                    "line-width": 3,
                    "line-color": ["get", "color"],
                },
            });

            setLibreMap(map);
        });
    });

    return <div id="map" class="map__canvas"></div>;
};
