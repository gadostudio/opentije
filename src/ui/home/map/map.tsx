import { Component, createSignal, onMount } from "solid-js";
import { GeolocateControl, Map, NavigationControl } from "maplibre-gl";
import { jakartaCoordinate } from "../../../constants";
import { useSidebarState } from "../../../data/sidebar-state";
import { useTjRealtimePositions } from "../../hooks/tj/realtime";
import { installRealtimeBusLocation } from "./map-plugins";
import { TjRealtimeConnectionControl } from "./tj-realtime-control";

export enum MapLayer {
    BusPositions = "opentije_bus_position",
    BusPositionsLayer = "opentije_bus_position_layer",
}

export enum MapDataSource {
    BusPositions = "opentije_bus_position",
}

export const MapCanvas: Component = () => {
    const { setIsExpanded } = useSidebarState();
    const [libreMap, setLibreMap] = createSignal<Map | null>(null);
    const { busPositions, connStatus } = useTjRealtimePositions();

    installRealtimeBusLocation(busPositions, libreMap);

    onMount(() => {
        const map = new Map({
            container: "map",
            style: "/assets/style.json",
            center: [jakartaCoordinate.longitude, jakartaCoordinate.latitude],
            zoom: 12,
            attributionControl: false,
        });
        map.on("load", () => {
            map.addControl(new TjRealtimeConnectionControl(connStatus));
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
