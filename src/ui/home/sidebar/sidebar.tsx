import { Accessor, For, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { Route } from "./routes";
import style from "./sidebar.module.scss";
import { RouteType } from "../../../data/consumer";
import { useTransportData } from "../../../data/transport-data";
import { AboutModal } from "./about";

export const Sidebar = () => {
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
            <div class="sidebar__about">
                <button onClick={() => setShowAboutModal(true)}>Tentang OpenTije</button>
            </div>
            <AboutModal show={showAboutModal()} onHide={() => setShowAboutModal(false)} />
        </>
    );
};
