import style from "./routes.module.scss"
import { RouteData } from "../map/map";

type RouteProps = {
  route: RouteData;
};

export const Route = ({ route }: RouteProps) => {
  return (
    <li class={style.container}>
      <span
        class={style.badge}
        style={`background: #${route.data.route_color}`}
      >
        {route.data.route_id}
      </span>
      <p class={style.label}>{route.data.route_long_name}</p>
      <input type="checkbox" />
    </li>
  );
};
