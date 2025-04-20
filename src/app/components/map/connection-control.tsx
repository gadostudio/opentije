import { IControl, Map } from "maplibre-gl";
import style from "./connection-control.module.scss";
import {
  TjRealtimeConnectionStatus as TransjakartaRealtimeConnectionStatus,
  useTransjakartaRealtimePositions,
} from "@/hooks/transjakarta-realtime";
import { createRoot, Root } from "react-dom/client";
import { useEffect, useMemo, useState } from "react";

const MAP_CONNECTION_STATUS = {
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
};

export class Control implements IControl {
  private container: HTMLElement | undefined;
  private connStatus: TransjakartaRealtimeConnectionStatus =
    TransjakartaRealtimeConnectionStatus.Connecting;
  private connStatusSetter:
    | ((newConnStatus: TransjakartaRealtimeConnectionStatus) => void)
    | undefined = undefined;

  setConnStatus(connStatus: TransjakartaRealtimeConnectionStatus) {
    this.connStatusSetter?.(connStatus);
  }

  TjRealtimeConnection = () => {
    const [connStatus, setConnStatus] =
      useState<TransjakartaRealtimeConnectionStatus>(this.connStatus);
    useEffect(() => {
      this.connStatusSetter = setConnStatus;
    }, [setConnStatus]);
    
    const { display, color } = MAP_CONNECTION_STATUS[connStatus];

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

  onAdd(map: Map) {
    this.container = document.createElement("div");
    this.container.className = "maplibregl-ctrl maplibregl-ctrl-group";
    this.container.id = "websocket-status-control";
    createRoot(this.container).render(<this.TjRealtimeConnection />);
    return this.container;
  }

  onRemove() {
    this.container?.parentNode?.removeChild(this.container);
  }
}

// Glue between the Libremap Control and react
export const useTransjakartaRealtimeConnectionControl = (map: Map | null) => {
  const { connStatus } = useTransjakartaRealtimePositions(map);
  const tjRealtimeIndicator = useMemo(() => new Control(), []);

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
