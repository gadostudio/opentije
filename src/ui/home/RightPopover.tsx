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
            <div>
                <p>{busStop().id}</p>
                <p>{busStop().name}</p>
                <button onClick={() => closeRightPopover()}>Close</button>
            </div>
            <div>
                <For each={busStop().servedRouteIds}>
                    {(routeId) => <p>{routeId}</p>}
                </For>
            </div>
        </div>
    );
};
