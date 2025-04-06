"use client";

import {
  CanvasSourceSpecification,
  ExpressionInputType,
  ExpressionSpecification,
  FilterSpecification,
  GeoJSONSource,
  GeolocateControl,
  Map,
  NavigationControl,
  SourceSpecification,
} from "maplibre-gl";
import { useTransportController } from "@/data/transport-controller";
import { useMapUiState } from "@/data/map-ui";
import { ModeType } from "@/domain/transport-mode";
import { jakartaCoordinate } from "@/data/constants";
import { TjRealtimeConnectionControl as TransjakartaRealtimeConnectionControl } from "./map/connection-control";
import { useEffect } from "react";
import { useTransjakartaRealtimePositions } from "@/hooks/transjakarta-realtime";

export enum MapLayer {
  BusPositions = "opentije_bus_position",
  BusPositionsLayer = "opentije_bus_position_layer",
}

export enum MapDataSource {
  BusPositions = "opentije_bus_position",
}

export const MapCanvas = () => {
  const { modes } = useTransportController();
  const {
    libreMap,
    setLibreMap,
    setIsSidebarExpanded,
    selectedRouteIds,
    setSelectedStop,
  } = useMapUiState();
  const { connStatus } = useTransjakartaRealtimePositions(libreMap);

  useEffect(() => {
    const map = libreMap;
    if (!map) return;

    for (const mode of modes) {
      // Routes
      const routes = Object.values(mode.routes);
      const routeData = routes.map((route) => route.geoJson);
      const routeSource = map.getSource(mode.routesSourceId) as
        | GeoJSONSource
        | undefined;
      const routeGeoJson: GeoJSON.GeoJSON = {
        type: "FeatureCollection",
        features: routeData,
      };
      if (routeSource) {
        routeSource.setData(routeGeoJson);
      } else {
        map.addSource(mode.routesSourceId, {
          type: "geojson",
          data: routeGeoJson,
        });
      }

      if (map.getLayer(mode.routesLayerId) === undefined) {
        map.addLayer({
          id: mode.routesLayerId,
          type: "line",
          source: mode.routesSourceId,
          paint: {
            "line-width": 3,
            "line-color": ["get", "color"],
          },
          filter: ["literal", false],
        });
      }

      // Stops
      const stopData = mode.stops.map((stop) => stop.geoJson);
      const stopSource = map.getSource(mode.stopsLayerId) as
        | GeoJSONSource
        | undefined;
      const stopGeoJson: GeoJSON.GeoJSON = {
        type: "FeatureCollection",
        features: stopData,
      };
      if (stopSource) {
        stopSource.setData(stopGeoJson);
      } else {
        map.addSource(mode.stopsLayerId, {
          type: "geojson",
          data: stopGeoJson,
        });
      }

      if (map.getLayer(mode.stopsLayerId) === undefined) {
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
          id: mode.stopsLayerId,
          type: "symbol",
          source: mode.stopsSourceId,
          layout: {
            "icon-image": image,
            "icon-size": 0.5,
            "icon-allow-overlap": true,
          },
          minzoom,
          paint: {
            "icon-color": "#FF0000",
          },
        });
        map.on("click", mode.stopsLayerId, (target) => {
          const stopId = target?.features?.[0]?.properties?.id;
          if (stopId === undefined) return;
          setSelectedStop(stopId);
        });
      }
    }
  }, [libreMap, modes, setSelectedStop]);

  useEffect(() => {
    const map = libreMap;
    if (!map) return;

    const routeIds = Array.from(selectedRouteIds);
    const showAll = routeIds.length === 0;

    for (const mode of modes) {
      const layer = map.getLayer(mode.stopsLayerId);
      if (!layer) continue;

      let filter: undefined | FilterSpecification;
      // Hide bus stops since it looks messy for a route preview
      if (!showAll) {
        const routeExp: Array<ExpressionSpecification> = routeIds.map(
          (routeId: string) => ["in", routeId, ["get", "servedRouteIds"]],
        );
        filter = ["any", ...routeExp];
        layer.minzoom = 0;
        layer.setPaintProperty("icon-color", ["literal", "#B7B1F2"]);
      } else {
        filter = undefined;
        if (mode.type === ModeType.Train) {
          layer.minzoom = 0;
        } else {
          layer.minzoom = 14;
        }
        layer.setPaintProperty("icon-color", ["literal", "#000000"]);
      }
      map.setFilter(mode.stopsLayerId, filter);
    }

    for (const mode of modes) {
      const layer = map.getLayer(mode.routesLayerId);
      if (!layer) continue;

      let filter: undefined | FilterSpecification;
      if (!showAll) {
        filter = ["in", ["get", "routeId"], ["literal", routeIds]];
      } else {
        filter = ["literal", false];
      }
      map.setFilter(mode.routesLayerId, filter);
    }
  }, [libreMap, modes, selectedRouteIds]);

  useEffect(() => {
    const map = new Map({
      container: "map",
      style: "/assets/style.json",
      center: [jakartaCoordinate.longitude, jakartaCoordinate.latitude],
      zoom: 12,
      attributionControl: false,
    });
    map.on("load", async () => {
      map.addControl(new TransjakartaRealtimeConnectionControl(connStatus));
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

      const busStopImg = await map.loadImage("/assets/images/bus-stop.webp");
      map.addImage("bus-stop", busStopImg.data);
      const trainStationImg = await map.loadImage(
        "/assets/images/train-station.webp",
      );
      map.addImage("train-station", trainStationImg.data);

      map.on("contextmenu", (target) => {
        console.log("target", target.lngLat);
      });

      setLibreMap(map);
    });
  }, [connStatus, setLibreMap]);

  return (
    <div
      id="map"
      className="map__canvas"
      onClick={() => setIsSidebarExpanded(false)}
    />
  );
};
