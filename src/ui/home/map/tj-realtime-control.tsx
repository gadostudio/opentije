import { IControl, Map } from "maplibre-gl";
import { Accessor } from "solid-js";
import { render } from "solid-js/web";
import { TjRealtimeConnectionStatus } from "../../hooks/tj/realtime";
import style from "./tj-realtime-control.module.scss";

const MAP_CONNECTION_STATUS = {
    [TjRealtimeConnectionStatus.Connected]: {
        display: "Connected",
        color: "#B1C29E",
    },
    [TjRealtimeConnectionStatus.Connecting]: {
        display: "Connecting",
        color: "#FADA7A",
    },
    [TjRealtimeConnectionStatus.Disconnected]: {
        display: "Disconnected",
        color: "#E16A54",
    },
    [TjRealtimeConnectionStatus.Error]: { display: "Error", color: "#E16A54" },
};

export type TjRealtimeConnectionProps = {
    connStatus: Accessor<TjRealtimeConnectionStatus>;
};

const TjRealtimeConnection = ({ connStatus }: TjRealtimeConnectionProps) => {
    const { display, color } = MAP_CONNECTION_STATUS[connStatus()];

    return (
        <div class={style.container}>
            <span
                style={`background-color: ${color};`}
                class={style.indicator}
            ></span>
            <div>
                <p class={style.title}>{`Realtime location`}</p>
                <p class={style.subtitle}>{display}</p>
            </div>
        </div>
    );
};

export class TjRealtimeConnectionControl implements IControl {
    private container: HTMLElement | undefined;
    private connStatus: Accessor<TjRealtimeConnectionStatus>;

    constructor(connStatus: Accessor<TjRealtimeConnectionStatus>) {
        this.connStatus = connStatus;
    }

    onAdd(map: Map) {
        this.container = document.createElement("div");
        this.container.className = "maplibregl-ctrl maplibregl-ctrl-group";
        this.container.id = "websocket-status-control";
        render(
            () => <TjRealtimeConnection connStatus={this.connStatus} />,
            this.container,
        );
        return this.container;
    }

    onRemove() {
        this.container?.parentNode?.removeChild(this.container);
    }
}
