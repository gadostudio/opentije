import { Component, createEffect, createSignal, onMount } from "solid-js";
import { Feature, Position } from "geojson";
import maplibregl from "maplibre-gl";
import { jakartaCoordinate } from "../../../constants";
import { useTransportData } from "../../../data/transport-data";

export const MapCanvas: Component = () => {
    const { tj } = useTransportData();

    onMount(() => {
        const map = new maplibregl.Map({
            container: "map",
            style: "/assets/style.json",
            center: [jakartaCoordinate.longitude, jakartaCoordinate.latitude],
            zoom: 12,
        });

        map.on("load", () => {
            map.addSource("opentije_bus_stops", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: tj().getBusStops().map(stop => stop.asGeoJson()),
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
        });
    });

    // onMount(async () => {
    //     const pathsData: Array<Feature> = [];
    //     for (const route of routes.values()) {
    //         const routeShapes: Array<Array<Position>> = [];
    //         for (const trip of route.trips) {
    //             const shapes: Array<Position> = [];
    //             for (const shape of trip.shapes) {
    //                 shapes.push([shape.shape_pt_lon, shape.shape_pt_lat]);
    //             }
    //             routeShapes.push(shapes);
    //         }

    //         pathsData.push({
    //             type: "Feature",
    //             geometry: {
    //                 type: "MultiLineString",
    //                 coordinates: routeShapes,
    //             },
    //             properties: {
    //                 title: route.data.route_id,
    //                 color: `#${route.data.route_color}`,
    //             },
    //         });
    //     }

    //     const stopsData: Array<Feature> = stopsRawData.map((stopRawData) => ({
    //         type: "Feature",
    //         geometry: {
    //             type: "Point",
    //             coordinates: [stopRawData.stop_lon, stopRawData.stop_lat],
    //         },
    //         properties: {
    //             color: "#FF0000",
    //         },
    //     }));

    //     map.on("load", () => {
    //         map.addSource("opentije_bus_trips", {
    //             type: "geojson",
    //             data: {
    //                 type: "FeatureCollection",
    //                 features: pathsData,
    //             },
    //         });
    //         map.addLayer({
    //             id: "opentije_bus_trips",
    //             type: "line",
    //             source: "opentije_bus_trips",
    //             paint: {
    //                 "line-width": 3,
    //                 "line-color": ["get", "color"],
    //             },
    //         });
    //         map.on("click", "opentije_bus_trips", (e) => {
    //             console.log(e, e?.features);
    //         });
    //         // map.addLayer({
    //         //     id: 'opentije_bus_trips_symbol',
    //         //     type: 'symbol',
    //         //     source: 'opentije_bus_trips',
    //         //     layout: {
    //         //         'text-field': '{title}',
    //         //         "text-font": ['Noto Sans Regular']
    //         //     }
    //         // });

    //         map.addSource("opentije_bus_stops", {
    //             type: "geojson",
    //             data: {
    //                 type: "FeatureCollection",
    //                 features: stopsData,
    //             },
    //         });
    //         map.addLayer({
    //             id: "opentije_bus_stops",
    //             type: "circle",
    //             source: "opentije_bus_stops",
    //             paint: {
    //                 "circle-color": ["get", "color"],
    //             },
    //         });
    //     });
    // });

    return <div id="map" class="map__canvas"></div>;
};
