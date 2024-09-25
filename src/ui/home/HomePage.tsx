import { Component, Match, onMount, Switch } from "solid-js";
import { MapCanvas } from "./map/map";
import { Sidebar } from "./sidebar/sidebar";
import { useTransportData } from "../../data/transport-data";

export const HomePage: Component = () => {
    const { tjDataSource: tjResult } = useTransportData();

    return (
        <div class="map__container">
            <div class="map__sidebar">
                <Switch fallback={<p>Loading...</p>}>
                    <Match when={tjResult().type === "success"}>
                        <Sidebar />
                    </Match>
                    <Match when={tjResult().type === "error"}>
                        <p>Error</p>
                    </Match>
                </Switch>
            </div>
            <div class="map__canvas-container">
                <Switch fallback={<p>Loading...</p>}>
                    <Match when={tjResult().type === "success"}>
                        <MapCanvas />
                    </Match>
                    <Match when={tjResult().type === "error"}>
                        <p>Error</p>
                    </Match>
                </Switch>
            </div>
        </div>
    );
};
