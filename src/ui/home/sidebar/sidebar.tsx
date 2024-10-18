import { Accessor, For, Match, Switch, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { Route } from "./routes";
import style from "./sidebar.module.scss";
import { RouteType } from "../../../data/consumer";
import {
    BusRoute,
    BusStop,
    useTransportData,
} from "../../../data/transport-data";
import { AboutModal } from "./about";
import { useSidebarState } from "../../../data/sidebar-state";

export const Sidebar = () => {
    const { tjDataSource } = useTransportData();
    const { isExpanded, setIsExpanded } = useSidebarState();

    return (
        <div
            class={`${style.container} ${isExpanded() ? style["container-focused"] : ""}`}
        >
            <Switch fallback={<p>Loading...</p>}>
                <Match when={tjDataSource().type === "success"}>
                    <Content onSearchBarFocused={() => setIsExpanded(true)} />
                </Match>
                <Match when={tjDataSource().type === "error"}>
                    <p>Error</p>
                </Match>
            </Switch>
        </div>
    );
};

type FilteredResult = {
    category: "Bus Stop" | "Bus Route";
    id: string;
    name: string;
    latitude?: number;
    longitude?: number;
    color?: string;
};

const Content = ({
    onSearchBarFocused,
}: {
    onSearchBarFocused: () => void;
}) => {
    const {
        tjDataSource,
        geoData,
        filter,
        setSelectedRouteTypes,
        setSelectedRouteId,
        setQuery,
        setSelectedEntry,
    } = useTransportData();
    const routeTypes = Object.values(RouteType) as Array<RouteType>;
    const [showAboutModal, setShowAboutModal] = createSignal<boolean>(false);
    const [filteredResults, setFilteredResults] = createSignal<
        FilteredResult[]
    >([]);

    const handleInputChange = (e: Event) => {
        const query = (e.target as HTMLInputElement).value;
        setQuery(query);

        if (!geoData().busStops || !geoData().busRoutes) return;

        const stopMatches: FilteredResult[] = geoData()
            .busStops.filter((stop) =>
                stop.name?.toLowerCase().includes(query.toLowerCase()),
            )
            .map((stop) => ({
                category: "Bus Stop",
                id: stop.id,
                name: stop.name,
                latitude: stop.latitude,
                longitude: stop.longitude,
            }));

        const routeMatches: FilteredResult[] = geoData()
            .busRoutes.filter((route) =>
                route.fullName?.toLowerCase().includes(query.toLowerCase()),
            )
            .map((route) => ({
                category: "Bus Route",
                id: route.id,
                name: route.fullName,
                color: route.color,
            }));

        const matches: FilteredResult[] = [...routeMatches, ...stopMatches];

        setFilteredResults(matches);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
            if (filter().query === "") {
                setFilteredResults([]);
                setSelectedEntry(null);
            }
        }
    };

    return (
        <>
            <div class={style.header}>
                <input
                    placeholder="Cari rute bus atau bus stop"
                    onInput={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => onSearchBarFocused()}
                    value={filter().query}
                    class={style.searchInput}
                />
                {filteredResults().length > 0 && (
                    <ul class={style.autocompleteList}>
                        <For each={filteredResults()}>
                            {(matchedEntry) => (
                                <li
                                    class={style.autocompleteItem}
                                    onClick={() => {
                                        setQuery(matchedEntry.name);
                                        setSelectedEntry(matchedEntry);

                                        let route = geoData().busRoutes.find(
                                            (route) =>
                                                route.id === matchedEntry.id,
                                        );

                                        if (route) {
                                            if (
                                                filter().selectedRouteIds.has(
                                                    route.id,
                                                )
                                            ) {
                                                setSelectedRouteId(
                                                    route.id,
                                                    false,
                                                );
                                            } else {
                                                setSelectedRouteId(
                                                    route.id,
                                                    true,
                                                );
                                            }
                                        }
                                        setFilteredResults([]);
                                    }}
                                >
                                    {matchedEntry.category === "Bus Stop" ? (
                                        <div>
                                            <span>Halte:</span>
                                            <span>{matchedEntry.name}</span>
                                        </div>
                                    ) : (
                                        <div>
                                            <span>Rute:</span>
                                            <span>
                                                {matchedEntry.id} |{" "}
                                                {matchedEntry.name}
                                            </span>
                                        </div>
                                    )}
                                </li>
                            )}
                        </For>
                    </ul>
                )}
                <div class={style.filters}>
                    <For each={routeTypes}>
                        {(routeType) => (
                            <label>
                                <input
                                    type="checkbox"
                                    checked={filter().selectedRouteTypes.has(
                                        routeType,
                                    )}
                                    onChange={(e) => {
                                        setSelectedRouteTypes(
                                            routeType,
                                            e.target.checked,
                                        );
                                    }}
                                />
                                <p>{routeType}</p>
                            </label>
                        )}
                    </For>
                </div>
            </div>
            <div class="sidebar__routes">
                <ul class={style.routes}>
                    {geoData().busRoutes.map((route) => (
                        <Route route={route} />
                    ))}
                </ul>
            </div>
            <div class="sidebar__about">
                <button
                    class="about-button"
                    onClick={() => setShowAboutModal(true)}
                >
                    Tentang OpenTije
                </button>
            </div>
            <AboutModal
                show={showAboutModal()}
                onHide={() => setShowAboutModal(false)}
            />
        </>
    );
};
