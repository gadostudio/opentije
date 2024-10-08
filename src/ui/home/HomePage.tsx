import { Component, Match, onMount, Switch } from "solid-js";
import { MapCanvas } from "./map/map";
import { Sidebar } from "./sidebar/sidebar";
import { BusStop, useTransportData } from "../../data/transport-data";
import { RightPopover } from "./RightPopover";

export const HomePage: Component = () => {
    const { tjDataSource: tjResult } = useTransportData();

    return (
        <div class="map__container">
            <Sidebar />
            <div class="map__canvas-container">
                <Switch fallback={<p>Loading...</p>}>
                    <Match when={tjResult().type === "success"}>
                        <MapCanvas />
                    </Match>
                    <Match when={tjResult().type === "error"}>
                        <p>Error</p>
                    </Match>
                </Switch>
                <RightPopover />
            </div>
        </div>
    );
};
