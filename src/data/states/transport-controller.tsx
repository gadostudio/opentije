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
    TransportModeDataSourceType,
} from "../transport-mode";
import { Result } from "../../utils/result";
import { loadRailsTransportMode } from "../transport-source/rails";
import { TransportModeLoader } from "../transport-source";
import { loadTransjakartaTransportMode } from "../transport-source/transjakarta";
import { PopOverState } from "../transport-data";

type TransportController = {
    loadingModes: Accessor<
        Record<TransportModeDataSourceType, Result<TransportMode>>
    >;
    modes: Accessor<Array<TransportMode>>;
    stops: Accessor<Array<Stop>>;
    routes: Accessor<Array<Route>>;

    getRoute: (id: string) => Route | undefined;
};

export const TransportControllerContext = createContext<TransportController>();
export const useTransportController = () =>
    useContext(TransportControllerContext)!;

export const TransportControllerProvider: ParentComponent = (props) => {
    const [loadingModes, setLoadingModes] = createSignal<
        Record<TransportModeDataSourceType, Result<TransportMode>>
    >({
        [TransportModeDataSourceType.Rails]: {
            type: "loading",
        },
        [TransportModeDataSourceType.Transjakarta]: {
            type: "loading",
        },
    });
    const [modes, setModes] = createSignal<Array<TransportMode>>([]);

    const registerTransportMode = (
        mode: TransportModeDataSourceType,
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

    registerTransportMode(
        TransportModeDataSourceType.Rails,
        loadRailsTransportMode,
    );
    registerTransportMode(
        TransportModeDataSourceType.Transjakarta,
        loadTransjakartaTransportMode,
    );

    return (
        <TransportControllerContext.Provider
            value={{
                modes,
                loadingModes,
                stops: () => modes().flatMap((mode) => mode.stops),
                routes: () =>
                    modes().flatMap((mode) => Object.values(mode.routes)),
                getRoute: (id: string) =>
                    modes().find((mode) => mode.routes[id] !== undefined)
                        ?.routes[id],
            }}
        >
            {props.children}
        </TransportControllerContext.Provider>
    );
};
