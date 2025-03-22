import { Accessor, For, Match, Switch, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { Route } from "./routes";
import style from "./sidebar.module.scss";
import { RouteType } from "../../../data/consumer";
import { AboutModal } from "./about";
import { useSidebarState } from "../../../data/sidebar-state";
import { useTransportController } from "../../../data/transport-controller";

export const Sidebar = () => {
    const { isExpanded, setIsExpanded } = useSidebarState();

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
    const { stops, routes } = useTransportController();
    const routeTypes = Object.values(RouteType) as Array<RouteType>;
    const [showAboutModal, setShowAboutModal] = createSignal<boolean>(false);

    return (
        <>
            <div class={style.header}>
                <input
                    placeholder="Cari rute bus atau bus stop"
                    onInput={(e) => {}}
                    onFocus={() => onSearchBarFocused()}
                    value={""}
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
                    {routes().map((route) => (
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
