import { Component, Match, onMount, Switch } from "solid-js";
import {
  getRawData,
  RouteRawData,
  ShapeRawData,
} from "../../data/consumer";
import { DefaultMap } from "../../utils/container";
import { MapCanvas } from "./map/map";
import { Sidebar } from "./sidebar/sidebar";
import { useTransportData } from "../../data/transport-data";
import { Trip } from "../../data/transport-data";

export type RouteData = {
  data: RouteRawData;
  // stops: Array<Stop>,
  trips: Array<Trip>;
};

export const HomePage: Component = () => {
  const { route } = useTransportData();

  return (
    <div class="map__container">
      <div class="map__sidebar">
        <Switch fallback={<p>Loading...</p>}>
          <Match when={route().type === "success"}>
            <Sidebar />
          </Match>
          <Match when={route().type === "error"}>
            <p>Error</p>
          </Match>
        </Switch>
      </div>
      <div class="map__canvas-container">
        <Switch fallback={<p>Loading...</p>}>
          <Match when={route().type === "error"}>
            <p>Error</p>
          </Match>
        </Switch>
        <MapCanvas />
      </div>
    </div>
  );
};
