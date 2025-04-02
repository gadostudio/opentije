import {
    Accessor,
    createEffect,
    createSignal,
    onMount,
    onCleanup,
} from "solid-js";
import {
    BusPosition,
    BusPositions,
    RealtimeBusPosition as RealtimeBusConnection,
} from "../../../data/tj/realtime";

export enum TjRealtimeConnectionStatus {
    Connected,
    Connecting,
    Disconnected,
    Error,
}

export type TjRealtimePositionsAction = {
    busPositions: Accessor<Array<BusPosition>>;
    connStatus: Accessor<TjRealtimeConnectionStatus>;
};

export const useTjRealtimePositions = (
    query: Accessor<string> | undefined = undefined,
): TjRealtimePositionsAction => {
    const [busPositions, setBusPositions] = createSignal<Array<BusPosition>>(
        [],
    );
    const [connStatus, setConnStatus] =
        createSignal<TjRealtimeConnectionStatus>(
            TjRealtimeConnectionStatus.Connecting,
        );
    const realtimeConn = new RealtimeBusConnection();

    onMount(async () => {
        try {
            setConnStatus(TjRealtimeConnectionStatus.Connecting);
            await realtimeConn.connect();
            setConnStatus(TjRealtimeConnectionStatus.Connected);
        } catch (error) {
            setConnStatus(TjRealtimeConnectionStatus.Error);
        }
    });

    onCleanup(async () => {
        try {
            await realtimeConn.disconnect();
            setConnStatus(TjRealtimeConnectionStatus.Disconnected);
        } catch (error) {
            setConnStatus(TjRealtimeConnectionStatus.Error);
        }
    });

    createEffect(() => {
        realtimeConn.onPositionUpdate((data) => {
            setBusPositions(data.busData);
        });
    });

    return { busPositions, connStatus };
};
