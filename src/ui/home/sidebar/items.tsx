import {
    ModeType,
    Route as RouteType,
    Stop,
} from "../../../data/transport-mode";
import style from "./routes.module.scss";
import { useTransportController } from "../../../data/states/transport-controller";
import { useMapUiState } from "../../../data/states/map-ui";

type RouteProps = {
    route: RouteType;
};

export const RouteItem = ({ route }: RouteProps) => {
    const { selectedRouteIds, setSelectedRouteId } = useMapUiState();

    let badgeStyle;
    if (route.type === ModeType.Bus) {
        badgeStyle = style.badgeBus;
    } else {
        badgeStyle = style.badgeTrain;
    }

    return (
        <li class="routes__route">
            <label
                class={style.container}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setSelectedRouteId(route.id);
                    return;
                }}
            >
                <span
                    class={badgeStyle}
                    style={`--route-color: #${route.color};`}
                >
                    {route.shortName}
                </span>
                <p class={style.label}>{route.fullName}</p>
                <input
                    type="checkbox"
                    checked={selectedRouteIds().has(route.id)}
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRouteId(route.id, e.currentTarget.checked);
                    }}
                />
            </label>
        </li>
    );
};

export type StopProps = {
    stop: Stop;
};

export const StopItem = ({ stop }: StopProps) => {
    const { libreMap, setSelectedStop } = useMapUiState();

    // let badgeStyle;
    // if (route.type === ModeType.Bus) {
    //     badgeStyle = style.badgeBus;
    // } else {
    //     badgeStyle = style.badgeTrain;
    // }

    return (
        <li class="routes__route">
            <label
                class={style.container}
                onClick={(e) => {
                    const map = libreMap();
                    if (!map) return;

                    map.flyTo({
                        center: [
                            stop.coordinate.longitude,
                            stop.coordinate.latitude,
                        ],
                        zoom: 14,
                    });
                    setSelectedStop(stop.id);
                }}
            >
                {/* <span
                    class={badgeStyle}
                    style={`--route-color: #${route.color};`}
                >
                    {route.shortName}
                </span> */}
                <p class={style.label}>{stop.name}</p>
            </label>
        </li>
    );
};
