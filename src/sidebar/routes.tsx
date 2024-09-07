import { RouteData } from "../map/map";

type RouteProps = {
    route: RouteData,
}

export const Route = ({route}: RouteProps) => {
    return <li class="route__item">
        <span class="route__badge" style={`background: #${route.data.route_color}`}>{route.data.route_id}</span>
        <p>{route.data.route_long_name}</p>
    </li>;
}
