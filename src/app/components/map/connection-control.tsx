import style from "./connection-control.module.scss";
import {
  GeoJSONSource,
  GeolocateControl,
  IControl,
  Map,
  NavigationControl,
} from "maplibre-gl";
import { GeoJsonProperties, Geometry, Feature } from "geojson";
import {
  TjRealtimeConnectionStatus as TransjakartaRealtimeConnectionStatus,
  useTransjakartaRealtimePositions,
} from "@/hooks/transjakarta-realtime";
import { createRoot } from "react-dom/client";
import { useEffect, useMemo, useState } from "react";
import { MapDataSource, MapLayer } from "../MapCanvas";
import { BusPosition } from "@/data/transport-source-realtime/transjakarta";
import { useMapUiState } from "@/data/map-ui";

const mapConnectionStatus = (status: TransjakartaRealtimeConnectionStatus) => ({
  [TransjakartaRealtimeConnectionStatus.Connected]: {
    display: "Connected",
    color: "#B1C29E",
  },
  [TransjakartaRealtimeConnectionStatus.Connecting]: {
    display: "Connecting",
    color: "#FADA7A",
  },
  [TransjakartaRealtimeConnectionStatus.Disconnected]: {
    display: "Disconnected",
    color: "#E16A54",
  },
  [TransjakartaRealtimeConnectionStatus.Error]: {
    display: "Error",
    color: "#E16A54",
  },
}[status]);

export class Control implements IControl {
  private container: HTMLElement | undefined;
  private connStatus: TransjakartaRealtimeConnectionStatus =
    TransjakartaRealtimeConnectionStatus.Connecting;
  private connStatusSetter:
    | ((newConnStatus: TransjakartaRealtimeConnectionStatus) => void)
    | undefined = undefined;

  setConnStatus(connStatus: TransjakartaRealtimeConnectionStatus) {
    this.connStatus = connStatus;
    this.connStatusSetter?.(connStatus);
  }

  onAdd(map: Map) {
    this.container = document.createElement("div");
    this.container.className = "maplibregl-ctrl maplibregl-ctrl-group";
    this.container.id = "websocket-status-control";

    const TjRealtimeConnection = () => {
      const [connStatus, setConnStatus] =
        useState<TransjakartaRealtimeConnectionStatus>(this.connStatus);
      useEffect(() => {
        this.connStatusSetter = setConnStatus;
      }, [setConnStatus]);
  
      const { display, color } = mapConnectionStatus(connStatus);
  
      return (
        <div className={style.container}>
          <span
            style={{ backgroundColor: color }}
            className={style.indicator}
          ></span>
          <div>
            <p className={style.title}>{`Realtime location`}</p>
            <p className={style.subtitle}>{display}</p>
          </div>
        </div>
      );
    };

    createRoot(this.container).render(<TjRealtimeConnection />);
    return this.container;
  }

  onRemove() {
    this.container?.parentNode?.removeChild(this.container);
  }
}

// Glue between the Libremap Control and react
export const useTransjakartaRealtimeConnectionControl = (map: Map | null) => {
  const { connStatus, busPositions } = useTransjakartaRealtimePositions();
  const tjRealtimeIndicator = useMemo(() => new Control(), []);

  const { selectedRouteIds } = useMapUiState();

  useEffect(() => {
    if (!map) return;

    if (!map.getSource(MapDataSource.BusPositions)) {
      map.addSource(MapDataSource.BusPositions, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });
    }
    if (!map.getLayer(MapLayer.BusPositions)) {
      map.addLayer({
        id: MapLayer.BusPositions,
        type: "circle",
        source: MapDataSource.BusPositions,
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": 24,
        },
        minzoom: 15,
      });
    }
    if (!map.getLayer(MapLayer.BusPositionsLayer)) {
      map.addLayer({
        id: MapLayer.BusPositionsLayer,
        type: "symbol",
        source: MapDataSource.BusPositions,
        paint: {
          "text-color": ["get", "labelColor"],
        },
        layout: {
          "text-field": ["get", "routeCode"],
          "text-font": ["Noto Sans Regular"],
          "text-variable-anchor": ["center"],
          "text-radial-offset": 0.5,
          "text-justify": "auto",
          "text-size": 12,
          "text-allow-overlap": true,
        },
        minzoom: 15,
      });
    }
  });

  useEffect(() => {
    if (!map) return;

    const busPositionSource = map.getSource(
      MapDataSource.BusPositions,
    ) as GeoJSONSource;

    let searchPredicate: (data: BusPosition) => boolean;
    if (selectedRouteIds.size > 0) {
      searchPredicate = (data) => selectedRouteIds.has(data.route_code);
    } else {
      searchPredicate = (data) => true;
    }

    const geoJsonData = busPositions.filter(searchPredicate).map((data) => {
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [data.longitude, data.latitude],
        },
        properties: {
          color: `#${data.route_color}`,
          routeCode: data.route_code,
          labelColor: `#${data.route_text_color}`,
        },
      } as Feature<Geometry, GeoJsonProperties>;
    });

    busPositionSource.setData({
      type: "FeatureCollection",
      features: geoJsonData,
    });
  });

  useEffect(() => {
    tjRealtimeIndicator.setConnStatus(connStatus);
  }, [connStatus]);

  useEffect(() => {
    if (!map) return;
    map.addControl(tjRealtimeIndicator, "top-right");

    return () => {
      map.removeControl(tjRealtimeIndicator);
    };
  }, [map, tjRealtimeIndicator]);
};
