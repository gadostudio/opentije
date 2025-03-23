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
import { useTransportController } from "../../../data/states/transport-controller";
import { useMapUiState } from "../../../data/states/sidebar-state";
import { ModeType } from "../../../data/transport-mode";
import { Feature, GeoJsonProperties, Geometry } from "geojson";

export const MapCanvas: Component = () => {
    const { modes, setSelectedStop, getRoute } = useTransportController();
    const {
        libreMap,
        setLibreMap,
        setIsSidebarExpanded,
        selectedRouteIds,
        setSelectedRouteId,
    } = useMapUiState();
    const lanesSourceId = `opentije_lanes_data`;
    const lanesLayerId = `opentije_lanes_layer`;

    createEffect(() => {
        const map = libreMap();
        if (map === null) return;

        const features: Array<Feature<Geometry, GeoJsonProperties>> = [];
        for (const routeId of selectedRouteIds()) {
            const geoJson = getRoute(routeId)?.laneGeoJson;
            if (geoJson === undefined) continue;
            features.push(geoJson);
        }

        const source = map.getSource(lanesSourceId) as
            | GeoJSONSource
            | undefined;
        source?.setData({
            type: "FeatureCollection",
            features,
        });
    });

    createEffect(() => {
        const map = libreMap();
        if (map === null) return;

        for (const mode of modes()) {
            const sourceId = `opentije_${mode.name}_stop_data`;
            const layerId = `opentije_${mode.name}_stop_layer`;

            const stopGeoJson: GeoJSON.GeoJSON = {
                type: "FeatureCollection",
                features: mode.stops.map((stop) => stop.geoJson),
            };
            const stopSource = map.getSource(sourceId) as
                | GeoJSONSource
                | undefined;
            if (stopSource !== undefined) {
                stopSource.setData(stopGeoJson);
            } else {
                map.addSource(sourceId, {
                    type: "geojson",
                    data: stopGeoJson,
                });
            }
            if (map.getLayer(layerId) !== null) {
                let image: string;
                let minzoom: number;
                if (mode.type === ModeType.Train) {
                    image = "train-station";
                    minzoom = 0;
                } else {
                    image = "bus-stop";
                    minzoom = 14;
                }
                map.addLayer({
                    id: layerId,
                    type: "symbol",
                    source: sourceId,
                    layout: {
                        "icon-image": image,
                        "icon-size": 0.5,
                    },
                    minzoom,
                });
                map.on("click", layerId, (target) => {
                    const busStopId = target?.features?.[0]?.properties?.id;
                    if (busStopId === undefined) return;
                    setSelectedStop(busStopId);
                });
            }
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
        map.on("load", async () => {
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

            const busStopImg = await map.loadImage(
                "/assets/images/bus-stop.webp",
            );
            map.addImage("bus-stop", busStopImg.data);
            const trainStationImg = await map.loadImage(
                "/assets/images/train-station.webp",
            );
            map.addImage("train-station", trainStationImg.data);

            map.on("contextmenu", (target) => {
                console.log("target", target.lngLat);
            });

            map.addSource(lanesSourceId, {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: [],
                },
            });
            map.addLayer({
                id: lanesLayerId,
                type: "line",
                source: lanesSourceId,
                paint: {
                    "line-width": 3,
                    "line-color": ["get", "color"],
                },
            });

            setLibreMap(map);
        });
    });

    return (
        <div
            id="map"
            class="map__canvas"
            onClick={() => setIsSidebarExpanded(false)}
        >
            <ul class={""}>
                <li>
                    {1}, {1}
                </li>
                <li>Public transportation around here</li>
                <li>Open Google Maps</li>
            </ul>
        </div>
    );
};
