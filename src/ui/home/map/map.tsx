import { Component, createEffect, createSignal, onMount } from "solid-js";
import {
    GeoJSONSource,
    GeolocateControl,
    Map,
    NavigationControl,
} from "maplibre-gl";
import { jakartaCoordinate } from "../../../constants";
import { BusStop, useTransportData } from "../../../data/transport-data";
import { useSidebarState } from "../../../data/sidebar-state";

export const MapCanvas: Component = () => {
    const { geoData, tjDataSource, setSelectedBusStop, selectedEntry } =
        useTransportData();
    const { setIsExpanded } = useSidebarState();
    const [libreMap, setLibreMap] = createSignal<Map | null>(null);

    const updateBusStopSources = (map: Map, selectedStopId: string | null) => {
        const busStopsSource = map.getSource(
            "opentije_bus_stops",
        ) as GeoJSONSource;
        const selectedStopSource = map.getSource(
            "selected_bus_stop",
        ) as GeoJSONSource;

        if (selectedStopId) {
            const selectedStop = geoData().busStops.find(
                (stop) => stop.id === selectedStopId,
            );

            if (selectedStop) {
                selectedStopSource.setData({
                    type: "FeatureCollection",
                    features: [selectedStop.geoJson],
                });

                const filteredSameStop = geoData()
                    .busStops.filter((stop) => stop.id !== selectedStop.id)
                    .map((stop) => stop.geoJson);

                busStopsSource.setData({
                    type: "FeatureCollection",
                    features: filteredSameStop,
                });
            }
        } else {
            selectedStopSource.setData({
                type: "FeatureCollection",
                features: [],
            });

            busStopsSource.setData({
                type: "FeatureCollection",
                features: geoData().busStops.map((stop) => stop.geoJson),
            });
        }
    };

    createEffect(() => {
        const map = libreMap();
        if (map === null) return;

        const busStopsSource = map.getSource(
            "opentije_bus_stops",
        ) as GeoJSONSource;
        busStopsSource.setData({
            type: "FeatureCollection",
            features: geoData().busStops.map((stop) => stop.geoJson),
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

        const entry = selectedEntry();
        if (entry && entry.category === "Bus Stop") {
            updateBusStopSources(map, entry.id);

            const selectedStop = geoData().busStops.find(
                (stop) => stop.id === entry.id,
            );

            if (selectedStop) {
                map.flyTo({
                    center: [selectedStop.longitude, selectedStop.latitude],
                    zoom: 16,
                    speed: 0.5,
                    curve: 2.5,
                });
            }
        } else {
            updateBusStopSources(map, null);
            map.flyTo({
                center: [
                    jakartaCoordinate.longitude,
                    jakartaCoordinate.latitude,
                ],
                zoom: 12,
                speed: 0.5,
                curve: 2.5,
            });
        }
    });

    onMount(() => {
        const map = new Map({
            container: "map",
            style: "/assets/style.json",
            center: [jakartaCoordinate.longitude, jakartaCoordinate.latitude],
            zoom: 12,
            attributionControl: false,
        });
        map.on("load", () => {
            map.addControl(
                new GeolocateControl({
                    positionOptions: {
                        enableHighAccuracy: true,
                    },
                    trackUserLocation: true,
                    showAccuracyCircle: false,
                }),
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
                id: "opentije_bus_stops-label",
                type: "symbol",
                source: "opentije_bus_stops",
                minzoom: 15,
                layout: {
                    "text-field": ["get", "name"],
                    "text-font": ["Noto Sans Regular"],
                    "text-variable-anchor": ["left", "right"],
                    "text-radial-offset": 0.5,
                    "text-justify": "auto",
                },
            });
            map.addLayer({
                id: "opentije_bus_stops",
                type: "circle",
                source: "opentije_bus_stops",
                minzoom: 12,
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

            map.addSource("selected_bus_stop", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: [],
                },
            });

            map.addLayer({
                id: "selected_bus_stop",
                type: "circle",
                source: "selected_bus_stop",
                paint: {
                    "circle-color": "#FF0000",
                    "circle-radius": 10,
                },
            });

            map.addLayer({
                id: "selected_bus_stop-label",
                type: "symbol",
                source: "selected_bus_stop",
                layout: {
                    "text-field": ["get", "name"],
                    "text-font": ["Noto Sans Bold"],
                    "text-size": 20,
                    "text-variable-anchor": ["left", "right"],
                    "text-radial-offset": 0.8,
                    "text-justify": "auto",
                },
                paint: {
                    "text-color": "#000000",
                    "text-opacity": 1,
                },
            });

            map.on("click", "opentije_bus_stops", (target) => {
                const busStopId = target.features![0].properties.id;

                setSelectedBusStop(busStopId);
                updateBusStopSources(map, busStopId);
            });

            setLibreMap(map);
        });
    });

    return (
        <div
            id="map"
            class="map__canvas"
            onClick={() => setIsExpanded(false)}
        ></div>
    );
};
