import { Accessor } from "solid-js";
import { RouteData } from "../map/map";
import { Route } from "./routes";

type SidebarProps = {
    routes: Accessor<Array<RouteData> | null>;
}

export const Sidebar = ({routes}: SidebarProps) => {
    console.log(routes);
    return <div class="map__sidebar">
        <input placeholder="Cari rute bus atau bus stop" />
        <div class="sidebar__filter">
            <div>
                <input type="checkbox" />
                <p>BRT</p>
            </div>
            <div>
                <input type="checkbox" />
                <p>Pengumpan</p>
            </div>
            <div>
                <input type="checkbox" />
                <p>Rusun</p>
            </div>
            <div>
                <input type="checkbox" />
                <p>Mikrotrans</p>
            </div>
        </div>
        <div class="sidebar__routes">
            <ul class="route__list">
            {routes()?.map((route) => <Route route={route} />)}
            </ul>
        </div>
    </div>;
}
