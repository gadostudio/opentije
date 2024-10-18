import { BusRoute, useTransportData } from "../../../data/transport-data";
import style from "./routes.module.scss";

type RouteProps = {
    route: BusRoute;
};

export const Route = ({ route }: RouteProps) => {
    const { filter, setSelectedRouteId, setSelectedEntry } = useTransportData();

    const handleCheckboxChange = (e: Event) => {
        const isChecked = (e.target as HTMLInputElement).checked;

        setSelectedRouteId(route.id, isChecked);

        if (isChecked) {
            setSelectedEntry({
                category: "Bus Route",
                id: route.id,
                name: route.fullName,
                color: route.color,
            });
        } else {
            const selectedRoutes = filter().selectedRouteIds;
            if (selectedRoutes.size === 0) {
                setSelectedEntry(null);
            }
        }
    };

    return (
        <li class="routes__route">
            <label class={style.container}>
                <span class={style.badge} style={`background: #${route.color}`}>
                    {route.id}
                </span>
                <p class={style.label}>{route.fullName}</p>
                <input
                    type="checkbox"
                    checked={filter().selectedRouteIds.has(route.id)}
                    onChange={handleCheckboxChange}
                />
            </label>
        </li>
    );
};
