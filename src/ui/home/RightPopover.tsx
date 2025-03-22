import {
    Accessor,
    createSignal,
    For,
    Match,
    ParentComponent,
    Switch,
} from "solid-js";
import {
    BusStop as BusStopType,
    PopOverBusStop,
} from "../../data/transport-data";
import style from "./RightPopover.module.scss";
import { useTransportController } from "../../data/transport-controller";
import { Stop } from "../../data/transport-mode";

export const RightPopover: ParentComponent = () => {
    const { rightPopover } = useTransportController();

    const openedClass = () => (rightPopover() !== null ? style.opened : "");
    const stop = () => (rightPopover() as PopOverBusStop).stop;

    return (
        <div class={`${style.container} ${openedClass()}`}>
            <Switch>
                <Match when={rightPopover()?.type === "stop"}>
                    <BusStop stop={stop} />
                </Match>
            </Switch>
        </div>
    );
};

type BusStopProps = {
    stop: Accessor<Stop>;
};

const BusStop = ({ stop }: BusStopProps) => {
    const { closeRightPopover } = useTransportController();

    return (
        <div>
            <div class={style.header}>
                <p class={style["station-name"]}>{stop().name}</p>
                <button
                    class={style["close-button"]}
                    onClick={() => closeRightPopover()}
                >
                    ×
                </button>
            </div>
            <div>
                <For each={stop().servedRoutes}>
                    {(routeId) => <p>{routeId}</p>}
                </For>
            </div>
        </div>
    );
};
