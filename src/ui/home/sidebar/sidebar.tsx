import { Accessor, For, Match, Show, Switch, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { RouteItem, StopItem } from "./items";
import style from "./sidebar.module.scss";
import { AboutModal } from "./about";
import { useMapUiState } from "../../../data/states/sidebar-state";
import { useTransportController } from "../../../data/states/transport-controller";
import {
    Route as RouteType,
    Stop as StopType,
} from "../../../data/transport-mode";
import { TransjakartaRouteType } from "../../../data/transport-source/transjakarta";

export const Sidebar = () => {
    const {
        isSidebarExpanded: isExpanded,
        setIsSidebarExpanded: setIsExpanded,
    } = useMapUiState();

    return (
        <div
            class={`${style.container} ${isExpanded() ? style["container-focused"] : ""}`}
        >
            <Content onSearchBarFocused={() => setIsExpanded(true)} />
        </div>
    );
};

const Content = ({
    onSearchBarFocused,
}: {
    onSearchBarFocused: () => void;
}) => {
    const [query, setQuery] = createSignal<string>("");
    const { stops, routes } = useTransportController();
    const routeTypes = Object.values(
        TransjakartaRouteType,
    ) as Array<TransjakartaRouteType>;
    const [showAboutModal, setShowAboutModal] = createSignal<boolean>(false);

    const routeSearchPredicate = function (route: RouteType): boolean {
        return (
            route.fullName.toLowerCase().includes(query()) ||
            route.id.toLowerCase().includes(query())
        );
    };

    const stopSearchPredicate = function (stop: StopType): boolean {
        return stop.name.toLowerCase().includes(query());
    };

    return (
        <>
            <div class={style.header}>
                <input
                    placeholder="Cari rute bus, kereta, bus stop, atau stasiun"
                    onInput={(e) => setQuery(e.target.value)}
                    onFocus={() => onSearchBarFocused()}
                    value={query()}
                    class={style.searchInput}
                />
                <div class={style.filters}>
                    <For each={routeTypes}>
                        {(routeType) => (
                            <label>
                                <input
                                    type="checkbox"
                                    checked={true}
                                    onChange={(e) => {}}
                                />
                                <p>{routeType}</p>
                            </label>
                        )}
                    </For>
                </div>
            </div>
            <div class="sidebar__routes">
                <ul class={style.routes}>
                    {routes()
                        .filter(routeSearchPredicate)
                        .map((route) => (
                            <RouteItem route={route} />
                        ))}
                    <Show when={query().length !== 0}>
                        {stops()
                            .filter(stopSearchPredicate)
                            .map((stop) => (
                                <StopItem stop={stop} />
                            ))}
                    </Show>
                </ul>
            </div>
            <div class="sidebar__about">
                <button
                    class="about-button"
                    onClick={() => setShowAboutModal(true)}
                >
                    About OpenTije
                </button>
            </div>
            <AboutModal
                show={showAboutModal()}
                onHide={() => setShowAboutModal(false)}
            />
        </>
    );
};
