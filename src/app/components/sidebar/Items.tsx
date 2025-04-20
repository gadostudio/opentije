"use client";

import styles from "./Items.module.scss";
import {
  ModeType,
  Route as RouteType,
  Stop as StopType,
} from "@/domain/transport-mode";
import { useMapUiState } from "@/data/map-ui";

type RouteProps = {
  route: RouteType;
};

export const RouteItem = ({ route }: RouteProps) => {
  const { selectedRouteIds, setSelectedRouteId } = useMapUiState();

  const badgeStyle =
    route.type === ModeType.Bus ? styles.badgeBus : styles.badgeTrain;

  return (
    <li className="routes__route">
      <label
        className={styles.container}
        onClick={(e) => {
          // e.stopPropagation();
          // e.preventDefault();
          // setSelectedRouteId(route.id);
        }}
      >
        <span
          className={badgeStyle}
          style={{ "--route-color": `#${route.color}` } as React.CSSProperties}
        >
          {route.shortName}
        </span>
        <p className={styles.label}>{route.fullName}</p>
        <input
          type="checkbox"
          checked={selectedRouteIds.has(route.id)}
          onChange={(e) => {
            e.stopPropagation();
            setSelectedRouteId(route.id, e.currentTarget.checked);
          }}
        />
      </label>
    </li>
  );
};

export type StopProps = {
  stop: StopType;
};

export const StopItem = ({ stop }: StopProps) => {
  const { libreMap, setSelectedStop } = useMapUiState();

  return (
    <li className="routes__route">
      <label
        className={styles.container}
        onClick={() => {
          const map = libreMap;
          if (!map) return;

          map.flyTo({
            center: [stop.coordinate.longitude, stop.coordinate.latitude],
            zoom: 14,
          });
          setSelectedStop(stop.id);
        }}
      >
        <p className={styles.label}>{stop.name}</p>
      </label>
    </li>
  );
};
