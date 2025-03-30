import { Component, Match, onMount, Switch } from "solid-js";
import { MapCanvas } from "./map/map";
import { Sidebar } from "./sidebar/sidebar";
import { RightPopover } from "./RightPopover";

export const HomePage: Component = () => {
    return (
        <div class="map__container">
            <Sidebar />
            <div class="map__canvas-container">
                <MapCanvas />
                <RightPopover />
            </div>
        </div>
    );
};
