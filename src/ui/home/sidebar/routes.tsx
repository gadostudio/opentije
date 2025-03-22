import { Route as RouteType } from "../../../data/transport-mode";
import style from "./routes.module.scss";
import { useTransportController } from "../../../data/transport-controller";

type RouteProps = {
    route: RouteType;
};

export const Route = ({ route }: RouteProps) => {
    const { filter } = useTransportController();

    return (
        <li class="routes__route">
            <label class={style.container}>
                <span class={style.badge} style={`background: #${route.color}`}>
                    {route.shortName}
                </span>
                <p class={style.label}>{route.fullName}</p>
                <input
                    type="checkbox"
                    checked={true} //filter().selectedRouteIds.has(route.id)}
                    onChange={(e) => {
                        // setSelectedRouteId(route.id, e.target.checked);
                    }}
                />
            </label>
        </li>
    );
};
