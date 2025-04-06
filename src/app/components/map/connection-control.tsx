import { IControl, Map } from "maplibre-gl";
import style from "./connection-control.module.scss";
import { TjRealtimeConnectionStatus as TransjakartaRealtimeConnectionStatus } from "@/hooks/transjakarta-realtime";
import { createRoot, Root } from "react-dom/client";

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

export type TjRealtimeConnectionProps = {
  connStatus: TransjakartaRealtimeConnectionStatus;
};

const TjRealtimeConnection = ({ connStatus }: TjRealtimeConnectionProps) => {
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

export class TjRealtimeConnectionControl implements IControl {
  private container: HTMLElement | undefined;
  private connStatus: TransjakartaRealtimeConnectionStatus;

  constructor(connStatus: TransjakartaRealtimeConnectionStatus) {
    this.connStatus = connStatus;
  }

  onAdd(map: Map) {
    this.container = document.createElement("div");
    this.container.className = "maplibregl-ctrl maplibregl-ctrl-group";
    this.container.id = "websocket-status-control";
    createRoot(this.container).render(
      <TjRealtimeConnection connStatus={this.connStatus} />,
    );
    return this.container;
  }

  onRemove() {
    this.container?.parentNode?.removeChild(this.container);
  }
}
