import { BusRoute } from "../../../data/transport-data";
import style from "./routes.module.scss"

type RouteProps = {
  route: BusRoute;
};

export const Route = ({ route }: RouteProps) => {
  return (
    <li class={style.container}>
      <span
        class={style.badge}
        style={`background: #${route.color}`}
      >
        {route.id}
      </span>
      <p class={style.label}>{route.fullName}</p>
      <input type="checkbox" />
    </li>
  );
};
