import {
    Accessor,
    createContext,
    createEffect,
    createSignal,
    ParentComponent,
    Setter,
    useContext,
} from "solid-js";
import {
    Route,
    Stop,
    TransportMode,
    TransportModeType,
} from "./transport-mode";
import { Result } from "../utils/result";
import { loadRailsTransportMode } from "./transport-source/rails";
import { TransportModeLoader } from "./transport-source";
import { loadTransjakartaTransportMode } from "./transport-source/transjakarta";
import { PopOverState } from "./transport-data";

type TransportController = {
    loadingModes: Accessor<Record<TransportModeType, Result<TransportMode>>>;
    modes: Accessor<Array<TransportMode>>;
    stops: Accessor<Array<Stop>>;
    routes: Accessor<Array<Route>>;

    closeRightPopover: () => void;
    rightPopover: Accessor<PopOverState>;
    setSelectedStop: (id: string) => void;
};

export const TransportControllerContext = createContext<TransportController>();
export const useTransportController = () =>
    useContext(TransportControllerContext)!;

export const TransportControllerProvider: ParentComponent = (props) => {
    const [loadingModes, setLoadingModes] = createSignal<
        Record<TransportModeType, Result<TransportMode>>
    >({
        Rails: {
            type: "loading",
        },
        Transjakarta: {
            type: "loading",
        },
    });
    const [modes, setModes] = createSignal<Array<TransportMode>>([]);
    const [rightPopover, setRightPopOver] = createSignal<PopOverState>(null);

    const registerTransportMode = (
        mode: TransportModeType,
        loader: TransportModeLoader,
    ) => {
        createEffect(async () => {
            let result: Result<undefined>;
            let newModes: Array<TransportMode> = [];
            try {
                newModes = await loader();
                result = {
                    type: "success",
                    data: undefined,
                };
            } catch (error) {
                result = {
                    type: "error",
                    error,
                };
            }

            setLoadingModes((prev) => ({
                ...prev,
                [mode]: result,
            }));
            setModes((prev) => [...prev, ...newModes]);
        });
    };

    registerTransportMode(TransportModeType.Rails, loadRailsTransportMode);
    registerTransportMode(
        TransportModeType.Transjakarta,
        loadTransjakartaTransportMode,
    );

    const setSelectedStop = (id: string) => {
        const stop = modes()
            .flatMap((mode) => mode.stops)
            .find((stop) => stop.id === id);
        if (stop === undefined) return;
        setRightPopOver({
            type: "stop",
            stop,
        });
    };

    return (
        <TransportControllerContext.Provider
            value={{
                modes,
                loadingModes,
                stops: () => modes().flatMap((mode) => mode.stops),
                routes: () =>
                    modes().flatMap((mode) => Object.values(mode.routes)),
                closeRightPopover: () => setRightPopOver(null),
                rightPopover,
                setSelectedStop,
            }}
        >
            {props.children}
        </TransportControllerContext.Provider>
    );
};
