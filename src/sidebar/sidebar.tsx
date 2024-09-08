import { Accessor, For } from "solid-js";
import { createStore } from "solid-js/store";
import { RouteData } from "../map/map";
import { Route } from "./routes";
import { AboutModal } from "./about";
import style from "./sidebar.module.scss";
import { RouteType, RouteTypeValues } from "../consumer";

type SidebarProps = {
  routes: Accessor<Array<RouteData> | null>;
};

export const Sidebar = ({ routes }: SidebarProps) => {
  const [filter, setFilter] = createStore({
    query: "",
    type: {
      [RouteType.BRT]: true,
      [RouteType.Integrasi]: true,
      [RouteType.Mikrotrans]: true,
    },
  });

  const getFilteredRoutes = () => {
    const query = filter.query.toLowerCase();
    if (query.trim() === "") {
      return routes();
    }

    return routes()?.filter((route) => {
      for (const routeType of RouteTypeValues) {
        if (!filter.type[routeType] && route.data.route_desc === routeType) {
          return false;
        }
      }

      const idMatch = route.data.route_id.toLowerCase().includes(query);
      const nameMatch = route.data.route_long_name
        .toLowerCase()
        .includes(query);
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
          <For each={RouteTypeValues}>
            {(routeType) => (
              <div>
                <input
                  type="checkbox"
                  checked={filter.type[routeType]}
                  onChange={(e) =>
                    setFilter("type", (currentType) => ({
                      [routeType]: !e.target.checked,
                      ...currentType,
                    }))
                  }
                />
                <p>{routeType}</p>
              </div>
            )}
          </For>
        </div>
      </div>
      <div class="sidebar__routes">
        <ul class="route__list">
          {getFilteredRoutes()?.map((route) => <Route route={route} />)}
        </ul>
      </div>
      <div>
        <a href="javascript:;">Tentang OpenTije</a>
      </div>
      {/* <AboutModal /> */}
    </>
  );
};
