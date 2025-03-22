import { Component, createEffect, createSignal, onMount } from "solid-js";
import {
    CanvasSourceSpecification,
    GeoJSONSource,
    GeolocateControl,
    Map,
    NavigationControl,
    SourceSpecification,
} from "maplibre-gl";
import { jakartaCoordinate } from "../../../constants";
import { useTransportController } from "../../../data/transport-controller";
import { useSidebarState } from "../../../data/sidebar-state";

export const MapCanvas: Component = () => {
    const { modes, setSelectedStop } = useTransportController();
    const { setIsExpanded } = useSidebarState();
    const [libreMap, setLibreMap] = createSignal<Map | null>(null);

    createEffect(() => {
        const map = libreMap();
        if (map === null) return;

        for (const mode of modes()) {
            const dataId = `opentije_${mode.name}_data`;
            const layerId = `opentije_${mode.name}_layer`;

            const stopGeoJson: GeoJSON.GeoJSON = {
                type: "FeatureCollection",
                features: mode.stops.map((stop) => stop.geoJson),
            };
            const stopSource = map.getSource(dataId) as
                | GeoJSONSource
                | undefined;
            if (stopSource !== undefined) {
                stopSource.setData(stopGeoJson);
            } else {
                map.addSource(dataId, {
                    type: "geojson",
                    data: stopGeoJson,
                });
            }
            if (map.getLayer(layerId) !== null) {
                map.addLayer({
                    id: layerId,
                    type: "circle",
                    source: dataId,
                    paint: {
                        "circle-color": ["get", "color"],
                    },
                });
                map.on("click", layerId, (target) => {
                    const busStopId = target?.features?.[0]?.properties?.id;
                    if (busStopId === undefined) return;
                    setSelectedStop(busStopId);
                });
            }
        }
    });

    createEffect(() => {
        const map = libreMap();
        if (map === null) return;

        // const stationSource = map.getSource(
        //     "opentije_station",
        // ) as GeoJSONSource;

        // const busStopsSource = map.getSource(
        //     "opentije_bus_stops",
        // ) as GeoJSONSource;
        // busStopsSource.setData({
        //     type: "FeatureCollection",
        //     features: geoData().busStops.map((stop) => stop.geoJson),
        // });

        // const busLanesSource = map.getSource(
        //     "opentije_bus_lanes",
        // ) as GeoJSONSource;
        // busLanesSource.setData({
        //     type: "FeatureCollection",
        //     features: geoData().selectedRoutes.map((route) =>
        //         route.routeToGeoJson(),
        //     ),
        // });
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

            // map.addLayer({
            //     id: "opentije_bus_stops-label",
            //     type: "symbol",
            //     source: "opentije_bus_stops",
            //     minzoom: 13,
            //     layout: {
            //         "text-field": ["get", "name"],
            //         "text-font": ["Noto Sans Regular"],
            //         "text-variable-anchor": ["left", "right"],
            //         "text-radial-offset": 0.5,
            //         "text-justify": "auto",
            //     },
            // });
            // map.addLayer({
            //     id: "opentije_bus_stops",
            //     type: "circle",
            //     source: "opentije_bus_stops",
            //     paint: {
            //         "circle-color": ["get", "color"],
            //     },
            // });

            // map.addSource("opentije_bus_lanes", {
            //     type: "geojson",
            //     data: {
            //         type: "FeatureCollection",
            //         features: [],
            //     },
            // });
            // map.addLayer({
            //     id: "opentije_bus_lanes",
            //     type: "line",
            //     source: "opentije_bus_lanes",
            //     paint: {
            //         "line-width": 3,
            //         "line-color": ["get", "color"],
            //     },
            // });

            // map.on("click", "opentije_bus_stops", (target) => {
            //     const busStopId = target.features![0].properties.id;
            //     setSelectedBusStop(busStopId);
            // });

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
