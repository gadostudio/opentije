import { Accessor, For } from "solid-js";
import { createStore } from "solid-js/store";
import { Route } from "./routes";
import style from "./sidebar.module.scss";
import { RouteType } from "../../../data/consumer";
import { useTransportData } from "../../../data/transport-data";

export const Sidebar = () => {
    const { tjDataSource, geoData, filter, setSelectedRouteTypes, setQuery } =
        useTransportData();
    const routeTypes = Object.values(RouteType) as Array<RouteType>;

    return (
        <>
            <div class={style.header}>
                <input
                    placeholder="Cari rute bus atau bus stop"
                    onInput={(e) => setQuery(e.target.value)}
                    value={filter().query}
                />
                <div class={style.filters}>
                    <For each={routeTypes}>
                        {(routeType) => (
                            <div>
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
                            </div>
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
            <div>
                <a href="javascript:;">Tentang OpenTije</a>
            </div>
            {/* <AboutModal /> */}
        </>
    );
};
