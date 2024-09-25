import { Accessor, For } from "solid-js";
import { createStore } from "solid-js/store";
import { Route } from "./routes";
import style from "./sidebar.module.scss";
import { RouteType } from "../../../data/consumer";
import { useTransportData } from "../../../data/transport-data";

export const Sidebar = () => {
    const { tj } = useTransportData();
    const [filter, setFilter] = createStore({
        query: "",
        type: {
            [RouteType.BRT]: true,
            [RouteType.Integrasi]: true,
            [RouteType.Mikrotrans]: true,
            [RouteType.Rusun]: true,
            [RouteType.Royaltrans]: true,
            [RouteType.Transjabodetabek]: true,
            [RouteType.BusWisata]: true,
        },
    });
    const routeTypes = Object.values(RouteType) as Array<RouteType>;

    const getFilteredRoutes = () => {
        const query = filter.query.toLowerCase();
        return tj()
            ?.getRoutes()
            .filter((route) => {
                for (const routeType of routeTypes) {
                    if (!filter.type[routeType] && route.type === routeType) {
                        return false;
                    }
                }

                const idMatch = route.id.toLowerCase().includes(query);
                const nameMatch = route.fullName.toLowerCase().includes(query);
                return idMatch || nameMatch;
            });
    };

    return (
        <>
            <div class={style.header}>
                <input
                    placeholder="Cari rute bus atau bus stop"
                    onInput={(e) => setFilter({ query: e.target.value })}
                    value={filter.query}
                />
                <div class={style.filters}>
                    <For each={routeTypes}>
                        {(routeType) => (
                            <div>
                                <input
                                    type="checkbox"
                                    checked={filter.type[routeType]}
                                    onChange={(e) =>
                                        setFilter("type", (currentType) => {
                                            return {
                                                ...currentType,
                                                [routeType]: e.target.checked,
                                            };
                                        })
                                    }
                                />
                                <p>{routeType}</p>
                            </div>
                        )}
                    </For>
                </div>
            </div>
            <div class="sidebar__routes">
                <ul class={style.routes}>
                    {getFilteredRoutes()?.map((route) => (
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
