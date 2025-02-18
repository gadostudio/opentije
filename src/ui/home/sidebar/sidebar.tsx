import { Accessor, For, Match, Switch, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { Route } from "./routes";
import style from "./sidebar.module.scss";
import { RouteType } from "../../../data/consumer";
import { useTransportData } from "../../../data/transport-data";
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

const Content = ({
    onSearchBarFocused,
}: {
    onSearchBarFocused: () => void;
}) => {
    const { tjDataSource, geoData, filter, setSelectedRouteTypes, setQuery } =
        useTransportData();
    const routeTypes = Object.values(RouteType) as Array<RouteType>;
    const [showAboutModal, setShowAboutModal] = createSignal<boolean>(false);

    return (
        <>
            <div class={style.header}>
                <input
                    placeholder="Cari rute bus atau bus stop"
                    onInput={(e) => setQuery(e.target.value)}
                    onFocus={() => onSearchBarFocused()}
                    value={filter().query}
                    class={style.searchInput}
                />
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
            <div class={style.footer}>
                {/* TODO language switcher */}
                <div></div>
                <div class={style.footerRight}>
                    <a
                        href="https://github.com/gadoproject/opentije"
                        target="_blank"
                    >
                        <img
                            src="/assets/image/github.svg"
                            alt="GitHub"
                            class={style.footerIcon}
                        />
                    </a>
                    <a onClick={() => setShowAboutModal(true)}>
                        <img
                            src="/assets/image/info.svg"
                            alt="Info"
                            class={style.footerIcon}
                        />
                    </a>
                </div>
            </div>
            <AboutModal
                show={showAboutModal()}
                onHide={() => setShowAboutModal(false)}
            />
        </>
    );
};
