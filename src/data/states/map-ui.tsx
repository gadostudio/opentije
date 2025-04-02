import {
    Accessor,
    createContext,
    createSignal,
    ParentComponent,
    Setter,
    useContext,
} from "solid-js";
import {
    CanvasSourceSpecification,
    GeoJSONSource,
    GeolocateControl,
    Map,
    NavigationControl,
    SourceSpecification,
} from "maplibre-gl";
import { PopOverState } from "../transport-data";
import { useTransportController } from "./transport-controller";

type MapUiState = {
    isSidebarExpanded: Accessor<boolean>;
    setIsSidebarExpanded: Setter<boolean>;

    showContextMenu: Accessor<boolean>;
    setShowContextMenu: Setter<boolean>;

    selectedRouteIds: Accessor<Set<string>>;
    setSelectedRouteId: (id: string, checked?: boolean) => void;

    libreMap: Accessor<Map | null>;
    setLibreMap: Setter<Map | null>;

    closeRightPopover: () => void;
    rightPopover: Accessor<PopOverState>;
    setSelectedStop: (id: string) => void;
};

export const MapUiStateContext = createContext<MapUiState>();
export const useMapUiState = () => useContext(MapUiStateContext)!;

export const MapUiStateProvider: ParentComponent = (props) => {
    const { modes } = useTransportController();
    const [isSidebarExpanded, setIsSidebarExpanded] = createSignal(false);
    const [showContextMenu, setShowContextMenu] = createSignal(false);
    const [selectedRouteIds, setSelectedRouteIds] = createSignal<Set<string>>(
        new Set(),
    );
    const [keywordFilter, setKeywordFilter] = createSignal<Array<string>>([]);
    const [libreMap, setLibreMap] = createSignal<Map | null>(null);
    const [rightPopover, setRightPopOver] = createSignal<PopOverState>(null);

    function setSelectedRouteId(id: string, checked?: boolean) {
        if (checked === undefined) {
            const newSet = new Set([id]);
            if (selectedRouteIds().size == 1 && selectedRouteIds().has(id)) {
                setSelectedRouteIds(new Set<string>());
            } else {
                setSelectedRouteIds(newSet);
            }
            return;
        }

        setSelectedRouteIds((prev) => {
            if (checked) {
                prev.add(id);
            } else {
                prev.delete(id);
            }
            return new Set(prev);
        });
    }

    function setSelectedStop(id: string) {
        const stop = modes()
            .flatMap((mode) => mode.stops)
            .find((stop) => stop.id === id);
        if (stop === undefined) return;
        setRightPopOver({
            type: "stop",
            stop,
        });
    }

    return (
        <MapUiStateContext.Provider
            value={{
                isSidebarExpanded,
                setIsSidebarExpanded,
                showContextMenu,
                setShowContextMenu,
                selectedRouteIds,
                setSelectedRouteId,
                libreMap,
                setLibreMap,
                closeRightPopover: () => setRightPopOver(null),
                rightPopover,
                setSelectedStop,
            }}
        >
            {props.children}
        </MapUiStateContext.Provider>
    );
};
