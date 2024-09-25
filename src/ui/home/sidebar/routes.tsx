import { BusRoute, useTransportData } from "../../../data/transport-data";
import style from "./routes.module.scss";

type RouteProps = {
    route: BusRoute;
};

export const Route = ({ route }: RouteProps) => {
    const { filter, setSelectedRouteId } = useTransportData();

    return (
        <li class={style.container}>
            <span class={style.badge} style={`background: #${route.color}`}>
                {route.id}
            </span>
            <p class={style.label}>{route.fullName}</p>
            <input
                type="checkbox"
                checked={filter().selectedRouteIds.has(route.id)}
                onChange={(e) => {
                    setSelectedRouteId(route.id, e.target.checked);
                }}
            />
        </li>
    );
};
