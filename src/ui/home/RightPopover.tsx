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
    useTransportData,
} from "../../data/transport-data";
import style from "./RightPopover.module.scss";

export const RightPopover: ParentComponent = () => {
    const { rightPopover } = useTransportData();

    const openedClass = () =>
        rightPopover()?.type !== null ? style.opened : "";
    const busStop = () => (rightPopover() as PopOverBusStop).busStop;

    return (
        <div class={`${style.container} ${openedClass()}`}>
            <Switch>
                <Match when={rightPopover()?.type === "bus_stop"}>
                    <BusStop busStop={busStop} />
                </Match>
            </Switch>
        </div>
    );
};

type BusStopProps = {
    busStop: Accessor<BusStopType>;
};

const BusStop = ({ busStop }: BusStopProps) => {
    const { closeRightPopover } = useTransportData();

    return (
        <div>
            <div class={style.header}>
                <p class={style['station-name']}>{busStop().name}</p>
                <button class={style['close-button']} onClick={() => closeRightPopover()}>×</button>
            </div>
            <div>
                <For each={busStop().servedRouteIds}>
                    {(routeId) => <p>{routeId}</p>}
                </For>
            </div>
        </div>
    );
};
